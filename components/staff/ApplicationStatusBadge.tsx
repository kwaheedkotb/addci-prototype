'use client'

import { useI18n } from '@/lib/i18n'

type ApplicationStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PENDING_INFO' | 'CLOSED'

const statusColors: Record<ApplicationStatus, string> = {
  SUBMITTED: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
  UNDER_REVIEW: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
  APPROVED: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
  REJECTED: 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-500/30',
  PENDING_INFO: 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
  CLOSED: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10',
}

const statusLabels: Record<ApplicationStatus, { en: string; ar: string }> = {
  SUBMITTED: { en: 'Submitted', ar: 'مُقدَّم' },
  UNDER_REVIEW: { en: 'Under Review', ar: 'قيد المراجعة' },
  APPROVED: { en: 'Approved', ar: 'مُعتمد' },
  REJECTED: { en: 'Rejected', ar: 'مرفوض' },
  PENDING_INFO: { en: 'Pending Info', ar: 'بانتظار معلومات' },
  CLOSED: { en: 'Closed', ar: 'مغلق' },
}

interface ApplicationStatusBadgeProps {
  status: string
}

export default function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  const { locale } = useI18n()
  const typedStatus = status as ApplicationStatus
  const colors = statusColors[typedStatus] || statusColors.SUBMITTED
  const label = statusLabels[typedStatus]
    ? (locale === 'ar' ? statusLabels[typedStatus].ar : statusLabels[typedStatus].en)
    : status

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors}`}>
      {label}
    </span>
  )
}
