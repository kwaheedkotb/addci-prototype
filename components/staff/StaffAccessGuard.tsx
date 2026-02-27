'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

interface StaffAccessGuardProps {
  isAuthorized: boolean
  children: React.ReactNode
}

export default function StaffAccessGuard({ isAuthorized, children }: StaffAccessGuardProps) {
  const { locale, dir } = useI18n()
  const isRtl = locale === 'ar'

  if (isAuthorized) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }} dir={dir}>
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--accent-red)', opacity: 0.15 }}>
          <svg className="w-10 h-10" style={{ color: 'var(--accent-red)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          {isRtl ? 'وصول مقيّد' : 'Access Denied'}
        </h2>
        <p className="mb-8" style={{ color: 'var(--muted)' }}>
          {isRtl
            ? 'بوابة العمليات الداخلية متاحة فقط لموظفي غرفة أبوظبي المعتمدين. يرجى تسجيل الدخول بحسابك المؤسسي.'
            : 'The Staff Operations Portal is restricted to authorized ADCCI personnel. Please sign in with your corporate account.'}
        </p>
        <div className={`flex flex-col sm:flex-row gap-3 justify-center ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
            {isRtl ? 'تسجيل الدخول' : 'Sign In'}
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl font-medium transition-colors inline-flex items-center justify-center"
            style={{ color: 'var(--primary)', border: '1px solid var(--border)' }}
          >
            {isRtl ? 'العودة للرئيسية' : 'Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  )
}
