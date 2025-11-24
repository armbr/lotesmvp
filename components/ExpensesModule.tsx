'use client'
import { useState, useEffect } from 'react'
import supabase from '../lib/supabaseClient'
import { saveAs } from 'file-saver'
import ExcelJS from 'exceljs'

export default function ExpensesModule({ empreendimento, socios: initialSocios, categorias: initialCats }: any) {
  const [gastos, setGastos] = useState<any[]>([])
  const [socios, setSocios] = useState(initialSocios || [])
  const [categorias, setCategorias] = useState(initialCats || [])
  const [filtroCat, setFiltroCat] = useState('')
  const [filtroSocio, setFiltroSocio] = useState('')
  const [form, setForm] = useState({ valor:'', data:'', quem_pagou_user_id:'', categoria_id:'', subcategoria_texto:'', anexo: null })
  const [novoSocio, setNovoSocio] = useState('')

  useEffect(()=>{ fetchGastos() },[])

  async function fetchGastos(){
    const { data } = await supabase.from('gastos').select('*').eq('empreendimento_id', empreendimento.id).order('criado_em',{ascending:false})
    setGastos(data || [])
  }

  async function addSocio(){
    if(!novoSocio) return
    const { data } = await supabase.from('socios').insert({ nome: novoSocio }).select().single()
    setSocios(s=>[...s, data])
    setNovoSocio('')
  }

  async function salvarGasto(){
    const payload: any = {
      valor: Number(form.valor),
      data: form.data,
      quem_pagou_user_id: form.quem_pagou_user_id,
      categoria_id: form.categoria_id,
      subcategoria_texto: form.subcategoria_texto,
      empreendimento_id: empreendimento.id
    }
    if (form.anexo) {
      const file = form.anexo
      const path = `comprovantes/${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('comprovantes').upload(path, file, { upsert: false })
      if (!upErr) payload.comprovante_url = path
    }
    await supabase.from('gastos').insert(payload)
    // webhook notify (somente se configurado)
    try { fetch(process.env.NEXT_PUBLIC_WHATSAPP_WEBHOOK_URL || '', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ tipo:'gasto_criado', empreendimento: empreendimento.nome, valor: payload.valor }) }) } catch(e){}
    setForm({ valor:'', data:'', quem_pagou_user_id:'', categoria_id:'', subcategoria_texto:'', anexo: null })
    fetchGastos()
  }

  async function exportExcel(){
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Gastos')
    ws.addRow(['Valor','Data','Quem Pagou','Categoria','Subcategoria','Comprovante'])
    for(const g of gastos){
      const socio = socios.find((s:any)=>s.id===g.quem_pagou_user_id)?.nome || ''
      const cat = categorias.find((c:any)=>c.id===g.categoria_id)?.nome || ''
      ws.addRow([Number(g.valor), g.data, socio, cat, g.subcategoria_texto || '', g.comprovante_url || ''])
    }
    const buf = await wb.xlsx.writeBuffer()
    const blob = new Blob([buf], { type: 'application/octet-stream' })
    saveAs(blob, `${empreendimento.nome}-gastos.xlsx`)
  }

  const filtered = gastos.filter(g=> (!filtroCat || g.categoria_id===filtroCat) && (!filtroSocio || g.quem_pagou_user_id===filtroSocio))

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-3">Financeiro / Gastos</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <input value={form.valor} onChange={e=>setForm({...form,valor:e.target.value})} placeholder="Valor (R$)" className="p-2 border rounded" />
        <input type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})} className="p-2 border rounded" />
        <select value={form.quem_pagou_user_id} onChange={e=>setForm({...form,quem_pagou_user_id:e.target.value})} className="p-2 border rounded">
          <option value="">Quem pagou</option>
          { (socios || []).map((s:any)=>(<option key={s.id} value={s.id}>{s.nome}</option>)) }
        </select>
        <select value={form.categoria_id} onChange={e=>setForm({...form,categoria_id:e.target.value})} className="p-2 border rounded">
          <option value="">Categoria</option>
          { (categorias || []).map((c:any)=>(<option key={c.id} value={c.id}>{c.nome}</option>)) }
        </select>
        <input value={form.subcategoria_texto} onChange={e=>setForm({...form,subcategoria_texto:e.target.value})} placeholder="Subcategoria" className="p-2 border rounded" />
        <input type="file" onChange={e=>setForm({...form,anexo: (e.target.files ? e.target.files[0] : null)})} className="p-2" />
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={salvarGasto} className="bg-green-600 text-white px-3 py-2 rounded">+ Novo Gasto</button>
        <button onClick={exportExcel} className="bg-gray-700 text-white px-3 py-2 rounded">Exportar Excel</button>
      </div>

      <div className="space-y-2">
        {filtered.map(g=> (
          <div key={g.id} className="p-2 border rounded flex justify-between items-center">
            <div>
              <div className="text-sm">R$ {Number(g.valor).toFixed(2)} — {g.subcategoria_texto}</div>
              <div className="text-xs text-gray-500">{g.data}</div>
            </div>
            <div className="text-sm text-gray-600">{ (socios || []).find((s:any)=>s.id===g.quem_pagou_user_id)?.nome || '' }</div>
          </div>
        ))}
      </div>
    </div>
  )
}
