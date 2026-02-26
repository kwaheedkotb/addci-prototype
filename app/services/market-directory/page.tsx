'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useI18n } from '@/lib/i18n'
import {
  type Company,
  type AreaStat,
  type SectorStat,
  allCompanies,
  allAreaStats,
  allSectorStats,
  sectors,
  sectorsAr,
  sectorColors,
  sectorHexColors,
  areas,
  areasAr,
  employeeRanges,
  employeeRangesAr,
  legalTypes,
  legalTypesAr,
  statusesAr,
  budgetOptions,
  budgetOptionsAr,
  priorityOptions,
  priorityOptionsAr,
  saturationColors,
  growthColors,
  saturationAr,
  growthAr,
  areaCoordinates,
} from '@/lib/market-directory-data'
import en from '@/locales/en.json'

type MD = typeof en.marketDirectory

// ─── Dynamic Map Import (SSR-disabled) ───────────────────────────────────────

function MapSkeleton() {
  return (
    <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ background: 'var(--panel-2)', minHeight: 400 }}>
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span style={{ color: 'var(--muted)', fontSize: 13 }}>Loading map...</span>
      </div>
    </div>
  )
}

const MarketMap = dynamic(() => import('@/components/market-directory/MarketMap'), {
  ssr: false,
  loading: () => <MapSkeleton />,
})

// ─── MemberAccessGuard ───────────────────────────────────────────────────────

function MemberAccessGuard({ md, isRtl }: { md: MD; isRtl: boolean }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>{md.memberOnly}</h2>
        <p className="mb-8" style={{ color: 'var(--muted)' }}>{md.memberOnlyDesc}</p>
        <div className={`flex flex-col sm:flex-row gap-3 justify-center ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">{md.loginAccess}</button>
          <button className="px-6 py-3 rounded-xl font-medium transition-colors" style={{ color: 'var(--primary)', border: '1px solid var(--border)' }}>{md.becomeMember}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Badge Components ────────────────────────────────────────────────────────

function SectorBadge({ sector, isRtl }: { sector: string; isRtl: boolean }) {
  const colors = sectorColors[sector] || { bg: 'bg-gray-100 dark:bg-white/10', text: 'text-gray-800 dark:text-gray-300', border: 'border-gray-200 dark:border-white/10' }
  const label = isRtl ? (sectorsAr[sector] || sector) : sector
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>{label}</span>
}

function AreaBadge({ area, isRtl }: { area: string; isRtl: boolean }) {
  const label = isRtl ? (areasAr[area] || area) : area
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      {label}
    </span>
  )
}

function StatusBadge({ status, isRtl }: { status: string; isRtl: boolean }) {
  const isActive = status === 'Active'
  const label = isRtl ? (statusesAr[status] || status) : status
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${isActive ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/20' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
      {label}
    </span>
  )
}

function SaturationBadge({ level }: { level: string }) {
  const c = saturationColors[level] || ''
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${c}`}>{level}</span>
}

function GrowthBadge({ trend }: { trend: string }) {
  const c = growthColors[trend] || ''
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${c}`}>{trend}</span>
}

function CompanyAvatar({ company }: { company: Company }) {
  const color = sectorHexColors[company.sector] || '#6b7280'
  const initials = company.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: color }}>
      {initials}
    </div>
  )
}

// ─── Card Skeleton ───────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="theme-panel rounded-xl p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg" style={{ background: 'var(--panel-2)' }} />
        <div className="flex-1">
          <div className="h-4 rounded w-3/4 mb-2" style={{ background: 'var(--panel-2)' }} />
          <div className="h-3 rounded w-1/2" style={{ background: 'var(--panel-2)' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Mode Toggle ─────────────────────────────────────────────────────────────

function ModeToggle({ mode, onChange, md }: { mode: 'explore' | 'advisor'; onChange: (m: 'explore' | 'advisor') => void; md: MD }) {
  return (
    <div className="inline-flex rounded-xl p-1" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
      {([
        { key: 'explore' as const, label: md.exploreMarket, icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
        { key: 'advisor' as const, label: md.setupAdvisor, icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
      ] as const).map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === key ? 'bg-blue-600 text-white shadow-md' : ''}`}
          style={mode !== key ? { color: 'var(--muted)' } : undefined}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Map Mode Selector ───────────────────────────────────────────────────────

function MapModeSelector({ mapMode, onChange, md }: { mapMode: 'markers' | 'heatmap' | 'sectors'; onChange: (m: 'markers' | 'heatmap' | 'sectors') => void; md: MD }) {
  const modes = [
    { key: 'markers' as const, label: md.mapMarkers },
    { key: 'heatmap' as const, label: md.mapHeatmap },
    { key: 'sectors' as const, label: md.mapSectorClusters },
  ]
  return (
    <div className="flex gap-1 rounded-lg p-0.5" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
      {modes.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mapMode === key ? 'bg-blue-600 text-white' : ''}`}
          style={mapMode !== key ? { color: 'var(--muted)' } : undefined}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Filter Panel ────────────────────────────────────────────────────────────

function FilterPanel({
  md, isRtl, searchQuery, onSearchChange, sectorFilter, setSectorFilter,
  areaFilter, setAreaFilter, employeeFilter, setEmployeeFilter,
  legalFilter, setLegalFilter, activeOnly, setActiveOnly,
  goldenOnly, setGoldenOnly, sortBy, setSortBy, filteredCount, totalCount, onClearFilters,
}: {
  md: MD; isRtl: boolean
  searchQuery: string; onSearchChange: (v: string) => void
  sectorFilter: string; setSectorFilter: (v: string) => void
  areaFilter: string; setAreaFilter: (v: string) => void
  employeeFilter: string; setEmployeeFilter: (v: string) => void
  legalFilter: string; setLegalFilter: (v: string) => void
  activeOnly: boolean; setActiveOnly: (v: boolean) => void
  goldenOnly: boolean; setGoldenOnly: (v: boolean) => void
  sortBy: string; setSortBy: (v: string) => void
  filteredCount: number; totalCount: number; onClearFilters: () => void
}) {
  const hasFilters = sectorFilter || areaFilter || employeeFilter || legalFilter || activeOnly || goldenOnly || searchQuery

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <svg className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 ${isRtl ? 'right-3' : 'left-3'}`} style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder={md.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg text-sm py-2.5 border"
          style={{ paddingInlineStart: '2.5rem', paddingInlineEnd: '0.75rem', background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}
        />
      </div>

      {/* Filters grid */}
      <div className="grid grid-cols-2 gap-2">
        <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} className="rounded-lg text-xs py-2 px-2 border" style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}>
          <option value="">{md.allSectors}</option>
          {sectors.map((s) => <option key={s} value={s}>{isRtl ? sectorsAr[s] : s}</option>)}
        </select>
        <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} className="rounded-lg text-xs py-2 px-2 border" style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}>
          <option value="">{md.allAreas}</option>
          {areas.map((a) => <option key={a} value={a}>{isRtl ? areasAr[a] : a}</option>)}
        </select>
        <select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} className="rounded-lg text-xs py-2 px-2 border" style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}>
          <option value="">{md.allSizes}</option>
          {employeeRanges.map((e) => <option key={e} value={e}>{isRtl ? employeeRangesAr[e] : e}</option>)}
        </select>
        <select value={legalFilter} onChange={(e) => setLegalFilter(e.target.value)} className="rounded-lg text-xs py-2 px-2 border" style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}>
          <option value="">{md.allLegalTypes}</option>
          {legalTypes.map((l) => <option key={l} value={l}>{isRtl ? legalTypesAr[l] : l}</option>)}
        </select>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-2">
        <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} className="rounded" />
          {md.activeOnly}
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={goldenOnly} onChange={(e) => setGoldenOnly(e.target.checked)} className="rounded" />
          {md.goldenVendorToggle}
        </label>
      </div>

      {/* Sort */}
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full rounded-lg text-xs py-2 px-2 border" style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}>
        <option value="name">{md.sortName}</option>
        <option value="newest">{md.sortNewest}</option>
        <option value="oldest">{md.sortOldest}</option>
        <option value="employees">{md.sortEmployees}</option>
      </select>

      {/* Results count + clear */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          {md.showingCompanies.replace('{count}', String(filteredCount)).replace('{total}', String(totalCount))}
        </span>
        {hasFilters && (
          <button onClick={onClearFilters} className="text-xs font-medium hover:underline" style={{ color: 'var(--primary)' }}>
            {md.clearFilters}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Company Card ────────────────────────────────────────────────────────────

function CompanyCard({ company, isRtl, isSelected, onClick }: { company: Company; isRtl: boolean; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl p-3 transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ background: isSelected ? 'var(--panel-2)' : 'var(--panel)', border: '1px solid var(--border)' }}
    >
      <div className={`flex items-start gap-3 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
        <CompanyAvatar company={company} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
              {isRtl ? company.nameAr : company.name}
            </span>
            {company.isGoldenVendor && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <SectorBadge sector={company.sector} isRtl={isRtl} />
            <AreaBadge area={company.area} isRtl={isRtl} />
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[11px]" style={{ color: 'var(--muted)' }}>
            <span>{company.establishedYear}</span>
            <span>{isRtl ? employeeRangesAr[company.employeeRange] : company.employeeRange}</span>
            <StatusBadge status={company.status} isRtl={isRtl} />
          </div>
        </div>
      </div>
    </button>
  )
}

// ─── Company Detail Modal ────────────────────────────────────────────────────

function CompanyDetailModal({
  company, md, isRtl, onClose, onViewSimilar, onViewOnMap,
}: {
  company: Company; md: MD; isRtl: boolean
  onClose: () => void; onViewSimilar: () => void; onViewOnMap: () => void
}) {
  const areaStat = allAreaStats.find((a) => a.area === company.area)
  const sectorStat = allSectorStats.find((s) => s.sector === company.sector)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-6"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5" style={{ color: 'var(--muted)' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Header */}
        <div className={`flex items-start gap-4 mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold" style={{ background: sectorHexColors[company.sector] || '#6b7280' }}>
            {company.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>{isRtl ? company.nameAr : company.name}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <SectorBadge sector={company.sector} isRtl={isRtl} />
              <AreaBadge area={company.area} isRtl={isRtl} />
              <StatusBadge status={company.status} isRtl={isRtl} />
              {company.isGoldenVendor && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  {md.goldenVendorBadge}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: md.established, value: String(company.establishedYear) },
            { label: md.employees, value: isRtl ? employeeRangesAr[company.employeeRange] : company.employeeRange },
            { label: md.legalType, value: isRtl ? legalTypesAr[company.legalType] : company.legalType },
            { label: md.subSector, value: isRtl ? company.subSectorAr : company.subSector },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg p-3 text-center" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
              <div className="text-[11px] mb-1" style={{ color: 'var(--muted)' }}>{label}</div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>{md.description}</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{isRtl ? company.descriptionAr : company.description}</p>
        </div>

        {/* Tags */}
        {company.tags.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>{md.tags}</h3>
            <div className="flex flex-wrap gap-1.5">
              {(isRtl ? company.tagsAr : company.tags).map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--panel-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Area Context */}
        {areaStat && (
          <div className="mb-5 rounded-xl p-4" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>{md.areaContext} — {isRtl ? areaStat.areaAr : areaStat.area}</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span style={{ color: 'var(--muted)' }}>{md.saturation}:</span>{' '}
                <SaturationBadge level={areaStat.saturationLevel} />
              </div>
              <div>
                <span style={{ color: 'var(--muted)' }}>{md.averageRent}:</span>{' '}
                <span className="font-medium" style={{ color: 'var(--text)' }}>{isRtl ? areaStat.averageRentAr : areaStat.averageRent}</span>
              </div>
              <div className="col-span-2">
                <span style={{ color: 'var(--muted)' }}>{md.topSectorsInArea}:</span>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{(isRtl ? areaStat.topSectorsAr : areaStat.topSectors).join(', ')}</span>
              </div>
              <div className="col-span-2">
                <span style={{ color: 'var(--muted)' }}>{md.keyInfrastructure}:</span>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{(isRtl ? areaStat.keyInfrastructureAr : areaStat.keyInfrastructure).join(', ')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Sector Context */}
        {sectorStat && (
          <div className="mb-5 rounded-xl p-4" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>{md.sectorContext} — {isRtl ? sectorStat.sectorAr : sectorStat.sector}</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span style={{ color: 'var(--muted)' }}>{md.growthRate}:</span>{' '}
                <span className="font-medium" style={{ color: 'var(--text)' }}>{sectorStat.growthRate}</span>
              </div>
              <div>
                <span style={{ color: 'var(--muted)' }}>{md.opportunityScore}:</span>{' '}
                <span className="font-medium" style={{ color: 'var(--text)' }}>{sectorStat.opportunityScore}/10</span>
              </div>
              <div className="col-span-2">
                <span style={{ color: 'var(--muted)' }}>{md.topAreasForSector}:</span>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{(isRtl ? sectorStat.topAreasAr : sectorStat.topAreas).join(', ')}</span>
              </div>
              <div className="col-span-2">
                <span style={{ color: 'var(--muted)' }}>{md.keyDrivers}:</span>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{(isRtl ? sectorStat.keyDriversAr : sectorStat.keyDrivers).join(', ')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button onClick={onViewOnMap} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">{md.viewOnMap}</button>
          <button onClick={onViewSimilar} className="px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>{md.viewSimilar}</button>
          <button onClick={() => window.print()} className="px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>{md.exportPdf}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Global Search Dropdown ──────────────────────────────────────────────────

function GlobalSearchDropdown({
  query, isRtl, md, onSelectCompany, onSelectSector, onSelectArea,
}: {
  query: string; isRtl: boolean; md: MD
  onSelectCompany: (c: Company) => void
  onSelectSector: (s: string) => void
  onSelectArea: (a: string) => void
}) {
  const q = query.toLowerCase()
  const matchedCompanies = allCompanies.filter((c) => c.name.toLowerCase().includes(q) || c.nameAr.includes(query)).slice(0, 5)
  const matchedAreas = areas.filter((a) => a.toLowerCase().includes(q) || (areasAr[a] || '').includes(query)).slice(0, 3)
  const matchedSectors = sectors.filter((s) => s.toLowerCase().includes(q) || (sectorsAr[s] || '').includes(query)).slice(0, 3)

  if (!matchedCompanies.length && !matchedAreas.length && !matchedSectors.length) {
    return (
      <div className="absolute top-full mt-1 w-full rounded-xl overflow-hidden z-50 shadow-lg" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <div className="p-4 text-center text-sm" style={{ color: 'var(--muted)' }}>{md.noSearchResults}</div>
      </div>
    )
  }

  return (
    <div className="absolute top-full mt-1 w-full rounded-xl overflow-hidden z-50 shadow-lg max-h-72 overflow-y-auto" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
      {matchedCompanies.length > 0 && (
        <div>
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)', background: 'var(--panel-2)' }}>{md.searchCompanies}</div>
          {matchedCompanies.map((c) => (
            <button key={c.id} onClick={() => onSelectCompany(c)} className={`w-full px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5 ${isRtl ? 'text-right' : ''}`}>
              <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{isRtl ? c.nameAr : c.name}</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>{isRtl ? c.sectorAr : c.sector} &middot; {isRtl ? c.areaAr : c.area}</div>
            </button>
          ))}
        </div>
      )}
      {matchedAreas.length > 0 && (
        <div>
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)', background: 'var(--panel-2)' }}>{md.searchAreas}</div>
          {matchedAreas.map((a) => (
            <button key={a} onClick={() => onSelectArea(a)} className={`w-full px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5 ${isRtl ? 'text-right' : ''}`}>
              <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{isRtl ? areasAr[a] : a}</div>
            </button>
          ))}
        </div>
      )}
      {matchedSectors.length > 0 && (
        <div>
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)', background: 'var(--panel-2)' }}>{md.searchSectors}</div>
          {matchedSectors.map((s) => (
            <button key={s} onClick={() => onSelectSector(s)} className={`w-full px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5 ${isRtl ? 'text-right' : ''}`}>
              <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{isRtl ? sectorsAr[s] : s}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Sector Intel Panel ──────────────────────────────────────────────────────

function SectorIntelPanel({
  md, isRtl, onClose, onSelectSector,
}: {
  md: MD; isRtl: boolean; onClose: () => void; onSelectSector: (sector: string) => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className={`relative ${isRtl ? 'mr-auto' : 'ml-auto'} w-full max-w-2xl h-full overflow-y-auto`}
        style={{ background: 'var(--panel)' }}
        onClick={(e) => e.stopPropagation()}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{md.sectorIntelligence}</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{md.sectorIntelDesc}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5" style={{ color: 'var(--muted)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allSectorStats.map((s) => {
              const oppColor = s.opportunityScore >= 8 ? 'text-green-600 dark:text-green-400' : s.opportunityScore >= 6 ? 'text-blue-600 dark:text-blue-400' : s.opportunityScore >= 4 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
              return (
                <div key={s.sector} className="rounded-xl p-4 cursor-pointer hover:shadow-md transition-all" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }} onClick={() => { onSelectSector(s.sector); onClose() }}>
                  <div className="flex items-center justify-between mb-2">
                    <SectorBadge sector={s.sector} isRtl={isRtl} />
                    <span className={`text-lg font-bold ${oppColor}`}>{s.opportunityScore}/10</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                    <div>
                      <span style={{ color: 'var(--muted)' }}>{md.companies}:</span>{' '}
                      <span className="font-medium" style={{ color: 'var(--text)' }}>{s.totalCompanies}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>{md.growth}:</span>{' '}
                      <span className="font-medium" style={{ color: 'var(--text)' }}>{s.growthRate}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>{md.saturation}:</span>{' '}
                      <SaturationBadge level={s.saturationLevel} />
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>{md.topAreas}:</span>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>{(isRtl ? s.topAreasAr : s.topAreas).slice(0, 2).join(', ')}</span>
                    </div>
                  </div>
                  <button className="mt-3 text-xs font-medium" style={{ color: 'var(--primary)' }}>{md.exploreInMap} &rarr;</button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Setup Advisor Form ──────────────────────────────────────────────────────

interface AdvisorFormData {
  sector: string
  subSector: string
  companySize: string
  legalStructure: string
  budget: string
  priorities: string[]
  additionalContext: string
}

function SetupAdvisorForm({
  md, isRtl, onSubmit,
}: {
  md: MD; isRtl: boolean; onSubmit: (data: AdvisorFormData) => void
}) {
  const [form, setForm] = useState<AdvisorFormData>({
    sector: '', subSector: '', companySize: '', legalStructure: '',
    budget: '', priorities: [], additionalContext: '',
  })

  const togglePriority = (p: string) => {
    setForm((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(p) ? prev.priorities.filter((x) => x !== p) : [...prev.priorities, p],
    }))
  }

  const canSubmit = form.sector && form.companySize

  return (
    <div className="max-w-2xl mx-auto">
      <div className="theme-panel rounded-2xl p-6 sm:p-8">
        <div className="space-y-5">
          {/* Sector */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>{md.advisorForm.sector} *</label>
            <select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className="w-full rounded-lg text-sm py-2.5 px-3 border" style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}>
              <option value="">{md.advisorForm.sectorPlaceholder}</option>
              {sectors.map((s) => <option key={s} value={s}>{isRtl ? sectorsAr[s] : s}</option>)}
            </select>
          </div>

          {/* Sub-sector */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>{md.advisorForm.subSector}</label>
            <input
              type="text"
              value={form.subSector}
              onChange={(e) => setForm({ ...form, subSector: e.target.value })}
              placeholder={md.advisorForm.subSectorPlaceholder}
              className="w-full rounded-lg text-sm py-2.5 px-3 border"
              style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}
            />
          </div>

          {/* Company Size + Legal Structure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>{md.advisorForm.companySize} *</label>
              <select value={form.companySize} onChange={(e) => setForm({ ...form, companySize: e.target.value })} className="w-full rounded-lg text-sm py-2.5 px-3 border" style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}>
                <option value="">{md.advisorForm.sizePlaceholder}</option>
                {employeeRanges.map((e) => <option key={e} value={e}>{isRtl ? employeeRangesAr[e] : e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>{md.advisorForm.legalStructure}</label>
              <select value={form.legalStructure} onChange={(e) => setForm({ ...form, legalStructure: e.target.value })} className="w-full rounded-lg text-sm py-2.5 px-3 border" style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}>
                <option value="">{md.advisorForm.legalPlaceholder}</option>
                {legalTypes.map((l) => <option key={l} value={l}>{isRtl ? legalTypesAr[l] : l}</option>)}
              </select>
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>{md.advisorForm.budget}</label>
            <select value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full rounded-lg text-sm py-2.5 px-3 border" style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}>
              <option value="">{md.advisorForm.budgetPlaceholder}</option>
              {budgetOptions.map((b) => <option key={b} value={b}>{isRtl ? budgetOptionsAr[b] : b}</option>)}
            </select>
          </div>

          {/* Priorities */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>{md.advisorForm.priorities}</label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((p) => (
                <button
                  key={p}
                  onClick={() => togglePriority(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.priorities.includes(p) ? 'bg-blue-600 text-white border-blue-600' : ''}`}
                  style={!form.priorities.includes(p) ? { color: 'var(--text-secondary)', borderColor: 'var(--border)' } : undefined}
                >
                  {isRtl ? priorityOptionsAr[p] : p}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Context */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>{md.advisorForm.additionalContext}</label>
            <textarea
              value={form.additionalContext}
              onChange={(e) => setForm({ ...form, additionalContext: e.target.value })}
              placeholder={md.advisorForm.contextPlaceholder}
              rows={3}
              className="w-full rounded-lg text-sm py-2.5 px-3 border resize-none"
              style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}
            />
          </div>

          {/* Submit */}
          <button
            onClick={() => canSubmit && onSubmit(form)}
            disabled={!canSubmit}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: canSubmit ? 'var(--primary)' : 'var(--muted)' }}
          >
            {md.advisorForm.analyze}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Setup Advisor Loading ───────────────────────────────────────────────────

function SetupAdvisorLoading({ md }: { md: MD }) {
  const [step, setStep] = useState(0)
  const steps = [md.advisorLoading.step1, md.advisorLoading.step2, md.advisorLoading.step3, md.advisorLoading.step4]

  useEffect(() => {
    const interval = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 600)
    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="w-16 h-16 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
      <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>{md.advisorLoading.title}</h3>
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={i} className={`text-sm transition-opacity duration-300 ${i <= step ? 'opacity-100' : 'opacity-30'}`} style={{ color: i <= step ? 'var(--text)' : 'var(--muted)' }}>
            {i <= step ? '\u2713' : '\u25CB'} {s}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Setup Advisor Results ───────────────────────────────────────────────────

interface AdvisorResult {
  recommendations: Array<{
    rank: number; area: string; matchScore: number; rationale: string
    competitiveLandscape: string; keyAdvantages: string[]
    potentialChallenges: string[]; saturationLevel: string; growthTrend: string
  }>
  sectorOutlook: { summary: string; opportunityScore: number; growthRate: number; keyDrivers: string[] }
  nextSteps: string[]
  disclaimer: string
}

function SetupAdvisorResults({
  md, isRtl, results, onExploreArea, onReAnalyze,
}: {
  md: MD; isRtl: boolean; results: AdvisorResult
  onExploreArea: (area: string) => void; onReAnalyze: () => void
}) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{md.advisorResults.title}</h2>

      {/* Recommendations */}
      <div className="space-y-4">
        {results.recommendations.map((rec) => {
          const scoreColor = rec.matchScore >= 80 ? 'text-green-600 dark:text-green-400' : rec.matchScore >= 60 ? 'text-blue-600 dark:text-blue-400' : 'text-yellow-600 dark:text-yellow-400'
          return (
            <div key={rec.rank} className="theme-panel rounded-xl p-5">
              <div className={`flex items-start justify-between mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                    #{rec.rank}
                  </div>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>{rec.area}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <SaturationBadge level={rec.saturationLevel} />
                      <GrowthBadge trend={rec.growthTrend} />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{md.advisorResults.matchScore}</div>
                  <div className={`text-2xl font-bold ${scoreColor}`}>{rec.matchScore}%</div>
                </div>
              </div>

              {/* Rationale */}
              <div className="mb-3">
                <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>{md.advisorResults.rationale}</div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{rec.rationale}</p>
              </div>

              {/* Competitive Landscape */}
              <div className="mb-3">
                <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>{md.advisorResults.competitiveLandscape}</div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{rec.competitiveLandscape}</p>
              </div>

              {/* Advantages + Challenges side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="rounded-lg p-3" style={{ background: 'var(--panel-2)' }}>
                  <div className="text-xs font-semibold mb-1.5 text-green-600 dark:text-green-400">{md.advisorResults.keyAdvantages}</div>
                  <ul className="space-y-1">
                    {rec.keyAdvantages.map((a, i) => (
                      <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                        <span className="text-green-500 mt-0.5">+</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg p-3" style={{ background: 'var(--panel-2)' }}>
                  <div className="text-xs font-semibold mb-1.5 text-orange-600 dark:text-orange-400">{md.advisorResults.potentialChallenges}</div>
                  <ul className="space-y-1">
                    {rec.potentialChallenges.map((c, i) => (
                      <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                        <span className="text-orange-500 mt-0.5">!</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button onClick={() => onExploreArea(rec.area)} className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                {md.advisorResults.exploreOnMap} &rarr;
              </button>
            </div>
          )
        })}
      </div>

      {/* Sector Outlook */}
      <div className="theme-panel rounded-xl p-5">
        <h3 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>{md.advisorResults.sectorOutlook}</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{results.sectorOutlook.summary}</p>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center rounded-lg p-3" style={{ background: 'var(--panel-2)' }}>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>{md.opportunityScore}</div>
            <div className="text-xl font-bold" style={{ color: 'var(--text)' }}>{results.sectorOutlook.opportunityScore}/10</div>
          </div>
          <div className="text-center rounded-lg p-3" style={{ background: 'var(--panel-2)' }}>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>{md.growthRate}</div>
            <div className="text-xl font-bold" style={{ color: 'var(--text)' }}>{results.sectorOutlook.growthRate}%</div>
          </div>
          <div className="text-center rounded-lg p-3" style={{ background: 'var(--panel-2)' }}>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>{md.keyDrivers}</div>
            <div className="text-sm font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>{results.sectorOutlook.keyDrivers.length}</div>
          </div>
        </div>
        {results.sectorOutlook.keyDrivers.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {results.sectorOutlook.keyDrivers.map((d) => (
              <span key={d} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--panel-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>{d}</span>
            ))}
          </div>
        )}
      </div>

      {/* Next Steps */}
      <div className="theme-panel rounded-xl p-5">
        <h3 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>{md.advisorResults.nextSteps}</h3>
        <ol className="space-y-2">
          {results.nextSteps.map((step, i) => (
            <li key={i} className={`flex items-start gap-3 text-sm ${isRtl ? 'flex-row-reverse' : ''}`} style={{ color: 'var(--text-secondary)' }}>
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl p-4" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
        <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>{md.advisorResults.disclaimer}</div>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>{results.disclaimer}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={onReAnalyze} className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors" style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>
          {md.advisorResults.reAnalyze}
        </button>
        <button onClick={() => window.print()} className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors" style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>
          {md.advisorResults.exportPdf}
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Main Page Component ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function MarketDirectoryPage() {
  const { locale, t, dir } = useI18n()
  const md = t.marketDirectory
  const isRtl = dir === 'rtl'
  const router = useRouter()
  const searchParams = useSearchParams()

  // ─── Auth mock ──────────────────────────────────────────────────────────────
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => { setIsMember(true); setLoading(false) }, 400)
    return () => clearTimeout(timer)
  }, [])

  // ─── URL-synced state ───────────────────────────────────────────────────────
  const mode = (searchParams.get('mode') as 'explore' | 'advisor') || 'explore'
  const sectorFilter = searchParams.get('sector') || ''
  const areaFilter = searchParams.get('area') || ''
  const employeeFilter = searchParams.get('employees') || ''
  const legalFilter = searchParams.get('legal') || ''
  const activeOnly = searchParams.get('active') === '1'
  const goldenOnly = searchParams.get('golden') === '1'
  const sortBy = searchParams.get('sort') || 'name'
  const selectedCompanyId = searchParams.get('company') || ''
  const showSectorIntel = searchParams.get('sectorIntel') === '1'

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery)
  const [globalSearch, setGlobalSearch] = useState('')
  const [showGlobalDropdown, setShowGlobalDropdown] = useState(false)
  const [mapMode, setMapMode] = useState<'markers' | 'heatmap' | 'sectors'>('markers')

  // Advisor state
  const [advisorStep, setAdvisorStep] = useState<'form' | 'loading' | 'results'>('form')
  const [advisorResults, setAdvisorResults] = useState<AdvisorResult | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // ─── URL update helper ──────────────────────────────────────────────────────
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') params.delete(key)
        else params.set(key, value)
      }
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [searchParams, router]
  )

  // ─── Filtered + Sorted Companies ───────────────────────────────────────────
  const filteredCompanies = useMemo(() => {
    let result = [...allCompanies]
    const q = debouncedQuery.toLowerCase()
    if (q) result = result.filter((c) => c.name.toLowerCase().includes(q) || c.nameAr.includes(debouncedQuery) || c.sector.toLowerCase().includes(q) || c.area.toLowerCase().includes(q) || c.subSector.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q)))
    if (sectorFilter) result = result.filter((c) => c.sector === sectorFilter)
    if (areaFilter) result = result.filter((c) => c.area === areaFilter)
    if (employeeFilter) result = result.filter((c) => c.employeeRange === employeeFilter)
    if (legalFilter) result = result.filter((c) => c.legalType === legalFilter)
    if (activeOnly) result = result.filter((c) => c.status === 'Active')
    if (goldenOnly) result = result.filter((c) => c.isGoldenVendor)

    // Sort
    switch (sortBy) {
      case 'newest': result.sort((a, b) => b.establishedYear - a.establishedYear); break
      case 'oldest': result.sort((a, b) => a.establishedYear - b.establishedYear); break
      case 'employees': {
        const order = { '200+': 4, '51–200': 3, '11–50': 2, '1–10': 1 }
        result.sort((a, b) => (order[b.employeeRange] || 0) - (order[a.employeeRange] || 0))
        break
      }
      default: result.sort((a, b) => a.name.localeCompare(b.name))
    }
    return result
  }, [debouncedQuery, sectorFilter, areaFilter, employeeFilter, legalFilter, activeOnly, goldenOnly, sortBy])

  const selectedCompany = selectedCompanyId ? allCompanies.find((c) => c.id === selectedCompanyId) || null : null

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleClearFilters = () => {
    setSearchQuery('')
    updateParams({ q: null, sector: null, area: null, employees: null, legal: null, active: null, golden: null, sort: null })
  }

  const handleSelectCompany = (c: Company) => {
    updateParams({ company: c.id })
  }

  const handleAdvisorSubmit = async (data: AdvisorFormData) => {
    setAdvisorStep('loading')
    try {
      const res = await fetch('/api/market-directory/setup-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, locale }),
      })
      const json = await res.json()
      if (json.success) {
        setAdvisorResults(json)
        setAdvisorStep('results')
      } else {
        setAdvisorStep('form')
      }
    } catch {
      setAdvisorStep('form')
    }
  }

  const handleExploreArea = (areaName: string) => {
    // Find the matching English area name (if results came back in Arabic)
    const matchedArea = areas.find((a) => a === areaName) || areas.find((a) => areasAr[a] === areaName) || ''
    updateParams({ mode: 'explore', area: matchedArea, company: null, sectorIntel: null })
    setAdvisorStep('form')
    setAdvisorResults(null)
  }

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isMember) return <MemberAccessGuard md={md} isRtl={isRtl} />

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }} dir={dir}>
      {/* ─── Header / Hero ────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)' }}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Link href="/services" className={`inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <svg className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {md.backToServices}
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{md.title}</h1>
              <p className="text-base sm:text-lg text-white/80 max-w-2xl">{md.subtitle}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/15 text-white border border-white/20 backdrop-blur">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {md.poweredByBadge}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Mode Toggle + Global Search ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-5 relative z-10">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <ModeToggle
            mode={mode}
            onChange={(m) => { updateParams({ mode: m === 'explore' ? null : m }); setAdvisorStep('form'); setAdvisorResults(null) }}
            md={md}
          />

          {mode === 'explore' && (
            <div className="relative flex-1 max-w-md w-full">
              <svg className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 ${isRtl ? 'right-3' : 'left-3'}`} style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={md.searchPlaceholder}
                value={globalSearch}
                onChange={(e) => { setGlobalSearch(e.target.value); setShowGlobalDropdown(!!e.target.value) }}
                onFocus={() => { if (globalSearch) setShowGlobalDropdown(true) }}
                onBlur={() => setTimeout(() => setShowGlobalDropdown(false), 200)}
                className="w-full rounded-xl text-sm py-2.5 border shadow-sm"
                style={{ paddingInlineStart: '2.5rem', paddingInlineEnd: '0.75rem', background: 'var(--panel)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              {showGlobalDropdown && globalSearch && (
                <GlobalSearchDropdown
                  query={globalSearch}
                  isRtl={isRtl}
                  md={md}
                  onSelectCompany={(c) => { handleSelectCompany(c); setGlobalSearch(''); setShowGlobalDropdown(false) }}
                  onSelectSector={(s) => { updateParams({ sector: s }); setGlobalSearch(''); setShowGlobalDropdown(false) }}
                  onSelectArea={(a) => { updateParams({ area: a }); setGlobalSearch(''); setShowGlobalDropdown(false) }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Content Area ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        {/* ── Explore Mode ────────────────────────────────────────────────────── */}
        {mode === 'explore' && (
          <>
            {/* Sector Intel button + Map mode */}
            <div className={`flex items-center justify-between mb-4 flex-wrap gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => updateParams({ sectorIntel: showSectorIntel ? null : '1' })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ border: '1px solid var(--border)', color: 'var(--text)', background: 'var(--panel)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                {md.sectorIntelligence}
              </button>
              <MapModeSelector mapMode={mapMode} onChange={setMapMode} md={md} />
            </div>

            {/* Split layout: List + Map */}
            <div className="flex flex-col lg:flex-row gap-4" style={{ minHeight: 600 }}>
              {/* Left panel — Filters + Company List */}
              <div className="w-full lg:w-[380px] shrink-0 space-y-4">
                <div className="theme-panel rounded-xl p-4">
                  <FilterPanel
                    md={md}
                    isRtl={isRtl}
                    searchQuery={searchQuery}
                    onSearchChange={(v) => { setSearchQuery(v); updateParams({ q: v || null }) }}
                    sectorFilter={sectorFilter}
                    setSectorFilter={(v) => updateParams({ sector: v || null })}
                    areaFilter={areaFilter}
                    setAreaFilter={(v) => updateParams({ area: v || null })}
                    employeeFilter={employeeFilter}
                    setEmployeeFilter={(v) => updateParams({ employees: v || null })}
                    legalFilter={legalFilter}
                    setLegalFilter={(v) => updateParams({ legal: v || null })}
                    activeOnly={activeOnly}
                    setActiveOnly={(v) => updateParams({ active: v ? '1' : null })}
                    goldenOnly={goldenOnly}
                    setGoldenOnly={(v) => updateParams({ golden: v ? '1' : null })}
                    sortBy={sortBy}
                    setSortBy={(v) => updateParams({ sort: v === 'name' ? null : v })}
                    filteredCount={filteredCompanies.length}
                    totalCount={allCompanies.length}
                    onClearFilters={handleClearFilters}
                  />
                </div>

                {/* Company list */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredCompanies.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{md.noCompanies}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{md.noCompaniesHint}</p>
                    </div>
                  ) : (
                    filteredCompanies.map((c) => (
                      <CompanyCard
                        key={c.id}
                        company={c}
                        isRtl={isRtl}
                        isSelected={selectedCompanyId === c.id}
                        onClick={() => handleSelectCompany(c)}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Right panel — Map */}
              <div className="flex-1 min-h-[400px] lg:min-h-0">
                <MarketMap
                  companies={filteredCompanies}
                  areaStats={allAreaStats}
                  selectedCompany={selectedCompany}
                  onSelectCompany={handleSelectCompany}
                  mapMode={mapMode}
                  isRtl={isRtl}
                />
              </div>
            </div>
          </>
        )}

        {/* ── Advisor Mode ────────────────────────────────────────────────────── */}
        {mode === 'advisor' && (
          <div>
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>{md.advisorTitle}</h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{md.advisorSubtitle}</p>
            </div>

            {advisorStep === 'form' && (
              <SetupAdvisorForm md={md} isRtl={isRtl} onSubmit={handleAdvisorSubmit} />
            )}
            {advisorStep === 'loading' && (
              <SetupAdvisorLoading md={md} />
            )}
            {advisorStep === 'results' && advisorResults && (
              <SetupAdvisorResults
                md={md}
                isRtl={isRtl}
                results={advisorResults}
                onExploreArea={handleExploreArea}
                onReAnalyze={() => { setAdvisorStep('form'); setAdvisorResults(null) }}
              />
            )}
          </div>
        )}
      </div>

      {/* ─── Company Detail Modal ─────────────────────────────────────────────── */}
      {selectedCompany && (
        <CompanyDetailModal
          company={selectedCompany}
          md={md}
          isRtl={isRtl}
          onClose={() => updateParams({ company: null })}
          onViewSimilar={() => {
            updateParams({ sector: selectedCompany.sector, company: null })
          }}
          onViewOnMap={() => {
            updateParams({ company: selectedCompany.id })
          }}
        />
      )}

      {/* ─── Sector Intel Panel ───────────────────────────────────────────────── */}
      {showSectorIntel && (
        <SectorIntelPanel
          md={md}
          isRtl={isRtl}
          onClose={() => updateParams({ sectorIntel: null })}
          onSelectSector={(s) => updateParams({ sector: s, sectorIntel: null })}
        />
      )}
    </div>
  )
}
