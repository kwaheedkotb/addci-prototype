'use client'

import { useState, useEffect, use } from 'react'
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

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { locale, t } = useI18n()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isRtl = locale === 'ar'

  useEffect(() => {
    fetchService()
  }, [resolvedParams.id])

  const fetchService = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/services/${resolvedParams.id}`)
      if (!response.ok) {
        throw new Error('Service not found')
      }
      const data = await response.json()
      setService(data)
    } catch {
      setError(locale === 'ar' ? 'لم يتم العثور على الخدمة' : 'Service not found')
    } finally {
      setLoading(false)
    }
  }

  // Open chatbot with prefilled message
  const openChatWithPrompt = (prompt: string) => {
    // Dispatch custom event to open chatbot with message
    window.dispatchEvent(new CustomEvent('openChatbot', { detail: { message: prompt } }))
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'ADC Platform':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'TAMM':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'Affiliates Platform':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 dark:from-[#000C14] dark:via-[#001520] dark:to-[#001B30]">
        <svg className="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 dark:from-[#000C14] dark:via-[#001520] dark:to-[#001B30]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              {locale === 'ar' ? 'الخدمة غير موجودة' : 'Service Not Found'}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {locale === 'ar'
                ? 'الخدمة التي تبحث عنها غير متوفرة.'
                : 'The service you are looking for is not available.'}
            </p>
            <Link
              href="/services"
              className="mt-6 inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <svg className="w-5 h-5 me-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t.services.backToDirectory}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isESGService = service.name === 'Chamber ESG Label'
  const isExternal = service.channelType === 'EXTERNAL'

  // ESG Service - New AI-first dark-themed single-column design
  if (isESGService) {
    const esg = t.esgDetail

    return (
      <div className={`min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 dark:from-[#000C14] dark:via-[#001520] dark:to-[#001B30] ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background glow effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 relative">
            {/* Back Link */}
            <Link
              href="/services"
              className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-white/50 dark:hover:text-white/80 mb-8 transition-colors text-sm"
              aria-label={t.services.backToDirectory}
            >
              <svg className="w-4 h-4 me-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t.services.backToDirectory}
            </Link>

            {/* Title & CTA */}
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {locale === 'ar' ? service.nameAr : service.name}
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-white/60 mb-8 max-w-2xl mx-auto">
                {esg.heroSubtitle}
              </p>

              {/* Primary CTA */}
              <Link
                href={`/services/${service.id}/apply`}
                className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:scale-[1.02]"
                aria-label={esg.startApplication}
              >
                {esg.startApplication}
                <svg className="w-5 h-5 ms-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              {/* Secondary AI Link */}
              <button
                onClick={() => openChatWithPrompt(isRtl ? esg.aiQuestions.docsPrompt : 'What documents and steps do I need to apply for the Chamber ESG Label?')}
                className="mt-4 block mx-auto text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {esg.askAI}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-12">

          {/* What You Will Need */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{esg.whatYouNeed}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Required Items */}
              {[
                { title: esg.needs.tradeLicense, desc: esg.needs.tradeLicenseDesc, required: true },
                { title: esg.needs.esgPolicy, desc: esg.needs.esgPolicyDesc, required: true },
                { title: esg.needs.esgReport, desc: esg.needs.esgReportDesc, required: true },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">{esg.required}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-white/50 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
              {/* Optional Items */}
              {[
                { title: esg.needs.certifications, desc: esg.needs.certificationsDesc },
                { title: esg.needs.supplierAssessments, desc: esg.needs.supplierAssessmentsDesc },
                { title: esg.needs.financialReport, desc: esg.needs.financialReportDesc },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white/30 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-white/40" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-white/70 text-sm">{item.title}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/40">{esg.optional}</span>
                    </div>
                    <p className="text-sm text-gray-400 dark:text-white/40 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* What ESG Covers */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{esg.whatESGCovers}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Environmental */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 border border-green-200/50 dark:border-green-700/30">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-green-900 dark:text-green-300 mb-1">{esg.covers.environmental}</h3>
                <p className="text-sm text-green-700 dark:text-green-400/70">{esg.covers.environmentalDesc}</p>
              </div>
              {/* Social */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200/50 dark:border-blue-700/30">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">{esg.covers.social}</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400/70">{esg.covers.socialDesc}</p>
              </div>
              {/* Governance */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-200/50 dark:border-purple-700/30">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-1">{esg.covers.governance}</h3>
                <p className="text-sm text-purple-700 dark:text-purple-400/70">{esg.covers.governanceDesc}</p>
              </div>
            </div>
          </section>

          {/* How It Works - Timeline */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{esg.howItWorks}</h2>
            <div className="space-y-0">
              {[
                { step: 1, title: esg.process.step1Title, desc: esg.process.step1Desc, icon: '📝' },
                { step: 2, title: esg.process.step2Title, desc: esg.process.step2Desc, icon: '🌿' },
                { step: 3, title: esg.process.step3Title, desc: esg.process.step3Desc, icon: '📄' },
                { step: 4, title: esg.process.step4Title, desc: esg.process.step4Desc, icon: '✓' },
              ].map((item, idx, arr) => (
                <div key={item.step} className="relative flex gap-4">
                  {/* Timeline line */}
                  {idx < arr.length - 1 && (
                    <div className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-10 w-0.5 h-full bg-gradient-to-b from-emerald-300 to-emerald-100 dark:from-emerald-600 dark:to-emerald-900/50`} />
                  )}
                  {/* Step circle */}
                  <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 dark:bg-emerald-600 text-white flex items-center justify-center text-sm font-bold z-10" aria-label={`Step ${item.step}`}>
                    {item.step}
                  </div>
                  {/* Content */}
                  <button
                    onClick={() => router.push(`/services/${service.id}/apply`)}
                    className="flex-1 pb-8 text-start hover:opacity-80 transition-opacity"
                    aria-label={`${item.title}: ${item.desc}`}
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-white/50">{item.desc}</p>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* AI Guidance Panel */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{esg.aiGuidance}</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: esg.aiQuestions.docs, prompt: esg.aiQuestions.docsPrompt },
                { label: esg.aiQuestions.time, prompt: esg.aiQuestions.timePrompt },
                { label: esg.aiQuestions.check, prompt: esg.aiQuestions.checkPrompt },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => openChatWithPrompt(item.prompt)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 text-sm hover:bg-white dark:hover:bg-white/10 hover:border-emerald-300 dark:hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all"
                  aria-label={item.label}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          {/* Service Info Footer */}
          <section className="pt-8 border-t border-gray-200 dark:border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-white/40">
                <span><span className="text-gray-400 dark:text-white/30">{esg.platform}:</span> <span className="text-gray-700 dark:text-white/60">{service.platform}</span></span>
                <span><span className="text-gray-400 dark:text-white/30">{esg.department}:</span> <span className="text-gray-700 dark:text-white/60">{service.dept}</span></span>
                <span><span className="text-gray-400 dark:text-white/30">{esg.type}:</span> <span className="text-gray-700 dark:text-white/60">{esg.typeInternal}</span></span>
              </div>
              <Link
                href="/customer"
                className="inline-flex items-center text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              >
                {esg.viewMyApplications}
                <svg className="w-4 h-4 ms-1 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </section>

        </div>
      </div>
    )
  }

  // Regular Service Detail Page (non-ESG services)
  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 dark:from-[#000C14] dark:via-[#001520] dark:to-[#001B30] ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-[#0a2540] dark:to-[#0d3055] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/services"
            className="inline-flex items-center text-blue-100 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5 me-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.services.backToDirectory}
          </Link>

          <div className="flex items-start gap-4">
            <div className="flex-1">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${getPlatformColor(service.platform)}`}>
                {service.platform}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {locale === 'ar' ? service.nameAr : service.name}
              </h1>
              <p className="text-blue-100">{service.dept}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl shadow-lg p-8 bg-white dark:bg-[#071824] border border-gray-200 dark:border-white/10">
          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {locale === 'ar' ? 'وصف الخدمة' : 'Service Description'}
            </h2>
            <p className="leading-relaxed text-gray-600 dark:text-gray-300">
              {locale === 'ar' ? service.descriptionAr : service.description}
            </p>
          </div>

          {/* Service Details */}
          <div className="mb-8 grid md:grid-cols-2 gap-6">
            <div className="rounded-xl p-4 bg-gray-50 dark:bg-white/5">
              <h3 className="text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">
                {locale === 'ar' ? 'المنصة' : 'Platform'}
              </h3>
              <p className="font-medium text-gray-900 dark:text-white">{service.platform}</p>
            </div>
            <div className="rounded-xl p-4 bg-gray-50 dark:bg-white/5">
              <h3 className="text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">
                {locale === 'ar' ? 'القسم' : 'Department'}
              </h3>
              <p className="font-medium text-gray-900 dark:text-white">{service.dept}</p>
            </div>
            <div className="rounded-xl p-4 bg-gray-50 dark:bg-white/5">
              <h3 className="text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">
                {locale === 'ar' ? 'نوع القناة' : 'Channel Type'}
              </h3>
              <p className="font-medium text-gray-900 dark:text-white">
                {service.channelType === 'INTERNAL'
                  ? locale === 'ar' ? 'داخلي' : 'Internal'
                  : locale === 'ar' ? 'خارجي' : 'External'}
              </p>
            </div>
            {isExternal && service.externalUrl && (
              <div className="rounded-xl p-4 bg-gray-50 dark:bg-white/5">
                <h3 className="text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">
                  {locale === 'ar' ? 'الرابط الخارجي' : 'External Link'}
                </h3>
                <a
                  href={service.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  {locale === 'ar' ? 'فتح الرابط' : 'Open Link'}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>

          {/* Action Button for External */}
          {isExternal && service.externalUrl && (
            <div className="pt-6 border-t border-gray-200 dark:border-white/10">
              <a
                href={service.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
              >
                {locale === 'ar' ? 'الانتقال للخدمة' : 'Go to Service'}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}

          {/* Placeholder for Internal Services */}
          {!isExternal && (
            <div className="pt-6 border-t border-gray-200 dark:border-white/10">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-2">
                  {locale === 'ar' ? 'قريباً' : 'Coming Soon'}
                </h3>
                <p className="text-blue-700 dark:text-blue-400">
                  {locale === 'ar'
                    ? 'هذه الخدمة قيد التطوير وستكون متاحة قريباً.'
                    : 'This service is under development and will be available soon.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
