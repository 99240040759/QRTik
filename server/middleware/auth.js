import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function authRequired(req, res, next) {
  const header = req.headers.authorization || ''
  const [, token] = header.split(' ')
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.sub)
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    req.user = { id: user._id.toString() }
    next()
  } catch {
    res.status(401).json({ message: 'Unauthorized' })
  }
}

