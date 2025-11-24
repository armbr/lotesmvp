import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(url, key)

function verifyHmac(secret: string, body: string, signature?: string){
  if (!secret) return false
  if (!signature) return false
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected,'hex'), Buffer.from(signature,'hex'))
}

export async function POST(request: Request) {
  try {
    const raw = await request.text()
    const payload = raw ? JSON.parse(raw) : {}
    const sig = request.headers.get('x-signature') || request.headers.get('x-hub-signature') || ''
    const secret = process.env.WHATSAPP_WEBHOOK_SECRET || ''
    const verified = verifyHmac(secret, raw, sig)

    // log
    await supabase.from('webhook_logs').insert([{ source: 'external', payload, signature: sig, verified, headers: Object.fromEntries((request.headers as unknown as Headers).entries()) }])

    if (!verified) return NextResponse.json({ ok: false, verified: false }, { status: 401 })

    // Aqui você pode transformar e inserir dados nas tabelas apropriadas, por exemplo inserir em `notificacoes`.
    // Exemplo: inserir notificação
    try {
      const titulo = payload.title || payload.titulo || 'Webhook recebido'
      const mensagem = payload.body || payload.message || JSON.stringify(payload)
      await supabase.from('notificacoes').insert([{ titulo, mensagem, lida: false }])
    } catch (e) { /* ignore insertion errors */ }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

