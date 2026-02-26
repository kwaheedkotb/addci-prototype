'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { ThemeToggle } from '@/components/ThemeToggle'

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

// Rotating placeholder examples
const placeholderExamples = {
  en: [
    'I want to apply for ESG certification',
    'I need a membership certificate',
    'How do I get a certificate of origin?',
    'I want to register a new membership',
    'Legal consultancy for my business',
  ],
  ar: [
    'أريد التقدم لشهادة ESG',
    'أريد شهادة عدم عضوية',
    'كيف أحصل على شهادة منشأ؟',
    'أريد تسجيل عضوية جديدة',
    'استشارات قانونية لعملي',
  ],
}

export default function Home() {
  const { locale, setLocale } = useI18n()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Service[]>([])
  const [reasoningSummary, setReasoningSummary] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  const isRtl = locale === 'ar'

  // Typewriter effect for placeholder
  useEffect(() => {
    const examples = placeholderExamples[isRtl ? 'ar' : 'en']
    const currentText = examples[placeholderIndex]
    let timeout: NodeJS.Timeout

    if (isTyping) {
      // Typing phase
      if (displayedPlaceholder.length < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayedPlaceholder(currentText.slice(0, displayedPlaceholder.length + 1))
        }, 50) // Typing speed
      } else {
        // Finished typing, wait then start deleting
        timeout = setTimeout(() => {
          setIsTyping(false)
        }, 2000) // Pause at full text
      }
    } else {
      // Deleting phase
      if (displayedPlaceholder.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedPlaceholder(displayedPlaceholder.slice(0, -1))
        }, 30) // Deleting speed (faster)
      } else {
        // Finished deleting, move to next placeholder
        setPlaceholderIndex((prev) => (prev + 1) % examples.length)
        setIsTyping(true)
      }
    }

    return () => clearTimeout(timeout)
  }, [displayedPlaceholder, isTyping, placeholderIndex, isRtl])

  // Reset animation when locale changes
  useEffect(() => {
    setDisplayedPlaceholder('')
    setPlaceholderIndex(0)
    setIsTyping(true)
  }, [isRtl])

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    setHasSearched(true)
    setIsMenuOpen(false)

    try {
      const matchResponse = await fetch('/api/ai/service-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, lang: locale }),
      })

      const matchData: ServiceMatchResponse = await matchResponse.json()
      setReasoningSummary(matchData.reasoningSummary)

      if (matchData.matchedServices.length > 0) {
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
      setReasoningSummary(isRtl ? 'حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.' : 'An error occurred during search. Please try again.')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [query, locale, isRtl])

  const handleServiceClick = (service: Service) => {
    if (service.channelType === 'EXTERNAL' && service.externalUrl) {
      window.open(service.externalUrl, '_blank')
    } else if (service.name === 'Chamber ESG Label') {
      router.push('/customer')
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
        return 'bg-blue-100 text-blue-700 dark:bg-[#003057]/20 dark:text-[#60A5FA]'
      case 'TAMM':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'
      case 'Affiliates Platform':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/70'
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

  const resetSearch = () => {
    setHasSearched(false)
    setSearchResults([])
    setReasoningSummary('')
    setQuery('')
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 dark:from-[#000C14] dark:via-[#001520] dark:to-[#001B30] ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Side Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Slide-out Side Menu */}
      <div className={`fixed top-0 ${isRtl ? 'right-0' : 'left-0'} h-full w-72 bg-white dark:bg-gradient-to-b dark:from-[#001520] dark:to-[#001B30] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isMenuOpen
          ? 'translate-x-0'
          : isRtl ? 'translate-x-full' : '-translate-x-full'
      }`}>
        {/* Menu Header */}
        <div className="p-6 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isRtl ? 'القائمة' : 'Menu'}
            </h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-white/60 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4">
          <ul className="space-y-1">
            <li>
              <Link
                href="/services"
                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10 rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 text-gray-400 dark:text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-sm font-medium">
                  {isRtl ? 'دليل الخدمات' : 'Service Directory'}
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/staff"
                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10 rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 text-gray-400 dark:text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className="text-sm font-medium">
                  {isRtl ? 'بوابة الموظفين' : 'Staff Portal'}
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/customer"
                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10 rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 text-gray-400 dark:text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium">
                  {isRtl ? 'بوابة العملاء' : 'Customer Portal'}
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/kpi"
                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10 rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 text-gray-400 dark:text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm font-medium">
                  {isRtl ? 'لوحة المؤشرات' : 'Dashboard'}
                </span>
              </Link>
            </li>
            <li className="pt-4 border-t border-gray-200 dark:border-white/10 mt-4">
              <Link
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10 rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 text-gray-400 dark:text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">
                  {isRtl ? 'حول الغرفة' : 'About'}
                </span>
              </Link>
            </li>
            <li>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10 rounded-xl transition-colors"
                onClick={() => {
                  setIsMenuOpen(false)
                }}
              >
                <svg className="w-5 h-5 text-gray-400 dark:text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm font-medium">
                  {isRtl ? 'المساعد الذكي' : 'AI Assistant'}
                </span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Menu Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#001520]/50">
          <p className="text-xs text-gray-500 dark:text-white/40 text-center">
            {isRtl ? 'غرفة تجارة وصناعة أبوظبي' : 'Abu Dhabi Chamber of Commerce'}
          </p>
        </div>
      </div>

      {/* Top Navigation Bar - Transparent, Compact */}
      <nav className="fixed top-0 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5">
          <div className="flex items-center justify-between">
            {/* Left: Hamburger Menu */}
            <div className={`flex items-center ${isRtl ? 'order-2' : 'order-1'}`}>
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10 rounded-lg transition-all"
                aria-label={isRtl ? 'فتح القائمة' : 'Open menu'}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Center: ADCCI Logo - Increased size and stroke */}
            <div className="flex items-center gap-2 order-2">
              {/* ADCCI-style Logo - Slightly larger with thicker strokes */}
              <svg className="w-11 h-11" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="8" width="40" height="32" rx="4" className="stroke-gray-800 dark:stroke-white" strokeWidth="2.5" fill="none"/>
                <path d="M12 20h24M12 28h24M12 36h16" className="stroke-gray-800 dark:stroke-white" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="36" cy="16" r="4" className="fill-gray-800/30 stroke-gray-800 dark:fill-white/30 dark:stroke-white" strokeWidth="2"/>
                <path d="M24 8V4M20 6L24 4L28 6" className="stroke-gray-800 dark:stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-gray-900 dark:text-white font-semibold text-lg tracking-wide hidden sm:block">
                {isRtl ? 'غرفة أبوظبي' : 'Abu Dhabi Chamber'}
              </span>
            </div>

            {/* Right: Theme Toggle + Language Toggle - Capsule style */}
            <div className={`flex items-center gap-2 ${isRtl ? 'order-1 ml-2' : 'order-3 mr-2'}`}>
              <ThemeToggle />
              <div className="flex items-center bg-gray-200 dark:bg-white/10 rounded-full p-0.5">
                <button
                  onClick={() => setLocale('en')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    locale === 'en'
                      ? 'bg-white dark:bg-white text-gray-900 dark:text-[#001B30] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 dark:text-white/70 dark:hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLocale('ar')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    locale === 'ar'
                      ? 'bg-white dark:bg-white text-gray-900 dark:text-[#001B30] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 dark:text-white/70 dark:hover:text-white'
                  }`}
                >
                  AR
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {!hasSearched ? (
        /* Hero Section - Compressed spacing, moved upward */
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 -mt-16">
          <div className="w-full max-w-2xl text-center">
            {/* Primary Headline - Tighter line height */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 leading-[1.15]">
              {isRtl
                ? 'كيف يمكننا مساعدة عملك اليوم؟'
                : 'How can we help your business today?'}
            </h1>

            {/* Sub-headline - Reduced margin */}
            <p className="text-base sm:text-lg text-gray-600 dark:text-white/60 mb-8 max-w-xl mx-auto font-light">
              {isRtl
                ? 'اكتب أي طلب باللغة العربية أو الإنجليزية وسيجد الذكاء الاصطناعي الخدمة المناسبة فوراً.'
                : 'Type any request in English or Arabic. Our AI will find the right service instantly.'}
            </p>

            {/* Search Card */}
            <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl shadow-gray-300/50 dark:shadow-black/30 overflow-hidden border border-gray-200 dark:border-transparent focus-within:border-[#3B82F6] dark:focus-within:border-[#3B82F6] focus-within:ring-2 focus-within:ring-[#3B82F6]/20 transition-all">
                {/* Input Area - Increased height */}
                <div className="relative px-6 py-6">
                  <div className="relative flex items-center">
                    {/* Search Icon - Left in EN, Right in AR */}
                    <div className={`flex-shrink-0 ${isRtl ? 'order-2 ml-4' : 'order-1 mr-4'}`}>
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div className={`flex-1 relative ${isRtl ? 'order-1' : 'order-2'}`}>
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder=""
                        className="w-full text-lg bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400"
                        style={{ color: '#1f2937', border: 'none', boxShadow: 'none' }}
                        dir={isRtl ? 'rtl' : 'ltr'}
                      />
                      {/* Typewriter Placeholder Overlay */}
                      {!query && (
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-0' : 'left-0'} pointer-events-none flex items-center`}
                          dir={isRtl ? 'rtl' : 'ltr'}
                        >
                          <span className="text-lg text-gray-400">{displayedPlaceholder}</span>
                          <span className={`w-0.5 h-6 bg-[#003057] ${isRtl ? 'mr-0.5' : 'ml-0.5'} animate-blink`} />
                        </div>
                      )}
                    </div>
                    {/* Loading indicator */}
                    {isSearching && (
                      <div className={`flex-shrink-0 ${isRtl ? 'order-1 mr-4' : 'order-3 ml-4'}`}>
                        <svg className="w-5 h-5 text-[#003057] animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Hidden submit button for Enter key */}
              <button type="submit" className="sr-only">
                {isRtl ? 'بحث' : 'Search'}
              </button>
            </form>

            {/* Trust Line */}
            <p className="mt-4 text-xs text-gray-500 dark:text-white/40 text-center">
              {isRtl ? 'مدعوم بمحرك البحث الذكي من غرفة أبوظبي' : 'Powered by ADCCI AI Service Finder'}
            </p>

          </div>
        </div>
      ) : (
        /* Search Results Section */
        <div className="min-h-screen pt-24 pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
              onClick={resetSearch}
              className="mb-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-white/60 dark:hover:text-white transition-colors"
            >
              <svg className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">
                {isRtl ? 'بحث جديد' : 'New search'}
              </span>
            </button>

            {/* Search Query Display */}
            <div className="mb-8">
              <p className="text-sm text-gray-500 dark:text-white/50 mb-2">
                {isRtl ? 'نتائج البحث عن:' : 'Search results for:'}
              </p>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">&ldquo;{query}&rdquo;</h2>
            </div>

            {/* AI Reasoning Summary */}
            {reasoningSummary && (
              <div className="mb-8 p-5 bg-blue-50 dark:bg-white/5 rounded-2xl border border-blue-100 dark:border-white/10 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#3B82F6]/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#3B82F6] dark:text-[#60A5FA] mb-1">
                      {isRtl ? 'تحليل الذكاء الاصطناعي' : 'AI Analysis'}
                    </p>
                    <p className="text-gray-600 dark:text-white/70 text-sm leading-relaxed">{reasoningSummary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceClick(service)}
                    className="w-full text-start bg-white dark:bg-white/5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all p-6 border border-gray-200 dark:border-white/10 group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getPlatformColor(service.platform)}`}>
                            {service.platform}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-[#3B82F6] dark:group-hover:text-[#60A5FA] transition-colors">
                          {isRtl ? service.nameAr : service.name}
                        </h3>
                        <p className="text-gray-600 dark:text-white/60 text-sm mb-3 line-clamp-2">
                          {isRtl ? service.descriptionAr : service.description}
                        </p>
                        <div className="text-xs text-gray-400 dark:text-white/40">
                          {service.dept}
                        </div>
                      </div>
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-400 dark:text-white/40 group-hover:bg-[#3B82F6]/20 group-hover:text-[#3B82F6] dark:group-hover:text-[#60A5FA] transition-colors">
                        {getChannelIcon(service.channelType)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400 dark:text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-white/60 mb-4">
                  {isRtl ? 'لم يتم العثور على نتائج. جرب كلمات بحث مختلفة.' : 'No results found. Try different search terms.'}
                </p>
                <button
                  onClick={resetSearch}
                  className="text-[#3B82F6] dark:text-[#60A5FA] hover:underline font-medium text-sm"
                >
                  {isRtl ? 'حاول مرة أخرى' : 'Try again'}
                </button>
              </div>
            )}

            {/* Browse All Services Link */}
            {searchResults.length > 0 && (
              <div className="mt-8 text-center">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 text-[#3B82F6] dark:text-[#60A5FA] hover:underline font-medium text-sm"
                >
                  {isRtl ? 'تصفح جميع الخدمات' : 'Browse all services'}
                  <svg className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
