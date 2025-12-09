'use client'

import { I18nProvider, useI18n } from '@/lib/i18n'
import Header from '@/components/Header'
import AIChatAssistant from '@/components/AIChatAssistant'
import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

function AppContent({ children }: { children: ReactNode }) {
  const { dir } = useI18n()
  const pathname = usePathname()
  const isLandingPage = pathname === '/'

  return (
    <div dir={dir} className="min-h-screen bg-gray-50">
      <Header />
      <main>{children}</main>
      {!isLandingPage && <AIChatAssistant />}
    </div>
  )
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <AppContent>{children}</AppContent>
    </I18nProvider>
  )
}
