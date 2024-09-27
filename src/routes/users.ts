import { Router } from 'express'
import type { User } from '../types'

export function getUserRoutes(): Router {
  const router = Router()

  router.get('/current', (req, res) => {
    const { password, ...user } = req.user as User
    res.json(user)
  })

  return router
}
