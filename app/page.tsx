'use client'

import { useState, useEffect, useCallback } from 'react'
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
    } else {
      router.push(`/services/${service.id}`)
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'ADC Platform':
        return 'bg-[#003057]/20 text-[#60A5FA]'
      case 'TAMM':
        return 'bg-purple-500/20 text-purple-300'
      case 'Affiliates Platform':
        return 'bg-amber-500/20 text-amber-300'
      default:
        return 'bg-white/10 text-white/70'
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
    <div className={`min-h-screen bg-gradient-to-b from-[#000C14] via-[#001520] to-[#001B30] ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Side Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Dark Themed Slide-out Side Menu */}
      <div className={`fixed top-0 ${isRtl ? 'right-0' : 'left-0'} h-full w-72 bg-gradient-to-b from-[#001520] to-[#001B30] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isMenuOpen
          ? 'translate-x-0'
          : isRtl ? 'translate-x-full' : '-translate-x-full'
      }`}>
        {/* Menu Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {isRtl ? 'القائمة' : 'Menu'}
            </h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
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
                className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium">
                  {isRtl ? 'بوابة العملاء' : 'Customer Portal'}
                </span>
              </Link>
            </li>
            <li className="pt-4 border-t border-white/10 mt-4">
              <Link
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">
                  {isRtl ? 'حول الغرفة' : 'About'}
                </span>
              </Link>
            </li>
            <li>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                onClick={() => {
                  setIsMenuOpen(false)
                }}
              >
                <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 bg-[#001520]/50">
          <p className="text-xs text-white/40 text-center">
            {isRtl ? 'غرفة تجارة وصناعة أبوظبي' : 'Abu Dhabi Chamber of Commerce'}
          </p>
        </div>
      </div>

      {/* Top Navigation Bar - Transparent */}
      <nav className="fixed top-0 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Hamburger Menu */}
            <div className={`flex items-center gap-4 ${isRtl ? 'order-2' : 'order-1'}`}>
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                aria-label={isRtl ? 'فتح القائمة' : 'Open menu'}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Center: ADCCI Logo */}
            <div className="flex items-center gap-3 order-2">
              {/* ADCCI-style Logo Placeholder */}
              <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="8" width="40" height="32" rx="4" stroke="white" strokeWidth="2" fill="none"/>
                <path d="M12 20h24M12 28h24M12 36h16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="36" cy="16" r="4" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="1.5"/>
                <path d="M24 8V4M20 6L24 4L28 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-white font-semibold text-lg tracking-wide hidden sm:block">
                {isRtl ? 'غرفة أبوظبي' : 'Abu Dhabi Chamber'}
              </span>
            </div>

            {/* Right: Language Toggle */}
            <div className={`flex items-center gap-2 ${isRtl ? 'order-1' : 'order-3'}`}>
              <button
                onClick={() => setLocale('en')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  locale === 'en'
                    ? 'bg-white text-[#001B30]'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale('ar')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  locale === 'ar'
                    ? 'bg-white text-[#001B30]'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                عربي
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {!hasSearched ? (
        /* Hero Section - Centered vertically and horizontally */
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="w-full max-w-2xl text-center">
            {/* Primary Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {isRtl
                ? 'كيف يمكننا مساعدة عملك اليوم؟'
                : 'How can we help your business today?'}
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-white/60 mb-12 max-w-xl mx-auto font-light">
              {isRtl
                ? 'اكتب أي طلب باللغة العربية أو الإنجليزية وسيجد الذكاء الاصطناعي الخدمة المناسبة فوراً.'
                : 'Type any request in English or Arabic. Our AI will find the right service instantly.'}
            </p>

            {/* Search Card */}
            <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden ring-1 ring-white/20 focus-within:ring-2 focus-within:ring-[#3B82F6] transition-all">
                {/* Input Area */}
                <div className="relative px-6 py-5">
                  <div className="relative">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder=""
                      className="w-full text-lg bg-transparent border-none focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-400"
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
                    {/* Loading indicator */}
                    {isSearching && (
                      <div className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-0' : 'right-0'}`}>
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

            {/* Quick Action Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setQuery(isRtl ? 'أريد التقدم لشهادة ESG' : 'I want to apply for ESG certification')}
                className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-full text-sm text-white/80 hover:bg-white/20 hover:text-white hover:border-white/30 transition-all"
              >
                {isRtl ? '🌱 شهادة ESG' : '🌱 ESG Certificate'}
              </button>
              <button
                type="button"
                onClick={() => setQuery(isRtl ? 'أريد شهادة منشأ' : 'I need a certificate of origin')}
                className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-full text-sm text-white/80 hover:bg-white/20 hover:text-white hover:border-white/30 transition-all"
              >
                {isRtl ? '📜 شهادة منشأ' : '📜 Certificate of Origin'}
              </button>
              <button
                type="button"
                onClick={() => setQuery(isRtl ? 'تسجيل عضوية جديدة' : 'Register new membership')}
                className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-full text-sm text-white/80 hover:bg-white/20 hover:text-white hover:border-white/30 transition-all"
              >
                {isRtl ? '🏢 عضوية جديدة' : '🏢 New Membership'}
              </button>
              <button
                type="button"
                onClick={() => setQuery(isRtl ? 'استشارات قانونية' : 'Legal consultancy')}
                className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-full text-sm text-white/80 hover:bg-white/20 hover:text-white hover:border-white/30 transition-all"
              >
                {isRtl ? '⚖️ استشارات قانونية' : '⚖️ Legal Advice'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Search Results Section - Dark Theme */
        <div className="min-h-screen pt-24 pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
              onClick={resetSearch}
              className="mb-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
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
              <p className="text-sm text-white/50 mb-2">
                {isRtl ? 'نتائج البحث عن:' : 'Search results for:'}
              </p>
              <h2 className="text-2xl font-semibold text-white">&ldquo;{query}&rdquo;</h2>
            </div>

            {/* AI Reasoning Summary */}
            {reasoningSummary && (
              <div className="mb-8 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#3B82F6]/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#60A5FA] mb-1">
                      {isRtl ? 'تحليل الذكاء الاصطناعي' : 'AI Analysis'}
                    </p>
                    <p className="text-white/70 text-sm leading-relaxed">{reasoningSummary}</p>
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
                    className="w-full text-start bg-white/5 rounded-2xl hover:bg-white/10 transition-all p-6 border border-white/10 group backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getPlatformColor(service.platform)}`}>
                            {service.platform}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#60A5FA] transition-colors">
                          {isRtl ? service.nameAr : service.name}
                        </h3>
                        <p className="text-white/60 text-sm mb-3 line-clamp-2">
                          {isRtl ? service.descriptionAr : service.description}
                        </p>
                        <div className="text-xs text-white/40">
                          {service.dept}
                        </div>
                      </div>
                      <div className="flex-shrink-0 w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 group-hover:bg-[#3B82F6]/20 group-hover:text-[#60A5FA] transition-colors">
                        {getChannelIcon(service.channelType)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white/60 mb-4">
                  {isRtl ? 'لم يتم العثور على نتائج. جرب كلمات بحث مختلفة.' : 'No results found. Try different search terms.'}
                </p>
                <button
                  onClick={resetSearch}
                  className="text-[#60A5FA] hover:underline font-medium text-sm"
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
                  className="inline-flex items-center gap-2 text-[#60A5FA] hover:underline font-medium text-sm"
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
