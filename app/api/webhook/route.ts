import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(url, serviceRole)

function signPayload(secret: string, body: string) {
  return crypto.createHmac('sha256', secret).update(body).digest('hex')
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return NextResponse.json({ ok: false, message: 'Missing or invalid Authorization' }, { status: 401 })
    const token = authHeader.split(' ')[1]

    // validate token and fetch user
    const { data: userResp, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userResp?.user) return NextResponse.json({ ok: false, message: 'Invalid token' }, { status: 401 })
    const user = userResp.user

    // check role in public.users (fallback to metadata)
    const { data: roleRow } = await supabase.from('users').select('role').eq('id', user.id).single()
    const role = roleRow?.role || (user.user_metadata as Record<string, any>)?.role || 'cliente'
    if (![ 'admin', 'socio', 'sócio' ].includes(String(role))) {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
    }

    const rawBody = await request.text()
    const payload = rawBody ? JSON.parse(rawBody) : {}

    const webhook = process.env.NEXT_PUBLIC_WHATSAPP_WEBHOOK_URL || process.env.WHATSAPP_WEBHOOK_URL || ''
    if (!webhook) return NextResponse.json({ ok: false, message: 'Webhook não configurado' }, { status: 400 })

    // sign payload if secret configured
    const secret = process.env.WHATSAPP_WEBHOOK_SECRET || ''
    const signature = secret ? signPayload(secret, rawBody) : undefined

    // forward to external webhook
    const forwardRes = await fetch(webhook, {
      method: 'POST',
      headers: {
        'content-type':'application/json',
        ...(signature ? { 'x-signature': signature } : {}),
      },
      body: JSON.stringify({ ...payload, forwarded_by: user.id, forwarded_role: role }),
    })

    // read response body (safe guard)
    let respText = ''
    try { respText = await forwardRes.text() } catch (e) { respText = '' }

    // log forwarding result to webhook_logs for audit (service role client)
    try {
      const logPayload = {
        source: 'forward',
        payload: { forwarded: true, original: payload },
        signature: signature || null,
        verified: !!signature,
        headers: { forwarded_to: webhook, response_status: forwardRes.status, response_body: respText.slice(0, 4000) }
      }
      await supabase.from('webhook_logs').insert([logPayload])
    } catch (e) { /* ignore logging errors */ }

    if (!forwardRes.ok) {
      return NextResponse.json({ ok: false, webhook_error: respText }, { status: 502 })
    }

    return NextResponse.json({ ok: true, webhook_response: { status: forwardRes.status, body: respText } })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
