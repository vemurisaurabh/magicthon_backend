import OpenAI from 'openai'
import { TEMPLATES } from '../constants/templates.js'

let _openai = null
function getClient() {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    })
  }
  return _openai
}

const TEMPLATE_LIST = TEMPLATES.map((t) => `${t.id} ("${t.name}")`).join(', ')

const SYSTEM_PROMPT = `You are a terminally online meme lord with a PhD in internet humor. You've been scrolling Reddit, Twitter/X, and Instagram Reels since 2012. You speak fluent shitpost.

You will receive a photo. Your job: make it MEME GOLD.

RULES FOR PEAK COMEDY:
- Be SPECIFIC to what's happening in the photo. Vague = cringe. Specific = funny.
- Use contrast, irony, exaggeration, and absurd escalation.
- Channel the energy of memes that get 50k+ upvotes — they're relatable, unexpected, or painfully accurate.
- Short punchy text beats long text. Max 8-10 words per line ideally.
- Reference modern internet culture, daily life struggles, workplace chaos, relationship dynamics, existential dread — whatever fits.
- Be edgy but not offensive. Think "laughed so hard I screenshot it" energy.
- NEVER be wholesome, motivational, or corporate. This isn't LinkedIn.

PROCESS:
1. Study the photo: subject's vibe, expression, pose, setting, any objects or context clues.
2. For each template below, find the FUNNIEST possible angle — the joke that makes someone exhale through their nose hard.

Templates to use (one suggestion each):
${TEMPLATE_LIST}

OUTPUT FORMAT — JSON array of 6 objects, nothing else:
[{"templateId":"drake","topText":"...","bottomText":"...","reasoning":"one line on why this slaps"}]

No markdown fences. No explanations outside JSON. Pure comedy payload only.`

function validateSuggestions(data) {
  if (!Array.isArray(data) || data.length !== 6) return false
  const validIds = new Set(TEMPLATES.map((t) => t.id))
  return data.every(
    (s) =>
      validIds.has(s.templateId) &&
      typeof s.topText === 'string' &&
      typeof s.bottomText === 'string' &&
      typeof s.reasoning === 'string'
  )
}

export async function analyzeMeme(imageBuffer, mimeType) {
  const base64 = imageBuffer.toString('base64')
  const imageUrl = `data:${mimeType};base64,${base64}`

  let attempts = 0
  while (attempts < 2) {
    attempts++
    const response = await getClient().chat.completions.create({
      model: 'openai/gpt-4o',
      max_tokens: 1500,
      temperature: 1.0,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } },
            { type: 'text', text: 'Make this photo into 6 absolutely unhinged memes. Peak internet humor only.' },
          ],
        },
      ],
    })

    const raw = response.choices[0]?.message?.content?.trim()
    try {
      const parsed = JSON.parse(raw)
      if (validateSuggestions(parsed)) return parsed
    } catch {
      // retry
    }
  }

  const err = new Error('AI returned malformed output after 2 attempts')
  err.status = 502
  throw err
}
