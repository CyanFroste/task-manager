import { MongoClient } from 'mongodb'

export async function createDbIndices(dbClient: MongoClient) {
  const created: string[] = []

  created.push(await dbClient.db().collection('users').createIndex({ email: 1 }, { unique: true }))

  return created
}
