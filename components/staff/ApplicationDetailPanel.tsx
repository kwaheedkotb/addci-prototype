'use client'

import { useState, useEffect, useCallback } from 'react'
import { useI18n } from '@/lib/i18n'
import ApplicationStatusBadge from './ApplicationStatusBadge'
import SLAIndicator from './SLAIndicator'

interface ActivityEntry {
  id: string
  action: string
  performedBy: string
  performedAt: string
  notes?: string | null
}

interface StaffOption {
  id: string
  name: string
  nameAr: string
}

interface ApplicationDetail {
  id: string
  serviceType: string
  status: string
  submittedBy: string
  submittedByEmail: string
  memberTier: string
  submittedAt: string
  updatedAt: string
  reviewedAt?: string | null
  reviewedBy?: string | null
  internalNotes?: string | null
  rejectionReason?: string | null
  satisfactionScore?: number | null
  satisfactionComment?: string | null
  assignedTo?: { id: string; name: string; nameAr: string } | null
  assignedToId?: string | null
  activityLogs: ActivityEntry[]
}

interface ApplicationDetailPanelProps {
  applicationId: string
  serviceType: string
  onClose: () => void
  onStatusChange: () => void
  slaDays?: number | null
  children?: React.ReactNode
}

function relativeTime(dateStr: string, isRtl: boolean): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return isRtl ? 'الآن' : 'Just now'
  if (diffMin < 60) return isRtl ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`
  if (diffHr < 24) return isRtl ? `منذ ${diffHr} ساعة` : `${diffHr}h ago`
  if (diffDay < 7) return isRtl ? `منذ ${diffDay} يوم` : `${diffDay}d ago`
  return date.toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { month: 'short', day: 'numeric' })
}

export default function ApplicationDetailPanel({
  applicationId,
  serviceType,
  onClose,
  onStatusChange,
  slaDays = null,
  children,
}: ApplicationDetailPanelProps) {
  const { locale, dir } = useI18n()
  const isRtl = locale === 'ar'

  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const [staffList, setStaffList] = useState<StaffOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newStatus, setNewStatus] = useState('')
  const [newAssignee, setNewAssignee] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const fetchApplication = useCallback(async () => {
    try {
      const res = await fetch(`/api/staff/applications/${applicationId}`)
      const data = await res.json()
      if (data.success) {
        setApplication(data.application)
        setInternalNotes(data.application.internalNotes || '')
        setRejectionReason(data.application.rejectionReason || '')
        setNewStatus(data.application.status)
        setNewAssignee(data.application.assignedToId || '')
      }
    } catch (err) {
      console.error('Error fetching application:', err)
    } finally {
      setIsLoading(false)
    }
  }, [applicationId])

  useEffect(() => {
    fetchApplication()
    // Fetch staff list for assignment dropdown
    fetch('/api/staff/applications?staffList=true')
      .then(res => res.json())
      .then(data => { if (data.staffList) setStaffList(data.staffList) })
      .catch(() => {})
  }, [fetchApplication])

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const body: Record<string, string | null> = {}
      if (newStatus && newStatus !== application?.status) body.status = newStatus
      if (newAssignee !== (application?.assignedToId || '')) body.assignedToId = newAssignee || null
      if (internalNotes !== (application?.internalNotes || '')) body.internalNotes = internalNotes
      if (rejectionReason !== (application?.rejectionReason || '')) body.rejectionReason = rejectionReason

      if (Object.keys(body).length === 0) { setIsSaving(false); return }

      const res = await fetch(`/api/staff/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        setApplication(data.application)
        onStatusChange()
      }
    } catch (err) {
      console.error('Error updating application:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Auto-save internal notes on blur
  const handleNotesBlur = async () => {
    if (internalNotes === (application?.internalNotes || '')) return
    try {
      await fetch(`/api/staff/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNotes }),
      })
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Slide-over panel */}
      <div
        className={`relative ms-auto w-full max-w-2xl h-full overflow-y-auto shadow-2xl`}
        style={{ background: 'var(--panel)' }}
        onClick={e => e.stopPropagation()}
        dir={dir}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : !application ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: 'var(--muted)' }}>{isRtl ? 'الطلب غير موجود' : 'Application not found'}</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                    {isRtl ? 'تفاصيل الطلب' : 'Application Details'}
                  </h2>
                  <ApplicationStatusBadge status={application.status} />
                </div>
                <p className="text-xs font-mono mt-1" style={{ color: 'var(--muted)' }}>{application.id}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: 'var(--muted)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{isRtl ? 'مُقدَّم من' : 'Submitted By'}</label>
                  <p className="text-sm font-medium mt-1" style={{ color: 'var(--text)' }}>{application.submittedBy}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{application.submittedByEmail}</p>
                </div>
                <div>
                  <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{isRtl ? 'فئة العضوية' : 'Member Tier'}</label>
                  <p className="text-sm font-medium mt-1" style={{ color: 'var(--text)' }}>{application.memberTier}</p>
                </div>
                <div>
                  <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{isRtl ? 'تاريخ التقديم' : 'Submitted'}</label>
                  <p className="text-sm mt-1" style={{ color: 'var(--text)' }}>
                    {new Date(application.submittedAt).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{isRtl ? 'اتفاقية الخدمة' : 'SLA'}</label>
                  <div className="mt-1">
                    <SLAIndicator submittedAt={application.submittedAt} slaDays={slaDays ?? 0} />
                  </div>
                </div>
                {application.reviewedAt && (
                  <div>
                    <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{isRtl ? 'تاريخ المراجعة' : 'Reviewed'}</label>
                    <p className="text-sm mt-1" style={{ color: 'var(--text)' }}>
                      {new Date(application.reviewedAt).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      {application.reviewedBy && <span className="text-xs ms-2" style={{ color: 'var(--muted)' }}>by {application.reviewedBy}</span>}
                    </p>
                  </div>
                )}
              </div>

              {/* Service-specific fields (passed as children) */}
              {children}

              {/* Status update */}
              <div className="rounded-xl p-4" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
                  {isRtl ? 'تحديث الحالة' : 'Update Status'}
                </h3>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm mb-3"
                  style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  <option value="SUBMITTED">{isRtl ? 'مُقدَّم' : 'Submitted'}</option>
                  <option value="UNDER_REVIEW">{isRtl ? 'قيد المراجعة' : 'Under Review'}</option>
                  <option value="APPROVED">{isRtl ? 'مُعتمد' : 'Approved'}</option>
                  <option value="REJECTED">{isRtl ? 'مرفوض' : 'Rejected'}</option>
                  <option value="PENDING_INFO">{isRtl ? 'بانتظار معلومات' : 'Pending Info'}</option>
                  <option value="CLOSED">{isRtl ? 'مغلق' : 'Closed'}</option>
                </select>

                {newStatus === 'REJECTED' && (
                  <div className="mb-3">
                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted)' }}>
                      {isRtl ? 'سبب الرفض' : 'Rejection Reason'}
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 rounded-xl text-sm resize-none"
                      style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    />
                  </div>
                )}

                {/* Assign to */}
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'إسناد إلى' : 'Assign To'}
                </label>
                <select
                  value={newAssignee}
                  onChange={e => setNewAssignee(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm mb-3"
                  style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  <option value="">{isRtl ? 'غير مُسند' : 'Unassigned'}</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{isRtl ? s.nameAr : s.name}</option>
                  ))}
                </select>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSaving
                    ? (isRtl ? 'جاري الحفظ...' : 'Saving...')
                    : (isRtl ? 'حفظ التغييرات' : 'Save Changes')}
                </button>
              </div>

              {/* Internal notes */}
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--text)' }}>
                  {isRtl ? 'ملاحظات داخلية' : 'Internal Notes'}
                </label>
                <textarea
                  value={internalNotes}
                  onChange={e => setInternalNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  rows={3}
                  placeholder={isRtl ? 'اكتب ملاحظاتك هنا...' : 'Type your notes here...'}
                  className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                  style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'يُحفظ تلقائياً عند المغادرة' : 'Auto-saves on blur'}
                </p>
              </div>

              {/* Satisfaction score */}
              {application.satisfactionScore !== null && application.satisfactionScore !== undefined && (
                <div className="rounded-xl p-4" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>
                    {isRtl ? 'تقييم الرضا' : 'Satisfaction Score'}
                  </h3>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} className={`w-5 h-5 ${star <= application.satisfactionScore! ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-sm font-medium ms-1" style={{ color: 'var(--text)' }}>{application.satisfactionScore}/5</span>
                  </div>
                  {application.satisfactionComment && (
                    <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>{application.satisfactionComment}</p>
                  )}
                </div>
              )}

              {/* Activity log */}
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
                  {isRtl ? 'سجل النشاط' : 'Activity Log'}
                </h3>
                {application.activityLogs.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{isRtl ? 'لا يوجد نشاط بعد' : 'No activity yet'}</p>
                ) : (
                  <div className="space-y-3">
                    {application.activityLogs.map(entry => (
                      <div key={entry.id} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--primary)' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm" style={{ color: 'var(--text)' }}>{entry.action}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs" style={{ color: 'var(--muted)' }}>{entry.performedBy}</span>
                            <span className="text-xs" style={{ color: 'var(--muted)' }}>{relativeTime(entry.performedAt, isRtl)}</span>
                          </div>
                          {entry.notes && <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{entry.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
