import { Router } from 'express'
import multer from 'multer'
import { analyzeMeme } from '../services/aiService.js'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

export const memeRouter = Router()

memeRouter.post('/analyze', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('No image file provided')
      err.status = 400
      throw err
    }
    const suggestions = await analyzeMeme(req.file.buffer, req.file.mimetype)
    res.json({ suggestions })
  } catch (err) {
    next(err)
  }
})
