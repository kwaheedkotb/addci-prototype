'use client'

import { useI18n } from '@/lib/i18n'

export interface FilterConfig {
  key: string
  label: string
  labelAr: string
  type: 'select' | 'date'
  options?: { value: string; label: string; labelAr: string }[]
}

interface StaffFilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  searchPlaceholderAr?: string
  filters: FilterConfig[]
  activeFilters: Record<string, string>
  onFilterChange: (key: string, value: string) => void
  onClearAll: () => void
  resultCount?: number
}

export default function StaffFilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search applications...',
  searchPlaceholderAr = 'البحث في الطلبات...',
  filters,
  activeFilters,
  onFilterChange,
  onClearAll,
  resultCount,
}: StaffFilterBarProps) {
  const { locale } = useI18n()
  const isRtl = locale === 'ar'

  const hasActiveFilters = searchQuery.length > 0 || Object.values(activeFilters).some(v => v !== '')

  return (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <svg className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 ${isRtl ? 'right-3' : 'left-3'}`} style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={isRtl ? searchPlaceholderAr : searchPlaceholder}
            className={`w-full py-3 rounded-xl text-sm ${isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
            style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className={`absolute top-1/2 -translate-y-1/2 p-1 rounded-full hover:opacity-70 transition-opacity ${isRtl ? 'left-3' : 'right-3'}`}
              style={{ color: 'var(--muted)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        {filters.map(filter => {
          if (filter.type === 'select' && filter.options) {
            return (
              <select
                key={filter.key}
                value={activeFilters[filter.key] || ''}
                onChange={e => onFilterChange(filter.key, e.target.value)}
                className="px-4 py-3 rounded-xl text-sm min-w-[160px]"
                style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)' }}
              >
                <option value="">{isRtl ? filter.labelAr : filter.label}</option>
                {filter.options.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {isRtl ? opt.labelAr : opt.label}
                  </option>
                ))}
              </select>
            )
          }
          if (filter.type === 'date') {
            return (
              <input
                key={filter.key}
                type="date"
                value={activeFilters[filter.key] || ''}
                onChange={e => onFilterChange(filter.key, e.target.value)}
                className="px-4 py-3 rounded-xl text-sm"
                style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            )
          }
          return null
        })}
      </div>

      {/* Results + clear */}
      <div className="flex items-center justify-between mt-4">
        {resultCount !== undefined && (
          <span className="text-sm" style={{ color: 'var(--muted)' }}>
            {isRtl ? `${resultCount} نتيجة` : `${resultCount} results`}
          </span>
        )}
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: 'var(--primary)' }}
          >
            {isRtl ? 'مسح الكل' : 'Clear all filters'}
          </button>
        )}
      </div>
    </div>
  )
}
