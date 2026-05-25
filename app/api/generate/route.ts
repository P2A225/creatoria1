import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const MAX_GENERATIONS_PER_DAY = 20

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify user session
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
    })

    if (!userRes.ok) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
    }

    const user = await userRes.json()
    const userId = user.id

    // Parse body
    const { topic, platform } = await req.json()

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({ error: 'Le sujet est requis' }, { status: 400 })
    }

    const validPlatforms = ['tiktok', 'reels', 'shorts']
    const selectedPlatform = validPlatforms.includes(platform) ? platform : 'tiktok'

    // Check rate limit using Supabase REST API
    const today = new Date().toISOString().split('T')[0]
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=generation_count_today,last_generation_date`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
    })

    let profile = null
    if (profileRes.ok) {
      const profiles = await profileRes.json()
      profile = profiles[0] || null
    }

    // If no profile, create one
    if (!profile) {
      await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ id: userId, email: user.email, generation_count_today: 0, last_generation_date: today }),
      })
      profile = { generation_count_today: 0, last_generation_date: today }
    }

    // Reset counter if new day
    let currentCount = profile.generation_count_today || 0
    if (profile.last_generation_date !== today) {
      currentCount = 0
    }

    if (currentCount >= MAX_GENERATIONS_PER_DAY) {
      return NextResponse.json(
        { error: `Limite atteinte (${MAX_GENERATIONS_PER_DAY} générations/jour). Revenez demain !` },
        { status: 429 }
      )
    }

    // Generate content with OpenAI
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return NextResponse.json({ error: 'Clé OpenAI non configurée' }, { status: 500 })
    }

    const prompt = `Tu es un expert en création de contenu viral pour ${selectedPlatform}. Pour le sujet suivant, génère du contenu engageant et optimisé pour l'algorithme.

Sujet : "${topic.trim()}"

Réponds UNIQUEMENT en JSON valide avec cette structure exacte (pas de markdown, pas de backticks) :
{
  "hook": "Une accroche virale de 1-2 phrases qui captive immédiatement",
  "script": "Un script complet et structuré avec indications de timing et visuelles, 150-300 mots",
  "title": "Un titre accrocheur optimisé pour le clic",
  "hashtags": "15 hashtags pertinents séparés par des espaces, incluant des hashtags tendance",
  "description": "Une description optimisée SEO avec mots-clés, 2-3 phrases",
  "visual_ideas": "5 suggestions visuelles pour le montage, séparées par des retours à la ligne"
}`

    const completionRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    })

    if (!completionRes.ok) {
      const err = await completionRes.text()
      console.error('OpenAI error:', err)
      return NextResponse.json({ error: 'Erreur lors de la génération IA' }, { status: 500 })
    }

    const completion = await completionRes.json()
    const content = completion.choices[0]?.message?.content || ''

    // Parse the response - handle potential markdown wrapping
    let parsed
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      parsed = {
        hook: content.substring(0, 200),
        script: content,
        title: topic,
        hashtags: '',
        description: '',
        visual_ideas: '',
      }
    }

    // Save generation to database
    const newCount = currentCount + 1
    await fetch(`${SUPABASE_URL}/rest/v1/generations`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        user_id: userId,
        topic: topic.trim(),
        platform: selectedPlatform,
        hook: parsed.hook || '',
        script: parsed.script || '',
        title: parsed.title || '',
        hashtags: parsed.hashtags || '',
        description: parsed.description || '',
        visual_ideas: parsed.visual_ideas || '',
      }),
    })

    // Update rate limit counter
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        generation_count_today: newCount,
        last_generation_date: today,
      }),
    })

    return NextResponse.json({
      ...parsed,
      generations_left: MAX_GENERATIONS_PER_DAY - newCount,
    })
  } catch (err) {
    console.error('Generate error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
