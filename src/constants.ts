import dotenv from 'dotenv'

dotenv.config()

export const IS_DEV = process.env.NODE_ENV === 'development'
export const PORT = process.env.PORT!
export const MONGODB_URI = IS_DEV ? process.env.MONGODB_URI_DEV! : process.env.MONGODB_URI!
export const SESSION_SECRET = process.env.SESSION_SECRET!
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
