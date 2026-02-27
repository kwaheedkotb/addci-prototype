'use client'

import { useI18n } from '@/lib/i18n'

interface SLAIndicatorProps {
  submittedAt: string | Date
  slaDays: number | null
}

export default function SLAIndicator({ submittedAt, slaDays }: SLAIndicatorProps) {
  const { locale } = useI18n()
  const isRtl = locale === 'ar'

  if (!slaDays || slaDays <= 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10">
        {isRtl ? 'غير محدد' : 'N/A'}
      </span>
    )
  }

  const submitted = new Date(submittedAt)
  const now = new Date()
  const elapsedMs = now.getTime() - submitted.getTime()
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24)
  const ratio = elapsedDays / slaDays
  const remaining = slaDays - elapsedDays

  let colorClass: string
  let label: string

  if (ratio > 1) {
    // Breached
    const overdueDays = Math.ceil(elapsedDays - slaDays)
    colorClass = 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-500/30'
    label = isRtl ? `متأخر ${overdueDays} يوم` : `${overdueDays}d overdue`
  } else if (ratio > 0.75) {
    // Approaching
    const remainHours = Math.max(0, Math.ceil(remaining * 24))
    colorClass = 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
    label = remainHours < 24
      ? (isRtl ? `${remainHours} ساعة متبقية` : `${remainHours}h left`)
      : (isRtl ? `${Math.ceil(remaining)} يوم متبقي` : `${Math.ceil(remaining)}d left`)
  } else {
    // Within SLA
    colorClass = 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
    label = isRtl ? `${Math.ceil(remaining)} يوم متبقي` : `${Math.ceil(remaining)}d left`
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ratio > 1 ? 'bg-red-500' : ratio > 0.75 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      {label}
    </span>
  )
}
