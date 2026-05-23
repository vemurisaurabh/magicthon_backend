import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { saveMeme } from '../lib/db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads')

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

export async function shareMeme({ imageBuffer, mimeType, templateId, texts }) {
  const ext = mimeType.split('/')[1] || 'png'
  const filename = `${crypto.randomUUID()}.${ext}`
  const filePath = path.join(UPLOADS_DIR, filename)

  fs.writeFileSync(filePath, imageBuffer)

  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`
  const imageUrl = `${backendUrl}/uploads/${filename}`

  const id = await saveMeme({ imageUrl, templateId, texts })
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

  return { id, shareUrl: `${frontendUrl}/m/${id}`, imageUrl }
}
