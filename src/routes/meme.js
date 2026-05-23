import { Router } from 'express'
import multer from 'multer'
import { analyzeMeme, refineMeme, generateMemeImage } from '../services/aiService.js'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

export const memeRouter = Router()

memeRouter.post('/analyze', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('No image file provided')
      err.status = 400
      throw err
    }

    const prompt = req.body.prompt || undefined
    let preferredTemplates
    try {
      preferredTemplates = req.body.preferredTemplates
        ? JSON.parse(req.body.preferredTemplates)
        : undefined
    } catch {
      preferredTemplates = undefined
    }

    const suggestions = await analyzeMeme(
      req.file.buffer,
      req.file.mimetype,
      { prompt, preferredTemplates }
    )
    res.json({ suggestions })
  } catch (err) {
    next(err)
  }
})

memeRouter.post('/refine', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('No image file provided')
      err.status = 400
      throw err
    }

    const feedback = req.body.feedback
    if (!feedback) {
      const err = new Error('Feedback is required')
      err.status = 400
      throw err
    }

    let previousSuggestions
    try {
      previousSuggestions = JSON.parse(req.body.previousSuggestions)
    } catch {
      const err = new Error('Invalid previousSuggestions')
      err.status = 400
      throw err
    }

    const suggestions = await refineMeme(
      req.file.buffer,
      req.file.mimetype,
      previousSuggestions,
      feedback
    )
    res.json({ suggestions })
  } catch (err) {
    next(err)
  }
})

memeRouter.post('/generate-meme-image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('No image file provided')
      err.status = 400
      throw err
    }

    const { templateId, topText, bottomText } = req.body
    if (!templateId || !topText) {
      const err = new Error('templateId and topText are required')
      err.status = 400
      throw err
    }

    const result = await generateMemeImage(
      req.file.buffer,
      req.file.mimetype,
      { templateId, topText, bottomText: bottomText || '' }
    )
    res.json(result)
  } catch (err) {
    next(err)
  }
})
