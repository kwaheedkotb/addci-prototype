'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import StatusBadge from '@/components/StatusBadge'
import AIPanel from '@/components/AIPanel'
import { StaffAccessGuard } from '@/components/staff'

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

interface KnowledgeSharingData {
  id: string
  requestType: string
  programType: string | null
  programTypeAr: string | null
  programName: string | null
  programNameAr: string | null
  sessionDate: string | null
  sessionDates: string | null
  numberOfAttendees: number | null
  attendeeDetails: string | null
  queryText: string | null
  attachmentUrl: string | null
  attachmentName: string | null
  responseText: string | null
  responseAttachmentUrl: string | null
  responseAttachmentName: string | null
  respondedAt: string | null
  respondedBy: string | null
  surveySentAt: string | null
  completedAt: string | null
}

interface RawStaffApplication {
  id: string
  serviceType: string
  status: string
  submittedBy: string
  submittedByEmail: string
  memberTier: string
  submittedAt: string
  updatedAt: string
  assignedTo?: { id: string; name: string; nameAr: string } | null
  activityLogs?: Array<{ id: string; action: string; performedAt: string; performedBy: string }>
  internalNotes: string | null
  knowledgeSharingApplication?: KnowledgeSharingData | null
  esgApplication?: Record<string, unknown> | null
}

export default function StaffApplicationDetail() {
  const { t } = useI18n()
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [rawApp, setRawApp] = useState<RawStaffApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  // AI States
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [aiComment, setAiComment] = useState<string | null>(null)
  const [aiCommentLoading, setAiCommentLoading] = useState(false)

  // Reviewer Assist State
  const [reviewerAssist, setReviewerAssist] = useState<{
    overallAssessment: string
    recommendedDecision: 'APPROVE' | 'REQUEST_CORRECTIONS' | 'REJECT'
    confidenceLevel: number
    redFlags: string[]
    strengths: string[]
    extraDocumentsSuggested: string[]
    detailedNotes: string
  } | null>(null)
  const [reviewerAssistLoading, setReviewerAssistLoading] = useState(false)

  // Action States
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Knowledge Sharing States
  const [ksResponseText, setKsResponseText] = useState('')
  const [ksResponseFileName, setKsResponseFileName] = useState('')
  const [sendingResponse, setSendingResponse] = useState(false)
  const [sendingSurvey, setSendingSurvey] = useState(false)
  const [ksSummary, setKsSummary] = useState<string | null>(null)
  const [ksSummaryLoading, setKsSummaryLoading] = useState(false)
  const [ksActions, setKsActions] = useState<Array<{ action: string; priority: string; reason: string }> | null>(null)
  const [ksActionsLoading, setKsActionsLoading] = useState(false)

  const isKS = rawApp?.serviceType === 'KNOWLEDGE_SHARING'
  const ksData = rawApp?.knowledgeSharingApplication

  useEffect(() => {
    fetchApplication()
  }, [params.id])

  async function fetchApplication() {
    try {
      // Try BaseApplication (staff portal model) first
      const staffRes = await fetch(`/api/staff/applications/${params.id}`)
      const staffData = await staffRes.json()
      if (staffData.success && staffData.application) {
        const app = staffData.application
        setRawApp(app)
        // Map BaseApplication fields to the Application shape this page expects
        setApplication({
          id: app.id,
          applicantName: app.submittedBy,
          organizationName: app.submittedBy,
          email: app.submittedByEmail,
          sector: app.esgApplication?.subSector || app.serviceType.replace(/_/g, ' '),
          description: app.internalNotes || '',
          status: app.status,
          aiPrecheckResult: null,
          createdAt: app.submittedAt,
          updatedAt: app.updatedAt,
          reviewNotes: (app.activityLogs || []).map((log: { id: string; action: string; performedAt: string; performedBy: string }) => ({
            id: log.id,
            authorType: log.performedBy === 'System (migration)' ? 'SYSTEM' : 'STAFF',
            note: log.action,
            createdAt: log.performedAt,
          })),
          certificate: null,
        })
        return
      }

      // Fall back to legacy Application model
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

  async function runReviewerAssist() {
    if (!application) return
    setReviewerAssistLoading(true)
    try {
      const res = await fetch('/api/ai/reviewer-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application.id,
          locale: 'en',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setReviewerAssist({
          overallAssessment: data.overallAssessment,
          recommendedDecision: data.recommendedDecision,
          confidenceLevel: data.confidenceLevel,
          redFlags: data.redFlags,
          strengths: data.strengths,
          extraDocumentsSuggested: data.extraDocumentsSuggested,
          detailedNotes: data.detailedNotes,
        })
      }
    } catch (error) {
      console.error('Reviewer assist error:', error)
    } finally {
      setReviewerAssistLoading(false)
    }
  }

  async function saveNote() {
    if (!newNote.trim()) return
    setSavingNote(true)
    try {
      await fetch(`/api/staff/applications/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNotes: newNote, performedBy: 'Staff' }),
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
      PENDING_INFO: t.staff.detail.confirmCorrections,
    }

    if (!confirm(confirmMessages[status])) return

    setActionLoading(status)
    try {
      const res = await fetch(`/api/staff/applications/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          internalNotes: newNote || note || undefined,
          performedBy: 'Staff',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setNewNote('')
        fetchApplication()
      }
    } catch (error) {
      console.error('Update status error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  // ─── Knowledge Sharing Functions ────────────────────────────────────────────

  async function sendKsResponse() {
    if (!ksResponseText.trim() || !rawApp) return
    setSendingResponse(true)
    try {
      const res = await fetch(`/api/staff/applications/${rawApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CLOSED',
          responseText: ksResponseText,
          responseAttachmentName: ksResponseFileName || null,
          respondedAt: new Date().toISOString(),
          respondedBy: 'Staff',
          performedBy: 'Staff',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setKsResponseText('')
        setKsResponseFileName('')
        fetchApplication()
      }
    } catch (error) {
      console.error('Send KS response error:', error)
    } finally {
      setSendingResponse(false)
    }
  }

  async function sendKsSurvey() {
    if (!rawApp) return
    setSendingSurvey(true)
    try {
      const res = await fetch(`/api/staff/applications/${rawApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveySentAt: new Date().toISOString(),
          performedBy: 'Staff',
        }),
      })
      const data = await res.json()
      if (data.success) {
        fetchApplication()
      }
    } catch (error) {
      console.error('Send KS survey error:', error)
    } finally {
      setSendingSurvey(false)
    }
  }

  async function runKsSummary() {
    if (!rawApp || !ksData) return
    setKsSummaryLoading(true)
    try {
      const res = await fetch('/api/ai/ks-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: rawApp.id,
          submittedBy: rawApp.submittedBy,
          submittedByEmail: rawApp.submittedByEmail,
          memberTier: rawApp.memberTier,
          status: rawApp.status,
          requestType: ksData.requestType,
          programType: ksData.programType,
          programName: ksData.programName,
          queryText: ksData.queryText,
          numberOfAttendees: ksData.numberOfAttendees,
          sessionDate: ksData.sessionDate,
          sessionDates: ksData.sessionDates,
          activityLogs: rawApp.activityLogs,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setKsSummary(data.summary)
      }
    } catch (error) {
      console.error('KS AI summary error:', error)
    } finally {
      setKsSummaryLoading(false)
    }
  }

  async function runKsActions() {
    if (!rawApp || !ksData) return
    setKsActionsLoading(true)
    try {
      const res = await fetch('/api/ai/ks-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: rawApp.id,
          submittedBy: rawApp.submittedBy,
          submittedByEmail: rawApp.submittedByEmail,
          memberTier: rawApp.memberTier,
          status: rawApp.status,
          requestType: ksData.requestType,
          programType: ksData.programType,
          programName: ksData.programName,
          queryText: ksData.queryText,
          numberOfAttendees: ksData.numberOfAttendees,
          sessionDate: ksData.sessionDate,
          sessionDates: ksData.sessionDates,
          respondedAt: ksData.respondedAt,
          surveySentAt: ksData.surveySentAt,
          activityLogs: rawApp.activityLogs,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setKsActions(data.actions)
      }
    } catch (error) {
      console.error('KS AI actions error:', error)
    } finally {
      setKsActionsLoading(false)
    }
  }

  // ─── Render helpers ─────────────────────────────────────────────────────────

  function renderKsDetails() {
    if (!isKS || !ksData) return null

    const isCalendarBooking = ksData.requestType === 'CALENDAR_BOOKING'

    let attendees: Array<{ name?: string; email?: string; phone?: string }> = []
    if (ksData.attendeeDetails) {
      try {
        attendees = JSON.parse(ksData.attendeeDetails)
      } catch { /* ignore parse errors */ }
    }

    let sessionDatesArr: string[] = []
    if (ksData.sessionDates) {
      try {
        sessionDatesArr = JSON.parse(ksData.sessionDates)
      } catch { /* ignore parse errors */ }
    }

    return (
      <div className="shadow rounded-lg overflow-hidden theme-panel">
        <div className="px-6 py-4 flex items-center gap-3" style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--border)' }}>
          <svg className="w-5 h-5" style={{ color: 'var(--primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
            Knowledge Sharing Details
          </h2>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            isCalendarBooking
              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
              : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'
          }`}>
            {isCalendarBooking ? 'Calendar Booking' : 'Training Query'}
          </span>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Common fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ksData.programType && (
              <div className="p-4 rounded-lg" style={{ background: 'var(--panel-2)' }}>
                <label className="block text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>Program Type</label>
                <p className="mt-1 font-medium" style={{ color: 'var(--text)' }}>{ksData.programType}</p>
                {ksData.programTypeAr && <p className="text-sm" style={{ color: 'var(--muted)' }}>{ksData.programTypeAr}</p>}
              </div>
            )}
            {ksData.programName && (
              <div className="p-4 rounded-lg" style={{ background: 'var(--panel-2)' }}>
                <label className="block text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>Program Name</label>
                <p className="mt-1 font-medium" style={{ color: 'var(--text)' }}>{ksData.programName}</p>
                {ksData.programNameAr && <p className="text-sm" style={{ color: 'var(--muted)' }}>{ksData.programNameAr}</p>}
              </div>
            )}
          </div>

          {isCalendarBooking ? (
            <>
              {/* Session dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ksData.sessionDate && (
                  <div className="p-4 rounded-lg" style={{ background: 'var(--panel-2)' }}>
                    <label className="block text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>Session Date</label>
                    <p className="mt-1" style={{ color: 'var(--text)' }}>
                      {new Date(ksData.sessionDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                )}
                {sessionDatesArr.length > 0 && (
                  <div className="p-4 rounded-lg" style={{ background: 'var(--panel-2)' }}>
                    <label className="block text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>All Session Dates</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {sessionDatesArr.map((d, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-full text-xs font-medium border" style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--border)' }}>
                          {new Date(d).toLocaleDateString()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {ksData.numberOfAttendees != null && (
                  <div className="p-4 rounded-lg" style={{ background: 'var(--panel-2)' }}>
                    <label className="block text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>Number of Attendees</label>
                    <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--primary)' }}>{ksData.numberOfAttendees}</p>
                  </div>
                )}
              </div>

              {/* Attendee list */}
              {attendees.length > 0 && (
                <div>
                  <label className="block text-xs font-medium uppercase mb-2" style={{ color: 'var(--muted)' }}>Attendee List</label>
                  <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--border)' }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: 'var(--panel-2)' }}>
                          <th className="px-4 py-2 text-start font-medium" style={{ color: 'var(--muted)' }}>#</th>
                          <th className="px-4 py-2 text-start font-medium" style={{ color: 'var(--muted)' }}>Name</th>
                          <th className="px-4 py-2 text-start font-medium" style={{ color: 'var(--muted)' }}>Email</th>
                          <th className="px-4 py-2 text-start font-medium" style={{ color: 'var(--muted)' }}>Phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendees.map((att, i) => (
                          <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                            <td className="px-4 py-2" style={{ color: 'var(--muted)' }}>{i + 1}</td>
                            <td className="px-4 py-2" style={{ color: 'var(--text)' }}>{att.name || '-'}</td>
                            <td className="px-4 py-2" style={{ color: 'var(--text)' }}>{att.email || '-'}</td>
                            <td className="px-4 py-2" style={{ color: 'var(--text)' }}>{att.phone || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Message to organizer (queryText used as message for calendar bookings) */}
              {ksData.queryText && (
                <div>
                  <label className="block text-xs font-medium uppercase mb-2" style={{ color: 'var(--muted)' }}>Message to Organizer</label>
                  <div className="p-4 rounded-lg" style={{ background: 'var(--panel-2)' }}>
                    <p className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{ksData.queryText}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Training Query specific fields */}
              {ksData.queryText && (
                <div>
                  <label className="block text-xs font-medium uppercase mb-2" style={{ color: 'var(--muted)' }}>Query Text</label>
                  <div className="p-4 rounded-lg" style={{ background: 'var(--panel-2)' }}>
                    <p className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{ksData.queryText}</p>
                  </div>
                </div>
              )}
              {ksData.attachmentName && (
                <div className="p-4 rounded-lg flex items-center gap-3" style={{ background: 'var(--panel-2)' }}>
                  <svg className="w-5 h-5 shrink-0" style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <div>
                    <label className="block text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>Attachment</label>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{ksData.attachmentName}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Staff response (if already responded) */}
          {ksData.respondedAt && (
            <div className="p-4 rounded-lg" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>Staff Response</label>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {new Date(ksData.respondedAt).toLocaleString()} by {ksData.respondedBy}
                </span>
              </div>
              <p className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{ksData.responseText}</p>
              {ksData.responseAttachmentName && (
                <div className="mt-2 flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  {ksData.responseAttachmentName}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  function renderKsSendResponse() {
    if (!isKS || !ksData || ksData.respondedAt) return null

    return (
      <div className="shadow rounded-lg overflow-hidden theme-panel">
        <div className="px-6 py-4" style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Send Response</h2>
        </div>
        <div className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Response Text
            </label>
            <textarea
              value={ksResponseText}
              onChange={(e) => setKsResponseText(e.target.value)}
              placeholder="Type your response to the member..."
              rows={5}
              className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Attachment (optional)
            </label>
            <input
              type="text"
              value={ksResponseFileName}
              onChange={(e) => setKsResponseFileName(e.target.value)}
              placeholder="Enter file name (file upload coming soon)"
              className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={sendKsResponse}
              disabled={!ksResponseText.trim() || sendingResponse}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
            >
              {sendingResponse ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              ) : 'Send Response & Close'}
            </button>
          </div>

          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Sending a response will automatically close this application.
          </p>
        </div>
      </div>
    )
  }

  function renderKsAiTools() {
    if (!isKS) return null

    return (
      <div className="shadow rounded-lg overflow-hidden theme-panel">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Tools
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {/* AI Summary */}
          <button
            onClick={runKsSummary}
            disabled={ksSummaryLoading}
            className="w-full px-4 py-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors disabled:opacity-50 text-start"
          >
            <div className="font-medium flex items-center gap-2">
              {ksSummaryLoading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              Generate AI Summary
            </div>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">Summarize this knowledge sharing request using Claude</p>
          </button>

          {(ksSummary || ksSummaryLoading) && (
            <AIPanel
              title="AI Summary"
              content={ksSummary}
              isLoading={ksSummaryLoading}
              loadingText="Generating summary..."
            />
          )}

          {/* AI Recommended Actions */}
          <button
            onClick={runKsActions}
            disabled={ksActionsLoading}
            className="w-full px-4 py-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors disabled:opacity-50 text-start"
          >
            <div className="font-medium flex items-center gap-2">
              {ksActionsLoading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              AI Recommended Actions
            </div>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">Get AI-powered next steps and priority recommendations</p>
          </button>

          {/* Render actions list */}
          {ksActions && (
            <div className="space-y-2">
              {ksActions.map((item, i) => (
                <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.action}</p>
                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      item.priority === 'high'
                        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700'
                        : item.priority === 'medium'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700'
                        : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{item.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  function renderKsSurveyButton() {
    if (!isKS || !ksData || rawApp?.status !== 'CLOSED') return null

    const alreadySent = !!ksData.surveySentAt

    return (
      <div className="shadow rounded-lg overflow-hidden theme-panel">
        <div className="px-6 py-4" style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Satisfaction Survey</h2>
        </div>
        <div className="p-6">
          {alreadySent ? (
            <div className="text-center py-2">
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Survey already sent</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                Sent on {new Date(ksData.surveySentAt!).toLocaleString()}
              </p>
            </div>
          ) : (
            <button
              onClick={sendKsSurvey}
              disabled={sendingSurvey}
              className="w-full px-4 py-3 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-800/30 transition-colors disabled:opacity-50 font-medium"
            >
              {sendingSurvey ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              ) : 'Send Satisfaction Survey'}
            </button>
          )}
        </div>
      </div>
    )
  }

  // ─── Loading & Error States ─────────────────────────────────────────────────

  if (loading) {
    return (
      <StaffAccessGuard isAuthorized={true}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
        </div>
      </StaffAccessGuard>
    )
  }

  if (!application) {
    return (
      <StaffAccessGuard isAuthorized={true}>
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p style={{ color: 'var(--muted)' }}>Application not found</p>
        </div>
      </StaffAccessGuard>
    )
  }

  const canTakeAction = ['SUBMITTED', 'UNDER_REVIEW'].includes(application.status)

  return (
    <StaffAccessGuard isAuthorized={true}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/staff"
          className="inline-flex items-center hover:opacity-80"
          style={{ color: 'var(--muted)' }}
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
          <div className="shadow rounded-lg overflow-hidden theme-panel">
            <div className="px-6 py-4 flex justify-between items-center" style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{t.staff.detail.title}</h1>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>ID: {application.id}</p>
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
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{t.staff.detail.applicationInfo}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ background: 'var(--panel-2)' }}>
                  <label className="block text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>{t.customer.form.applicantName}</label>
                  <p className="mt-1 font-medium" style={{ color: 'var(--text)' }}>{application.applicantName}</p>
                </div>
                <div className="p-4 rounded-lg" style={{ background: 'var(--panel-2)' }}>
                  <label className="block text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>{t.customer.form.organizationName}</label>
                  <p className="mt-1 font-medium" style={{ color: 'var(--text)' }}>{application.organizationName}</p>
                </div>
                <div className="p-4 rounded-lg" style={{ background: 'var(--panel-2)' }}>
                  <label className="block text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>{t.customer.form.email}</label>
                  <p className="mt-1" style={{ color: 'var(--text)' }}>{application.email}</p>
                </div>
                <div className="p-4 rounded-lg" style={{ background: 'var(--panel-2)' }}>
                  <label className="block text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>{t.customer.form.sector}</label>
                  <p className="mt-1" style={{ color: 'var(--text)' }}>{application.sector}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase mb-2" style={{ color: 'var(--muted)' }}>{t.customer.form.description}</label>
                <div className="p-4 rounded-lg" style={{ background: 'var(--panel-2)' }}>
                  <p className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{application.description}</p>
                </div>
              </div>

              {application.aiPrecheckResult && (
                <AIPanel title={t.customer.detail.aiPrecheckResult} content={application.aiPrecheckResult} />
              )}
            </div>
          </div>

          {/* Knowledge Sharing Service Details */}
          {renderKsDetails()}

          {/* Knowledge Sharing Send Response */}
          {renderKsSendResponse()}

          {/* Review Notes */}
          <div className="shadow rounded-lg overflow-hidden theme-panel">
            <div className="px-6 py-4" style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--border)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{t.staff.detail.reviewNotes}</h2>
            </div>
            <div className="px-6 py-4">
              {application.reviewNotes.length === 0 ? (
                <p className="text-center py-4" style={{ color: 'var(--muted)' }}>{t.customer.detail.noNotes}</p>
              ) : (
                <div className="space-y-4">
                  {application.reviewNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-4 rounded-lg border ${
                        note.authorType === 'SYSTEM'
                          ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          note.authorType === 'SYSTEM'
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            : 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                        }`}>
                          {note.authorType}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--muted)' }}>
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{note.note}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Note */}
              <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{t.staff.detail.addNote}</h3>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={t.staff.detail.notePlaceholder}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
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
          {/* KS AI Tools (only for Knowledge Sharing) */}
          {renderKsAiTools()}

          {/* KS Survey Button (only for closed KS applications) */}
          {renderKsSurveyButton()}

          {/* AI Reviewer Assist - Advanced Analysis (non-KS only) */}
          {!isKS && (
            <div className="shadow rounded-lg overflow-hidden theme-panel">
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30" style={{ borderBottom: '1px solid var(--border)' }}>
                <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  AI Reviewer Assistant
                </h2>
              </div>
              <div className="p-6">
                <button
                  onClick={runReviewerAssist}
                  disabled={reviewerAssistLoading}
                  className="w-full px-4 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 shadow-lg"
                >
                  <div className="font-semibold flex items-center justify-center gap-2">
                    {reviewerAssistLoading ? (
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    )}
                    {reviewerAssistLoading ? 'Analyzing Application...' : 'Run Full AI Analysis'}
                  </div>
                  <p className="text-sm text-emerald-100 mt-1">Get comprehensive ESG assessment with recommendations</p>
                </button>

                {/* Reviewer Assist Results */}
                {reviewerAssist && (
                  <div className="mt-4 space-y-4">
                    {/* Decision Recommendation */}
                    <div className={`p-4 rounded-lg border-2 ${
                      reviewerAssist.recommendedDecision === 'APPROVE' ? 'bg-green-50 border-green-300' :
                      reviewerAssist.recommendedDecision === 'REQUEST_CORRECTIONS' ? 'bg-amber-50 border-amber-300' :
                      'bg-red-50 border-red-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">Recommended Decision</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          reviewerAssist.recommendedDecision === 'APPROVE' ? 'bg-green-200 text-green-800' :
                          reviewerAssist.recommendedDecision === 'REQUEST_CORRECTIONS' ? 'bg-amber-200 text-amber-800' :
                          'bg-red-200 text-red-800'
                        }`}>
                          {reviewerAssist.recommendedDecision.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{reviewerAssist.overallAssessment}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-gray-500">Confidence:</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              reviewerAssist.confidenceLevel >= 80 ? 'bg-green-500' :
                              reviewerAssist.confidenceLevel >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${reviewerAssist.confidenceLevel}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{reviewerAssist.confidenceLevel}%</span>
                      </div>
                    </div>

                    {/* Strengths */}
                    {reviewerAssist.strengths.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-1">
                          <span>✅</span> Strengths
                        </h4>
                        <ul className="space-y-1">
                          {reviewerAssist.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                              <span className="text-green-500">•</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Red Flags */}
                    {reviewerAssist.redFlags.length > 0 && (
                      <div className="bg-red-50 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-1">
                          <span>🚩</span> Red Flags
                        </h4>
                        <ul className="space-y-1">
                          {reviewerAssist.redFlags.map((r, i) => (
                            <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                              <span className="text-red-500">•</span>
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggested Documents */}
                    {reviewerAssist.extraDocumentsSuggested.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
                          <span>📄</span> Request Additional Documents
                        </h4>
                        <ul className="space-y-1">
                          {reviewerAssist.extraDocumentsSuggested.map((d, i) => (
                            <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                              <span className="text-blue-500">•</span>
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Quick Action Based on Recommendation */}
                    {canTakeAction && (
                      <button
                        onClick={() => updateStatus(
                          reviewerAssist.recommendedDecision === 'APPROVE' ? 'APPROVED' :
                          reviewerAssist.recommendedDecision === 'REQUEST_CORRECTIONS' ? 'PENDING_INFO' : 'REJECTED'
                        )}
                        disabled={actionLoading !== null}
                        className={`w-full py-2 rounded-lg font-medium transition-colors ${
                          reviewerAssist.recommendedDecision === 'APPROVE' ? 'bg-green-600 text-white hover:bg-green-700' :
                          reviewerAssist.recommendedDecision === 'REQUEST_CORRECTIONS' ? 'bg-amber-600 text-white hover:bg-amber-700' :
                          'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        Apply Recommended Decision
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Tools (non-KS only) */}
          {!isKS && (
            <div className="shadow rounded-lg overflow-hidden theme-panel">
              <div className="px-6 py-4 bg-purple-50 dark:bg-purple-900/30" style={{ borderBottom: '1px solid var(--border)' }}>
                <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-2">
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
                    className="w-full px-4 py-3 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors disabled:opacity-50 text-start"
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
                    <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">{t.staff.detail.runAiSummaryDesc}</p>
                  </button>
                </div>

                <div>
                  <button
                    onClick={() => generateAiComment('corrections')}
                    disabled={aiCommentLoading}
                    className="w-full px-4 py-3 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors disabled:opacity-50 text-start"
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
                    <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">{t.staff.detail.generateAiCommentDesc}</p>
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
          )}

          {/* Status Actions */}
          {canTakeAction && (
            <div className="shadow rounded-lg overflow-hidden theme-panel">
              <div className="px-6 py-4" style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--border)' }}>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{t.staff.detail.statusActions}</h2>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={() => updateStatus('PENDING_INFO')}
                  disabled={actionLoading !== null}
                  className="w-full px-4 py-3 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800/30 transition-colors disabled:opacity-50 font-medium"
                >
                  {actionLoading === 'PENDING_INFO' ? t.common.loading : t.staff.detail.requestCorrections}
                </button>

                <button
                  onClick={() => updateStatus('APPROVED')}
                  disabled={actionLoading !== null}
                  className="w-full px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/30 transition-colors disabled:opacity-50 font-medium"
                >
                  {actionLoading === 'APPROVED' ? t.common.loading : t.staff.detail.approveIssue}
                </button>

                <button
                  onClick={() => updateStatus('REJECTED')}
                  disabled={actionLoading !== null}
                  className="w-full px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors disabled:opacity-50 font-medium"
                >
                  {actionLoading === 'REJECTED' ? t.common.loading : t.staff.detail.reject}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </StaffAccessGuard>
  )
}
