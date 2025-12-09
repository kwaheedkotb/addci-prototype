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

  // On landing page, header is hidden (landing page has its own nav)
  if (isHome) {
    return null
  }

  return (
    <header className="bg-gradient-to-r from-[#001B30] to-[#002040] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              {/* ADCCI-style Logo */}
              <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="8" width="40" height="32" rx="4" stroke="white" strokeWidth="2" fill="none"/>
                <path d="M12 20h24M12 28h24M12 36h16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="36" cy="16" r="4" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="1.5"/>
                <path d="M24 8V4M20 6L24 4L28 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-bold text-lg tracking-wide">{t.common.appName}</span>
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
                  ? 'bg-white text-[#001B30]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {t.common.english}
            </button>
            <button
              onClick={() => setLocale('ar')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                locale === 'ar'
                  ? 'bg-white text-[#001B30]'
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
