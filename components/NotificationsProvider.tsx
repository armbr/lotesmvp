'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import supabase from '../lib/supabaseClient'
import { toast, Toaster } from 'react-hot-toast'

type Notification = { id: string; titulo: string; mensagem: string; lida: boolean; data: string }

const NotificationsContext = createContext<{ notifications: Notification[]; unread: number; refresh: ()=>void }>({ notifications: [], unread: 0, refresh: ()=>{} })

export function useNotifications(){ return useContext(NotificationsContext) }

export default function NotificationsProvider({ children }: { children: React.ReactNode }){
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [role, setRole] = useState<string | null>(null)

  async function load(){
    const { data } = await supabase.from('notificacoes').select('*').order('data', { ascending: false }).limit(50)
    setNotifications((data || []) as Notification[])
  }

  async function loadRole(){
    try {
      const { data: userResp } = await supabase.auth.getUser()
      const user = userResp?.user
      if (!user) return setRole('cliente')

      // try to read role from `users` table (if exists)
      try {
        const { data: r } = await supabase.from('users').select('role').eq('id', user.id).single()
        if (r && r.role) return setRole(r.role)
      } catch (e) {
        // ignore if table does not exist
      }

      // fallback to metadata.role
      const metaRole = (user.user_metadata as Record<string, any>)?.role
      if (metaRole) return setRole(metaRole)
      setRole('cliente')
    } catch (e) { console.error('loadRole', e); setRole('cliente') }
  }

  useEffect(()=>{ load(); loadRole() }, [])

  useEffect(()=>{
    const channel = supabase.channel('public:notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gastos' }, (payload) => handleEvent('gasto', payload))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cronograma_obras' }, (payload) => handleEvent('cronograma', payload))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'processos_licencas' }, (payload) => handleEvent('processo', payload))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documentos' }, (payload) => handleEvent('documento', payload))
      .subscribe()

    return ()=>{ channel.unsubscribe() }
  }, [role])

  async function handleEvent(tipo: string, payload: any){
    try {
      const ev = payload.eventType || payload.type || payload.event || 'update'
      let titulo = ''
      let mensagem = ''
      const newRow = payload.new || payload.record || payload
      if (tipo === 'gasto'){
        titulo = 'Novo gasto'
        mensagem = `Gasto de R$ ${Number(newRow.valor||0).toFixed(2)} no empreendimento.`
      } else if (tipo === 'cronograma'){
        titulo = 'Cronograma atualizado'
        mensagem = `${newRow.etapa || 'Etapa'} — ${newRow.percentual_concluido || 0}%`
      } else if (tipo === 'processo'){
        titulo = 'Processo de licença alterado'
        mensagem = `${newRow.nome || ''} — ${newRow.status || ''}`
      } else if (tipo === 'documento'){
        titulo = 'Documento atualizado'
        mensagem = `${newRow.tipo || 'Documento'} ${newRow.requer_assinatura ? 'requer assinatura' : 'adicionado'}`
      }

      // persistir na tabela notificacoes (registro central)
      await supabase.from('notificacoes').insert([{ titulo, mensagem, lida: false }])

      // Somente mostrar toast e enviar webhook se o role do usuário atual for admin ou socio
      const allowed = role === 'admin' || role === 'socio' || role === 'sócio' || role === 'socio'
      if (allowed) {
        toast.success(`${titulo}: ${mensagem}`)
        try {
          // include user's access token in Authorization header so server can verify role
          const { data: sessionData } = await supabase.auth.getSession()
          const token = ((sessionData as Record<string, any>)?.session as Record<string, any>)?.access_token || ''
          await fetch('/api/webhook', { method: 'POST', headers: { 'content-type':'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ tipo, titulo, mensagem }) })
        } catch(e){}
      }

      load()
    } catch(e){ console.error('notify error', e) }
  }

  const unread = notifications.filter(n=>!n.lida).length

  return (
    <NotificationsContext.Provider value={{ notifications, unread, refresh: load }}>
      <Toaster position="top-right" />
      {children}
    </NotificationsContext.Provider>
  )
}


