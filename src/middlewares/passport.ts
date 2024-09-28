import { MongoClient, ObjectId, type WithId } from 'mongodb'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as LocalStrategy } from 'passport-local'
import type { User } from '../types'
import { verifyPassword } from '../utils'

export function getGoogleStrategy(clientID: string, clientSecret: string, dbClient: MongoClient) {
  return new GoogleStrategy(
    { clientID, clientSecret, callbackURL: '/api/auth/google/callback' },
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
      } catch {
        // ? This error is propagated to the client as HTML. (can handle it differently)
        return done('Unable to sign in with Google.', false)
      }
    },
  )
}

export function getLocalStrategy(dbClient: MongoClient) {
  return new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    const usersCollection = dbClient.db().collection<User>('users')

    try {
      const user = await usersCollection.findOne({ email })
      if (!user) throw new Error('User not found.')

      if (!(await verifyPassword(user.password ?? '', password))) throw new Error('Incorrect password.')

      return done(null, user)
    } catch {
      // ? This error is propagated to the client as HTML. (can handle it differently)
      return done('Invalid email or password.', false)
    }
  })
}

export function serializeUser(user: Express.User, done: (err: any, id?: string) => void) {
  done(null, (user as WithId<User>)._id.toHexString())
}

export function getDeserializeUser(dbClient: MongoClient) {
  return async (id: string, done: (err: any, user?: Express.User | false | null) => void) => {
    const usersCollection = dbClient.db().collection('users')
    const user = await usersCollection.findOne({ _id: new ObjectId(id) })

    done(null, user)
  }
}
