'use client'

import { useI18n } from '@/lib/i18n'
import { MEMBER_STATUS_LABELS, DEPARTMENT_LIST } from '@/lib/service-metadata'
import { STAFF_SERVICE_MAP } from '@/lib/staff-service-map'

// ─── Types ───────────────────────────────────────────────────────────────────

interface FilterCounts {
  byService: Record<string, number>
  byStatus: Record<string, number>
  byDepartment: Record<string, number>
}

interface ApplicationsFilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  serviceTypes: string[]
  onServiceTypesChange: (values: string[]) => void
  statuses: string[]
  onStatusesChange: (values: string[]) => void
  departments: string[]
  onDepartmentsChange: (values: string[]) => void
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
  sort: string
  onSortChange: (value: string) => void
  onClearAll: () => void
  resultCount: number
  totalCount: number
  filterCounts: FilterCounts
}

// ─── Service options built from STAFF_SERVICE_MAP ────────────────────────────

const serviceOptions = Object.values(STAFF_SERVICE_MAP).map(meta => ({
  value: meta.serviceType,
  en: meta.nameEn,
  ar: meta.nameAr,
}))

// ─── Status options built from MEMBER_STATUS_LABELS ──────────────────────────

const statusOptions = Object.entries(MEMBER_STATUS_LABELS).map(([key, meta]) => ({
  value: key,
  en: meta.en,
  ar: meta.ar,
}))

// ─── Department options built from DEPARTMENT_LIST ───────────────────────────

const departmentOptions = DEPARTMENT_LIST.map(d => ({
  value: d.key,
  en: d.en,
  ar: d.ar,
}))

// ─── Sort options ────────────────────────────────────────────────────────────

const sortOptions = [
  { value: 'newest', en: 'Newest First', ar: 'الأحدث أولاً' },
  { value: 'oldest', en: 'Oldest First', ar: 'الأقدم أولاً' },
  { value: 'status', en: 'Status', ar: 'الحالة' },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function ApplicationsFilterBar({
  searchQuery,
  onSearchChange,
  serviceTypes,
  onServiceTypesChange,
  statuses,
  onStatusesChange,
  departments,
  onDepartmentsChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  sort,
  onSortChange,
  onClearAll,
  resultCount,
  totalCount,
  filterCounts,
}: ApplicationsFilterBarProps) {
  const { locale } = useI18n()
  const isRtl = locale === 'ar'

  // ── Derived state ────────────────────────────────────────────────────────

  const hasActiveFilters =
    searchQuery.length > 0 ||
    serviceTypes.length > 0 ||
    statuses.length > 0 ||
    departments.length > 0 ||
    dateFrom !== '' ||
    dateTo !== ''

  // ── Helpers for single-select that toggles within an array ─────────────

  function handleSelectToggle(
    current: string[],
    onChange: (v: string[]) => void,
    value: string,
  ) {
    if (!value) return
    if (current.includes(value)) {
      onChange(current.filter(v => v !== value))
    } else {
      onChange([...current, value])
    }
  }

  // ── Build active filter chips ──────────────────────────────────────────

  const chips: { key: string; label: string; onRemove: () => void }[] = []

  for (const st of serviceTypes) {
    const opt = serviceOptions.find(o => o.value === st)
    chips.push({
      key: `service-${st}`,
      label: opt ? (isRtl ? opt.ar : opt.en) : st,
      onRemove: () => onServiceTypesChange(serviceTypes.filter(v => v !== st)),
    })
  }

  for (const s of statuses) {
    const opt = statusOptions.find(o => o.value === s)
    chips.push({
      key: `status-${s}`,
      label: opt ? (isRtl ? opt.ar : opt.en) : s,
      onRemove: () => onStatusesChange(statuses.filter(v => v !== s)),
    })
  }

  for (const d of departments) {
    const opt = departmentOptions.find(o => o.value === d)
    chips.push({
      key: `dept-${d}`,
      label: opt ? (isRtl ? opt.ar : opt.en) : d,
      onRemove: () => onDepartmentsChange(departments.filter(v => v !== d)),
    })
  }

  if (dateFrom) {
    chips.push({
      key: 'dateFrom',
      label: `${isRtl ? 'من' : 'From'}: ${dateFrom}`,
      onRemove: () => onDateFromChange(''),
    })
  }

  if (dateTo) {
    chips.push({
      key: 'dateTo',
      label: `${isRtl ? 'إلى' : 'To'}: ${dateTo}`,
      onRemove: () => onDateToChange(''),
    })
  }

  // ── Shared styles ──────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    background: 'var(--panel)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="mb-6">
      {/* Row 1: Search + filter dropdowns */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-1 min-w-0">
          <svg
            className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 ${isRtl ? 'right-3' : 'left-3'}`}
            style={{ color: 'var(--muted)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={
              isRtl
                ? 'ابحث بالرقم أو اسم المنظمة...'
                : 'Search by ID or organization...'
            }
            className={`w-full px-4 py-3 rounded-xl text-sm ${isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
            style={inputStyle}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className={`absolute top-1/2 -translate-y-1/2 p-1 rounded-full hover:opacity-70 transition-opacity ${isRtl ? 'left-3' : 'right-3'}`}
              style={{ color: 'var(--muted)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Filter dropdowns - wrap on mobile */}
        <div className="flex flex-wrap gap-3">
          {/* Service Type */}
          <select
            value=""
            onChange={e => handleSelectToggle(serviceTypes, onServiceTypesChange, e.target.value)}
            className="px-4 py-3 rounded-xl text-sm min-w-[160px]"
            style={inputStyle}
          >
            <option value="">{isRtl ? 'الخدمة' : 'Service'}</option>
            {serviceOptions.map(opt => {
              const count = filterCounts.byService[opt.value] ?? 0
              return (
                <option key={opt.value} value={opt.value}>
                  {isRtl ? opt.ar : opt.en}{count > 0 ? ` (${count})` : ''}
                </option>
              )
            })}
          </select>

          {/* Department */}
          <select
            value=""
            onChange={e => handleSelectToggle(departments, onDepartmentsChange, e.target.value)}
            className="px-4 py-3 rounded-xl text-sm min-w-[160px]"
            style={inputStyle}
          >
            <option value="">{isRtl ? 'الإدارة' : 'Department'}</option>
            {departmentOptions.map(opt => {
              const count = filterCounts.byDepartment[opt.value] ?? 0
              return (
                <option key={opt.value} value={opt.value}>
                  {isRtl ? opt.ar : opt.en}{count > 0 ? ` (${count})` : ''}
                </option>
              )
            })}
          </select>

          {/* Status */}
          <select
            value=""
            onChange={e => handleSelectToggle(statuses, onStatusesChange, e.target.value)}
            className="px-4 py-3 rounded-xl text-sm min-w-[160px]"
            style={inputStyle}
          >
            <option value="">{isRtl ? 'الحالة' : 'Status'}</option>
            {statusOptions.map(opt => {
              const count = filterCounts.byStatus[opt.value] ?? 0
              return (
                <option key={opt.value} value={opt.value}>
                  {isRtl ? opt.ar : opt.en}{count > 0 ? ` (${count})` : ''}
                </option>
              )
            })}
          </select>

          {/* Date From */}
          <input
            type="date"
            value={dateFrom}
            onChange={e => onDateFromChange(e.target.value)}
            className="px-4 py-3 rounded-xl text-sm"
            style={inputStyle}
            title={isRtl ? 'من تاريخ' : 'Date from'}
          />

          {/* Date To */}
          <input
            type="date"
            value={dateTo}
            onChange={e => onDateToChange(e.target.value)}
            className="px-4 py-3 rounded-xl text-sm"
            style={inputStyle}
            title={isRtl ? 'إلى تاريخ' : 'Date to'}
          />

          {/* Sort */}
          <select
            value={sort}
            onChange={e => onSortChange(e.target.value)}
            className="px-4 py-3 rounded-xl text-sm min-w-[140px]"
            style={inputStyle}
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {isRtl ? opt.ar : opt.en}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Active filter chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {chips.map(chip => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border"
              style={{
                background: 'var(--panel)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            >
              {chip.label}
              <button
                onClick={chip.onRemove}
                className={`ms-1 hover:opacity-70 transition-opacity`}
                style={{ color: 'var(--muted)' }}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          ))}
          <button
            onClick={onClearAll}
            className="text-xs font-medium ms-2 transition-opacity hover:opacity-80"
            style={{ color: 'var(--primary)' }}
          >
            {isRtl ? 'مسح الكل' : 'Clear all'}
          </button>
        </div>
      )}

      {/* Row 3: Results count */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm" style={{ color: 'var(--muted)' }}>
          {isRtl
            ? `عرض ${resultCount} من أصل ${totalCount} طلب`
            : `Showing ${resultCount} of ${totalCount} applications`}
        </span>
        {hasActiveFilters && chips.length === 0 && (
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
