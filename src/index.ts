import express from 'express'
import dotenv from 'dotenv'
import { MongoClient, ObjectId, ServerApiVersion, type WithId } from 'mongodb'
import session from 'express-session'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as LocalStrategy } from 'passport-local'
import cors from 'cors'
import bcrypt from 'bcrypt'
import type { User } from './types'

dotenv.config()

const PORT = process.env.PORT!
const MONGODB_URI = process.env.MONGODB_URI!
const SESSION_SECRET = process.env.SESSION_SECRET!
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

const dbClient = new MongoClient(MONGODB_URI, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
})

const app = express()

app.use(express.json())
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: true }))

app.use(passport.initialize())
app.use(passport.session())

passport.use(
  new GoogleStrategy(
    { clientID: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET, callbackURL: '/auth/google/callback' },
    async (accessToken, refreshToken, profile, done) => {
      const usersCollection = dbClient.db().collection<User>('users')

      try {
        const user = await usersCollection.findOne({ googleId: profile.id })
        if (user) return done(null, user)

        const newUser: User = {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0].value,
        }

        const { insertedId } = await usersCollection.insertOne(newUser)
        return done(null, { _id: insertedId, ...newUser })
      } catch (err) {
        return done(err)
      }
    },
  ),
)

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    const usersCollection = dbClient.db().collection<User>('users')

    try {
      const user = await usersCollection.findOne({ email })
      if (!user) return done(null, false, { message: 'Incorrect email.' })

      if (!(await bcrypt.compare(password, user.password ?? '')))
        return done(null, false, { message: 'Incorrect password.' })

      return done(null, user)
    } catch (err) {
      return done(err)
    }
  }),
)

passport.serializeUser((user, done) => {
  done(null, (user as WithId<User>)._id)
})

passport.deserializeUser(async (id: string, done) => {
  const usersCollection = dbClient.db().collection('users')
  const user = await usersCollection.findOne({ _id: new ObjectId(id) })

  done(null, user)
})

app.get('/', (req, res) => {
  res.send('Hello, TypeScript with Express!')
})

app.post('/api/login', passport.authenticate('local'), (req, res) => {
  res.json(req.user)
})

app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body
  const usersCollection = dbClient.db().collection<User>('users')

  const hashedPassword = await bcrypt.hash(password, 10)
  const newUser: User = {
    email,
    password: hashedPassword,
    name,
  }

  try {
    const { insertedId } = await usersCollection.insertOne(newUser)
    res.status(201).json({ _id: insertedId, ...newUser, password: undefined })
  } catch (error) {
    res.status(400).send('Error registering user.')
  }
})

app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
)

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('http://localhost:5173')
})

app.get('/api/user', (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).send('Not authenticated')
    return
  }

  const { password, ...user } = req.user as User
  res.json(user)
})

app.post('/api/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      return res.status(500).send('Logout error')
    }
    res.sendStatus(200)
  })
})

dbClient
  .connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`)
    })
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
