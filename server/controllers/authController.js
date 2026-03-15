import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

function createToken(user) {
  return jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  )
}

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' })
    }
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash })
    const token = createToken(user)
    res.status(201).json({
      user: { _id: user._id, name: user.name, email: user.email },
      token
    })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing fields' })
    }
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    const token = createToken(user)
    res.json({
      user: { _id: user._id, name: user.name, email: user.email },
      token
    })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}
