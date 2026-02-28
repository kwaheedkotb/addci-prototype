'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import {
  DEALS,
  categoryColors,
  dealTypeColors,
  categoriesAr,
  type Deal,
} from '@/lib/chamber-boost-data'

// ─── Member Access Guard ────────────────────────────────────────────────────
function MemberAccessGuard({ locale }: { locale: string }) {
  const isRtl = locale === 'ar'
  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 dark:from-[#000C14] dark:via-[#001520] dark:to-[#001B30] ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text)' }}>
            {isRtl ? 'محتوى حصري للأعضاء' : 'Members-Only Content'}
          </h2>
          <p className="mb-8" style={{ color: 'var(--muted)' }}>
            {isRtl
              ? 'عروض Chamber Boost متاحة حصرياً لأعضاء غرفة أبوظبي.'
              : 'Chamber Boost deals are exclusively available to ADCCI members.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-3 rounded-xl text-white font-medium" style={{ background: 'var(--primary)' }}>
              {isRtl ? 'تسجيل الدخول' : 'Sign In'}
            </button>
            <Link href="/services" className="px-6 py-3 rounded-xl font-medium border" style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>
              {isRtl ? 'العودة للخدمات' : 'Back to Services'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Types ──────────────────────────────────────────────────────────────────
type SortOption = 'featured' | 'newest' | 'discount'
type DealTypeFilter = '' | 'UNLIMITED' | 'LIMITED'

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function ChamberBoostPage() {
  const { locale, dir } = useI18n()
  const router = useRouter()
  const isRtl = locale === 'ar'

  // Auth — prototype mode: always true
  const [isAuthenticated] = useState(true)

  // Modal state
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [dealTypeFilter, setDealTypeFilter] = useState<DealTypeFilter>('')
  const [sortBy, setSortBy] = useState<SortOption>('featured')

  // Search debounce
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [searchQuery])

  // ─── Computed stats ─────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const uniqueVendors = new Set(DEALS.map(d => d.vendor))
    const uniqueCategories = new Set(DEALS.map(d => d.category))
    const limitedRemaining = DEALS
      .filter(d => d.dealType === 'LIMITED' && d.availableSlots && d.claimedSlots !== undefined)
      .reduce((sum, d) => sum + ((d.availableSlots || 0) - (d.claimedSlots || 0)), 0)
    return {
      totalDeals: DEALS.length,
      vendors: uniqueVendors.size,
      categories: uniqueCategories.size,
      limitedRemaining,
    }
  }, [])

  // ─── Category counts ────────────────────────────────────────────────────
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const d of DEALS) {
      counts[d.category] = (counts[d.category] || 0) + 1
    }
    return counts
  }, [])

  // ─── Filtered and sorted deals ──────────────────────────────────────────
  const filteredDeals = useMemo(() => {
    let result = [...DEALS]

    // Search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.titleAr.includes(q) ||
        d.vendor.toLowerCase().includes(q) ||
        d.vendorAr.includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.descriptionAr.includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q)) ||
        d.tagsAr.some(t => t.includes(q))
      )
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(d => selectedCategories.includes(d.category))
    }

    // Deal type filter
    if (dealTypeFilter) {
      result = result.filter(d => d.dealType === dealTypeFilter)
    }

    // Sort
    switch (sortBy) {
      case 'featured':
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
      case 'discount':
        result.sort((a, b) => {
          const aVal = parseInt(a.discountValue.replace(/\D/g, '')) || 0
          const bVal = parseInt(b.discountValue.replace(/\D/g, '')) || 0
          return bVal - aVal
        })
        break
    }

    return result
  }, [debouncedSearch, selectedCategories, dealTypeFilter, sortBy])

  // ─── Featured deals ─────────────────────────────────────────────────────
  const featuredDeals = useMemo(() => DEALS.filter(d => d.isFeatured), [])

  // ─── Handlers ───────────────────────────────────────────────────────────
  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedCategories([])
    setDealTypeFilter('')
    setSortBy('featured')
  }, [])

  const hasFilters = searchQuery || selectedCategories.length > 0 || dealTypeFilter

  if (!isAuthenticated) return <MemberAccessGuard locale={locale} />

  return (
    <div className={`min-h-screen ${isRtl ? 'rtl' : 'ltr'}`} style={{ background: 'var(--bg)' }} dir={dir}>
      {/* ─── Gradient Header ──────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 dark:from-[#2d1a00] dark:to-[#1a0f00]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <Link
            href="/services"
            className="inline-flex items-center text-white/60 hover:text-white/90 transition-colors mb-4 text-sm"
          >
            <svg className={`w-4 h-4 ${isRtl ? 'ms-1.5 rtl:rotate-180' : 'me-1.5'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {isRtl ? 'العودة للخدمات' : 'Back to Services'}
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {isRtl ? 'تعزيز الغرفة' : 'Chamber Boost'}
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            {isRtl
              ? 'صفقات حصرية وأسعار تفضيلية لأعضاء الغرفة من كبار شركاء الأعمال'
              : 'Exclusive deals and preferential rates for ADCCI members from leading business partners'}
          </p>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: isRtl ? 'عروض نشطة' : 'Active Deals', value: stats.totalDeals },
              { label: isRtl ? 'شركاء' : 'Partner Vendors', value: stats.vendors },
              { label: isRtl ? 'فئات' : 'Categories', value: stats.categories },
              { label: isRtl ? 'عروض محدودة متبقية' : 'Limited Slots Left', value: stats.limitedRemaining },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-3 bg-white/10 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ─── Featured Deals ─────────────────────────────────────────── */}
        {!hasFilters && featuredDeals.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>
              {isRtl ? 'العروض المميزة' : 'Featured Deals'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredDeals.map(deal => (
                <button
                  key={deal.id}
                  onClick={() => setSelectedDeal(deal)}
                  className="rounded-2xl p-5 theme-panel hover:shadow-lg transition-all text-left relative overflow-hidden group"
                  dir={dir}
                >
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg">
                    {isRtl ? 'مميز' : 'FEATURED'}
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white" style={{ background: 'var(--primary)' }}>
                      {deal.vendorLogo}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{isRtl ? deal.vendorAr : deal.vendor}</p>
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{isRtl ? deal.titleAr : deal.title}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold mb-1" style={{ color: 'var(--accent-green)' }}>
                    {isRtl ? deal.discountValueAr : deal.discountValue}
                  </p>
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--muted)' }}>
                    {isRtl ? deal.offerSummaryAr : deal.offerSummary}
                  </p>
                  <div className="flex gap-1.5 mt-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${dealTypeColors[deal.dealType]}`}>
                      {deal.dealType === 'UNLIMITED' ? (isRtl ? 'فوري' : 'Instant') : (isRtl ? 'محدود' : 'Limited')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${categoryColors[deal.category] || ''}`}>
                      {isRtl ? deal.categoryAr : deal.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Filter Bar ─────────────────────────────────────────────── */}
        <div className="rounded-2xl p-4 theme-panel mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 ${isRtl ? 'right-3' : 'left-3'}`} style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'ابحث عن عروض، شركاء...' : 'Search deals, vendors...'}
                className={`w-full rounded-lg py-2 text-sm border ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}
              />
            </div>

            {/* Category multi-select */}
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    selectedCategories.includes(cat)
                      ? categoryColors[cat] || ''
                      : ''
                  }`}
                  style={!selectedCategories.includes(cat) ? { color: 'var(--muted)', borderColor: 'var(--border)' } : undefined}
                >
                  {isRtl ? (categoriesAr[cat] || cat) : cat} ({count})
                </button>
              ))}
            </div>

            {/* Deal type toggle */}
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
              {[
                { value: '' as DealTypeFilter, label: isRtl ? 'الكل' : 'All' },
                { value: 'UNLIMITED' as DealTypeFilter, label: isRtl ? 'فوري' : 'Instant' },
                { value: 'LIMITED' as DealTypeFilter, label: isRtl ? 'محدود' : 'Limited' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDealTypeFilter(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium transition-all ${
                    dealTypeFilter === opt.value ? 'text-white' : ''
                  }`}
                  style={dealTypeFilter === opt.value
                    ? { background: 'var(--primary)' }
                    : { color: 'var(--muted)' }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="rounded-lg px-3 py-1.5 text-xs border"
              style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}
            >
              <option value="featured">{isRtl ? 'المميزة أولاً' : 'Featured First'}</option>
              <option value="newest">{isRtl ? 'الأحدث' : 'Newest'}</option>
              <option value="discount">{isRtl ? 'أعلى خصم' : 'Highest Discount'}</option>
            </select>
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {filteredDeals.length} {isRtl ? 'نتيجة' : 'results'}
              </span>
              {selectedCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className="px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1"
                  style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
                >
                  {isRtl ? (categoriesAr[cat] || cat) : cat}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ))}
              {dealTypeFilter && (
                <button
                  onClick={() => setDealTypeFilter('')}
                  className="px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1"
                  style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
                >
                  {dealTypeFilter === 'UNLIMITED' ? (isRtl ? 'فوري' : 'Instant') : (isRtl ? 'محدود' : 'Limited')}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button onClick={clearFilters} className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                {isRtl ? 'مسح الكل' : 'Clear all'}
              </button>
            </div>
          )}
        </div>

        {/* ─── Deal Cards Grid ────────────────────────────────────────── */}
        {filteredDeals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.map(deal => (
              <DealCard key={deal.id} deal={deal} isRtl={isRtl} dir={dir} onSelect={() => setSelectedDeal(deal)} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl p-12 theme-panel text-center">
            <svg className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
              {isRtl ? 'لا توجد نتائج' : 'No deals found'}
            </p>
            <p className="mb-4" style={{ color: 'var(--muted)' }}>
              {isRtl ? 'جرب تعديل معايير البحث' : 'Try adjusting your search criteria'}
            </p>
            <button onClick={clearFilters} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: 'var(--primary)' }}>
              {isRtl ? 'مسح الفلاتر' : 'Clear Filters'}
            </button>
          </div>
        )}
      </div>

      {/* ─── Deal Detail Modal ─────────────────────────────────────────── */}
      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          isRtl={isRtl}
          dir={dir}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </div>
  )
}

// ─── Deal Card Component ────────────────────────────────────────────────────
function DealCard({ deal, isRtl, dir, onSelect }: { deal: Deal; isRtl: boolean; dir: string; onSelect: () => void }) {
  const daysUntilExpiry = Math.ceil((new Date(deal.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const slotsRemaining = deal.dealType === 'LIMITED' && deal.availableSlots ? (deal.availableSlots - (deal.claimedSlots || 0)) : null
  const slotsPct = slotsRemaining !== null && deal.availableSlots ? (slotsRemaining / deal.availableSlots) * 100 : null

  return (
    <button
      onClick={onSelect}
      className="rounded-2xl p-6 theme-panel hover:shadow-lg transition-all text-left relative group"
      dir={dir}
    >
      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {deal.isNew && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
            {isRtl ? 'جديد' : 'NEW'}
          </span>
        )}
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${dealTypeColors[deal.dealType]}`}>
          {deal.dealType === 'UNLIMITED' ? (isRtl ? 'فوري' : 'Instant') : (isRtl ? 'متاح محدود' : 'Limited Availability')}
        </span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryColors[deal.category] || ''}`}>
          {isRtl ? deal.categoryAr : deal.category}
        </span>
      </div>

      {/* Vendor */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0" style={{ background: 'var(--primary)' }}>
          {deal.vendorLogo}
        </div>
        <div className="min-w-0">
          <p className="text-xs" style={{ color: 'var(--muted)' }}>{isRtl ? deal.vendorAr : deal.vendor}</p>
          <p className="font-semibold truncate" style={{ color: 'var(--text)' }}>{isRtl ? deal.titleAr : deal.title}</p>
        </div>
      </div>

      {/* Offer summary */}
      <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--muted)' }}>
        {isRtl ? deal.offerSummaryAr : deal.offerSummary}
      </p>

      {/* Discount value */}
      <p className="text-2xl font-bold mb-3" style={{ color: 'var(--accent-green)' }}>
        {isRtl ? deal.discountValueAr : deal.discountValue}
      </p>

      {/* Valid until */}
      <p className={`text-xs mb-2 ${daysUntilExpiry <= 30 ? 'font-semibold' : ''}`}
        style={{ color: daysUntilExpiry <= 30 ? 'var(--accent-amber)' : 'var(--muted)' }}>
        {isRtl ? 'صالح حتى:' : 'Valid until:'} {new Date(deal.validUntil).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>

      {/* Slots remaining for LIMITED */}
      {slotsRemaining !== null && slotsPct !== null && (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: slotsPct < 20 ? 'var(--accent-red)' : slotsPct < 40 ? 'var(--accent-amber)' : 'var(--muted)' }}>
              {isRtl ? `${slotsRemaining} من ${deal.availableSlots} متبقي` : `${slotsRemaining} of ${deal.availableSlots} slots remaining`}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--panel-2)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${slotsPct}%`,
                background: slotsPct < 20 ? 'var(--accent-red)' : slotsPct < 40 ? 'var(--accent-amber)' : 'var(--accent-green)',
              }}
            />
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-4 py-2 rounded-lg text-center text-sm font-medium text-white transition-all group-hover:opacity-90" style={{ background: 'var(--primary)' }}>
        {isRtl ? 'عرض والمطالبة' : 'View & Claim'}
      </div>
    </button>
  )
}

// ─── Deal Detail Modal ──────────────────────────────────────────────────────
function DealDetailModal({ deal, isRtl, dir, onClose }: { deal: Deal; isRtl: boolean; dir: string; onClose: () => void }) {
  const router = useRouter()

  // Form state
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [memberTier, setMemberTier] = useState('Standard')
  const [companySize, setCompanySize] = useState('')
  const [intendedUse, setIntendedUse] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)
  const [applicationId, setApplicationId] = useState('')
  const [voucherCode, setVoucherCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedRef, setCopiedRef] = useState(false)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const slotsRemaining = deal.dealType === 'LIMITED' && deal.availableSlots ? (deal.availableSlots - (deal.claimedSlots || 0)) : null
  const slotsPct = slotsRemaining !== null && deal.availableSlots ? (slotsRemaining / deal.availableSlots) * 100 : null

  const handleSubmit = async () => {
    setSubmitError('')
    if (!companyName || !email) {
      setSubmitError(isRtl ? 'يرجى تعبئة جميع الحقول المطلوبة' : 'Please fill in all required fields')
      return
    }
    if (deal.dealType === 'LIMITED' && !intendedUse) {
      setSubmitError(isRtl ? 'يرجى وصف استخدامك المقصود' : 'Please describe your intended use')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/services/chamber-boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: deal.id,
          dealTitle: deal.title,
          dealTitleAr: deal.titleAr,
          dealType: deal.dealType,
          vendorName: deal.vendor,
          vendorNameAr: deal.vendorAr,
          category: deal.category,
          categoryAr: deal.categoryAr,
          companyName,
          email,
          memberTier,
          companySize: deal.dealType === 'LIMITED' ? companySize : undefined,
          intendedUse: deal.dealType === 'LIMITED' ? intendedUse : undefined,
          additionalNotes: deal.dealType === 'LIMITED' && additionalNotes ? additionalNotes : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setSubmitError(data.error || (isRtl ? 'فشل في إرسال الطلب' : 'Failed to submit request'))
        return
      }
      setApplicationId(data.applicationId)
      if (data.voucherCode) setVoucherCode(data.voucherCode)
      setSuccess(true)
    } catch {
      setSubmitError(isRtl ? 'خطأ في الشبكة. حاول مرة أخرى.' : 'Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = (text: string, type: 'voucher' | 'ref') => {
    navigator.clipboard.writeText(text)
    if (type === 'voucher') { setCopied(true); setTimeout(() => setCopied(false), 2000) }
    else { setCopiedRef(true); setTimeout(() => setCopiedRef(false), 2000) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8"
        style={{ background: 'var(--panel)', boxShadow: 'var(--shadow-lg)' }}
        onClick={e => e.stopPropagation()}
        dir={dir}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors hover:opacity-70"
          style={{ color: 'var(--muted)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {success ? (
          /* ─── Success State ─────────────────────────────────────── */
          <div className="text-center py-4">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              deal.dealType === 'UNLIMITED'
                ? 'bg-emerald-100 dark:bg-emerald-500/20'
                : 'bg-amber-100 dark:bg-amber-500/20'
            }`}>
              <svg className={`w-8 h-8 ${deal.dealType === 'UNLIMITED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
              {deal.dealType === 'UNLIMITED'
                ? (isRtl ? 'صفقتك جاهزة!' : 'Your Deal is Ready!')
                : (isRtl ? 'تم إرسال طلبك' : 'Request Submitted')}
            </h3>

            {/* Summary card */}
            <div className="rounded-xl p-4 text-left mb-4" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }} dir={dir}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0" style={{ background: 'var(--primary)' }}>
                  {deal.vendorLogo}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text)' }}>{isRtl ? deal.titleAr : deal.title}</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{isRtl ? deal.vendorAr : deal.vendor}</p>
                </div>
              </div>
            </div>

            {/* Voucher code for UNLIMITED */}
            {deal.dealType === 'UNLIMITED' && voucherCode && (
              <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'رمز القسيمة الخاص بك' : 'Your Voucher Code'}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-lg font-mono font-bold px-4 py-2 rounded-lg" style={{ background: 'var(--panel)', color: 'var(--accent-green)', border: '2px dashed var(--accent-green)' }}>
                    {voucherCode}
                  </code>
                  <button
                    onClick={() => copyToClipboard(voucherCode, 'voucher')}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: copied ? 'var(--accent-green)' : 'var(--muted)' }}
                    title={isRtl ? 'نسخ' : 'Copy'}
                  >
                    {copied ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'استخدم هذا الرمز عند الدفع على موقع الشريك' : 'Use this code at checkout on the vendor website'}
                </p>
              </div>
            )}

            {/* Reference ID */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {isRtl ? 'رقم المرجع:' : 'Reference:'} {applicationId}
              </span>
              <button
                onClick={() => copyToClipboard(applicationId, 'ref')}
                className="text-xs font-medium"
                style={{ color: copiedRef ? 'var(--accent-green)' : 'var(--primary)' }}
              >
                {copiedRef ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ' : 'Copy')}
              </button>
            </div>

            {/* Message for LIMITED */}
            {deal.dealType === 'LIMITED' && (
              <p className="text-sm mb-4 max-w-sm mx-auto" style={{ color: 'var(--muted)' }}>
                {isRtl
                  ? 'طلبك قيد المراجعة. ستتلقى رداً خلال يومي عمل.'
                  : 'Your request is under review. ADCCI will respond within 2 working days. You will be notified once a voucher code is issued or if additional information is needed.'}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push(`/member/applications/${applicationId}`)}
                className="px-6 py-2.5 rounded-lg font-medium text-white text-sm"
                style={{ background: 'var(--primary)' }}
              >
                {isRtl ? 'عرض طلبي' : 'View My Application'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg font-medium text-sm border"
                style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
              >
                {isRtl ? 'تصفح المزيد من العروض' : 'Browse More Deals'}
              </button>
            </div>
          </div>
        ) : (
          /* ─── Deal Detail + Form ────────────────────────────────── */
          <>
            {/* Header */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg text-white shrink-0" style={{ background: 'var(--primary)' }}>
                {deal.vendorLogo}
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>{isRtl ? deal.vendorAr : deal.vendor}</p>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{isRtl ? deal.titleAr : deal.title}</h3>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${dealTypeColors[deal.dealType]}`}>
                {deal.dealType === 'UNLIMITED' ? (isRtl ? 'فوري' : 'Instant') : (isRtl ? 'متاح محدود' : 'Limited Availability')}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryColors[deal.category] || ''}`}>
                {isRtl ? deal.categoryAr : deal.category}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {isRtl ? deal.descriptionAr : deal.description}
            </p>

            {/* Offer box */}
            <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>{isRtl ? 'ملخص العرض' : 'Offer Summary'}</p>
              <p className="font-semibold" style={{ color: 'var(--text)' }}>
                {isRtl ? deal.offerSummaryAr : deal.offerSummary}
              </p>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-3xl font-bold" style={{ color: 'var(--accent-green)' }}>{isRtl ? deal.discountValueAr : deal.discountValue}</span>
                {deal.originalValue && (
                  <span className="text-sm line-through" style={{ color: 'var(--muted)' }}>{deal.originalValue}</span>
                )}
              </div>
            </div>

            {/* Conditions */}
            <div className="mb-4">
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>{isRtl ? 'الشروط والأحكام' : 'Conditions'}</p>
              <ul className="space-y-1">
                {(isRtl ? deal.conditionsAr : deal.conditions).map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                    <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--muted)' }} />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Valid until */}
            <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>
              {isRtl ? 'صالح حتى:' : 'Valid until:'} {new Date(deal.validUntil).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            {/* Slots remaining for LIMITED */}
            {slotsRemaining !== null && slotsPct !== null && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: slotsPct < 20 ? 'var(--accent-red)' : slotsPct < 40 ? 'var(--accent-amber)' : 'var(--muted)' }}>
                    {isRtl ? `${slotsRemaining} من ${deal.availableSlots} متبقي` : `${slotsRemaining} of ${deal.availableSlots} slots remaining`}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: 'var(--panel-2)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${slotsPct}%`,
                      background: slotsPct < 20 ? 'var(--accent-red)' : slotsPct < 40 ? 'var(--accent-amber)' : 'var(--accent-green)',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Redemption instructions */}
            <div className="rounded-xl p-3 mb-6" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>{isRtl ? 'تعليمات الاسترداد' : 'Redemption Instructions'}</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {isRtl ? deal.redemptionInstructionsAr : deal.redemptionInstructions}
              </p>
            </div>

            {/* ─── Divider ────────────────────────────────────────── */}
            <div className="h-px mb-6" style={{ background: 'var(--border)' }} />

            {/* ─── Form ───────────────────────────────────────────── */}
            <h4 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>
              {deal.dealType === 'UNLIMITED'
                ? (isRtl ? 'المطالبة بالعرض الفوري' : 'Claim Instant Deal')
                : (isRtl ? 'طلب هذا العرض' : 'Request This Deal')}
            </h4>

            <div className="space-y-3">
              {/* Company name */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>
                  {isRtl ? 'اسم الشركة *' : 'Company Name *'}
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm border"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}
                  placeholder={isRtl ? 'أدخل اسم الشركة' : 'Enter company name'}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>
                  {isRtl ? 'البريد الإلكتروني *' : 'Email *'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm border"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}
                  placeholder={isRtl ? 'أدخل البريد الإلكتروني' : 'Enter email'}
                />
              </div>

              {/* Member tier */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>
                  {isRtl ? 'فئة العضوية *' : 'Member Tier *'}
                </label>
                <select
                  value={memberTier}
                  onChange={e => setMemberTier(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm border"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}
                >
                  <option value="Standard">{isRtl ? 'أساسي' : 'Standard'}</option>
                  <option value="Premium">{isRtl ? 'مميز' : 'Premium'}</option>
                  <option value="Elite Plus">{isRtl ? 'النخبة بلس' : 'Elite Plus'}</option>
                </select>
              </div>

              {/* LIMITED-only fields */}
              {deal.dealType === 'LIMITED' && (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>
                      {isRtl ? 'حجم الشركة *' : 'Company Size *'}
                    </label>
                    <select
                      value={companySize}
                      onChange={e => setCompanySize(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-sm border"
                      style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}
                    >
                      <option value="">{isRtl ? 'اختر' : 'Select'}</option>
                      <option value="1-10">1–10</option>
                      <option value="11-50">11–50</option>
                      <option value="51-200">51–200</option>
                      <option value="200+">200+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>
                      {isRtl ? 'الاستخدام المقصود *' : 'Intended Use *'}
                    </label>
                    <textarea
                      value={intendedUse}
                      onChange={e => setIntendedUse(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg px-3 py-2 text-sm border resize-none"
                      style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}
                      placeholder={isRtl ? 'صف بإيجاز كيف ستستخدم شركتك هذا العرض' : 'Briefly describe how your company will use this deal'}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>
                      {isRtl ? 'ملاحظات إضافية' : 'Additional Notes'}
                    </label>
                    <textarea
                      value={additionalNotes}
                      onChange={e => setAdditionalNotes(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg px-3 py-2 text-sm border resize-none"
                      style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}
                      placeholder={isRtl ? 'أي معلومات إضافية (اختياري)' : 'Any additional information (optional)'}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Error */}
            {submitError && (
              <div className="mt-3 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)' }}>
                {submitError}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full mt-4 py-3 rounded-lg font-medium text-white text-sm disabled:opacity-50"
              style={{ background: 'var(--primary)' }}
            >
              {isSubmitting
                ? (isRtl ? 'جاري الإرسال...' : 'Submitting...')
                : deal.dealType === 'UNLIMITED'
                  ? (isRtl ? 'المطالبة بالعرض الفوري' : 'Claim Instant Deal')
                  : (isRtl ? 'إرسال الطلب' : 'Request This Deal')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
