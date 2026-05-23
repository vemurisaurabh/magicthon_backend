import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '../../data')
const DB_FILE = path.join(DATA_DIR, 'memes.json')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

function readDb() {
  if (!fs.existsSync(DB_FILE)) return { memes: {}, reactions: {} }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
}

export async function saveMeme({ imageUrl, templateId, texts }) {
  const db = readDb()
  const id = crypto.randomUUID().slice(0, 8)
  db.memes[id] = {
    id,
    image_url: imageUrl,
    template_id: templateId,
    texts,
    created_at: new Date().toISOString(),
  }
  writeDb(db)
  return id
}

export async function getMeme(id) {
  const db = readDb()
  const meme = db.memes[id]
  if (!meme) {
    const e = new Error('Meme not found')
    e.status = 404
    throw e
  }
  return meme
}

export async function addReaction(memeId, emoji) {
  const db = readDb()
  if (!db.reactions[memeId]) db.reactions[memeId] = []
  db.reactions[memeId].push({ emoji, created_at: new Date().toISOString() })
  writeDb(db)
}

export async function getReactions(memeId) {
  const db = readDb()
  const entries = db.reactions[memeId] || []
  const counts = {}
  for (const r of entries) {
    counts[r.emoji] = (counts[r.emoji] || 0) + 1
  }
  return counts
}
