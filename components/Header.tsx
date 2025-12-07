'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

export default function Header() {
  const { locale, setLocale, t } = useI18n()
  const pathname = usePathname()

  const isHome = pathname === '/'
  const isServices = pathname.startsWith('/services')
  const isCustomer = pathname.startsWith('/customer')
  const isStaff = pathname.startsWith('/staff')

  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-bold text-lg">{t.common.appName}</span>
            </Link>

            <nav className="hidden md:flex gap-1">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isHome
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {t.common.home}
              </Link>
              <Link
                href="/services"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isServices
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {t.common.serviceHub}
              </Link>
              <Link
                href="/customer"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isCustomer
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {t.common.myApplications}
              </Link>
              <Link
                href="/staff"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isStaff
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {t.common.staffPortal}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm text-white/80">{t.common.language}:</span>
            <button
              onClick={() => setLocale('en')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                locale === 'en'
                  ? 'bg-white text-blue-700'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {t.common.english}
            </button>
            <button
              onClick={() => setLocale('ar')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                locale === 'ar'
                  ? 'bg-white text-blue-700'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {t.common.arabic}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden pb-4 flex gap-2 overflow-x-auto">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              isHome
                ? 'bg-white/20 text-white'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            {t.common.home}
          </Link>
          <Link
            href="/services"
            className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              isServices
                ? 'bg-white/20 text-white'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            {t.common.serviceHub}
          </Link>
          <Link
            href="/customer"
            className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              isCustomer
                ? 'bg-white/20 text-white'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            {t.common.myApplications}
          </Link>
          <Link
            href="/staff"
            className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              isStaff
                ? 'bg-white/20 text-white'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            {t.common.staffPortal}
          </Link>
        </nav>
      </div>
    </header>
  )
}
