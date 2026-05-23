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
  if (!fs.existsSync(DB_FILE)) return { memes: {}, reactions: {}, drafts: {} }
  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))
  if (!data.drafts) data.drafts = {}
  return data
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

export async function saveDraft({ templateId, layers }) {
  const db = readDb()
  const id = crypto.randomUUID().slice(0, 8)
  db.drafts[id] = {
    id,
    template_id: templateId,
    layers: layers || [],
    updated_at: new Date().toISOString(),
  }
  writeDb(db)
  return id
}

export async function getLatestDraft() {
  const db = readDb()
  const entries = Object.values(db.drafts)
  if (entries.length === 0) return null
  entries.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
  return entries[0]
}

export async function deleteDraft(id) {
  const db = readDb()
  delete db.drafts[id]
  writeDb(db)
}
