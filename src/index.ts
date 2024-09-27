import express from 'express'
import dotenv from 'dotenv'
import { MongoClient, ObjectId, ServerApiVersion, type WithId } from 'mongodb'
import cookieSession from 'cookie-session'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as LocalStrategy } from 'passport-local'
import path from 'path'
// import cors from 'cors'
import bcrypt from 'bcrypt'
import type { User } from './types'
import { getAuthRoutes } from './routes/auth'
import { getUserRoutes } from './routes/users'
import { isAuthenticated } from './middlewares/auth'

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

// app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.use(cookieSession({ name: 'session', keys: [SESSION_SECRET], maxAge: 60 * 60 * 1000 }))

// ISSUE: https://github.com/jaredhanson/passport/issues/904#issuecomment-1307558283
app.use(function (req, res, next) {
  const placeholder = ((cb: any) => cb()) as any

  if (!req.session.regenerate) req.session.regenerate = placeholder
  if (!req.session.save) req.session.save = placeholder

  next()
})

app.use(passport.initialize())
app.use(passport.session())

app.use(express.static(path.join(__dirname, '../client/dist')))

passport.use(
  new GoogleStrategy(
    { clientID: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET, callbackURL: '/api/auth/google/callback' },
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

app.get('/api/health', (req, res) => {
  res.send('OK')
})

app.use('/api/auth', getAuthRoutes(dbClient))
app.use('/api/users', isAuthenticated, getUserRoutes())

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'))
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
