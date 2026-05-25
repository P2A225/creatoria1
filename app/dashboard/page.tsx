'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sparkles, LogOut, FileDown, Trash2, ChevronDown, Zap, Hash, FileText, Lightbulb, Clock, Loader as Loader2, Send } from 'lucide-react'

interface Generation {
  id: string
  topic: string
  platform: string
  hook: string
  script: string
  title: string
  hashtags: string
  description: string
  visual_ideas: string
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('tiktok')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [generations, setGenerations] = useState<Generation[]>([])
  const [generationsLeft, setGenerationsLeft] = useState(20)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  const fetchGenerations = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setGenerations(data)
    setLoadingHistory(false)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/auth/login')
        return
      }
      setUser(session.user)
      fetchGenerations(session.user.id)

      // Ensure profile exists
      supabase.from('profiles').select('id').eq('id', session.user.id).maybeSingle().then(({ data }) => {
        if (!data) {
          supabase.from('profiles').insert({ id: session.user.id, email: session.user.email })
        }
      })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push('/auth/login')
    })

    return () => subscription.unsubscribe()
  }, [router, fetchGenerations])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim() || generating) return

    setGenerating(true)
    setError('')
    setResult(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ topic: topic.trim(), platform }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la génération')
        return
      }

      setResult(data)
      setGenerationsLeft(data.generations_left ?? 0)
      setTopic('')
      if (user) fetchGenerations(user.id)
    } catch {
      setError('Erreur réseau. Réessayez.')
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id: string) => {
    await supabase.from('generations').delete().eq('id', id)
    if (user) fetchGenerations(user.id)
  }

  const exportMarkdown = (gen: Generation | null) => {
    const g = gen || result
    if (!g) return
    const md = `# ${g.title || g.topic}\n\n## Hook\n${g.hook}\n\n## Script\n${g.script}\n\n## Titre\n${g.title}\n\n## Hashtags\n${g.hashtags}\n\n## Description\n${g.description}\n\n## Idees visuelles\n${g.visual_ideas}\n`
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(g.title || g.topic).replace(/[^a-zA-Z0-9]/g, '_')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[#262626] bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-lg">CreatorAI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#a3a3a3] hidden sm:block">{user.email}</span>
            <button onClick={handleLogout} className="text-sm text-[#a3a3a3] hover:text-white flex items-center gap-1.5 transition-colors">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        {/* Rate limit badge */}
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-[#a3a3a3]">
            {generationsLeft} générations restantes aujourd&apos;hui
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Generator form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleGenerate} className="card p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Sujet ou idée</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex: Recette healthy rapide pour TikTok..."
                  rows={3}
                  className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Plateforme</label>
                <div className="relative">
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-2.5 text-sm appearance-none focus:outline-none focus:border-blue-600 transition-colors"
                  >
                    <option value="tiktok">TikTok</option>
                    <option value="reels">Instagram Reels</option>
                    <option value="shorts">YouTube Shorts</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373] pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={generating || !topic.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {generating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Génération en cours...</>
                ) : (
                  <><Send className="w-4 h-4" /> Générer le contenu</>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="mt-6 card p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{result.title}</h3>
                  <button
                    onClick={() => exportMarkdown(null)}
                    className="text-[#a3a3a3] hover:text-white transition-colors"
                    title="Exporter en Markdown"
                  >
                    <FileDown className="w-5 h-5" />
                  </button>
                </div>

                {result.hook && (
                  <div>
                    <div className="flex items-center gap-1.5 text-blue-400 text-xs font-medium mb-1.5">
                      <Zap className="w-3.5 h-3.5" /> Hook
                    </div>
                    <p className="text-sm leading-relaxed">{result.hook}</p>
                  </div>
                )}

                {result.script && (
                  <div>
                    <div className="flex items-center gap-1.5 text-blue-400 text-xs font-medium mb-1.5">
                      <FileText className="w-3.5 h-3.5" /> Script
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-line">{result.script}</div>
                  </div>
                )}

                {result.hashtags && (
                  <div>
                    <div className="flex items-center gap-1.5 text-blue-400 text-xs font-medium mb-1.5">
                      <Hash className="w-3.5 h-3.5" /> Hashtags
                    </div>
                    <p className="text-sm text-cyan-400">{result.hashtags}</p>
                  </div>
                )}

                {result.description && (
                  <div>
                    <div className="flex items-center gap-1.5 text-blue-400 text-xs font-medium mb-1.5">
                      <FileText className="w-3.5 h-3.5" /> Description
                    </div>
                    <p className="text-sm leading-relaxed">{result.description}</p>
                  </div>
                )}

                {result.visual_ideas && (
                  <div>
                    <div className="flex items-center gap-1.5 text-blue-400 text-xs font-medium mb-1.5">
                      <Lightbulb className="w-3.5 h-3.5" /> Idees visuelles
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-line">{result.visual_ideas}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* History */}
          <div className="lg:col-span-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-sm font-medium mb-4 lg:pointer-events-none"
            >
              <Clock className="w-4 h-4 text-[#737373]" />
              Historique des generations
              <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform ${showHistory ? 'rotate-180' : ''} lg:hidden`} />
            </button>

            <div className={`space-y-3 ${showHistory ? 'block' : 'hidden'} lg:block`}>
              {loadingHistory ? (
                <div className="text-center py-8 text-[#737373]">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Chargement...
                </div>
              ) : generations.length === 0 ? (
                <div className="text-center py-8 text-[#737373] text-sm">
                  Aucune generation pour le moment. Creez votre premier contenu !
                </div>
              ) : (
                generations.map((gen) => (
                  <div key={gen.id} className="card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-sm">{gen.topic}</h4>
                        <span className="text-xs text-[#737373] capitalize">{gen.platform} — {new Date(gen.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => exportMarkdown(gen)}
                          className="text-[#737373] hover:text-white transition-colors"
                          title="Exporter"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(gen.id)}
                          className="text-[#737373] hover:text-red-400 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {gen.hook && <p className="text-xs text-[#a3a3a3] line-clamp-2">{gen.hook}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
