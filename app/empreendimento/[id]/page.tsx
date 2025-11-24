"use client"
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import supabase from '../../../lib/supabaseClient'
import LoteMap from '../../../components/LoteMap'
import ExpensesModule from '../../../components/ExpensesModule'
import SignaturePad from '../../../components/SignaturePad'

export default function EmpreendimentoPage(){
  const params = useParams()
  const id = params?.id
  const [data, setData] = useState<any>(null)
  const [cronograma, setCronograma] = useState<any[]>([])
  const [processos, setProcessos] = useState<any[]>([])
  const [docs, setDocs] = useState<any[]>([])

  useEffect(()=>{ if(id) load() }, [id])
  async function load(){
    const { data } = await supabase.from('empreendimentos').select('*').eq('id', id).single()
    setData(data)
    const { data: c } = await supabase.from('cronograma_obras').select('*').eq('empreendimento_id', id).order('data_inicio_previsto')
    setCronograma(c || [])
    const { data: p } = await supabase.from('processos_licencas').select('*').eq('empreendimento_id', id)
    setProcessos(p || [])
    const { data: d } = await supabase.from('documentos').select('*').eq('empreendimento_id', id)
    setDocs(d || [])
  }

  async function uploadFoto(e:any){
    const file = e.target.files?.[0]
    if(!file) return
    let coords = null
    try { coords = await new Promise((res, rej)=> navigator.geolocation.getCurrentPosition(p=>res(p.coords), rej)) } catch(e){ }
    const path = `fotos/${id}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('fotos').upload(path, file)
    if (!error) {
      await supabase.from('documentos').insert({ empreendimento_id: id, tipo: 'foto', url: path, descricao: JSON.stringify({ coords }) })
      load()
    }
  }

  if(!data) return <div>Carregando...</div>

  return (
    <div>
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex gap-4">
          <img src={data.foto_aerea || '/icon-192.png'} className="w-48 h-32 object-cover rounded" />
          <div className="flex-1">
            <h1 className="text-xl font-bold">{data.nome}</h1>
            <div className="mt-2">Cidade: {data.cidade}</div>
            <div className="mt-1">% obra: {data.percentual_obra}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Mapa de Lotes</h3>
            <LoteMap features={[]} />
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Cronograma</h3>
            <ul className="space-y-2">
              {cronograma.map(c=> (
                <li key={c.id} className="p-2 border rounded">
                  <div className="font-semibold">{c.etapa} — {c.percentual_concluido}%</div>
                  <div className="text-sm text-gray-600">{c.descricao}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Fotos da obra (upload)</h3>
            <input type="file" accept="image/*" onChange={uploadFoto} />
            <div className="mt-2 grid grid-cols-3 gap-2">
              {docs.filter(d=>d.tipo==='foto').map(f=> (
                <img key={f.id} src={supabase.storage.from('fotos').getPublicUrl(f.url).data.publicUrl} className="w-full h-24 object-cover rounded" />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Licenças e Processos</h3>
            <ul className="space-y-2">
              {processos.map(p=> (
                <li key={p.id} className="p-2 rounded border flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{p.nome}</div>
                    <div className="text-sm text-gray-600">{p.orgao} — {p.status}</div>
                  </div>
                  <div className="text-xs text-gray-500">{p.data_prevista || ''}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Documentos</h3>
            <ul className="space-y-2">
              {docs.map(d=> (
                <li key={d.id} className="p-2 border rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{d.tipo}</div>
                      <div className="text-sm text-gray-600">{d.descricao}</div>
                    </div>
                    <div className="flex gap-2">
                      {d.requer_assinatura && <SignaturePad documentoId={d.id} pdfUrl={supabase.storage.from('documentos').getPublicUrl(d.url).data.publicUrl} onComplete={load} />}
                      {!d.requer_assinatura && <a className="text-sm text-blue-600" href={supabase.storage.from('documentos').getPublicUrl(d.url).data.publicUrl} target="_blank">Abrir</a>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <ExpensesModule empreendimento={data} socios={[]} categorias={[]} />
        </div>
      </div>
    </div>
  )
}
