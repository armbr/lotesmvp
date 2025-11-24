'use client'
import { useState } from 'react'
import { useNotifications } from './NotificationsProvider'
import supabase from '../lib/supabaseClient'

export default function NotificationBell(){
  const { notifications, unread, refresh } = useNotifications()
  const [open, setOpen] = useState(false)

  async function markRead(id?: string){
    if(id){ await supabase.from('notificacoes').update({ lida: true }).eq('id', id) }
    else { await supabase.from('notificacoes').update({ lida: true }).neq('lida', true) }
    refresh()
  }

  return (
    <div className="relative">
      <button onClick={()=>setOpen(o=>!o)} className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {unread>0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">{unread}</span>}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow p-2 z-50">
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold">Notificações</div>
            <div className="flex gap-2">
              <button onClick={()=>markRead()} className="text-sm text-slate-500">Marcar todas lidas</button>
            </div>
          </div>
          <div className="max-h-64 overflow-auto">
            {notifications.map(n=> (
              <div key={n.id} className={`p-2 rounded ${n.lida ? 'bg-white' : 'bg-slate-50'}`}>
                <div className="font-medium">{n.titulo}</div>
                <div className="text-xs text-gray-600">{n.mensagem}</div>
                <div className="text-xs text-gray-400">{new Date(n.data).toLocaleString()}</div>
                {!n.lida && <button onClick={()=>markRead(n.id)} className="text-xs text-blue-600 mt-1">Marcar como lida</button>}
              </div>
            ))}
            {notifications.length===0 && <div className="text-sm text-gray-500 p-2">Nenhuma notificação</div>}
          </div>
        </div>
      )}
    </div>
  )
}
