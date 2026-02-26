'use client'

import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import type { Company, AreaStat } from '@/lib/market-directory-data'
import { sectorHexColors, saturationHexColors, areaCoordinates } from '@/lib/market-directory-data'

// Fix default marker icon issue in webpack/next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface MarketMapProps {
  companies: Company[]
  areaStats: AreaStat[]
  selectedCompany: Company | null
  onSelectCompany: (company: Company) => void
  mapMode: 'markers' | 'heatmap' | 'sectors'
  isRtl: boolean
}

function createSectorIcon(sector: string, isGolden: boolean) {
  const color = sectorHexColors[sector] || '#6b7280'
  return L.divIcon({
    className: 'market-cluster-icon',
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50%;
      background: ${color}; border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      ${isGolden ? 'box-shadow: 0 0 0 3px #f59e0b, 0 2px 6px rgba(0,0,0,0.3);' : ''}
    "><span style="color:white;font-size:11px;font-weight:bold;">${sector.charAt(0)}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

function FlyToCompany({ company }: { company: Company | null }) {
  const map = useMap()
  useEffect(() => {
    if (company) {
      map.flyTo([company.lat, company.lng], 15, { duration: 1.2 })
    }
  }, [company, map])
  return null
}

const saturationRadiusMap: Record<string, number> = {
  Low: 600,
  Medium: 900,
  High: 1200,
  'Very High': 1500,
}

const saturationOpacityMap: Record<string, number> = {
  Low: 0.2,
  Medium: 0.35,
  High: 0.5,
  'Very High': 0.65,
}

export default function MarketMap({
  companies,
  areaStats,
  selectedCompany,
  onSelectCompany,
  mapMode,
  isRtl,
}: MarketMapProps) {
  // Compute dominant sector per area for sector clusters mode
  const areaDominantSector = useMemo(() => {
    const map: Record<string, string> = {}
    for (const area of areaStats) {
      if (area.topSectors.length > 0) {
        map[area.area] = area.topSectors[0]
      }
    }
    return map
  }, [areaStats])

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ minHeight: 400 }}>
      <MapContainer
        center={[24.4539, 54.3773]}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToCompany company={selectedCompany} />

        {/* Markers mode */}
        {mapMode === 'markers' &&
          companies.map((c) => (
            <Marker
              key={c.id}
              position={[c.lat, c.lng]}
              icon={createSectorIcon(c.sector, c.isGoldenVendor)}
              eventHandlers={{ click: () => onSelectCompany(c) }}
            >
              <Popup>
                <div style={{ direction: isRtl ? 'rtl' : 'ltr', minWidth: 160 }}>
                  <strong style={{ fontSize: 13 }}>{isRtl ? c.nameAr : c.name}</strong>
                  <br />
                  <span style={{ color: '#6b7280', fontSize: 12 }}>
                    {isRtl ? c.sectorAr : c.sector} &middot; {isRtl ? c.areaAr : c.area}
                  </span>
                  {c.isGoldenVendor && (
                    <div style={{ marginTop: 4, color: '#d97706', fontSize: 11, fontWeight: 600 }}>
                      {isRtl ? 'مورد ذهبي' : 'Golden Vendor'}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Heatmap mode — circle overlays per area */}
        {mapMode === 'heatmap' &&
          areaStats.map((a) => (
            <CircleMarker
              key={a.area}
              center={[a.lat, a.lng]}
              radius={saturationRadiusMap[a.saturationLevel] ? saturationRadiusMap[a.saturationLevel] / 30 : 20}
              pathOptions={{
                color: saturationHexColors[a.saturationLevel] || '#6b7280',
                fillColor: saturationHexColors[a.saturationLevel] || '#6b7280',
                fillOpacity: saturationOpacityMap[a.saturationLevel] || 0.3,
                weight: 2,
              }}
            >
              <Popup>
                <div style={{ direction: isRtl ? 'rtl' : 'ltr', minWidth: 180 }}>
                  <strong style={{ fontSize: 13 }}>{isRtl ? a.areaAr : a.area}</strong>
                  <br />
                  <span style={{ fontSize: 12, color: '#6b7280' }}>
                    {a.totalCompanies} {isRtl ? 'شركة' : 'companies'}
                  </span>
                  <br />
                  <span style={{ fontSize: 11 }}>
                    {isRtl ? 'التشبع' : 'Saturation'}: <strong>{a.saturationLevel}</strong>
                  </span>
                  <br />
                  <span style={{ fontSize: 11 }}>
                    {isRtl ? 'النمو' : 'Growth'}: <strong>{a.growthTrend}</strong>
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          ))}

        {/* Sector clusters mode — circles colored by dominant sector */}
        {mapMode === 'sectors' &&
          areaStats.map((a) => {
            const dominant = areaDominantSector[a.area]
            const color = dominant ? sectorHexColors[dominant] || '#6b7280' : '#6b7280'
            return (
              <Circle
                key={a.area}
                center={[a.lat, a.lng]}
                radius={saturationRadiusMap[a.saturationLevel] || 800}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.2,
                  weight: 2,
                }}
              >
                <Popup>
                  <div style={{ direction: isRtl ? 'rtl' : 'ltr', minWidth: 180 }}>
                    <strong style={{ fontSize: 13 }}>{isRtl ? a.areaAr : a.area}</strong>
                    <br />
                    <span style={{ fontSize: 12, color: '#6b7280' }}>
                      {isRtl ? 'القطاع المهيمن' : 'Dominant'}: <strong>{dominant || 'N/A'}</strong>
                    </span>
                    <br />
                    <span style={{ fontSize: 11 }}>
                      {(isRtl ? a.topSectorsAr : a.topSectors).join(', ')}
                    </span>
                  </div>
                </Popup>
              </Circle>
            )
          })}
      </MapContainer>

      {/* Legend overlay for heatmap mode */}
      {mapMode === 'heatmap' && (
        <div
          className="absolute bottom-4 theme-panel rounded-lg px-3 py-2 text-xs z-[1000]"
          style={{ [isRtl ? 'left' : 'right']: 12 }}
        >
          <div className="font-semibold mb-1" style={{ color: 'var(--text)' }}>
            {isRtl ? 'مستوى التشبع' : 'Saturation Level'}
          </div>
          {(['Low', 'Medium', 'High', 'Very High'] as const).map((level) => (
            <div key={level} className="flex items-center gap-2 mb-0.5">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ background: saturationHexColors[level] }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>{level}</span>
            </div>
          ))}
        </div>
      )}

      {/* Legend overlay for sector clusters mode */}
      {mapMode === 'sectors' && (
        <div
          className="absolute bottom-4 theme-panel rounded-lg px-3 py-2 text-xs z-[1000] max-h-48 overflow-y-auto"
          style={{ [isRtl ? 'left' : 'right']: 12 }}
        >
          <div className="font-semibold mb-1" style={{ color: 'var(--text)' }}>
            {isRtl ? 'القطاعات' : 'Sectors'}
          </div>
          {Object.entries(sectorHexColors).map(([sector, color]) => (
            <div key={sector} className="flex items-center gap-2 mb-0.5">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ background: color }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>{sector}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
