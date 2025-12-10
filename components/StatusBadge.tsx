'use client'

import { useI18n } from '@/lib/i18n'

type Status = 'SUBMITTED' | 'UNDER_REVIEW' | 'CORRECTIONS_REQUESTED' | 'APPROVED' | 'REJECTED'

// Maps status to CSS class that uses theme-aware CSS variables
const statusClasses: Record<Status, string> = {
  SUBMITTED: 'chip-submitted',
  UNDER_REVIEW: 'chip-review',
  CORRECTIONS_REQUESTED: 'chip-warning',
  APPROVED: 'chip-approved',
  REJECTED: 'chip-rejected',
}

export default function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n()
  const typedStatus = status as Status

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusClasses[typedStatus] || 'chip-submitted'
      }`}
    >
      {t.status[typedStatus] || status}
    </span>
  )
}
