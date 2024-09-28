import express from 'express'
import request from 'supertest'
import { MongoClient } from 'mongodb'
import passport from 'passport'
import { MongoMemoryServer } from 'mongodb-memory-server'
import session from 'cookie-session'
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals'
import { getAuthRoutes } from './auth'
import { createDbIndices } from '../utils'
import { getDeserializeUser, getLocalStrategy, serializeUser } from '../middlewares/passport'
import { fixCookieSession } from '../middlewares/session'

let mongoServer: MongoMemoryServer
let dbClient: MongoClient
let app: express.Express

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()

  dbClient = await MongoClient.connect(uri)
  await createDbIndices(dbClient)

  app = express()
  app.use(express.json())

  app.use(session({ name: 'session', keys: ['test'], maxAge: 60 * 1000 }))
  app.use(fixCookieSession)

  app.use(passport.initialize())
  app.use(passport.session())

  passport.use(getLocalStrategy(dbClient))
  passport.serializeUser(serializeUser)
  passport.deserializeUser(getDeserializeUser(dbClient))

  app.use('/auth', getAuthRoutes(dbClient))
})

afterAll(async () => {
  await dbClient.close()
  await mongoServer.stop()
})

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'password123', name: 'Test User' })
      .expect(201)

    expect(response.body).toHaveProperty('_id')
    expect(response.body).toHaveProperty('email', 'test@example.com')
    expect(response.body).toHaveProperty('name', 'Test User')
    expect(response.body).not.toHaveProperty('password')
  })

  it('should not register a user with existing email', async () => {
    await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'password123', name: 'Test User' })

    const response = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'password123', name: 'Another User' })
      .expect(400)

    expect(response.text).toBe('Error registering user.')
  })

  it('should log in a user', async () => {
    await request(app)
      .post('/auth/register')
      .send({ email: 'login@example.com', password: 'password123', name: 'Login User' })

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'login@example.com', password: 'password123' })
      .expect(200)

    expect(response.body).toHaveProperty('email', 'login@example.com')
    expect(response.body).toHaveProperty('name', 'Login User')
  })

  it('should not log in with incorrect password', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'login@example.com', password: 'wrongpassword' })
      .expect(401)

    expect(response.text).toContain('Unauthorized')
  })

  it('should log out a user', async () => {
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ email: 'login@example.com', password: 'password123' })

    const sessionCookie = loginResponse.headers['set-cookie']

    const response = await request(app).post('/auth/logout').set('Cookie', sessionCookie).expect(200)

    expect(response.status).toBe(200)
  })
})
