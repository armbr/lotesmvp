'use client'
import { MapContainer as RLMapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import React from 'react'
import 'leaflet/dist/leaflet.css'

export default function LoteMap({ features }: any) {
  return (
    <div className="h-80 rounded overflow-hidden">
      {/* Cast to any to avoid strict MapContainer prop typings during build */}
      <RLMapContainer center={[-23.5, -46.6]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />   
        {features && (() => {
          const AnyGeoJSON = GeoJSON as unknown as React.ComponentType<any>
          return <AnyGeoJSON data={features} style={(feature:any)=>({ color: feature.properties?.status === 'vendido' ? '#10B981' : feature.properties?.status === 'reservado' ? '#F59E0B' : '#3B82F6' })} />
        })()}
      </RLMapContainer>
    </div>
  )
}


