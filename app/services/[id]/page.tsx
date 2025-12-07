'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
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
  const { locale } = useI18n()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              {locale === 'ar' ? 'الخدمة غير موجودة' : 'Service Not Found'}
            </h2>
            <p className="mt-2 text-gray-600">
              {locale === 'ar'
                ? 'الخدمة التي تبحث عنها غير متوفرة.'
                : 'The service you are looking for is not available.'}
            </p>
            <Link
              href="/services"
              className="mt-6 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 me-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {locale === 'ar' ? 'العودة لدليل الخدمات' : 'Back to Service Directory'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isESGService = service.name === 'Chamber ESG Label'
  const isExternal = service.channelType === 'EXTERNAL'

  // ESG Service - Show dedicated ESG detail page
  if (isESGService) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* ESG Header */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link
              href="/services"
              className="inline-flex items-center text-emerald-100 hover:text-white mb-6 transition-colors"
            >
              <svg className="w-5 h-5 me-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {locale === 'ar' ? 'العودة لدليل الخدمات' : 'Back to Service Directory'}
            </Link>

            <div className="flex items-start gap-6">
              <div className="hidden md:flex w-20 h-20 bg-white/20 rounded-2xl items-center justify-center">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/20 mb-4">
                  {service.platform}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  {locale === 'ar' ? service.nameAr : service.name}
                </h1>
                <p className="text-emerald-100 text-lg">
                  {locale === 'ar'
                    ? 'احصل على شهادة ESG لإثبات التزام مؤسستك بالاستدامة البيئية والمسؤولية الاجتماعية والحوكمة الرشيدة'
                    : 'Get ESG certification to demonstrate your organization\'s commitment to Environmental, Social, and Governance excellence'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ESG Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About ESG */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {locale === 'ar' ? 'ما هي شهادة ESG؟' : 'What is ESG Certification?'}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {locale === 'ar'
                    ? 'شهادة ESG من غرفة أبوظبي هي اعتراف رسمي بالتزام مؤسستك بممارسات الأعمال المستدامة. تغطي الشهادة ثلاثة محاور رئيسية:'
                    : 'The Chamber ESG Label is an official recognition of your organization\'s commitment to sustainable business practices. The certification covers three main pillars:'}
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-green-900 mb-1">
                      {locale === 'ar' ? 'البيئة' : 'Environmental'}
                    </h3>
                    <p className="text-green-700 text-sm">
                      {locale === 'ar' ? 'السياسات والمبادرات البيئية' : 'Environmental policies & initiatives'}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-blue-900 mb-1">
                      {locale === 'ar' ? 'المجتمع' : 'Social'}
                    </h3>
                    <p className="text-blue-700 text-sm">
                      {locale === 'ar' ? 'المسؤولية الاجتماعية والتنوع' : 'Social responsibility & diversity'}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-purple-900 mb-1">
                      {locale === 'ar' ? 'الحوكمة' : 'Governance'}
                    </h3>
                    <p className="text-purple-700 text-sm">
                      {locale === 'ar' ? 'ممارسات الحوكمة والامتثال' : 'Governance practices & compliance'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {locale === 'ar' ? 'المتطلبات' : 'Requirements'}
                </h2>
                <ul className="space-y-3">
                  {[
                    locale === 'ar' ? 'رخصة تجارية سارية المفعول' : 'Valid trade license',
                    locale === 'ar' ? 'سياسة الاستدامة أو ESG مكتوبة' : 'Written ESG or sustainability policy',
                    locale === 'ar' ? 'تقرير الاستدامة (إن وجد)' : 'Sustainability report (if available)',
                    locale === 'ar' ? 'شهادات أخرى ذات صلة (ISO، إلخ)' : 'Other relevant certifications (ISO, etc.)',
                    locale === 'ar' ? 'بيانات مؤشرات الأداء البيئية والاجتماعية' : 'Environmental & social KPI data',
                  ].map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Process Steps */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {locale === 'ar' ? 'خطوات التقديم' : 'Application Process'}
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: locale === 'ar' ? 'معلومات مقدم الطلب' : 'Applicant Information',
                      desc: locale === 'ar' ? 'أدخل معلومات مؤسستك الأساسية' : 'Enter your organization\'s basic information'
                    },
                    {
                      step: 2,
                      title: locale === 'ar' ? 'ملف ESG' : 'ESG Profile',
                      desc: locale === 'ar' ? 'صف مبادراتك البيئية والاجتماعية والحوكمة' : 'Describe your environmental, social, and governance initiatives'
                    },
                    {
                      step: 3,
                      title: locale === 'ar' ? 'تحميل المستندات' : 'Document Upload',
                      desc: locale === 'ar' ? 'ارفع المستندات الداعمة مع مراجعة AI' : 'Upload supporting documents with AI review'
                    },
                    {
                      step: 4,
                      title: locale === 'ar' ? 'المراجعة والتقديم' : 'Review & Submit',
                      desc: locale === 'ar' ? 'راجع طلبك وأرسله للتقييم' : 'Review your application and submit for evaluation'
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-700 font-semibold text-sm">{item.step}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        <p className="text-gray-600 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* CTA Card */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">
                  {locale === 'ar' ? 'ابدأ طلبك الآن' : 'Start Your Application'}
                </h3>
                <p className="text-emerald-100 text-sm mb-4">
                  {locale === 'ar'
                    ? 'أكمل النموذج متعدد الخطوات للتقدم بطلب شهادة ESG'
                    : 'Complete the multi-step form to apply for ESG certification'}
                </p>
                <Link
                  href={`/services/${service.id}/apply`}
                  className="block w-full bg-white text-emerald-700 text-center py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
                >
                  {locale === 'ar' ? 'بدء التقديم' : 'Start Application'}
                </Link>
              </div>

              {/* Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {locale === 'ar' ? 'معلومات الخدمة' : 'Service Information'}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{locale === 'ar' ? 'المنصة' : 'Platform'}</span>
                    <span className="text-gray-900 font-medium">{service.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{locale === 'ar' ? 'القسم' : 'Department'}</span>
                    <span className="text-gray-900 font-medium">{service.dept}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{locale === 'ar' ? 'النوع' : 'Type'}</span>
                    <span className="text-gray-900 font-medium">
                      {locale === 'ar' ? 'داخلي' : 'Internal'}
                    </span>
                  </div>
                </div>
              </div>

              {/* My Applications Link */}
              <div className="bg-blue-50 rounded-2xl p-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  {locale === 'ar' ? 'لديك طلب سابق؟' : 'Have an existing application?'}
                </h3>
                <p className="text-blue-700 text-sm mb-4">
                  {locale === 'ar'
                    ? 'تتبع حالة طلباتك السابقة'
                    : 'Track the status of your previous applications'}
                </p>
                <Link
                  href="/customer"
                  className="inline-flex items-center text-blue-700 font-medium hover:text-blue-800"
                >
                  {locale === 'ar' ? 'عرض طلباتي' : 'View My Applications'}
                  <svg className="w-4 h-4 ms-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Regular Service Detail Page
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/services"
            className="inline-flex items-center text-blue-100 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5 me-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {locale === 'ar' ? 'العودة لدليل الخدمات' : 'Back to Service Directory'}
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
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {locale === 'ar' ? 'وصف الخدمة' : 'Service Description'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {locale === 'ar' ? service.descriptionAr : service.description}
            </p>
          </div>

          {/* Service Details */}
          <div className="mb-8 grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {locale === 'ar' ? 'المنصة' : 'Platform'}
              </h3>
              <p className="text-gray-900 font-medium">{service.platform}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {locale === 'ar' ? 'القسم' : 'Department'}
              </h3>
              <p className="text-gray-900 font-medium">{service.dept}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {locale === 'ar' ? 'نوع القناة' : 'Channel Type'}
              </h3>
              <p className="text-gray-900 font-medium">
                {service.channelType === 'INTERNAL'
                  ? locale === 'ar' ? 'داخلي' : 'Internal'
                  : locale === 'ar' ? 'خارجي' : 'External'}
              </p>
            </div>
            {isExternal && service.externalUrl && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {locale === 'ar' ? 'الرابط الخارجي' : 'External Link'}
                </h3>
                <a
                  href={service.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
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
            <div className="pt-6 border-t border-gray-100">
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
            <div className="pt-6 border-t border-gray-100">
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  {locale === 'ar' ? 'قريباً' : 'Coming Soon'}
                </h3>
                <p className="text-blue-700">
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
