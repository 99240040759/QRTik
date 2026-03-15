import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDb } from './config/db.js'
import eventsRouter from './routes/events.js'
import ticketsRouter from './routes/tickets.js'
import authRouter from './routes/auth.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(cors())
app.use(express.json())

const port = process.env.PORT || 5001

console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode...`)

if (!process.env.MONGODB_URI) {
  console.error('FATAL: MONGODB_URI is not defined in environment variables')
  process.exit(1)
}

app.use(async (req, res, next) => {
  try {
    await connectDb(process.env.MONGODB_URI);
    next();
  } catch (error) {
    console.error('Database Connection Error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.use('/api/auth', authRouter)
app.use('/api/events', eventsRouter)
app.use('/api/tickets', ticketsRouter)

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  connectDb(process.env.MONGODB_URI)
    .then(() => {
      console.log('Successfully connected to MongoDB')
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`)
      })
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB:', err.message)
      process.exit(1)
    })
}

