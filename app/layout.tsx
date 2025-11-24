import './globals.css'
import { ReactNode } from 'react'
import Link from 'next/link'
import NotificationsProvider from '../components/NotificationsProvider'
import NotificationBell from '../components/NotificationBell'

export const metadata = {
  title: 'Loteadora',
  description: 'Sistema de gestão para loteadora - PWA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head />
      <body className="min-h-screen bg-gray-50 text-slate-800">
        <NotificationsProvider>
          <header className="bg-white border-b">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              <Link href="/" className="font-bold text-lg">Loteadora</Link>
              <nav className="flex items-center gap-3">
                <Link href="/" className="text-sm text-slate-600">Empreendimentos</Link>
                <Link href="/dashboard" className="text-sm text-slate-600">Dashboard</Link>
                <div className="ml-4"><NotificationBell /></div>
              </nav>
            </div>
          </header>
          <main className="max-w-6xl mx-auto p-4">{children}</main>
          <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{});}` }} />
        </NotificationsProvider>
      </body>
    </html>
  )
}
