import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Server as SocketServer } from 'socket.io'
import { memeRouter } from './routes/meme.js'
import { shareRouter } from './routes/share.js'
import { draftRouter } from './routes/draft.js'
import { errorHandler } from './middleware/errorHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 3001

const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(cors({ origin: FRONTEND_ORIGIN }))

const io = new SocketServer(server, {
  cors: { origin: FRONTEND_ORIGIN },
})

app.set('io', io)

io.on('connection', (socket) => {
  socket.on('join-meme', (memeId) => {
    socket.join(`meme:${memeId}`)
  })

  socket.on('leave-meme', (memeId) => {
    socket.leave(`meme:${memeId}`)
  })
})

app.use(express.json())

app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', memeRouter)
app.use('/api', shareRouter)
app.use('/api', draftRouter)

app.use(errorHandler)

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})