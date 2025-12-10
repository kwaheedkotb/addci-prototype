'use client'

import { useI18n } from '@/lib/i18n'

interface AIPanelProps {
  title: string
  content: string | null
  isLoading?: boolean
  loadingText?: string
}

export default function AIPanel({ title, content, isLoading, loadingText }: AIPanelProps) {
  const { t } = useI18n()

  if (!content && !isLoading) return null

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 className="font-semibold text-purple-800 dark:text-purple-300">{title}</h3>
        <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-full">
          {t.ai.poweredBy}
        </span>
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{loadingText || t.common.loading}</span>
        </div>
      ) : (
        <p className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{content}</p>
      )}
    </div>
  )
}
