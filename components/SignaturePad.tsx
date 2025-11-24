'use client'
import SignatureCanvas from 'react-signature-canvas'
import { useRef, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import supabase from '../lib/supabaseClient'

export default function SignaturePad({ documentoId, pdfUrl, onComplete }: any) {
  const sigRef = useRef<any>()
  const [saving, setSaving] = useState(false)

  async function saveSignature(){
    if(!sigRef.current) return
    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL('image/png')
    setSaving(true)
    try {
      // fetch original PDF
      const res = await fetch(pdfUrl)
      const arrayBuffer = await res.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pngImage = await pdfDoc.embedPng(dataUrl)
      const pages = pdfDoc.getPages()
      const first = pages[0]
      const { width, height } = first.getSize()
      first.drawImage(pngImage, {
        x: 50,
        y: 50,
        width: 200,
        height: 100,
      })
      const modified = await pdfDoc.save()
      // `modified` is a Uint8Array but TypeScript's DOM types may disagree;
      // cast to `any` to satisfy the compiler while keeping runtime behavior.
      const blob = new Blob([modified as Uint8Array], { type: 'application/pdf' })
      const path = `documentos_assinados/${documentoId}-${Date.now()}.pdf`
      const { error } = await supabase.storage.from('documentos').upload(path, blob)
      if (!error) {
        // atualizar registro de documento (simplificado)
        await supabase.from('documentos').update({ url: path }).eq('id', documentoId)
        onComplete && onComplete()
      }
    } catch(e){ console.error(e) }
    setSaving(false)
  }

  return (
    <div>
      <div className="border rounded">
        <SignatureCanvas ref={sigRef} penColor="black" canvasProps={{width:500,height:200,className:'sigCanvas'}} />
      </div>
      <div className="flex gap-2 mt-2">
        <button onClick={()=>sigRef.current.clear()} className="px-3 py-1 border rounded">Limpar</button>
        <button onClick={saveSignature} className="px-3 py-1 bg-blue-600 text-white rounded" disabled={saving}>{saving ? 'Salvando...' : 'Salvar assinatura'}</button>
      </div>
    </div>
  )
}

