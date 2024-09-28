import { Router } from 'express'
import { MongoClient } from 'mongodb'
import passport from 'passport'
// import bcrypt from 'bcrypt'
import argon2 from 'argon2'
import type { User } from '../types'
import { isAuthenticated } from '../middlewares/auth'

export function getAuthRoutes(dbClient: MongoClient): Router {
  const router = Router()

  router.post('/login', passport.authenticate('local'), (req, res) => {
    const { password, ...user } = req.user as User
    res.json(user)
  })

  router.post('/register', async (req, res) => {
    const { email, password, name } = req.body
    const usersCollection = dbClient.db().collection<User>('users')

    // const hashedPassword = await bcrypt.hash(password, 10) // argon2 is more secure
    const hashedPassword = await argon2.hash(password)

    const newUser: User = {
      email,
      password: hashedPassword,
      name,
    }

    try {
      const { insertedId } = await usersCollection.insertOne(newUser)
      res.status(201).json({ _id: insertedId, ...newUser, password: undefined })
    } catch (err) {
      res.status(400).send('Error registering user.')
    }
  })

  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

  router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/')
  })

  router.post('/logout', isAuthenticated, (req, res) => {
    req.logout(err => {
      if (err) return res.status(500).send('Logout error')
      res.sendStatus(200)
    })
  })

  return router
}
