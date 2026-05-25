'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('Cet email est déjà utilisé')
      } else if (error.message.includes('password')) {
        setError('Le mot de passe doit contenir au moins 6 caractères')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-7 h-7 text-blue-500" />
            <span className="font-bold text-xl">CreatorAI</span>
          </Link>
          <h1 className="text-2xl font-bold">Créer un compte</h1>
          <p className="text-[#a3a3a3] text-sm mt-2">Commencez à créer du contenu viral</p>
        </div>

        <form onSubmit={handleSignup} className="card p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vous@exemple.com"
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="6 caractères minimum"
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Création...' : <>Créer mon compte <ArrowRight className="w-4 h-4" /></>}
          </button>

          <p className="text-center text-sm text-[#a3a3a3]">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-blue-500 hover:text-blue-400">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
