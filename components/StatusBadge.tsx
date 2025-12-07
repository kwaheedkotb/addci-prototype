'use client'

import { useI18n } from '@/lib/i18n'

type Status = 'SUBMITTED' | 'UNDER_REVIEW' | 'CORRECTIONS_REQUESTED' | 'APPROVED' | 'REJECTED'

const statusColors: Record<Status, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-800 border-blue-200',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CORRECTIONS_REQUESTED: 'bg-orange-100 text-orange-800 border-orange-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
}

export default function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n()
  const typedStatus = status as Status

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        statusColors[typedStatus] || 'bg-gray-100 text-gray-800 border-gray-200'
      }`}
    >
      {t.status[typedStatus] || status}
    </span>
  )
}
