'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import {
  PROGRAMS,
  sectorColors,
  formatColors,
  levelColors,
  sectorsAr,
  type Program,
  type ProgramSession,
} from '@/lib/knowledge-sharing-data'

// ─── Member Access Guard ────────────────────────────────────────────────────
function MemberAccessGuard({ locale }: { locale: string }) {
  const isRtl = locale === 'ar'
  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 dark:from-[#000C14] dark:via-[#001520] dark:to-[#001B30] ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {isRtl ? 'محتوى حصري للأعضاء' : 'Members-Only Content'}
          </h2>
          <p className="text-gray-600 dark:text-white/60 mb-8">
            {isRtl
              ? 'برامج المعرفة والتطوير متاحة حصرياً لأعضاء غرفة أبوظبي. سجّل الدخول أو انضم للوصول إلى البرامج التدريبية.'
              : 'Knowledge Sharing & Upskilling Programs are exclusively available to Abu Dhabi Chamber members. Log in or become a member to access training programs.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
              {isRtl ? 'تسجيل الدخول' : 'Login to Access'}
            </button>
            <button className="px-6 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 font-medium rounded-xl hover:bg-white dark:hover:bg-white/10 transition-colors">
              {isRtl ? 'انضم كعضو' : 'Become a Member'}
            </button>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center mt-6 text-sm text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60 transition-colors"
          >
            <svg className="w-4 h-4 me-1 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {isRtl ? 'العودة لدليل الخدمات' : 'Back to Service Directory'}
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton Loader ────────────────────────────────────────────────────────
function ProgramCardSkeleton() {
  return (
    <div className="rounded-2xl p-6 theme-panel animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-24" />
        <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-20" />
      </div>
      <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/2 mb-3" />
      <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-full mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-2/3 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-16" />
        <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-14" />
        <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-18" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
        <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-32" />
        <div className="h-9 bg-gray-200 dark:bg-white/10 rounded-lg w-24" />
      </div>
    </div>
  )
}

// ─── Session Booking Modal ──────────────────────────────────────────────────
function SessionBookingModal({
  program,
  locale,
  onClose,
}: {
  program: Program
  locale: string
  onClose: () => void
}) {
  const isRtl = locale === 'ar'
  const [selectedSessionIdx, setSelectedSessionIdx] = useState<number | null>(null)
  const [numberOfAttendees, setNumberOfAttendees] = useState(1)
  const [attendeeDetails, setAttendeeDetails] = useState<{ name: string; email: string; phone: string }[]>([
    { name: '', email: '', phone: '' },
  ])
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [memberTier, setMemberTier] = useState('Standard')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const router = useRouter()

  const selectedSession = selectedSessionIdx !== null ? program.upcomingSessions[selectedSessionIdx] : null
  const maxSpots = selectedSession ? selectedSession.spotsAvailable : 99

  // Body scroll lock + Escape close
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  // Sync attendee rows when numberOfAttendees changes
  useEffect(() => {
    setAttendeeDetails((prev) => {
      if (numberOfAttendees > prev.length) {
        return [...prev, ...Array.from({ length: numberOfAttendees - prev.length }, () => ({ name: '', email: '', phone: '' }))]
      }
      return prev.slice(0, numberOfAttendees)
    })
  }, [numberOfAttendees])

  const updateAttendee = (idx: number, field: 'name' | 'email' | 'phone', value: string) => {
    setAttendeeDetails((prev) => prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a)))
  }

  const removeAttendee = (idx: number) => {
    if (numberOfAttendees <= 1) return
    setAttendeeDetails((prev) => prev.filter((_, i) => i !== idx))
    setNumberOfAttendees((n) => n - 1)
  }

  const addAttendee = () => {
    if (numberOfAttendees >= maxSpots) return
    setNumberOfAttendees((n) => n + 1)
    setAttendeeDetails((prev) => [...prev, { name: '', email: '', phone: '' }])
  }

  const canSubmit = selectedSessionIdx !== null && companyName.trim() && email.trim() && numberOfAttendees >= 1

  const handleSubmit = async () => {
    if (!canSubmit || !selectedSession) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const body = {
        requestType: 'CALENDAR_BOOKING',
        companyName: companyName.trim(),
        email: email.trim(),
        memberTier,
        programType: program.programType,
        programTypeAr: program.programTypeAr,
        programName: program.title,
        programNameAr: program.titleAr,
        sessionDate: selectedSession.date,
        numberOfAttendees,
        attendeeDetails: JSON.stringify(attendeeDetails),
        queryText: message.trim(),
      }
      const res = await fetch('/api/services/knowledge-sharing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setSubmitError(isRtl ? 'فشل في إرسال الطلب. يرجى المحاولة مرة أخرى.' : 'Failed to submit request. Please try again.')
        return
      }
      setApplicationId(data.applicationId)
      setSuccess(true)
    } catch {
      setSubmitError(isRtl ? 'حدث خطأ في الشبكة. يرجى المحاولة مرة أخرى.' : 'A network error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = { background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] pb-[5vh]" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#071824] border border-gray-200 dark:border-white/10 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 z-10 p-2 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          {success ? (
            <div className="py-4">
              {/* Success Icon */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-green)', opacity: 0.15 }}>
                  <svg className="w-8 h-8" style={{ color: 'var(--accent-green)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>
                  {isRtl ? 'تم إرسال طلب الحجز' : 'Booking Request Submitted'}
                </h3>
              </div>

              {/* Summary Card */}
              <div className="rounded-xl p-4 mb-6" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm" style={{ color: 'var(--muted)' }}>{isRtl ? 'البرنامج' : 'Program'}</span>
                    <span className="text-sm font-medium text-end" style={{ color: 'var(--text)' }}>
                      {isRtl ? program.titleAr : program.title}
                    </span>
                  </div>
                  {selectedSession && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm" style={{ color: 'var(--muted)' }}>{isRtl ? 'الجلسة' : 'Session'}</span>
                      <span className="text-sm font-medium text-end" style={{ color: 'var(--text)' }}>
                        {new Date(selectedSession.date).toLocaleDateString(isRtl ? 'ar-AE' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' — '}
                        {isRtl ? selectedSession.locationAr : selectedSession.location}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <span className="text-sm" style={{ color: 'var(--muted)' }}>{isRtl ? 'الحضور' : 'Attendees'}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{numberOfAttendees}</span>
                  </div>
                  {applicationId && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: 'var(--muted)' }}>{isRtl ? 'المرجع' : 'Reference'}</span>
                      <button
                        onClick={() => {
                          if (applicationId) navigator.clipboard.writeText(applicationId)
                        }}
                        className="flex items-center gap-1.5 text-sm font-mono font-medium hover:opacity-70 transition-opacity"
                        style={{ color: 'var(--primary)' }}
                        title={isRtl ? 'نسخ' : 'Copy'}
                      >
                        {applicationId.slice(0, 12)}...
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirmation Message */}
              <p className="text-sm text-center mb-6" style={{ color: 'var(--muted)' }}>
                {isRtl
                  ? 'تم استلام طلب حجزك. ستتلقى تأكيداً خلال يوم عمل واحد.'
                  : 'Your booking request has been received. You will receive a confirmation within 1 business day.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {applicationId && (
                  <button
                    onClick={() => router.push(`/member/applications/${applicationId}`)}
                    className="w-full py-3 rounded-xl text-white font-medium transition-all hover:opacity-90"
                    style={{ background: 'var(--primary)' }}
                  >
                    {isRtl ? 'عرض طلبي' : 'View My Application'}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl font-medium transition-all hover:opacity-80"
                  style={{ color: 'var(--text)', border: '1px solid var(--border)' }}
                >
                  {isRtl ? 'تصفّح المزيد من البرامج' : 'Browse More Programs'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/30 mb-2">
                  {isRtl ? program.programTypeAr : program.programType}
                </span>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                  {isRtl ? program.titleAr : program.title}
                </h2>
              </div>

              {/* Select Session */}
              <div className="mb-5">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  {isRtl ? 'اختر الجلسة' : 'Select Session'} *
                </label>
                <div className="space-y-2">
                  {program.upcomingSessions.map((session, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedSessionIdx(idx)
                        if (numberOfAttendees > session.spotsAvailable) {
                          setNumberOfAttendees(session.spotsAvailable)
                        }
                      }}
                      className={`w-full text-start p-3 rounded-xl border transition-all ${
                        selectedSessionIdx === idx
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-2 ring-blue-500/20'
                          : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                      }`}
                      style={selectedSessionIdx !== idx ? { background: 'var(--input-bg)' } : undefined}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedSessionIdx === idx ? 'border-blue-500' : 'border-gray-300 dark:border-white/20'
                          }`}>
                            {selectedSessionIdx === idx && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                              {new Date(session.date).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--muted)' }}>
                              {isRtl ? session.locationAr : session.location}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            session.spotsAvailable < 5
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {session.spotsAvailable} {isRtl ? 'مقعد متاح' : 'spots'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Attendees */}
              <div className="mb-5">
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                  {isRtl ? 'عدد الحاضرين' : 'Number of Attendees'} *
                </label>
                <input
                  type="number"
                  min={1}
                  max={maxSpots}
                  value={numberOfAttendees}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(maxSpots, parseInt(e.target.value) || 1))
                    setNumberOfAttendees(val)
                  }}
                  className="w-full px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={inputStyle}
                />
              </div>

              {/* Attendee Details */}
              <div className="mb-5">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  {isRtl ? 'تفاصيل الحاضرين' : 'Attendee Details'}
                </label>
                <div className="space-y-3">
                  {attendeeDetails.map((att, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-gray-200 dark:border-white/10" style={{ background: 'var(--input-bg)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                          {isRtl ? `حاضر ${idx + 1}` : `Attendee ${idx + 1}`}
                        </span>
                        {numberOfAttendees > 1 && (
                          <button
                            onClick={() => removeAttendee(idx)}
                            className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          >
                            {isRtl ? 'حذف' : 'Remove'}
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder={isRtl ? 'الاسم' : 'Name'}
                          value={att.name}
                          onChange={(e) => updateAttendee(idx, 'name', e.target.value)}
                          className="px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          style={inputStyle}
                        />
                        <input
                          type="email"
                          placeholder={isRtl ? 'البريد الإلكتروني' : 'Email'}
                          value={att.email}
                          onChange={(e) => updateAttendee(idx, 'email', e.target.value)}
                          className="px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          style={inputStyle}
                        />
                        <input
                          type="tel"
                          placeholder={isRtl ? 'الهاتف' : 'Phone'}
                          value={att.phone}
                          onChange={(e) => updateAttendee(idx, 'phone', e.target.value)}
                          className="px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {numberOfAttendees < maxSpots && (
                  <button
                    onClick={addAttendee}
                    className="mt-2 text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: 'var(--primary)' }}
                  >
                    + {isRtl ? 'إضافة حاضر' : 'Add Attendee'}
                  </button>
                )}
              </div>

              {/* Company Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                  {isRtl ? 'اسم الشركة' : 'Company Name'} *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={inputStyle}
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                  {isRtl ? 'البريد الإلكتروني' : 'Email'} *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={inputStyle}
                />
              </div>

              {/* Member Tier */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                  {isRtl ? 'فئة العضوية' : 'Member Tier'}
                </label>
                <select
                  value={memberTier}
                  onChange={(e) => setMemberTier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  style={inputStyle}
                >
                  <option value="Standard">{isRtl ? 'قياسي' : 'Standard'}</option>
                  <option value="Premium">{isRtl ? 'مميز' : 'Premium'}</option>
                  <option value="Elite Plus">{isRtl ? 'النخبة بلس' : 'Elite Plus'}</option>
                </select>
              </div>

              {/* Message to Organizer */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                  {isRtl ? 'رسالة للمنظم (اختياري)' : 'Message to Organizer (optional)'}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  style={inputStyle}
                />
              </div>

              {/* Error */}
              {submitError && (
                <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {submitError}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="w-full py-3 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: 'var(--primary)' }}
              >
                {submitting
                  ? (isRtl ? 'جارٍ الإرسال...' : 'Submitting...')
                  : (isRtl ? 'تأكيد الحجز' : 'Confirm Booking')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page Component ────────────────────────────────────────────────────
export default function KnowledgeSharingPage() {
  const { locale, dir } = useI18n()
  const isRtl = locale === 'ar'

  // Prototype: always true
  const isMember = true

  const [activeTab, setActiveTab] = useState<'browse' | 'query'>('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterProgramType, setFilterProgramType] = useState('')
  const [filterSector, setFilterSector] = useState('')
  const [filterFormat, setFilterFormat] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterCertification, setFilterCertification] = useState(false)
  const [sortBy, setSortBy] = useState('upcoming')
  const [loading, setLoading] = useState(true)
  const [bookingProgram, setBookingProgram] = useState<Program | null>(null)

  // Query form state
  const [qCompanyName, setQCompanyName] = useState('')
  const [qEmail, setQEmail] = useState('')
  const [qMemberTier, setQMemberTier] = useState('Standard')
  const [qProgramType, setQProgramType] = useState('')
  const [qProgramName, setQProgramName] = useState('')
  const [qDescription, setQDescription] = useState('')
  const [qAttachment, setQAttachment] = useState<string>('')
  const [qSubmitting, setQSubmitting] = useState(false)
  const [qSuccess, setQSuccess] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  // Compute stats
  const totalPrograms = PROGRAMS.length
  const upcomingSessionsThisMonth = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    return PROGRAMS.reduce((count, p) => {
      return count + p.upcomingSessions.filter((s) => {
        const d = new Date(s.date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      }).length
    }, 0)
  }, [])
  const trainingFormats = 3 // In-Person, Online, Hybrid
  const certifiedCount = useMemo(() => PROGRAMS.filter((p) => p.certificationOffered).length, [])

  // Unique filter values
  const sectors = useMemo(() => [...new Set(PROGRAMS.map((p) => p.sector))], [])

  // Featured programs
  const featuredPrograms = useMemo(() => PROGRAMS.filter((p) => p.isFeatured), [])

  // Active filter chips
  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string }[] = []
    if (filterProgramType) chips.push({ key: 'programType', label: isRtl ? (filterProgramType === 'Knowledge Series' ? 'سلسلة المعرفة' : 'برنامج التطوير المهني') : filterProgramType })
    if (filterSector) chips.push({ key: 'sector', label: isRtl ? (sectorsAr[filterSector] || filterSector) : filterSector })
    if (filterFormat) chips.push({ key: 'format', label: isRtl ? (filterFormat === 'In-Person' ? 'حضوري' : filterFormat === 'Online' ? 'عبر الإنترنت' : 'مدمج') : filterFormat })
    if (filterLanguage) chips.push({ key: 'language', label: isRtl ? (filterLanguage === 'English' ? 'إنجليزي' : filterLanguage === 'Arabic' ? 'عربي' : 'ثنائي اللغة') : filterLanguage })
    if (filterLevel) chips.push({ key: 'level', label: isRtl ? (filterLevel === 'Beginner' ? 'مبتدئ' : filterLevel === 'Intermediate' ? 'متوسط' : 'متقدم') : filterLevel })
    if (filterCertification) chips.push({ key: 'certification', label: isRtl ? 'شهادة معتمدة' : 'Certified' })
    return chips
  }, [filterProgramType, filterSector, filterFormat, filterLanguage, filterLevel, filterCertification, isRtl])

  const removeFilter = useCallback((key: string) => {
    switch (key) {
      case 'programType': setFilterProgramType(''); break
      case 'sector': setFilterSector(''); break
      case 'format': setFilterFormat(''); break
      case 'language': setFilterLanguage(''); break
      case 'level': setFilterLevel(''); break
      case 'certification': setFilterCertification(false); break
    }
  }, [])

  const clearAllFilters = useCallback(() => {
    setSearchQuery('')
    setDebouncedSearch('')
    setFilterProgramType('')
    setFilterSector('')
    setFilterFormat('')
    setFilterLanguage('')
    setFilterLevel('')
    setFilterCertification(false)
    setSortBy('upcoming')
  }, [])

  // Filter + sort
  const filteredPrograms = useMemo(() => {
    let results = [...PROGRAMS]

    // Search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      results = results.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.titleAr.includes(q) ||
        p.provider.toLowerCase().includes(q) ||
        p.providerAr.includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.descriptionAr.includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.tagsAr.some((t) => t.includes(q))
      )
    }

    // Filters
    if (filterProgramType) results = results.filter((p) => p.programType === filterProgramType)
    if (filterSector) results = results.filter((p) => p.sector === filterSector)
    if (filterFormat) results = results.filter((p) => p.format === filterFormat)
    if (filterLanguage) results = results.filter((p) => p.language === filterLanguage)
    if (filterLevel) results = results.filter((p) => p.level === filterLevel)
    if (filterCertification) results = results.filter((p) => p.certificationOffered)

    // Sort
    switch (sortBy) {
      case 'upcoming': {
        const getEarliestSession = (p: Program) => {
          if (p.upcomingSessions.length === 0) return Infinity
          return Math.min(...p.upcomingSessions.map((s) => new Date(s.date).getTime()))
        }
        results.sort((a, b) => getEarliestSession(a) - getEarliestSession(b))
        break
      }
      case 'newest':
        results.sort((a, b) => {
          const aMax = Math.max(...a.upcomingSessions.map((s) => new Date(s.date).getTime()))
          const bMax = Math.max(...b.upcomingSessions.map((s) => new Date(s.date).getTime()))
          return bMax - aMax
        })
        break
      case 'most-spots': {
        const getTotalSpots = (p: Program) => p.upcomingSessions.reduce((sum, s) => sum + s.spotsAvailable, 0)
        results.sort((a, b) => getTotalSpots(b) - getTotalSpots(a))
        break
      }
    }

    return results
  }, [debouncedSearch, filterProgramType, filterSector, filterFormat, filterLanguage, filterLevel, filterCertification, sortBy])

  // Query form submit
  const handleQuerySubmit = async () => {
    if (!qCompanyName.trim() || !qEmail.trim() || qDescription.trim().length < 20) return
    setQSubmitting(true)
    try {
      const body = {
        requestType: 'TRAINING_QUERY',
        companyName: qCompanyName.trim(),
        email: qEmail.trim(),
        memberTier: qMemberTier,
        programType: qProgramType,
        programName: qProgramName.trim(),
        queryText: qDescription.trim(),
        attachmentName: qAttachment || '',
      }
      const res = await fetch('/api/services/knowledge-sharing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Request failed')
      setQSuccess(true)
    } catch {
      // For prototype, show success anyway
      setQSuccess(true)
    } finally {
      setQSubmitting(false)
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isMember) {
    return <MemberAccessGuard locale={locale} />
  }

  const inputStyle = { background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }

  // Helper: get next session for a program
  const getNextSession = (p: Program): ProgramSession | null => {
    if (p.upcomingSessions.length === 0) return null
    const now = new Date()
    const upcoming = p.upcomingSessions
      .filter((s) => new Date(s.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return upcoming[0] || p.upcomingSessions[0]
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }} dir={dir}>
      {/* ─── Gradient Header Banner ─────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1e3a5f] to-[#0f2847]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-400/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 relative">
          <Link
            href="/services"
            className="inline-flex items-center text-white/50 hover:text-white/80 mb-6 transition-colors text-sm"
          >
            <svg className="w-4 h-4 me-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {isRtl ? 'العودة لدليل الخدمات' : 'Back to Service Directory'}
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {isRtl ? 'برامج المعرفة والتطوير المهني' : 'Knowledge Sharing & Upskilling Programs'}
          </h1>
          <p className="text-white/60 max-w-2xl mb-8">
            {isRtl
              ? 'عزّز قدراتك مع برامج التدريب وجلسات المعرفة المنتقاة من غرفة أبوظبي'
              : "Enhance your capabilities with ADCCI's curated training programs and knowledge sessions"}
          </p>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl p-4 bg-white/10 backdrop-blur-sm border border-white/10">
              <p className="text-2xl font-bold text-white">{totalPrograms}</p>
              <p className="text-xs text-white/50">{isRtl ? 'إجمالي البرامج' : 'Total Programs'}</p>
            </div>
            <div className="rounded-xl p-4 bg-white/10 backdrop-blur-sm border border-white/10">
              <p className="text-2xl font-bold text-white">{upcomingSessionsThisMonth}</p>
              <p className="text-xs text-white/50">{isRtl ? 'جلسات هذا الشهر' : 'Sessions This Month'}</p>
            </div>
            <div className="rounded-xl p-4 bg-white/10 backdrop-blur-sm border border-white/10">
              <p className="text-2xl font-bold text-white">{trainingFormats}</p>
              <p className="text-xs text-white/50">{isRtl ? 'أنماط التدريب' : 'Training Formats'}</p>
            </div>
            <div className="rounded-xl p-4 bg-white/10 backdrop-blur-sm border border-white/10">
              <p className="text-2xl font-bold text-white">{certifiedCount}</p>
              <p className="text-xs text-white/50">{isRtl ? 'برامج معتمدة' : 'Certified Programs'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tabs ───────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === 'browse'
                ? 'text-white shadow-md'
                : 'hover:opacity-80'
            }`}
            style={
              activeTab === 'browse'
                ? { background: 'var(--primary)', color: '#fff' }
                : { background: 'var(--panel)', color: 'var(--muted)', border: '1px solid var(--border)' }
            }
          >
            {isRtl ? 'تصفح البرامج' : 'Browse Programs'}
          </button>
          <button
            onClick={() => setActiveTab('query')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === 'query'
                ? 'text-white shadow-md'
                : 'hover:opacity-80'
            }`}
            style={
              activeTab === 'query'
                ? { background: 'var(--primary)', color: '#fff' }
                : { background: 'var(--panel)', color: 'var(--muted)', border: '1px solid var(--border)' }
            }
          >
            {isRtl ? 'أرسل استفساراً' : 'Submit a Query'}
          </button>
        </div>
      </div>

      {/* ─── BROWSE PROGRAMS TAB ────────────────────────────────────────── */}
      {activeTab === 'browse' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Featured Programs */}
          {featuredPrograms.length > 0 && !debouncedSearch && activeFilters.length === 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>
                {isRtl ? 'البرامج المميزة' : 'Featured Programs'}
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
                {featuredPrograms.map((program) => {
                  const nextSession = getNextSession(program)
                  return (
                    <button
                      key={program.id}
                      onClick={() => setBookingProgram(program)}
                      className="flex-shrink-0 w-[340px] snap-start text-start p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/10 border border-blue-200/50 dark:border-blue-700/30 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/30">
                          {isRtl ? program.programTypeAr : program.programType}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${sectorColors[program.sector] || ''}`}>
                          {isRtl ? program.sectorAr : program.sector}
                        </span>
                        <span className="ms-auto px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                          {isRtl ? 'مميز' : 'Featured'}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text)' }}>
                        {isRtl ? program.titleAr : program.title}
                      </h3>
                      <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>
                        {isRtl ? program.providerAr : program.provider}
                      </p>
                      <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--muted)' }}>
                        {isRtl ? program.descriptionAr : program.description}
                      </p>
                      {nextSession && (
                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {new Date(nextSession.date).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className={nextSession.spotsAvailable < 5 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                            {nextSession.spotsAvailable} {isRtl ? 'مقعد' : 'spots'}
                          </span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* Search + Filters */}
          <div className="rounded-2xl p-5 theme-panel mb-6">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRtl ? 'ابحث عن البرامج بالاسم أو الموضوع أو المزود...' : 'Search programs by name, topic, or provider...'}
                  className="w-full px-3 py-2.5 ps-10 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={inputStyle}
                  dir={isRtl ? 'rtl' : 'ltr'}
                />
                <svg className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {/* Program Type */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'نوع البرنامج' : 'Program Type'}
                </label>
                <select
                  value={filterProgramType}
                  onChange={(e) => setFilterProgramType(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  style={inputStyle}
                >
                  <option value="">{isRtl ? 'الكل' : 'All'}</option>
                  <option value="Knowledge Series">{isRtl ? 'سلسلة المعرفة' : 'Knowledge Series'}</option>
                  <option value="Upskilling Program">{isRtl ? 'برنامج التطوير المهني' : 'Upskilling Program'}</option>
                </select>
              </div>

              {/* Sector */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'القطاع' : 'Sector'}
                </label>
                <select
                  value={filterSector}
                  onChange={(e) => setFilterSector(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  style={inputStyle}
                >
                  <option value="">{isRtl ? 'الكل' : 'All'}</option>
                  {sectors.map((s) => (
                    <option key={s} value={s}>{isRtl ? (sectorsAr[s] || s) : s}</option>
                  ))}
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'النمط' : 'Format'}
                </label>
                <select
                  value={filterFormat}
                  onChange={(e) => setFilterFormat(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  style={inputStyle}
                >
                  <option value="">{isRtl ? 'الكل' : 'All'}</option>
                  <option value="In-Person">{isRtl ? 'حضوري' : 'In-Person'}</option>
                  <option value="Online">{isRtl ? 'عبر الإنترنت' : 'Online'}</option>
                  <option value="Hybrid">{isRtl ? 'مدمج' : 'Hybrid'}</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'اللغة' : 'Language'}
                </label>
                <select
                  value={filterLanguage}
                  onChange={(e) => setFilterLanguage(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  style={inputStyle}
                >
                  <option value="">{isRtl ? 'الكل' : 'All'}</option>
                  <option value="English">{isRtl ? 'إنجليزي' : 'English'}</option>
                  <option value="Arabic">{isRtl ? 'عربي' : 'Arabic'}</option>
                  <option value="Bilingual">{isRtl ? 'ثنائي اللغة' : 'Bilingual'}</option>
                </select>
              </div>

              {/* Level */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'المستوى' : 'Level'}
                </label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  style={inputStyle}
                >
                  <option value="">{isRtl ? 'الكل' : 'All'}</option>
                  <option value="Beginner">{isRtl ? 'مبتدئ' : 'Beginner'}</option>
                  <option value="Intermediate">{isRtl ? 'متوسط' : 'Intermediate'}</option>
                  <option value="Advanced">{isRtl ? 'متقدم' : 'Advanced'}</option>
                </select>
              </div>

              {/* Certification Toggle */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'شهادة' : 'Certification'}
                </label>
                <button
                  onClick={() => setFilterCertification(!filterCertification)}
                  className={`w-full px-2 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                    filterCertification
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                      : ''
                  }`}
                  style={!filterCertification ? inputStyle : undefined}
                >
                  {filterCertification
                    ? (isRtl ? 'معتمدة فقط' : 'Certified Only')
                    : (isRtl ? 'الكل' : 'All')}
                </button>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'الترتيب' : 'Sort'}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  style={inputStyle}
                >
                  <option value="upcoming">{isRtl ? 'الأقرب موعداً' : 'Upcoming First'}</option>
                  <option value="newest">{isRtl ? 'الأحدث' : 'Newest'}</option>
                  <option value="most-spots">{isRtl ? 'الأكثر مقاعد' : 'Most Spots'}</option>
                </select>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                {activeFilters.map((chip) => (
                  <span
                    key={chip.key}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30"
                  >
                    {chip.label}
                    <button onClick={() => removeFilter(chip.key)} className="ms-0.5 hover:text-blue-900 dark:hover:text-blue-100">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                <button onClick={clearAllFilters} className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                  {isRtl ? 'مسح الكل' : 'Clear All'}
                </button>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {isRtl
                ? `عرض ${filteredPrograms.length} برنامج`
                : `Showing ${filteredPrograms.length} programs`}
            </p>
          </div>

          {/* Program Grid / Loading / Empty */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProgramCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredPrograms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program) => {
                const nextSession = getNextSession(program)
                return (
                  <div key={program.id} className="rounded-2xl p-6 theme-panel hover:shadow-lg transition-all group">
                    {/* Badges Row */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/30">
                        {isRtl ? program.programTypeAr : program.programType}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${sectorColors[program.sector] || ''}`}>
                        {isRtl ? program.sectorAr : program.sector}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${formatColors[program.format] || ''}`}>
                        {isRtl ? program.formatAr : program.format}
                      </span>
                      {program.certificationOffered && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {isRtl ? 'معتمد' : 'Cert.'}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text)' }}>
                      {isRtl ? program.titleAr : program.title}
                    </h3>

                    {/* Provider */}
                    <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>
                      {isRtl ? program.providerAr : program.provider}
                    </p>

                    {/* Description */}
                    <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--muted)' }}>
                      {isRtl ? program.descriptionAr : program.description}
                    </p>

                    {/* Meta Tags: Duration, Level, Language */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-4">
                      <span className="px-2 py-0.5 text-xs rounded-md border" style={{ color: 'var(--muted)', borderColor: 'var(--border)', background: 'var(--panel)' }}>
                        {isRtl ? program.durationAr : program.duration}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-md border ${levelColors[program.level] || ''}`}>
                        {isRtl ? program.levelAr : program.level}
                      </span>
                      <span className="px-2 py-0.5 text-xs rounded-md border" style={{ color: 'var(--muted)', borderColor: 'var(--border)', background: 'var(--panel)' }}>
                        {program.language === 'Bilingual'
                          ? (isRtl ? 'ثنائي اللغة' : 'Bilingual')
                          : program.language === 'Arabic'
                            ? (isRtl ? 'عربي' : 'Arabic')
                            : (isRtl ? 'إنجليزي' : 'English')}
                      </span>
                    </div>

                    {/* Next Session */}
                    {nextSession && (
                      <div className="flex items-center gap-2 text-xs mb-4" style={{ color: 'var(--muted)' }}>
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {isRtl ? 'الجلسة القادمة: ' : 'Next: '}
                          {new Date(nextSession.date).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className={`font-medium ${nextSession.spotsAvailable < 5 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {nextSession.spotsAvailable} {isRtl ? 'مقعد' : 'spots'}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                      <button
                        onClick={() => {
                          setActiveTab('query')
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className="text-xs font-medium transition-colors hover:opacity-80"
                        style={{ color: 'var(--primary)' }}
                      >
                        {isRtl ? 'أرسل استفساراً' : 'Submit Query'}
                      </button>
                      <button
                        onClick={() => setBookingProgram(program)}
                        className="px-4 py-2 rounded-lg text-xs font-medium text-white transition-colors hover:opacity-90"
                        style={{ background: 'var(--primary)' }}
                      >
                        {isRtl ? 'عرض وحجز' : 'View & Book'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl theme-panel">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400 dark:text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="mb-2" style={{ color: 'var(--text)' }}>
                {isRtl ? 'لا توجد برامج مطابقة' : 'No programs match your filters'}
              </p>
              <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
                {isRtl ? 'جرّب تعديل معايير البحث أو مسح الفلاتر' : 'Try adjusting your search criteria or clearing filters'}
              </p>
              <button onClick={clearAllFilters} className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                {isRtl ? 'مسح جميع الفلاتر' : 'Clear All Filters'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── SUBMIT A QUERY TAB ─────────────────────────────────────────── */}
      {activeTab === 'query' && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="rounded-2xl p-6 sm:p-8 theme-panel">
            {qSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                  {isRtl ? 'تم إرسال استفسارك' : 'Query Submitted Successfully'}
                </h3>
                <p className="mb-6" style={{ color: 'var(--muted)' }}>
                  {isRtl
                    ? 'سيتواصل معك فريقنا خلال يوم عمل واحد.'
                    : 'Our team will get back to you within 1 business day.'}
                </p>
                <button
                  onClick={() => {
                    setQSuccess(false)
                    setQCompanyName('')
                    setQEmail('')
                    setQMemberTier('Standard')
                    setQProgramType('')
                    setQProgramName('')
                    setQDescription('')
                    setQAttachment('')
                  }}
                  className="px-6 py-2.5 rounded-xl text-white font-medium transition-colors hover:opacity-90"
                  style={{ background: 'var(--primary)' }}
                >
                  {isRtl ? 'إرسال استفسار آخر' : 'Submit Another Query'}
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>
                  {isRtl ? 'أرسل استفساراً' : 'Submit a Training Query'}
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
                  {isRtl
                    ? 'أخبرنا عن احتياجاتك التدريبية وسيتواصل معك فريقنا'
                    : 'Tell us about your training needs and our team will get in touch'}
                </p>

                <div className="space-y-4">
                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                      {isRtl ? 'اسم الشركة' : 'Company Name'} *
                    </label>
                    <input
                      type="text"
                      value={qCompanyName}
                      onChange={(e) => setQCompanyName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={inputStyle}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                      {isRtl ? 'البريد الإلكتروني' : 'Email'} *
                    </label>
                    <input
                      type="email"
                      value={qEmail}
                      onChange={(e) => setQEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={inputStyle}
                    />
                  </div>

                  {/* Member Tier */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                      {isRtl ? 'فئة العضوية' : 'Member Tier'}
                    </label>
                    <select
                      value={qMemberTier}
                      onChange={(e) => setQMemberTier(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      style={inputStyle}
                    >
                      <option value="Standard">{isRtl ? 'قياسي' : 'Standard'}</option>
                      <option value="Premium">{isRtl ? 'مميز' : 'Premium'}</option>
                      <option value="Elite Plus">{isRtl ? 'النخبة بلس' : 'Elite Plus'}</option>
                    </select>
                  </div>

                  {/* Program Type */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                      {isRtl ? 'نوع البرنامج' : 'Program Type'}
                    </label>
                    <select
                      value={qProgramType}
                      onChange={(e) => setQProgramType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      style={inputStyle}
                    >
                      <option value="">{isRtl ? 'اختر...' : 'Select...'}</option>
                      <option value="Knowledge Series">{isRtl ? 'سلسلة المعرفة' : 'Knowledge Series'}</option>
                      <option value="Upskilling Program">{isRtl ? 'برنامج التطوير المهني' : 'Upskilling Program'}</option>
                    </select>
                  </div>

                  {/* Program of Interest */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                      {isRtl ? 'البرنامج المهتم به' : 'Program of Interest'}
                    </label>
                    <input
                      type="text"
                      value={qProgramName}
                      onChange={(e) => setQProgramName(e.target.value)}
                      placeholder={isRtl ? 'اسم البرنامج أو الموضوع' : 'Program name or topic'}
                      className="w-full px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={inputStyle}
                    />
                  </div>

                  {/* Query Description */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                      {isRtl ? 'وصف الاستفسار' : 'Query Description'} *
                    </label>
                    <textarea
                      value={qDescription}
                      onChange={(e) => setQDescription(e.target.value)}
                      rows={4}
                      placeholder={isRtl ? 'صف احتياجاتك التدريبية بالتفصيل (20 حرف على الأقل)' : 'Describe your training needs in detail (minimum 20 characters)'}
                      className="w-full px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      style={inputStyle}
                    />
                    {qDescription.trim().length > 0 && qDescription.trim().length < 20 && (
                      <p className="mt-1 text-xs text-red-500">
                        {isRtl
                          ? `${20 - qDescription.trim().length} حرف إضافي مطلوب`
                          : `${20 - qDescription.trim().length} more characters required`}
                      </p>
                    )}
                  </div>

                  {/* Attach Document */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                      {isRtl ? 'إرفاق مستند (اختياري)' : 'Attach Document (optional)'}
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:opacity-80"
                        style={{ color: 'var(--text)', borderColor: 'var(--border)', background: 'var(--panel)' }}
                      >
                        {isRtl ? 'اختر ملف' : 'Choose File'}
                      </button>
                      <span className="text-sm truncate" style={{ color: 'var(--muted)' }}>
                        {qAttachment || (isRtl ? 'لم يتم اختيار ملف' : 'No file chosen')}
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) setQAttachment(file.name)
                        }}
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleQuerySubmit}
                    disabled={!qCompanyName.trim() || !qEmail.trim() || qDescription.trim().length < 20 || qSubmitting}
                    className="w-full py-3 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 mt-2"
                    style={{ background: 'var(--primary)' }}
                  >
                    {qSubmitting
                      ? (isRtl ? 'جارٍ الإرسال...' : 'Submitting...')
                      : (isRtl ? 'إرسال الاستفسار' : 'Submit Query')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Session Booking Modal ──────────────────────────────────────── */}
      {bookingProgram && (
        <SessionBookingModal
          program={bookingProgram}
          locale={locale}
          onClose={() => setBookingProgram(null)}
        />
      )}
    </div>
  )
}
