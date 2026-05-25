'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sparkles, Zap, Hash, FileText, Lightbulb, ArrowRight } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard')
      else setLoading(false)
    })
  }, [router])

  if (loading) return null

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[#262626] bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-lg">CreatorAI</span>
          </div>
          <nav className="flex items-center gap-4">
            <button
              onClick={() => router.push('/auth/login')}
              className="text-sm text-[#a3a3a3] hover:text-white transition-colors"
            >
              Connexion
            </button>
            <button
              onClick={() => router.push('/auth/signup')}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              S&apos;inscrire
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col">
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-6">
              <Zap className="w-4 h-4" />
              Propulsé par GPT-4o
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Créez du contenu viral<br />
              <span className="gradient-text">en quelques secondes</span>
            </h1>
            <p className="text-lg text-[#a3a3a3] max-w-2xl mx-auto mb-10">
              Hooks, scripts, titres, hashtags et descriptions — tout ce dont vous avez besoin pour TikTok, Reels et Shorts.
            </p>
            <button
              onClick={() => router.push('/auth/signup')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl text-lg font-medium transition-colors"
            >
              Commencer gratuitement <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 border-t border-[#262626]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Tout pour créer du contenu qui performe</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Sparkles, title: 'Hooks viraux', desc: 'Des accroches qui captent l\'attention dès la première seconde' },
                { icon: FileText, title: 'Scripts complets', desc: 'Des scripts structurés avec timing et indications visuelles' },
                { icon: Hash, title: 'Hashtags optimisés', desc: 'Les meilleurs hashtags pour maximiser votre portée' },
                { icon: Lightbulb, title: 'Idées visuelles', desc: 'Des suggestions d\'images et de montage pour chaque scène' },
                { icon: Zap, title: 'Titres engageants', desc: 'Des titres qui donnent envie de cliquer et de partager' },
                { icon: FileText, title: 'Descriptions SEO', desc: 'Des descriptions optimisées pour l\'algorithme' },
              ].map((feature, i) => (
                <div key={i} className="card p-6 hover:border-blue-600/30 transition-colors">
                  <feature.icon className="w-8 h-8 text-blue-500 mb-4" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#a3a3a3]">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#262626] py-8 px-6">
          <div className="max-w-6xl mx-auto text-center text-sm text-[#737373]">
            CreatorAI — Powered by OpenAI GPT-4o
          </div>
        </footer>
      </main>
    </div>
  )
}
