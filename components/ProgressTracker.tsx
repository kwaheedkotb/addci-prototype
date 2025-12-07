'use client'

import { useI18n } from '@/lib/i18n'

type Status = 'SUBMITTED' | 'UNDER_REVIEW' | 'CORRECTIONS_REQUESTED' | 'APPROVED' | 'REJECTED'

function getStepStatus(status: Status, step: number): 'completed' | 'current' | 'upcoming' {
  const statusOrder: Record<Status, number> = {
    SUBMITTED: 1,
    UNDER_REVIEW: 2,
    CORRECTIONS_REQUESTED: 3,
    APPROVED: 4,
    REJECTED: 4,
  }

  const currentStep = statusOrder[status]

  if (step < currentStep) return 'completed'
  if (step === currentStep) return 'current'
  return 'upcoming'
}

export default function ProgressTracker({ status }: { status: string }) {
  const { t, dir } = useI18n()
  const typedStatus = status as Status

  const steps = [
    { step: 1, label: t.customer.detail.step1 },
    { step: 2, label: t.customer.detail.step2 },
    { step: 3, label: t.customer.detail.step3 },
    { step: 4, label: typedStatus === 'REJECTED' ? t.status.REJECTED : t.customer.detail.step4 },
  ]

  return (
    <div className="w-full">
      <div className={`flex items-center ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
        {steps.map((item, index) => {
          const stepStatus = getStepStatus(typedStatus, item.step)
          const isLast = index === steps.length - 1

          return (
            <div key={item.step} className={`flex items-center ${!isLast ? 'flex-1' : ''}`}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    stepStatus === 'completed'
                      ? 'bg-emerald-500 text-white'
                      : stepStatus === 'current'
                      ? typedStatus === 'REJECTED'
                        ? 'bg-red-500 text-white'
                        : typedStatus === 'CORRECTIONS_REQUESTED'
                        ? 'bg-orange-500 text-white'
                        : 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {stepStatus === 'completed' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    item.step
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium text-center ${
                    stepStatus === 'upcoming' ? 'text-gray-400' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    getStepStatus(typedStatus, item.step + 1) !== 'upcoming'
                      ? 'bg-emerald-500'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
