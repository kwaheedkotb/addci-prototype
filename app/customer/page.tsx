'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import StatusBadge from '@/components/StatusBadge'

interface Application {
  id: string
  organizationName: string
  status: string
  createdAt: string
}

interface ESGService {
  id: number
}

export default function CustomerDashboard() {
  const { locale, t } = useI18n()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [esgServiceId, setEsgServiceId] = useState<number | null>(null)

  useEffect(() => {
    fetchApplications()
    fetchESGService()
  }, [])

  async function fetchApplications() {
    try {
      const res = await fetch('/api/applications')
      const data = await res.json()
      if (data.success) {
        setApplications(data.applications)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchESGService() {
    try {
      const res = await fetch('/api/services?search=Chamber%20ESG%20Label')
      const data = await res.json()
      if (data.services && data.services.length > 0) {
        setEsgServiceId(data.services[0].id)
      }
    } catch (error) {
      console.error('Error fetching ESG service:', error)
    }
  }

  const isRtl = locale === 'ar'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* New Application Banner - Direct to Service Hub */}
      <div className="mb-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">
              {isRtl ? 'هل تريد التقديم على شهادة ESG؟' : 'Want to apply for ESG Certificate?'}
            </h2>
            <p className="text-emerald-100 text-sm">
              {isRtl
                ? 'ابدأ طلبك الجديد من خلال دليل الخدمات'
                : 'Start your new application through the Service Directory'}
            </p>
          </div>
          <Link
            href={esgServiceId ? `/services/${esgServiceId}` : '/services'}
            className="inline-flex items-center gap-2 bg-white text-emerald-700 px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-50 transition-colors whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            {isRtl ? 'ابدأ طلب جديد' : 'Start New Application'}
          </Link>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t.customer.dashboard.title}</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-4 text-gray-500">{t.customer.dashboard.noApplications}</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.customer.dashboard.applicationId}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.customer.dashboard.organization}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.customer.dashboard.status}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.customer.dashboard.createdAt}
                </th>
                <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.common.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {app.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.organizationName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                    <Link
                      href={`/customer/${app.id}`}
                      className="text-emerald-600 hover:text-emerald-900"
                    >
                      {t.common.view}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
