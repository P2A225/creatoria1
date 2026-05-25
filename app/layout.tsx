import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CreatorAI — SaaS IA TikTok/Reels',
  description: 'Generate hooks, scripts, titles, hashtags and more for your TikTok and Reels content with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
