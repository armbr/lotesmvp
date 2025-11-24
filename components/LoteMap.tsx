'use client'
import { MapContainer as RLMapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import React from 'react'
import 'leaflet/dist/leaflet.css'

export default function LoteMap({ features }: any) {
  const center: LatLngExpression = [-23.5, -46.6]
  const MapContainer = RLMapContainer as any
  
  return (
    <div className="h-80 rounded overflow-hidden">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />   
        {features && (() => {
          const AnyGeoJSON = GeoJSON as unknown as React.ComponentType<any>
          return <AnyGeoJSON data={features} style={(feature:any)=>({ color: feature.properties?.status === 'vendido' ? '#10B981' : feature.properties?.status === 'reservado' ? '#F59E0B' : '#3B82F6' })} />
        })()}
      </MapContainer>
    </div>
  )
}


