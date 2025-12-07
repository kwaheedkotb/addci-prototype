'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import AIPanel from '@/components/AIPanel'

const SECTORS = [
  'energy', 'manufacturing', 'construction', 'utilities', 'agriculture',
  'technology', 'healthcare', 'finance', 'retail', 'transportation', 'chemicals', 'other'
]

export default function NewApplication() {
  const { t } = useI18n()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    applicantName: '',
    organizationName: '',
    email: '',
    sector: '',
    description: '',
  })

  function validateForm() {
    const newErrors: Record<string, string> = {}
    if (!form.applicantName.trim()) newErrors.applicantName = t.customer.form.required
    if (!form.organizationName.trim()) newErrors.organizationName = t.customer.form.required
    if (!form.email.trim()) {
      newErrors.email = t.customer.form.required
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = t.customer.form.invalidEmail
    }
    if (!form.sector) newErrors.sector = t.customer.form.required
    if (!form.description.trim()) newErrors.description = t.customer.form.required
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function runAiPrecheck() {
    if (!form.description.trim()) {
      setErrors({ ...errors, description: t.customer.form.required })
      return
    }
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/precheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: form.description,
          sector: form.sector,
          organizationName: form.organizationName,
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          aiPrecheckResult: aiResult,
        }),
      })
      const data = await res.json()
      if (data.success) {
        router.push(`/customer/${data.application.id}`)
      }
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/customer"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 me-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t.common.back}
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t.customer.form.title}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.customer.form.applicantName}
              </label>
              <input
                type="text"
                value={form.applicantName}
                onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
                placeholder={t.customer.form.applicantNamePlaceholder}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.applicantName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.applicantName && (
                <p className="mt-1 text-sm text-red-500">{errors.applicantName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.customer.form.organizationName}
              </label>
              <input
                type="text"
                value={form.organizationName}
                onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                placeholder={t.customer.form.organizationNamePlaceholder}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.organizationName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.organizationName && (
                <p className="mt-1 text-sm text-red-500">{errors.organizationName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.customer.form.email}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={t.customer.form.emailPlaceholder}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.customer.form.sector}
              </label>
              <select
                value={form.sector}
                onChange={(e) => setForm({ ...form, sector: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.sector ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">{t.customer.form.sectorPlaceholder}</option>
                {SECTORS.map((sector) => (
                  <option key={sector} value={sector.charAt(0).toUpperCase() + sector.slice(1)}>
                    {t.customer.sectors[sector as keyof typeof t.customer.sectors]}
                  </option>
                ))}
              </select>
              {errors.sector && (
                <p className="mt-1 text-sm text-red-500">{errors.sector}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.customer.form.description}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t.customer.form.descriptionPlaceholder}
              rows={6}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* AI Precheck Section */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {t.customer.form.aiPrecheck}
            </h2>
            <button
              type="button"
              onClick={runAiPrecheck}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
            >
              {aiLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t.customer.form.aiPrecheckRunning}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {t.customer.form.aiPrecheckButton}
                </>
              )}
            </button>

            {(aiResult || aiLoading) && (
              <div className="mt-4">
                <AIPanel
                  title={t.ai.precheckTitle}
                  content={aiResult}
                  isLoading={aiLoading}
                  loadingText={t.customer.form.aiPrecheckRunning}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Link
              href="/customer"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t.common.cancel}
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? t.common.loading : t.customer.form.submitApplication}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
