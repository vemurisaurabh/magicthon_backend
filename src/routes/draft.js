import { Router } from 'express'
import { saveDraft, getLatestDraft, deleteDraft } from '../lib/db.js'

export const draftRouter = Router()

draftRouter.post('/drafts', async (req, res, next) => {
  try {
    const { templateId, layers } = req.body
    if (!templateId) {
      const err = new Error('templateId is required')
      err.status = 400
      throw err
    }
    const id = await saveDraft({ templateId, layers })
    res.json({ id, saved: true })
  } catch (err) {
    next(err)
  }
})

draftRouter.get('/drafts/latest', async (_req, res, next) => {
  try {
    const draft = await getLatestDraft()
    if (!draft) return res.json({ draft: null })
    res.json({ draft })
  } catch (err) {
    next(err)
  }
})

draftRouter.delete('/drafts/:id', async (req, res, next) => {
  try {
    await deleteDraft(req.params.id)
    res.json({ deleted: true })
  } catch (err) {
    next(err)
  }
})
