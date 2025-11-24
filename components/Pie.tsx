'use client'
import React from 'react'

export default function Pie({ data, categories }: any) {
  const entries = Object.entries(data || {})
  const total = entries.reduce((s:any,[_k,v]:any)=>s + Number(v || 0), 0) || 0
  const color = ['#10B981','#F59E0B','#EF4444','#3B82F6','#8B5CF6']
  return (
    <div>
      <div className="flex gap-2">
        {entries.map(([k,v],i)=> {
          const cat = (categories || []).find((c:any)=>c.id===k)
          const pct = total ? ((Number(v || 0)/total)*100).toFixed(1) : '0.0'
          return (
            <div key={k} className="flex items-center gap-2">
              <div style={{width:12,height:12,background:color[i%color.length]}} />
              <div className="text-sm">{cat?.nome || 'Outro'} — {pct}%</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
