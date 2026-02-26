'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import {
  type Supplier,
  type CatalogItem,
  type ProcurementRequest,
  allSuppliers,
  allProcurementRequests,
  sectors,
  sectorsAr,
  sectorColors,
  companyColors,
  memberTiers,
  memberTiersAr,
  tierColors,
  statusColors,
  statusesAr,
  priceTypesAr,
  budgetRanges,
  budgetRangesAr,
} from '@/lib/procurement-hub-data'
import en from '@/locales/en.json'

type PH = typeof en.procurementHub

// ─── MemberAccessGuard ──────────────────────────────────────────────────────

function MemberAccessGuard({ ph, isRtl }: { ph: PH; isRtl: boolean }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>{ph.memberOnly}</h2>
        <p className="mb-8" style={{ color: 'var(--muted)' }}>{ph.memberOnlyDesc}</p>
        <div className={`flex flex-col sm:flex-row gap-3 justify-center ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
            {ph.loginAccess}
          </button>
          <button className="px-6 py-3 rounded-xl font-medium transition-colors" style={{ color: 'var(--primary)', border: '1px solid var(--border)' }}>
            {ph.becomeMember}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SectorBadge ────────────────────────────────────────────────────────────

function SectorBadge({ sector, isRtl }: { sector: string; isRtl: boolean }) {
  const colors = sectorColors[sector] || { bg: 'bg-gray-100 dark:bg-white/10', text: 'text-gray-800 dark:text-gray-300', border: 'border-gray-200 dark:border-white/10' }
  const label = isRtl ? (sectorsAr[sector] || sector) : sector
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
      {label}
    </span>
  )
}

// ─── TierBadge ──────────────────────────────────────────────────────────────

function TierBadge({ tier, isRtl }: { tier: string; isRtl: boolean }) {
  const colors = tierColors[tier] || ''
  const label = isRtl ? (memberTiersAr[tier] || tier) : tier
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors}`}>
      {label}
    </span>
  )
}

// ─── StatusBadge ────────────────────────────────────────────────────────────

function StatusBadge({ status, isRtl }: { status: string; isRtl: boolean }) {
  const colors = statusColors[status] || ''
  const label = isRtl ? (statusesAr[status] || status) : status
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors}`}>
      {label}
    </span>
  )
}

// ─── GoldenVendorBadge ──────────────────────────────────────────────────────

function GoldenVendorBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {label}
    </span>
  )
}

// ─── CompanyAvatar ──────────────────────────────────────────────────────────

function CompanyAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const colors = companyColors[name] || { bg: 'bg-gray-500', text: 'text-white' }
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const sizeClasses = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sizeClasses} ${colors.bg} ${colors.text} rounded-xl flex items-center justify-center font-bold flex-shrink-0`}>
      {initials}
    </div>
  )
}

// ─── StarRating ─────────────────────────────────────────────────────────────

function StarRating({ rating, reviewCount, reviewsLabel }: { rating: number; reviewCount: number; reviewsLabel: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{rating.toFixed(1)}</span>
      <span className="text-xs" style={{ color: 'var(--muted)' }}>({reviewCount} {reviewsLabel})</span>
    </div>
  )
}

// ─── CardSkeleton ───────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-2xl p-6 theme-panel animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/10" />
        <div className="flex-1">
          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-white/10 mb-2" />
          <div className="h-3 w-20 rounded bg-gray-200 dark:bg-white/10" />
        </div>
      </div>
      <div className="h-3 w-full rounded bg-gray-200 dark:bg-white/10 mb-2" />
      <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-white/10 mb-4" />
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-white/10" />
        <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-white/10" />
      </div>
    </div>
  )
}

// ─── SupplierCard ───────────────────────────────────────────────────────────

function SupplierCard({
  supplier, isRtl, ph, isSaved, onView, onToggleSave,
}: {
  supplier: Supplier; isRtl: boolean; ph: PH; isSaved: boolean; onView: () => void; onToggleSave: () => void
}) {
  return (
    <div className="rounded-2xl p-6 theme-panel hover:shadow-lg transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <CompanyAvatar name={supplier.companyName} />
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
              {isRtl ? supplier.companyNameAr : supplier.companyName}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <SectorBadge sector={supplier.sector} isRtl={isRtl} />
              <TierBadge tier={supplier.memberTier} isRtl={isRtl} />
            </div>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSave() }}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          title={isSaved ? ph.unsaveSupplier : ph.saveSupplier}
        >
          <svg className={`w-5 h-5 ${isSaved ? 'text-amber-500 fill-amber-500' : ''}`} style={isSaved ? {} : { color: 'var(--muted)' }} fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      {supplier.isGoldenVendor && (
        <div className="mb-3">
          <GoldenVendorBadge label={ph.goldenVendorBadge} />
        </div>
      )}

      <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--muted)' }}>
        {isRtl ? supplier.descriptionAr : supplier.description}
      </p>

      <StarRating rating={supplier.rating} reviewCount={supplier.reviewCount} reviewsLabel={ph.reviews} />

      <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: 'var(--muted)' }}>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          {supplier.completedDeals} {ph.completedDeals.toLowerCase()}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isRtl ? supplier.responseTimeAr : supplier.responseTime}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <button onClick={onView} className="flex-1 px-4 py-2 text-sm font-medium rounded-xl transition-colors bg-blue-600 text-white hover:bg-blue-700">
          {ph.viewProfile}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onView() }}
          className="px-4 py-2 text-sm font-medium rounded-xl transition-colors"
          style={{ color: 'var(--primary)', border: '1px solid var(--border)' }}
        >
          {ph.requestQuote}
        </button>
      </div>
    </div>
  )
}

// ─── RequestCard ────────────────────────────────────────────────────────────

function RequestCard({
  request, isRtl, ph, onView, onSubmitProposal,
}: {
  request: ProcurementRequest; isRtl: boolean; ph: PH; onView: () => void; onSubmitProposal: () => void
}) {
  return (
    <div className="rounded-2xl p-6 theme-panel hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <SectorBadge sector={request.sector} isRtl={isRtl} />
          <StatusBadge status={request.status} isRtl={isRtl} />
          {request.isUrgent && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30">
              {ph.urgent}
            </span>
          )}
        </div>
      </div>

      <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>
        {isRtl ? request.titleAr : request.title}
      </h3>

      <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--muted)' }}>
        {isRtl ? request.descriptionAr : request.description}
      </p>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-4" style={{ color: 'var(--muted)' }}>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {isRtl ? request.postedByAr : request.postedBy}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isRtl ? (budgetRangesAr[request.budget] || request.budget) : request.budget}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {ph.deadline}: {new Date(request.deadline).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          {request.proposalCount} {ph.proposals}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={onView} className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors" style={{ color: 'var(--primary)' }}>
            {ph.viewDetails}
          </button>
          {request.status === 'Open' && (
            <button onClick={onSubmitProposal} className="text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              {ph.submitProposal}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── SupplierDetailModal ────────────────────────────────────────────────────

function SupplierDetailModal({
  supplier, isRtl, ph, isSaved, onClose, onToggleSave, onRequestQuote, relatedSuppliers, onViewRelated,
}: {
  supplier: Supplier; isRtl: boolean; ph: PH; isSaved: boolean
  onClose: () => void; onToggleSave: () => void; onRequestQuote: () => void
  relatedSuppliers: Supplier[]; onViewRelated: (s: Supplier) => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl mx-4 my-8 rounded-2xl shadow-2xl theme-panel"
        style={{ background: 'var(--panel)' }}
        onClick={e => e.stopPropagation()}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <CompanyAvatar name={supplier.companyName} size="lg" />
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                  {isRtl ? supplier.companyNameAr : supplier.companyName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <SectorBadge sector={supplier.sector} isRtl={isRtl} />
                  <TierBadge tier={supplier.memberTier} isRtl={isRtl} />
                  {supplier.isGoldenVendor && <GoldenVendorBadge label={ph.goldenVendorBadge} />}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" style={{ color: 'var(--muted)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: ph.rating, value: `${supplier.rating.toFixed(1)} / 5.0` },
              { label: ph.completedDeals, value: String(supplier.completedDeals) },
              { label: ph.responseTime, value: isRtl ? supplier.responseTimeAr : supplier.responseTime },
              { label: ph.established, value: String(supplier.establishedYear) },
            ].map(stat => (
              <div key={stat.label} className="text-center p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
                <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>{stat.value}</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {isRtl ? supplier.descriptionAr : supplier.description}
          </p>

          {/* Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span style={{ color: 'var(--text-secondary)' }}>{isRtl ? supplier.locationAr : supplier.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span style={{ color: 'var(--text-secondary)' }}>{supplier.employeeCount} {ph.employees}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span style={{ color: 'var(--text-secondary)' }}>{supplier.contactEmail}</span>
            </div>
          </div>

          {/* Service Catalog */}
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>
              {ph.serviceCatalog} ({supplier.catalogItems.length} {ph.catalogItems})
            </h3>
            <div className="space-y-3">
              {supplier.catalogItems.map((item: CatalogItem) => (
                <div key={item.id} className="p-4 rounded-xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                      {isRtl ? item.titleAr : item.title}
                    </h4>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                      {isRtl ? (priceTypesAr[item.priceType] || item.priceType) : item.priceType}
                    </span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>
                    {isRtl ? item.descriptionAr : item.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>{isRtl ? item.priceRangeAr : item.priceRange}</span>
                    <span>{ph.deliveryTime}: {isRtl ? item.deliveryTimeAr : item.deliveryTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {(isRtl ? supplier.tagsAr : supplier.tags).map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-lg text-xs" style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button onClick={onRequestQuote} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              {ph.requestQuote}
            </button>
            <button
              onClick={onToggleSave}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ color: isSaved ? 'rgb(245, 158, 11)' : 'var(--primary)', border: '1px solid var(--border)' }}
            >
              {isSaved ? ph.savedLabel : ph.saveSupplier}
            </button>
          </div>

          {/* Related Suppliers */}
          {relatedSuppliers.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>{ph.relatedSuppliers}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedSuppliers.map(s => (
                  <button
                    key={s.id}
                    onClick={() => onViewRelated(s)}
                    className="flex items-center gap-3 p-3 rounded-xl text-start transition-colors hover:shadow-md"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                  >
                    <CompanyAvatar name={s.companyName} size="sm" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                        {isRtl ? s.companyNameAr : s.companyName}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>
                        {s.rating.toFixed(1)} · {s.completedDeals} {ph.completedDeals.toLowerCase()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── RequestDetailModal ─────────────────────────────────────────────────────

function RequestDetailModal({
  request, isRtl, ph, onClose, onSubmitProposal,
}: {
  request: ProcurementRequest; isRtl: boolean; ph: PH; onClose: () => void; onSubmitProposal: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl mx-4 my-8 rounded-2xl shadow-2xl theme-panel"
        style={{ background: 'var(--panel)' }}
        onClick={e => e.stopPropagation()}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <SectorBadge sector={request.sector} isRtl={isRtl} />
              <StatusBadge status={request.status} isRtl={isRtl} />
              {request.isUrgent && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30">
                  {ph.urgent}
                </span>
              )}
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" style={{ color: 'var(--muted)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            {isRtl ? request.titleAr : request.title}
          </h2>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-4" style={{ color: 'var(--muted)' }}>
            <span>{ph.postedBy}: {isRtl ? request.postedByAr : request.postedBy}</span>
            <span>{ph.postedDate}: {new Date(request.postedDate).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{ph.budget}</div>
              <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                {isRtl ? (budgetRangesAr[request.budget] || request.budget) : request.budget}
              </div>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{ph.deadline}</div>
              <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                {new Date(request.deadline).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            {isRtl ? request.descriptionAr : request.description}
          </p>

          <div className="mb-6">
            <h3 className="font-semibold mb-2 text-sm" style={{ color: 'var(--text)' }}>{ph.requirements}</h3>
            <ul className="space-y-2">
              {(isRtl ? request.requirementsAr : request.requirements).map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {(isRtl ? request.tagsAr : request.tags).map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-lg text-xs" style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="text-sm" style={{ color: 'var(--muted)' }}>
              {request.proposalCount} {ph.proposals}
            </span>
            {request.status === 'Open' && (
              <button onClick={onSubmitProposal} className="px-6 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                {ph.submitProposal}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── QuoteRequestForm ───────────────────────────────────────────────────────

function QuoteRequestForm({
  supplier, isRtl, ph, onClose,
}: {
  supplier: Supplier; isRtl: boolean; ph: PH; onClose: () => void
}) {
  const qf = ph.quoteForm
  const [form, setForm] = useState({ companyName: '', serviceNeeded: '', projectDescription: '', budget: '', timeline: '' })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Quote request submitted:', { supplier: supplier.companyName, ...form })
    setSubmitted(true)
    setTimeout(onClose, 2000)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg mx-4 my-8 rounded-2xl shadow-2xl theme-panel"
        style={{ background: 'var(--panel)' }}
        onClick={e => e.stopPropagation()}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{qf.title}</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" style={{ color: 'var(--muted)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl mb-6" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <CompanyAvatar name={supplier.companyName} size="sm" />
            <div>
              <div className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                {isRtl ? supplier.companyNameAr : supplier.companyName}
              </div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>
                {isRtl ? supplier.sectorAr : supplier.sector}
              </div>
            </div>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text)' }}>{qf.success}</h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{qf.successDesc}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{qf.companyName}</label>
                <input type="text" required value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} placeholder={qf.companyPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{qf.serviceNeeded}</label>
                <input type="text" required value={form.serviceNeeded} onChange={e => setForm(f => ({ ...f, serviceNeeded: e.target.value }))} placeholder={qf.servicePlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{qf.projectDescription}</label>
                <textarea required rows={3} value={form.projectDescription} onChange={e => setForm(f => ({ ...f, projectDescription: e.target.value }))} placeholder={qf.projectPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{qf.budget}</label>
                  <select value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                    <option value="">{qf.budgetPlaceholder}</option>
                    {budgetRanges.map(b => <option key={b} value={b}>{isRtl ? (budgetRangesAr[b] || b) : b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{qf.timeline}</label>
                  <input type="text" value={form.timeline} onChange={e => setForm(f => ({ ...f, timeline: e.target.value }))} placeholder={qf.timelinePlaceholder}
                    className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              </div>
              <button type="submit" className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                {qf.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── PostRequirementForm ────────────────────────────────────────────────────

function PostRequirementForm({ isRtl, ph, onClose }: { isRtl: boolean; ph: PH; onClose: () => void }) {
  const pf = ph.postForm
  const [form, setForm] = useState({ title: '', sector: '', description: '', budget: '', deadline: '', isUrgent: false })
  const [reqs, setReqs] = useState<string[]>([])
  const [reqInput, setReqInput] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose])

  const addReq = () => {
    if (reqInput.trim()) { setReqs(r => [...r, reqInput.trim()]); setReqInput('') }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Requirement posted:', { ...form, requirements: reqs })
    setSubmitted(true)
    setTimeout(onClose, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg mx-4 my-8 rounded-2xl shadow-2xl theme-panel"
        style={{ background: 'var(--panel)' }}
        onClick={e => e.stopPropagation()}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{pf.title}</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" style={{ color: 'var(--muted)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text)' }}>{pf.success}</h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{pf.successDesc}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{pf.reqTitle}</label>
                <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={pf.titlePlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{pf.sector}</label>
                <select required value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  <option value="">{pf.sectorPlaceholder}</option>
                  {sectors.map(s => <option key={s} value={s}>{isRtl ? (sectorsAr[s] || s) : s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{pf.description}</label>
                <textarea required rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder={pf.descriptionPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{pf.requirements}</label>
                <div className="flex gap-2">
                  <input type="text" value={reqInput} onChange={e => setReqInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addReq() } }}
                    placeholder={pf.reqPlaceholder}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                  <button type="button" onClick={addReq} className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ color: 'var(--primary)', border: '1px solid var(--border)' }}>{pf.addReq}</button>
                </div>
                {reqs.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {reqs.map((r, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs" style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        {r}
                        <button type="button" onClick={() => setReqs(rs => rs.filter((_, j) => j !== i))} className="hover:text-red-500">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{pf.budget}</label>
                  <select value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                    <option value="">{pf.budgetPlaceholder}</option>
                    {budgetRanges.map(b => <option key={b} value={b}>{isRtl ? (budgetRangesAr[b] || b) : b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{pf.deadline}</label>
                  <input type="date" required value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isUrgent} onChange={e => setForm(f => ({ ...f, isUrgent: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{pf.isUrgent}</span>
              </label>
              <button type="submit" className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                {pf.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── SubmitProposalForm ─────────────────────────────────────────────────────

function SubmitProposalForm({
  request, isRtl, ph, onClose,
}: {
  request: ProcurementRequest; isRtl: boolean; ph: PH; onClose: () => void
}) {
  const prf = ph.proposalForm
  const [form, setForm] = useState({ companyName: '', proposalSummary: '', proposedBudget: '', deliveryTimeline: '' })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Proposal submitted:', { request: request.title, ...form })
    setSubmitted(true)
    setTimeout(onClose, 2000)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg mx-4 my-8 rounded-2xl shadow-2xl theme-panel"
        style={{ background: 'var(--panel)' }}
        onClick={e => e.stopPropagation()}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{prf.title}</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" style={{ color: 'var(--muted)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-3 rounded-xl mb-6" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div className="font-medium text-sm" style={{ color: 'var(--text)' }}>
              {isRtl ? request.titleAr : request.title}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              {isRtl ? request.postedByAr : request.postedBy} · {isRtl ? (budgetRangesAr[request.budget] || request.budget) : request.budget}
            </div>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text)' }}>{prf.success}</h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{prf.successDesc}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{prf.companyName}</label>
                <input type="text" required value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} placeholder={prf.companyPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{prf.proposalSummary}</label>
                <textarea required rows={3} value={form.proposalSummary} onChange={e => setForm(f => ({ ...f, proposalSummary: e.target.value }))} placeholder={prf.summaryPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{prf.proposedBudget}</label>
                  <input type="text" required value={form.proposedBudget} onChange={e => setForm(f => ({ ...f, proposedBudget: e.target.value }))} placeholder={prf.budgetPlaceholder}
                    className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{prf.deliveryTimeline}</label>
                  <input type="text" required value={form.deliveryTimeline} onChange={e => setForm(f => ({ ...f, deliveryTimeline: e.target.value }))} placeholder={prf.timelinePlaceholder}
                    className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              </div>
              <button type="submit" className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                {prf.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function ProcurementHubPage() {
  const { locale, t } = useI18n()
  const isRtl = locale === 'ar'
  const ph = t.procurementHub
  const router = useRouter()
  const searchParams = useSearchParams()

  const [hasAccess] = useState(true) // mock

  // ─── URL-synced state ──────────────────────────────────────────────────
  const [role, setRole] = useState<'buyer' | 'supplier'>(
    (searchParams.get('role') as 'buyer' | 'supplier') || 'buyer'
  )
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)
  const [selectedSector, setSelectedSector] = useState(searchParams.get('sector') || '')
  const [selectedTier, setSelectedTier] = useState(searchParams.get('tier') || '')
  const [selectedBudget, setSelectedBudget] = useState(searchParams.get('budget') || '')
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '')
  const [goldenOnly, setGoldenOnly] = useState(searchParams.get('golden') === 'true')
  const [urgentOnly, setUrgentOnly] = useState(searchParams.get('urgent') === 'true')
  const [sortSuppliers, setSortSuppliers] = useState(searchParams.get('sortS') || 'rating')
  const [sortRequests, setSortRequests] = useState(searchParams.get('sortR') || 'newest')
  const [tab, setTab] = useState<'all' | 'saved'>(
    (searchParams.get('tab') as 'all' | 'saved') || 'all'
  )

  // ─── Saved suppliers (localStorage) ────────────────────────────────────
  const [savedIds, setSavedIds] = useState<string[]>([])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { const saved = localStorage.getItem('procurement-saved-suppliers'); if (saved) setSavedIds(JSON.parse(saved)) } catch { /* ignore */ }
  }, [])
  const toggleSave = useCallback((id: string) => {
    setSavedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      try { localStorage.setItem('procurement-saved-suppliers', JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  // ─── Modals ────────────────────────────────────────────────────────────
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [quoteSupplier, setQuoteSupplier] = useState<Supplier | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null)
  const [proposalRequest, setProposalRequest] = useState<ProcurementRequest | null>(null)
  const [showPostForm, setShowPostForm] = useState(false)

  // ─── Loading ───────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  useEffect(() => { const timer = setTimeout(() => setLoading(false), 600); return () => clearTimeout(timer) }, [])

  // ─── Debounced search ──────────────────────────────────────────────────
  useEffect(() => { const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300); return () => clearTimeout(timer) }, [searchQuery])

  // ─── Sync to URL ───────────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams()
    if (role !== 'buyer') params.set('role', role)
    if (debouncedSearch) params.set('q', debouncedSearch)
    if (selectedSector) params.set('sector', selectedSector)
    if (selectedTier) params.set('tier', selectedTier)
    if (selectedBudget) params.set('budget', selectedBudget)
    if (selectedStatus) params.set('status', selectedStatus)
    if (goldenOnly) params.set('golden', 'true')
    if (urgentOnly) params.set('urgent', 'true')
    if (sortSuppliers !== 'rating') params.set('sortS', sortSuppliers)
    if (sortRequests !== 'newest') params.set('sortR', sortRequests)
    if (tab !== 'all') params.set('tab', tab)
    const qs = params.toString()
    router.replace(`/services/procurement-hub${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [role, debouncedSearch, selectedSector, selectedTier, selectedBudget, selectedStatus, goldenOnly, urgentOnly, sortSuppliers, sortRequests, tab, router])

  // ─── Filtered suppliers ────────────────────────────────────────────────
  const filteredSuppliers = useMemo(() => {
    let result = [...allSuppliers]
    const q = debouncedSearch.toLowerCase()
    if (q) {
      result = result.filter(s =>
        s.companyName.toLowerCase().includes(q) || s.companyNameAr.includes(q) ||
        s.sector.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) ||
        s.tags.some(tg => tg.toLowerCase().includes(q)) ||
        s.catalogItems.some(ci => ci.title.toLowerCase().includes(q))
      )
    }
    if (selectedSector) result = result.filter(s => s.sector === selectedSector)
    if (selectedTier) result = result.filter(s => s.memberTier === selectedTier)
    if (goldenOnly) result = result.filter(s => s.isGoldenVendor)
    if (tab === 'saved') result = result.filter(s => savedIds.includes(s.id))
    switch (sortSuppliers) {
      case 'deals': result.sort((a, b) => b.completedDeals - a.completedDeals); break
      case 'response': result.sort((a, b) => parseFloat(a.responseTime) - parseFloat(b.responseTime)); break
      default: result.sort((a, b) => b.rating - a.rating)
    }
    return result
  }, [debouncedSearch, selectedSector, selectedTier, goldenOnly, sortSuppliers, tab, savedIds])

  // ─── Filtered requests ─────────────────────────────────────────────────
  const filteredRequests = useMemo(() => {
    let result = [...allProcurementRequests]
    const q = debouncedSearch.toLowerCase()
    if (q) {
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) || r.titleAr.includes(q) ||
        r.postedBy.toLowerCase().includes(q) || r.sector.toLowerCase().includes(q) ||
        r.tags.some(tg => tg.toLowerCase().includes(q))
      )
    }
    if (selectedSector) result = result.filter(r => r.sector === selectedSector)
    if (selectedBudget) result = result.filter(r => r.budget === selectedBudget)
    if (selectedStatus) result = result.filter(r => r.status === selectedStatus)
    if (urgentOnly) result = result.filter(r => r.isUrgent)
    switch (sortRequests) {
      case 'deadline': result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()); break
      case 'proposals': result.sort((a, b) => b.proposalCount - a.proposalCount); break
      default: result.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
    }
    return result
  }, [debouncedSearch, selectedSector, selectedBudget, selectedStatus, urgentOnly, sortRequests])

  const goldenVendors = useMemo(() => allSuppliers.filter(s => s.isGoldenVendor), [])

  const relatedSuppliers = useMemo(() => {
    if (!selectedSupplier) return []
    return allSuppliers.filter(s => s.id !== selectedSupplier.id && s.sector === selectedSupplier.sector).slice(0, 4)
  }, [selectedSupplier])

  const stats = useMemo(() => ({
    suppliers: allSuppliers.length,
    goldenVendors: allSuppliers.filter(s => s.isGoldenVendor).length,
    openRequests: allProcurementRequests.filter(r => r.status === 'Open').length,
    sectors: new Set(allSuppliers.map(s => s.sector)).size,
  }), [])

  const clearFilters = () => {
    setSearchQuery(''); setSelectedSector(''); setSelectedTier(''); setSelectedBudget('')
    setSelectedStatus(''); setGoldenOnly(false); setUrgentOnly(false)
    setSortSuppliers('rating'); setSortRequests('newest'); setTab('all')
  }

  const hasActiveFilters = debouncedSearch || selectedSector || selectedTier || selectedBudget || selectedStatus || goldenOnly || urgentOnly || tab === 'saved'

  if (!hasAccess) return <MemberAccessGuard ph={ph} isRtl={isRtl} />

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ── Hero Header ────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-[#0a2540] dark:to-[#0d3055] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/services" className="inline-flex items-center text-blue-100 hover:text-white mb-4 transition-colors">
            <svg className="w-5 h-5 me-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.services.backToDirectory}
          </Link>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{ph.title}</h1>
              <p className="text-blue-100 text-lg max-w-2xl">{ph.subtitle}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {[
              { label: ph.statSuppliers, value: stats.suppliers },
              { label: ph.statGoldenVendors, value: stats.goldenVendors },
              { label: ph.statOpenRequests, value: stats.openRequests },
              { label: ph.statSectors, value: stats.sectors },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Role Toggle ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex rounded-xl p-1" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
            <button onClick={() => setRole('buyer')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${role === 'buyer' ? 'bg-blue-600 text-white shadow-md' : ''}`}
              style={role !== 'buyer' ? { color: 'var(--text-secondary)' } : {}}>
              {ph.roleBuyer}
            </button>
            <button onClick={() => setRole('supplier')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${role === 'supplier' ? 'bg-blue-600 text-white shadow-md' : ''}`}
              style={role !== 'supplier' ? { color: 'var(--text-secondary)' } : {}}>
              {ph.roleSupplier}
            </button>
          </div>
        </div>

        {/* ═══ BUYER VIEW — Supplier Directory ═══ */}
        {role === 'buyer' && (
          <>
            {!hasActiveFilters && !loading && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{ph.goldenVendorSection}</h2>
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>{ph.goldenVendorDesc}</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {goldenVendors.map(s => (
                    <button key={s.id} onClick={() => setSelectedSupplier(s)}
                      className="text-start p-4 rounded-2xl transition-all hover:shadow-lg"
                      style={{ background: 'var(--panel)', border: '2px solid rgb(251, 191, 36, 0.3)' }}>
                      <div className="flex items-center gap-3 mb-2">
                        <CompanyAvatar name={s.companyName} size="sm" />
                        <div>
                          <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{isRtl ? s.companyNameAr : s.companyName}</div>
                          <div className="text-xs" style={{ color: 'var(--muted)' }}>{isRtl ? s.sectorAr : s.sector}</div>
                        </div>
                      </div>
                      <GoldenVendorBadge label={ph.goldenVendorBadge} />
                      <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--muted)' }}>
                        <span>{s.rating.toFixed(1)} / 5.0</span>
                        <span>{s.completedDeals} {ph.completedDeals.toLowerCase()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setTab('all')}
                className={`text-sm font-medium pb-2 transition-colors ${tab === 'all' ? 'border-b-2 border-blue-600' : ''}`}
                style={{ color: tab === 'all' ? 'var(--primary)' : 'var(--muted)' }}>{ph.supplierDirectory}</button>
              <button onClick={() => setTab('saved')}
                className={`text-sm font-medium pb-2 transition-colors ${tab === 'saved' ? 'border-b-2 border-blue-600' : ''}`}
                style={{ color: tab === 'saved' ? 'var(--primary)' : 'var(--muted)' }}>
                {ph.savedSuppliers} {savedIds.length > 0 && `(${savedIds.length})`}
              </button>
            </div>

            <div className="rounded-2xl shadow-lg p-6 mb-6 theme-panel">
              <div className="grid md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={ph.searchSuppliers}
                      className="w-full px-4 py-2.5 ps-10 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                    <svg className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <select value={selectedSector} onChange={e => setSelectedSector(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                    <option value="">{ph.allSectors}</option>
                    {sectors.map(s => <option key={s} value={s}>{isRtl ? (sectorsAr[s] || s) : s}</option>)}
                  </select>
                </div>
                <div>
                  <select value={selectedTier} onChange={e => setSelectedTier(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                    <option value="">{ph.allTiers}</option>
                    {memberTiers.map(tier => <option key={tier} value={tier}>{isRtl ? (memberTiersAr[tier] || tier) : tier}</option>)}
                  </select>
                </div>
                <div>
                  <select value={sortSuppliers} onChange={e => setSortSuppliers(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                    <option value="rating">{ph.sortRating}</option>
                    <option value="deals">{ph.sortDeals}</option>
                    <option value="response">{ph.sortResponse}</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={goldenOnly} onChange={e => setGoldenOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{ph.goldenVendorToggle}</span>
                </label>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{ph.clearFilters}</button>
                )}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {ph.showingSuppliers.replace('{count}', String(filteredSuppliers.length)).replace('{total}', String(allSuppliers.length))}
              </p>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : filteredSuppliers.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuppliers.map(s => (
                  <SupplierCard key={s.id} supplier={s} isRtl={isRtl} ph={ph} isSaved={savedIds.includes(s.id)}
                    onView={() => setSelectedSupplier(s)} onToggleSave={() => toggleSave(s.id)} />
                ))}
              </div>
            ) : tab === 'saved' ? (
              <div className="text-center py-12 rounded-2xl theme-panel">
                <svg className="mx-auto h-12 w-12" style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <p className="mt-4 font-medium" style={{ color: 'var(--text)' }}>{ph.noSavedSuppliers}</p>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{ph.noSavedHint}</p>
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl theme-panel">
                <svg className="mx-auto h-12 w-12" style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-4" style={{ color: 'var(--muted)' }}>{ph.noSuppliers}</p>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{ph.noSuppliersHint}</p>
              </div>
            )}
          </>
        )}

        {/* ═══ SUPPLIER VIEW — Procurement Requests ═══ */}
        {role === 'supplier' && (
          <>
            <div className="flex justify-end mb-6">
              <button onClick={() => setShowPostForm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {ph.postRequirement}
              </button>
            </div>

            <div className="rounded-2xl shadow-lg p-6 mb-6 theme-panel">
              <div className="grid md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={ph.searchRequests}
                      className="w-full px-4 py-2.5 ps-10 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                    <svg className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <select value={selectedSector} onChange={e => setSelectedSector(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                    <option value="">{ph.allSectors}</option>
                    {sectors.map(s => <option key={s} value={s}>{isRtl ? (sectorsAr[s] || s) : s}</option>)}
                  </select>
                </div>
                <div>
                  <select value={selectedBudget} onChange={e => setSelectedBudget(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                    <option value="">{ph.allBudgets}</option>
                    {budgetRanges.map(b => <option key={b} value={b}>{isRtl ? (budgetRangesAr[b] || b) : b}</option>)}
                  </select>
                </div>
                <div>
                  <select value={sortRequests} onChange={e => setSortRequests(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                    <option value="newest">{ph.sortNewest}</option>
                    <option value="deadline">{ph.sortDeadline}</option>
                    <option value="proposals">{ph.sortProposals}</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex items-center gap-4">
                  <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                    <option value="">{ph.allStatuses}</option>
                    <option value="Open">{ph.open}</option>
                    <option value="In Review">{ph.inReview}</option>
                    <option value="Closed">{ph.closed}</option>
                  </select>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={urgentOnly} onChange={e => setUrgentOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{ph.urgentToggle}</span>
                  </label>
                </div>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{ph.clearFilters}</button>
                )}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {ph.showingRequests.replace('{count}', String(filteredRequests.length)).replace('{total}', String(allProcurementRequests.length))}
              </p>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : filteredRequests.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.map(r => (
                  <RequestCard key={r.id} request={r} isRtl={isRtl} ph={ph}
                    onView={() => setSelectedRequest(r)} onSubmitProposal={() => setProposalRequest(r)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl theme-panel">
                <svg className="mx-auto h-12 w-12" style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-4" style={{ color: 'var(--muted)' }}>{ph.noRequests}</p>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{ph.noRequestsHint}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {selectedSupplier && (
        <SupplierDetailModal supplier={selectedSupplier} isRtl={isRtl} ph={ph}
          isSaved={savedIds.includes(selectedSupplier.id)}
          onClose={() => setSelectedSupplier(null)}
          onToggleSave={() => toggleSave(selectedSupplier.id)}
          onRequestQuote={() => setQuoteSupplier(selectedSupplier)}
          relatedSuppliers={relatedSuppliers}
          onViewRelated={s => setSelectedSupplier(s)} />
      )}
      {quoteSupplier && (
        <QuoteRequestForm supplier={quoteSupplier} isRtl={isRtl} ph={ph} onClose={() => setQuoteSupplier(null)} />
      )}
      {selectedRequest && !proposalRequest && (
        <RequestDetailModal request={selectedRequest} isRtl={isRtl} ph={ph}
          onClose={() => setSelectedRequest(null)}
          onSubmitProposal={() => setProposalRequest(selectedRequest)} />
      )}
      {proposalRequest && (
        <SubmitProposalForm request={proposalRequest} isRtl={isRtl} ph={ph}
          onClose={() => { setProposalRequest(null); setSelectedRequest(null) }} />
      )}
      {showPostForm && (
        <PostRequirementForm isRtl={isRtl} ph={ph} onClose={() => setShowPostForm(false)} />
      )}
    </div>
  )
}
