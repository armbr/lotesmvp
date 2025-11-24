"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import supabase from '../lib/supabaseClient'

export default function Page() {
  const [empreendimentos, setEmpreendimentos] = useState<any[]>([])

  useEffect(()=>{ fetchEmpreendimentos() }, [])
  async function fetchEmpreendimentos(){
    const { data } = await supabase.from('empreendimentos').select('*').order('criado_em', { ascending: false })
    setEmpreendimentos(data || [])
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Empreendimentos</h1>
        <Link href="/novo" className="bg-teal-500 text-white px-3 py-1 rounded">+ Novo</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {empreendimentos.map(e=> (
          <Link key={e.id} href={`/empreendimento/${e.id}`} className="block bg-white p-4 rounded shadow hover:shadow-md">
            <div className="flex gap-4">
              <img src={e.foto_aerea || '/icon-192.png'} alt="" className="w-28 h-20 object-cover rounded" />
              <div>
                <div className="font-semibold">{e.nome}</div>
                <div className="text-sm text-gray-600">Cidade: {e.cidade || '—'}</div>
                <div className="text-sm text-gray-600">Lotes: {e.total_lotes}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
