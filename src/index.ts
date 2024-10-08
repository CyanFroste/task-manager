import express from 'express'
import dotenv from 'dotenv'
import { MongoClient, ServerApiVersion } from 'mongodb'
import cookieSession from 'cookie-session'
import passport from 'passport'
import path from 'path'
import { getAuthRoutes } from './routes/auth'
import { getUserRoutes } from './routes/users'
import { isAuthenticated } from './middlewares/auth'
import { createDbIndices } from './utils'
import { getDeserializeUser, getGoogleStrategy, getLocalStrategy, serializeUser } from './middlewares/passport'
import { fixCookieSession } from './middlewares/session'
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, IS_DEV, MONGODB_URI, PORT, SESSION_SECRET } from './constants'
import { getTaskRoutes } from './routes/tasks'

console.log(`Starting in ${IS_DEV ? 'development' : 'production'} mode`)

const dbClient = new MongoClient(MONGODB_URI, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
})

const app = express()
app.use(express.json())
// app.use(cors({ origin: 'http://localhost:5173', credentials: true }))

app.use(cookieSession({ name: 'session', keys: [SESSION_SECRET], maxAge: 60 * 60 * 1000 }))
app.use(fixCookieSession)

app.use(passport.initialize())
app.use(passport.session())

app.use(express.static(path.join(__dirname, '../client/dist')))

passport.use(getGoogleStrategy(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, dbClient))
passport.use(getLocalStrategy(dbClient))
passport.serializeUser(serializeUser)
passport.deserializeUser(getDeserializeUser(dbClient))

app.get('/api/health', (req, res) => {
  res.send('OK')
})

app.use('/api/auth', getAuthRoutes(dbClient))
app.use('/api/users', isAuthenticated, getUserRoutes())
app.use('/api/tasks', isAuthenticated, getTaskRoutes(dbClient))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'))
})

main().catch(err => console.error(err))

async function main() {
  await dbClient.connect()
  await createDbIndices(dbClient)

  app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`))
}
