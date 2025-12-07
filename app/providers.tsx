'use client'

import { I18nProvider, useI18n } from '@/lib/i18n'
import Header from '@/components/Header'
import AIChatAssistant from '@/components/AIChatAssistant'
import { ReactNode } from 'react'

function AppContent({ children }: { children: ReactNode }) {
  const { dir } = useI18n()

  return (
    <div dir={dir} className="min-h-screen bg-gray-50">
      <Header />
      <main>{children}</main>
      <AIChatAssistant />
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
