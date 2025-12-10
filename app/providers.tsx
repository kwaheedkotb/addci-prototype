'use client'

import { I18nProvider, useI18n } from '@/lib/i18n'
import { ThemeProvider } from '@/components/ThemeProvider'
import Header from '@/components/Header'
import AIChatAssistant from '@/components/AIChatAssistant'
import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

function AppContent({ children }: { children: ReactNode }) {
  const { dir } = useI18n()
  const pathname = usePathname()
  const isLandingPage = pathname === '/'

  return (
    // Use CSS variable for background, adapts to dark/light mode
    <div dir={dir} className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Header />
      <main>{children}</main>
      {!isLandingPage && <AIChatAssistant />}
    </div>
  )
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppContent>{children}</AppContent>
      </I18nProvider>
    </ThemeProvider>
  )
}
