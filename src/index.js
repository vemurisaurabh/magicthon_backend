import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { memeRouter } from './routes/meme.js'
import { shareRouter } from './routes/share.js'
import { errorHandler } from './middleware/errorHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}))

app.use(express.json())

app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', memeRouter)
app.use('/api', shareRouter)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})

// Test comment to test the git push command alias "pushme"