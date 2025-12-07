'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import StatusBadge from '@/components/StatusBadge'
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

export default function StaffApplicationDetail() {
  const { t } = useI18n()
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  // AI States
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [aiComment, setAiComment] = useState<string | null>(null)
  const [aiCommentLoading, setAiCommentLoading] = useState(false)

  // Action States
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchApplication()
  }, [params.id])

  async function fetchApplication() {
    try {
      const res = await fetch(`/api/applications/${params.id}`)
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

  async function runAiSummary() {
    if (!application) return
    setAiSummaryLoading(true)
    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: application.description,
          sector: application.sector,
          organizationName: application.organizationName,
          applicantName: application.applicantName,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setAiSummary(data.summary)
      }
    } catch (error) {
      console.error('AI summary error:', error)
    } finally {
      setAiSummaryLoading(false)
    }
  }

  async function generateAiComment(type: string) {
    if (!application) return
    setAiCommentLoading(true)
    try {
      const res = await fetch('/api/ai/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: application.description,
          sector: application.sector,
          organizationName: application.organizationName,
          type,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setAiComment(data.comment)
        setNewNote(data.comment)
      }
    } catch (error) {
      console.error('AI comment error:', error)
    } finally {
      setAiCommentLoading(false)
    }
  }

  async function saveNote() {
    if (!newNote.trim()) return
    setSavingNote(true)
    try {
      await fetch(`/api/applications/${params.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote }),
      })
      setNewNote('')
      setAiComment(null)
      fetchApplication()
    } catch (error) {
      console.error('Save note error:', error)
    } finally {
      setSavingNote(false)
    }
  }

  async function updateStatus(status: string, note?: string) {
    const confirmMessages: Record<string, string> = {
      APPROVED: t.staff.detail.confirmApprove,
      REJECTED: t.staff.detail.confirmReject,
      CORRECTIONS_REQUESTED: t.staff.detail.confirmCorrections,
    }

    if (!confirm(confirmMessages[status])) return

    setActionLoading(status)
    try {
      const res = await fetch(`/api/applications/${params.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note: newNote || note }),
      })
      const data = await res.json()
      if (data.success) {
        setNewNote('')
        fetchApplication()
        if (status === 'APPROVED' && data.certificateNumber) {
          alert(`Certificate issued: ${data.certificateNumber}`)
        }
      }
    } catch (error) {
      console.error('Update status error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Application not found</p>
      </div>
    )
  }

  const canTakeAction = ['SUBMITTED', 'UNDER_REVIEW'].includes(application.status)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/staff"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 me-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t.common.back}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Info Card */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t.staff.detail.title}</h1>
                <p className="text-sm text-gray-500">ID: {application.id}</p>
              </div>
              <StatusBadge status={application.status} />
            </div>

            {/* Certificate Info */}
            {application.certificate && (
              <div className="px-6 py-4 bg-green-50 border-b border-green-100">
                <h3 className="font-semibold text-green-800 mb-2">{t.staff.detail.certificateInfo}</h3>
                <p className="text-sm text-green-700">
                  {t.staff.detail.certificateNumber}: <span className="font-mono font-bold">{application.certificate.certificateNumber}</span>
                </p>
                <p className="text-sm text-green-600">
                  {t.staff.detail.issuedAt}: {new Date(application.certificate.issuedAt).toLocaleString()}
                </p>
              </div>
            )}

            <div className="px-6 py-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">{t.staff.detail.applicationInfo}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase">{t.customer.form.applicantName}</label>
                  <p className="mt-1 text-gray-900 font-medium">{application.applicantName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase">{t.customer.form.organizationName}</label>
                  <p className="mt-1 text-gray-900 font-medium">{application.organizationName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase">{t.customer.form.email}</label>
                  <p className="mt-1 text-gray-900">{application.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase">{t.customer.form.sector}</label>
                  <p className="mt-1 text-gray-900">{application.sector}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">{t.customer.form.description}</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{application.description}</p>
                </div>
              </div>

              {application.aiPrecheckResult && (
                <AIPanel title={t.customer.detail.aiPrecheckResult} content={application.aiPrecheckResult} />
              )}
            </div>
          </div>

          {/* Review Notes */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">{t.staff.detail.reviewNotes}</h2>
            </div>
            <div className="px-6 py-4">
              {application.reviewNotes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">{t.customer.detail.noNotes}</p>
              ) : (
                <div className="space-y-4">
                  {application.reviewNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-4 rounded-lg border ${
                        note.authorType === 'SYSTEM'
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          note.authorType === 'SYSTEM'
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-blue-200 text-blue-700'
                        }`}>
                          {note.authorType}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{note.note}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Note */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{t.staff.detail.addNote}</h3>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={t.staff.detail.notePlaceholder}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={saveNote}
                    disabled={!newNote.trim() || savingNote}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {savingNote ? t.common.loading : t.staff.detail.saveNote}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - AI Tools & Actions */}
        <div className="space-y-6">
          {/* AI Tools */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b bg-purple-50">
              <h2 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {t.staff.detail.aiTools}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <button
                  onClick={runAiSummary}
                  disabled={aiSummaryLoading}
                  className="w-full px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50 text-start"
                >
                  <div className="font-medium flex items-center gap-2">
                    {aiSummaryLoading && (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    {t.staff.detail.runAiSummary}
                  </div>
                  <p className="text-sm text-purple-600 mt-1">{t.staff.detail.runAiSummaryDesc}</p>
                </button>
              </div>

              <div>
                <button
                  onClick={() => generateAiComment('corrections')}
                  disabled={aiCommentLoading}
                  className="w-full px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50 text-start"
                >
                  <div className="font-medium flex items-center gap-2">
                    {aiCommentLoading && (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    {t.staff.detail.generateAiComment}
                  </div>
                  <p className="text-sm text-purple-600 mt-1">{t.staff.detail.generateAiCommentDesc}</p>
                </button>
              </div>

              {(aiSummary || aiSummaryLoading) && (
                <AIPanel
                  title={t.staff.detail.aiSummary}
                  content={aiSummary}
                  isLoading={aiSummaryLoading}
                  loadingText={t.staff.detail.aiSummaryLoading}
                />
              )}
            </div>
          </div>

          {/* Status Actions */}
          {canTakeAction && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">{t.staff.detail.statusActions}</h2>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={() => updateStatus('CORRECTIONS_REQUESTED')}
                  disabled={actionLoading !== null}
                  className="w-full px-4 py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50 font-medium"
                >
                  {actionLoading === 'CORRECTIONS_REQUESTED' ? t.common.loading : t.staff.detail.requestCorrections}
                </button>

                <button
                  onClick={() => updateStatus('APPROVED')}
                  disabled={actionLoading !== null}
                  className="w-full px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 font-medium"
                >
                  {actionLoading === 'APPROVED' ? t.common.loading : t.staff.detail.approveIssue}
                </button>

                <button
                  onClick={() => updateStatus('REJECTED')}
                  disabled={actionLoading !== null}
                  className="w-full px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 font-medium"
                >
                  {actionLoading === 'REJECTED' ? t.common.loading : t.staff.detail.reject}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
