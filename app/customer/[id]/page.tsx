'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import StatusBadge from '@/components/StatusBadge'
import ProgressTracker from '@/components/ProgressTracker'
import AIPanel from '@/components/AIPanel'

interface ReviewNote {
  id: string
  authorType: string
  note: string
  createdAt: string
}

interface Certificate {
  id: string
  certificateNumber: string
  issuedAt: string
}

interface Application {
  id: string
  applicantName: string
  organizationName: string
  email: string
  sector: string
  description: string
  status: string
  aiPrecheckResult: string | null
  createdAt: string
  updatedAt: string
  reviewNotes: ReviewNote[]
  certificate: Certificate | null
}

export default function CustomerApplicationDetail() {
  const { t } = useI18n()
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<string | null>(null)

  useEffect(() => {
    fetchApplication()
  }, [params.id])

  async function fetchApplication() {
    try {
      // Try member API (BaseApplication) first
      const memberRes = await fetch(`/api/member/applications/${params.id}`)
      const memberData = await memberRes.json()
      if (memberData.success && memberData.application) {
        const app = memberData.application
        setApplication({
          id: app.id,
          applicantName: app.submittedBy || '',
          organizationName: app.submittedBy || '',
          email: app.submittedByEmail || '',
          sector: app.esgApplication?.subSector || app.serviceType?.replace(/_/g, ' ') || '',
          description: app.esgApplication?.description || app.internalNotes || '',
          status: app.status,
          aiPrecheckResult: null,
          createdAt: app.submittedAt,
          updatedAt: app.updatedAt,
          reviewNotes: (app.activityLogs || [])
            .filter((log: { action: string }) => !log.action.toLowerCase().includes('internal'))
            .map((log: { id: string; action: string; performedAt: string; performedBy: string }) => ({
              id: log.id,
              authorType: log.performedBy === 'System' ? 'SYSTEM' : 'STAFF',
              note: log.action,
              createdAt: log.performedAt,
            })),
          certificate: null,
        })
        setDescription(app.esgApplication?.description || app.internalNotes || '')
        return
      }

      // Fallback to legacy Application model
      const res = await fetch(`/api/applications/${params.id}`)
      const data = await res.json()
      if (data.success) {
        setApplication(data.application)
        setDescription(data.application.description)
        setAiResult(data.application.aiPrecheckResult)
      }
    } catch (error) {
      console.error('Error fetching application:', error)
    } finally {
      setLoading(false)
    }
  }

  async function runAiPrecheck() {
    if (!description.trim()) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/precheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          sector: application?.sector,
          organizationName: application?.organizationName,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setAiResult(data.result)
      }
    } catch (error) {
      console.error('AI precheck error:', error)
    } finally {
      setAiLoading(false)
    }
  }

  async function handleResubmit() {
    if (!description.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/applications/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, aiPrecheckResult: aiResult }),
      })
      const data = await res.json()
      if (data.success) {
        setApplication(data.application)
        setEditing(false)
      }
    } catch (error) {
      console.error('Resubmit error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--accent-green)' }}></div>
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

  const staffNotes = application.reviewNotes.filter((n) => n.authorType === 'STAFF')

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

      <div className="shadow rounded-lg overflow-hidden theme-panel">
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center" style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{t.customer.detail.title}</h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>ID: {application.id}</p>
          </div>
          <StatusBadge status={application.status} />
        </div>

        {/* Progress Tracker */}
        <div className="px-6 py-6" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--muted)' }}>{t.customer.detail.progressTracker}</h2>
          <ProgressTracker status={application.status} />
        </div>

        {/* Certificate Info (if approved) */}
        {application.status === 'APPROVED' && application.certificate && (
          <div className="px-6 py-4 bg-green-50 border-b border-green-100">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-green-800">{t.customer.detail.certificateIssued}</h3>
                <p className="text-sm text-green-700">
                  {t.customer.detail.certificateNumber}: <span className="font-mono font-bold">{application.certificate.certificateNumber}</span>
                </p>
                <p className="text-sm text-green-600">
                  {t.customer.detail.issuedOn}: {new Date(application.certificate.issuedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Info */}
        {application.status === 'REJECTED' && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-100">
            <div className="flex items-center gap-3">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-red-800">{t.customer.detail.applicationRejected}</h3>
                <p className="text-sm text-red-600">{t.customer.detail.rejectionMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Corrections Required */}
        {application.status === 'PENDING_INFO' && (
          <div className="px-6 py-4 bg-orange-50 border-b border-orange-100">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-semibold text-orange-800">{t.customer.detail.correctionsRequired}</h3>
                <p className="text-sm text-orange-600">{t.customer.detail.correctionsMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Application Details */}
        <div className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium" style={{ color: 'var(--muted)' }}>{t.customer.form.applicantName}</label>
              <p className="mt-1" style={{ color: 'var(--text)' }}>{application.applicantName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium" style={{ color: 'var(--muted)' }}>{t.customer.form.organizationName}</label>
              <p className="mt-1" style={{ color: 'var(--text)' }}>{application.organizationName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium" style={{ color: 'var(--muted)' }}>{t.customer.form.email}</label>
              <p className="mt-1" style={{ color: 'var(--text)' }}>{application.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium" style={{ color: 'var(--muted)' }}>{t.customer.form.sector}</label>
              <p className="mt-1" style={{ color: 'var(--text)' }}>{application.sector}</p>
            </div>
          </div>

          {/* Description - Editable if corrections requested */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>{t.customer.form.description}</label>
            {application.status === 'PENDING_INFO' && editing ? (
              <div className="space-y-4">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={runAiPrecheck}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )}
                    {t.customer.form.aiPrecheckButton}
                  </button>
                </div>
                {(aiResult || aiLoading) && (
                  <AIPanel
                    title={t.ai.precheckTitle}
                    content={aiResult}
                    isLoading={aiLoading}
                    loadingText={t.customer.form.aiPrecheckRunning}
                  />
                )}
                <div className="flex gap-4">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 rounded-lg hover:opacity-80"
                    style={{ border: '1px solid var(--border)', color: 'var(--text)' }}
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    onClick={handleResubmit}
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {submitting ? t.common.loading : t.customer.form.resubmitApplication}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="whitespace-pre-wrap p-4 rounded-lg" style={{ background: 'var(--panel-2)', color: 'var(--text)' }}>{application.description}</p>
                {application.status === 'PENDING_INFO' && (
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-4 inline-flex items-center gap-2"
                    style={{ color: 'var(--accent-green)' }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {t.common.edit}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* AI Precheck Result */}
          {application.aiPrecheckResult && !editing && (
            <AIPanel title={t.customer.detail.aiPrecheckResult} content={application.aiPrecheckResult} />
          )}

          {/* Staff Notes */}
          {staffNotes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--muted)' }}>{t.customer.detail.staffNotes}</h3>
              <div className="space-y-3">
                {staffNotes.map((note) => (
                  <div key={note.id} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
                    <p className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{note.note}</p>
                    <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
