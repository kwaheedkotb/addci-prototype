'use client'

import { useState } from 'react'
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

interface MatchedService {
  serviceId: number
  confidence: number
}

interface ServiceMatchResponse {
  reasoningSummary: string
  matchedServices: MatchedService[]
}

export default function Home() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Service[]>([])
  const [reasoningSummary, setReasoningSummary] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    try {
      // Call the AI service match endpoint
      const matchResponse = await fetch('/api/ai/service-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, lang: locale }),
      })

      const matchData: ServiceMatchResponse = await matchResponse.json()
      setReasoningSummary(matchData.reasoningSummary)

      if (matchData.matchedServices.length > 0) {
        // Fetch full service details for matched services
        const serviceIds = matchData.matchedServices.map(m => m.serviceId)
        const servicesResponse = await fetch('/api/services')
        const servicesData = await servicesResponse.json()

        const matchedServices = serviceIds
          .map(id => servicesData.services.find((s: Service) => s.id === id))
          .filter(Boolean) as Service[]

        setSearchResults(matchedServices)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setReasoningSummary(locale === 'ar' ? 'حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.' : 'An error occurred during search. Please try again.')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleServiceClick = (service: Service) => {
    if (service.channelType === 'EXTERNAL' && service.externalUrl) {
      window.open(service.externalUrl, '_blank')
    } else if (service.name === 'Chamber ESG Label') {
      router.push('/customer')
    } else {
      router.push(`/services/${service.id}`)
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'ADC Platform':
        return 'bg-blue-100 text-blue-800'
      case 'TAMM':
        return 'bg-purple-100 text-purple-800'
      case 'Affiliates Platform':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {locale === 'ar' ? 'غرفة تجارة وصناعة أبوظبي' : 'Abu Dhabi Chamber of Commerce'}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
              {locale === 'ar'
                ? 'اكتشف خدماتنا باستخدام البحث الذكي - اكتب ما تحتاجه وسنساعدك في العثور على الخدمة المناسبة'
                : 'Discover our services using smart search - type what you need and we\'ll help you find the right service'}
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={locale === 'ar' ? 'ماذا تبحث عنه؟ مثال: "أريد شهادة ESG" أو "تجديد العضوية"' : 'What are you looking for? e.g., "I want ESG certificate" or "membership renewal"'}
                  className="w-full px-6 py-4 text-lg rounded-2xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl backdrop-blur-sm"
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute top-1/2 -translate-y-1/2 end-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <span>{locale === 'ar' ? 'بحث' : 'Search'}</span>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Links */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => { setQuery(locale === 'ar' ? 'شهادة ESG' : 'ESG certificate'); }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors"
              >
                {locale === 'ar' ? 'شهادة ESG' : 'ESG Certificate'}
              </button>
              <button
                onClick={() => { setQuery(locale === 'ar' ? 'شهادة المنشأ' : 'certificate of origin'); }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors"
              >
                {locale === 'ar' ? 'شهادة المنشأ' : 'Certificate of Origin'}
              </button>
              <button
                onClick={() => { setQuery(locale === 'ar' ? 'تجديد العضوية' : 'membership renewal'); }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors"
              >
                {locale === 'ar' ? 'تجديد العضوية' : 'Membership Renewal'}
              </button>
              <button
                onClick={() => { setQuery(locale === 'ar' ? 'استشارات قانونية' : 'legal consultancy'); }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors"
              >
                {locale === 'ar' ? 'استشارات قانونية' : 'Legal Consultancy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* AI Reasoning Summary */}
          {reasoningSummary && (
            <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-800 mb-1">
                    {locale === 'ar' ? 'تحليل الذكاء الاصطناعي' : 'AI Analysis'}
                  </p>
                  <p className="text-gray-700">{reasoningSummary}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {searchResults.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceClick(service)}
                  className="text-start bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPlatformColor(service.platform)}`}>
                      {service.platform}
                    </span>
                    <span className="text-gray-400 group-hover:text-blue-600 transition-colors">
                      {getChannelIcon(service.channelType)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {locale === 'ar' ? service.nameAr : service.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {locale === 'ar' ? service.descriptionAr : service.description}
                  </p>
                  <div className="text-xs text-gray-500">
                    {service.dept}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-gray-600">
                {locale === 'ar' ? 'لم يتم العثور على نتائج. جرب كلمات بحث مختلفة.' : 'No results found. Try different search terms.'}
              </p>
            </div>
          )}

          {/* Browse All Services Link */}
          <div className="mt-8 text-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              {locale === 'ar' ? 'تصفح جميع الخدمات' : 'Browse all services'}
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Access Cards - Show when no search */}
      {!hasSearched && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {locale === 'ar' ? 'الوصول السريع' : 'Quick Access'}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Service Hub Card */}
            <Link
              href="/services"
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-8 border border-gray-100"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6 group-hover:bg-blue-200 transition-colors">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {locale === 'ar' ? 'دليل الخدمات' : 'Service Directory'}
              </h3>
              <p className="text-gray-600 mb-4">
                {locale === 'ar'
                  ? 'استكشف جميع خدمات الغرفة من التسجيل إلى الشهادات والمزيد'
                  : 'Explore all Chamber services from registration to certificates and more'}
              </p>
              <div className="flex items-center text-blue-600 font-medium">
                {locale === 'ar' ? 'استكشف الخدمات' : 'Explore Services'}
                <svg className="w-5 h-5 ms-2 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>

            {/* Staff Portal Card */}
            <Link
              href="/staff"
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-8 border border-gray-100"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-6 group-hover:bg-purple-200 transition-colors">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {locale === 'ar' ? 'بوابة الموظفين' : 'Staff Portal'}
              </h3>
              <p className="text-gray-600 mb-4">
                {locale === 'ar'
                  ? 'مراجعة الطلبات واستخدام أدوات الذكاء الاصطناعي للتحليل'
                  : 'Review applications and use AI tools for analysis'}
              </p>
              <div className="flex items-center text-purple-600 font-medium">
                {locale === 'ar' ? 'دخول' : 'Enter'}
                <svg className="w-5 h-5 ms-2 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Platform Section */}
      {!hasSearched && (
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              {locale === 'ar' ? 'منصاتنا' : 'Our Platforms'}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {locale === 'ar' ? 'منصة الغرفة' : 'ADC Platform'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {locale === 'ar'
                    ? 'خدمات داخلية مباشرة من غرفة أبوظبي'
                    : 'Direct internal services from Abu Dhabi Chamber'}
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">TAMM</h3>
                <p className="text-gray-600 text-sm">
                  {locale === 'ar'
                    ? 'خدمات حكومية متكاملة عبر منصة تم'
                    : 'Integrated government services via TAMM platform'}
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {locale === 'ar' ? 'منصة الشركاء' : 'Affiliates Platform'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {locale === 'ar'
                    ? 'خدمات من شركائنا والمجالس التابعة'
                    : 'Services from our partners and affiliate councils'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
