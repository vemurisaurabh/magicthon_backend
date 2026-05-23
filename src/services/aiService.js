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

function buildSystemPrompt(preferredTemplates) {
  const templatesToUse = preferredTemplates?.length
    ? TEMPLATES.filter((t) => preferredTemplates.includes(t.id))
    : TEMPLATES

  const templateList = templatesToUse.map((t) => `${t.id} ("${t.name}")`).join(', ')
  const count = templatesToUse.length

  return `You are a terminally online meme lord with a PhD in internet humor. You've been scrolling Reddit, Twitter/X, and Instagram Reels since 2012. You speak fluent shitpost.

You will receive a photo and optionally a description of the situation from the user. Your job: make it MEME GOLD.

RULES FOR PEAK COMEDY:
- Be SPECIFIC to what's happening in the photo. Vague = cringe. Specific = funny.
- If the user provided a description, USE IT as the primary context for the jokes. The photo is secondary context.
- Use contrast, irony, exaggeration, and absurd escalation.
- Channel the energy of memes that get 50k+ upvotes — they're relatable, unexpected, or painfully accurate.
- Short punchy text beats long text. Max 8-10 words per line ideally.
- Reference modern internet culture, daily life struggles, workplace chaos, relationship dynamics, existential dread — whatever fits.
- Be edgy but not offensive. Think "laughed so hard I screenshot it" energy.
- NEVER be wholesome, motivational, or corporate. This isn't LinkedIn.

PROCESS:
1. Read the user's description (if provided) — this is what they WANT the meme to be about.
2. Study the photo: subject's vibe, expression, pose, setting, any objects or context clues.
3. Combine both to find the FUNNIEST possible angle for each template.

Templates to use (one suggestion per template):
${templateList}

CRITICAL: You MUST produce EXACTLY ${count} suggestion(s). One for EACH template listed above. No more, no fewer. Use ONLY the template IDs listed above.

OUTPUT FORMAT — JSON array of EXACTLY ${count} objects, nothing else:
[{"templateId":"...","topText":"...","bottomText":"...","reasoning":"one line on why this slaps"}]

No markdown fences. No explanations outside JSON. Pure comedy payload only.`
}

function validateSuggestions(data, expectedCount, allowedIds) {
  if (!Array.isArray(data) || data.length === 0) return false
  const valid = data.every(
    (s) =>
      allowedIds.has(s.templateId) &&
      typeof s.topText === 'string' &&
      typeof s.bottomText === 'string' &&
      typeof s.reasoning === 'string'
  )
  if (!valid) return false
  if (data.length > expectedCount) return false
  return true
}

export async function analyzeMeme(imageBuffer, mimeType, options = {}) {
  const { prompt, preferredTemplates } = options
  const base64 = imageBuffer.toString('base64')
  const imageUrl = `data:${mimeType};base64,${base64}`

  const systemPrompt = buildSystemPrompt(preferredTemplates)

  const templatesToUse = preferredTemplates?.length
    ? TEMPLATES.filter((t) => preferredTemplates.includes(t.id))
    : TEMPLATES
  const expectedCount = templatesToUse.length
  const allowedIds = new Set(templatesToUse.map((t) => t.id))

  const userContent = []
  userContent.push({ type: 'image_url', image_url: { url: imageUrl, detail: 'low' } })

  if (prompt) {
    userContent.push({
      type: 'text',
      text: `Here's what's going on: "${prompt}"\n\nMake ${expectedCount} absolutely unhinged memes using this context and the photo. Peak internet humor only.`,
    })
  } else {
    userContent.push({
      type: 'text',
      text: `Make this photo into ${expectedCount} absolutely unhinged memes. Peak internet humor only.`,
    })
  }

  let attempts = 0
  while (attempts < 2) {
    attempts++
    const response = await getClient().chat.completions.create({
      model: 'openai/gpt-4o',
      max_tokens: 4000,
      temperature: 1.0,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    })

    const raw = response.choices[0]?.message?.content?.trim()
    try {
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '')
      const parsed = JSON.parse(cleaned)
      if (validateSuggestions(parsed, expectedCount, allowedIds)) return parsed
      console.warn(`[analyze] Validation failed: got ${parsed.length} items, expected ${expectedCount}. IDs:`, parsed.map(s => s.templateId))
    } catch (e) {
      console.warn('[analyze] JSON parse failed:', e.message, 'raw:', raw?.slice(0, 200))
    }
  }

  const err = new Error('AI returned malformed output after 2 attempts')
  err.status = 502
  throw err
}

export async function refineMeme(imageBuffer, mimeType, previousSuggestions, feedback) {
  const base64 = imageBuffer.toString('base64')
  const imageUrl = `data:${mimeType};base64,${base64}`

  const templateIds = previousSuggestions.map((s) => s.templateId)
  const templatesToUse = TEMPLATES.filter((t) => templateIds.includes(t.id))
  const expectedCount = templatesToUse.length
  const allowedIds = new Set(templatesToUse.map((t) => t.id))
  const templateList = templatesToUse.map((t) => `${t.id} ("${t.name}")`).join(', ')

  const systemPrompt = `You are a terminally online meme lord. The user already got meme suggestions but wants them REFINED based on their feedback.

RULES:
- Keep the same templates and structure.
- Apply the user's feedback to make the memes BETTER — funnier, edgier, more specific, whatever they asked for.
- Short punchy text. Max 8-10 words per line.
- Be edgy but not offensive.

Templates (keep these exact IDs): ${templateList}

OUTPUT FORMAT — JSON array of ${expectedCount} objects, nothing else:
[{"templateId":"...","topText":"...","bottomText":"...","reasoning":"one line on why this version is better"}]

No markdown fences. No explanations outside JSON.`

  const previousJson = JSON.stringify(previousSuggestions, null, 2)

  let attempts = 0
  while (attempts < 2) {
    attempts++
    const response = await getClient().chat.completions.create({
      model: 'openai/gpt-4o',
      max_tokens: 4000,
      temperature: 1.0,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } },
            { type: 'text', text: `Previous suggestions:\n${previousJson}\n\nUser feedback: "${feedback}"\n\nRefine all ${expectedCount} memes based on this feedback.` },
          ],
        },
      ],
    })

    const raw = response.choices[0]?.message?.content?.trim()
    try {
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '')
      const parsed = JSON.parse(cleaned)
      if (validateSuggestions(parsed, expectedCount, allowedIds)) return parsed
      console.warn(`[refine] Validation failed: got ${parsed.length} items, expected ${expectedCount}`)
    } catch (e) {
      console.warn('[refine] JSON parse failed:', e.message)
    }
  }

  const err = new Error('AI returned malformed output after 2 attempts')
  err.status = 502
  throw err
}
