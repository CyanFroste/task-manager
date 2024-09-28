import type { NextFunction, Request, Response } from 'express'

// ISSUE: https://github.com/jaredhanson/passport/issues/904#issuecomment-1307558283
export function fixCookieSession(req: Request, res: Response, next: NextFunction) {
  const placeholder = ((cb: any) => cb()) as any

  if (!req.session.regenerate) req.session.regenerate = placeholder
  if (!req.session.save) req.session.save = placeholder

  next()
}
