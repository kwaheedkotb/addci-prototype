'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import ApplicationDetailView from '@/components/member/ApplicationDetailView'

export default function MemberApplicationDetailPage() {
  const { t } = useI18n()
  const params = useParams()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/member/applications/${params.id}`)
        const data = await res.json()
        if (data.success) {
          setApplication(data.application)
        }
      } catch (error) {
        console.error('Error fetching application:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p style={{ color: 'var(--muted)' }}>Application not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/customer"
          className="inline-flex items-center hover:opacity-80"
          style={{ color: 'var(--muted)' }}
        >
          <svg className="w-5 h-5 me-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t.common.back}
        </Link>
      </div>

      <ApplicationDetailView application={application} />
    </div>
  )
}
