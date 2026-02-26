'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

interface Service {
  id: number
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  dept: string
  platform: string
  channelType: string
  externalUrl: string | null
}

interface FiltersData {
  departments: string[]
  platforms: string[]
}

export default function ServicesPage() {
  const { locale } = useI18n()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [filters, setFilters] = useState<FiltersData>({ departments: [], platforms: [] })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')

  useEffect(() => {
    fetchServices()
  }, [selectedPlatform, selectedDepartment, searchQuery])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedPlatform) params.set('platform', selectedPlatform)
      if (selectedDepartment) params.set('department', selectedDepartment)
      if (searchQuery) params.set('search', searchQuery)

      const response = await fetch(`/api/services?${params.toString()}`)
      const data = await response.json()

      // Handle API errors or missing data gracefully
      if (data.error || !data.services) {
        console.error('API error:', data.error)
        setServices([])
        setFilters({ departments: [], platforms: [] })
      } else {
        setServices(data.services || [])
        setFilters(data.filters || { departments: [], platforms: [] })
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      setServices([])
      setFilters({ departments: [], platforms: [] })
    } finally {
      setLoading(false)
    }
  }

  const handleServiceClick = (service: Service) => {
    if (service.channelType === 'EXTERNAL' && service.externalUrl) {
      window.open(service.externalUrl, '_blank')
    } else if (service.name === 'Expert Library') {
      router.push('/services/expert-library')
    } else if (service.name === 'Global Tenders Hub') {
      router.push('/services/global-tenders-hub')
    } else if (service.name === 'Data Hub') {
      router.push('/services/data-hub')
    } else if (service.name === 'Flagship & Sectorial Reports') {
      router.push('/services/flagship-reports')
    } else if (service.name === 'Procurement Hub') {
      router.push('/services/procurement-hub')
    } else if (service.name === 'Market Directory') {
      router.push('/services/market-directory')
    } else {
      router.push(`/services/${service.id}`)
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'ADC Platform':
        return 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/30'
      case 'TAMM':
        return 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-500/30'
      case 'Affiliates Platform':
        return 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
      default:
        return 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-white/10'
    }
  }

  const getChannelIcon = (channelType: string) => {
    if (channelType === 'EXTERNAL') {
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedPlatform('')
    setSelectedDepartment('')
  }

  const hasActiveFilters = searchQuery || selectedPlatform || selectedDepartment

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-[#0a2540] dark:to-[#0d3055] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/"
            className="inline-flex items-center text-blue-100 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5 me-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'ar' ? 'دليل الخدمات' : 'Service Directory'}
          </h1>
          <p className="text-blue-100 text-lg">
            {locale === 'ar'
              ? 'استكشف جميع خدمات غرفة أبوظبي'
              : 'Explore all Abu Dhabi Chamber services'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-2xl shadow-lg p-6 mb-8 theme-panel">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                {locale === 'ar' ? 'البحث' : 'Search'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={locale === 'ar' ? 'ابحث عن خدمة...' : 'Search for a service...'}
                  className="w-full px-4 py-2.5 ps-10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                />
                <svg
                  className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: 'var(--muted)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Platform Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                {locale === 'ar' ? 'المنصة' : 'Platform'}
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">{locale === 'ar' ? 'جميع المنصات' : 'All Platforms'}</option>
                {filters.platforms.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                {locale === 'ar' ? 'القسم' : 'Department'}
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">{locale === 'ar' ? 'جميع الأقسام' : 'All Departments'}</option>
                {filters.departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <button
                onClick={clearFilters}
                className="text-sm font-medium"
                style={{ color: 'var(--primary)' }}
              >
                {locale === 'ar' ? 'مسح جميع الفلاتر' : 'Clear all filters'}
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p style={{ color: 'var(--muted)' }}>
            {locale === 'ar'
              ? `عرض ${services.length} خدمة`
              : `Showing ${services.length} service${services.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8" style={{ color: 'var(--primary)' }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : services.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceClick(service)}
                className="text-start rounded-2xl transition-all p-6 group theme-panel hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPlatformColor(service.platform)}`}>
                    {service.platform}
                  </span>
                  <span className="transition-colors" style={{ color: 'var(--muted)' }}>
                    {getChannelIcon(service.channelType)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2 transition-colors" style={{ color: 'var(--text)' }}>
                  {locale === 'ar' ? service.nameAr : service.name}
                </h3>
                <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--muted)' }}>
                  {locale === 'ar' ? service.descriptionAr : service.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{service.dept}</span>
                  {service.channelType === 'EXTERNAL' && (
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {locale === 'ar' ? 'رابط خارجي' : 'External link'}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-2xl theme-panel">
            <svg className="mx-auto h-12 w-12" style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4" style={{ color: 'var(--muted)' }}>
              {locale === 'ar' ? 'لم يتم العثور على خدمات. جرب فلاتر مختلفة.' : 'No services found. Try different filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
