'use client'
import { useState } from 'react'
import supabase from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function signIn(){
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) router.push('/')
    else alert(error.message)
  }

  async function signInGoogle(){
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Entrar</h2>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded mb-2" />
      <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Senha" className="w-full p-2 border rounded mb-2" />
      <div className="flex gap-2">
        <button onClick={signIn} className="bg-blue-600 text-white px-3 py-2 rounded">Entrar</button>
        <button onClick={signInGoogle} className="bg-red-600 text-white px-3 py-2 rounded">Entrar com Google</button>
      </div>
    </div>
  )
}
