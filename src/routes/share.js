import { Router } from 'express'
import multer from 'multer'
import { shareMeme } from '../services/shareService.js'
import { getMeme, addReaction, getReactions } from '../lib/db.js'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

export const shareRouter = Router()

shareRouter.post('/share', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('No image file provided')
      err.status = 400
      throw err
    }
    const metadata = JSON.parse(req.body.metadata || '{}')
    const result = await shareMeme({
      imageBuffer: req.file.buffer,
      mimeType: req.file.mimetype,
      templateId: metadata.templateId || 'unknown',
      texts: metadata.texts || {},
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
})

shareRouter.get('/share/:id', async (req, res, next) => {
  try {
    const meme = await getMeme(req.params.id)
    res.json(meme)
  } catch (err) {
    next(err)
  }
})

shareRouter.post('/react/:id', async (req, res, next) => {
  try {
    const { emoji } = req.body
    if (!emoji) {
      const err = new Error('Emoji is required')
      err.status = 400
      throw err
    }
    await addReaction(req.params.id, emoji)
    const counts = await getReactions(req.params.id)
    res.json(counts)
  } catch (err) {
    next(err)
  }
})

shareRouter.get('/react/:id', async (req, res, next) => {
  try {
    const counts = await getReactions(req.params.id)
    res.json(counts)
  } catch (err) {
    next(err)
  }
})
