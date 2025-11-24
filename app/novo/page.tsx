'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../lib/supabaseClient'

export default function Novo() {
  const [nome, setNome] = useState('')
  const [cidade, setCidade] = useState('')
  const [total, setTotal] = useState(0)
  const router = useRouter()

  async function criar(){
    const { data } = await supabase.from('empreendimentos').insert({ nome, cidade, total_lotes: total }).select().single()
    router.push(`/empreendimento/${data.id}`)
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Criar Empreendimento</h2>
      <div className="space-y-2">
        <input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Nome" className="w-full p-2 border rounded" />
        <input value={cidade} onChange={e=>setCidade(e.target.value)} placeholder="Cidade" className="w-full p-2 border rounded" />
        <input value={total} onChange={e=>setTotal(Number(e.target.value))} type="number" placeholder="Total de lotes" className="w-full p-2 border rounded" />
        <div className="flex gap-2">
          <button onClick={criar} className="bg-teal-500 text-white px-3 py-2 rounded">Criar</button>
        </div>
      </div>
    </div>
  )
}
