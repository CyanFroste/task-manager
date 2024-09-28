import { MongoClient } from 'mongodb'
import argon2 from 'argon2'

export async function createDbIndices(dbClient: MongoClient) {
  const created: string[] = []

  created.push(await dbClient.db().collection('users').createIndex({ email: 1 }, { unique: true }))

  return created
}

export async function hashPassword(password: string) {
  // await bcrypt.hash(password, 10) // but argon2 is better
  return await argon2.hash(password)
}

export async function verifyPassword(hashedPassword: string, password: string) {
  // await bcrypt.compare(password, hashedPassword) // but argon2 is better
  return argon2.verify(hashedPassword, password)
}
