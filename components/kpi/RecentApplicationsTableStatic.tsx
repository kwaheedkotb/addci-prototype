'use client'

import { useI18n } from '@/lib/i18n'
import type { RecentApplicationsData } from '@/lib/kpi-mock-client'

interface RecentApplicationsTableStaticProps {
  data: RecentApplicationsData
}

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  UNDER_REVIEW: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  CORRECTIONS_REQUESTED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
}

export function RecentApplicationsTableStatic({ data }: RecentApplicationsTableStaticProps) {
  const { t, dir, locale } = useI18n()

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      SUBMITTED: t.status?.SUBMITTED || 'Submitted',
      UNDER_REVIEW: t.status?.UNDER_REVIEW || 'Under Review',
      CORRECTIONS_REQUESTED: t.status?.CORRECTIONS_REQUESTED || 'Corrections Requested',
      APPROVED: t.status?.APPROVED || 'Approved',
      REJECTED: t.status?.REJECTED || 'Rejected'
    }
    return statusMap[status] || status
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale === 'ar' ? 'ar-AE' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors overflow-hidden" dir={dir}>
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t.kpiDashboard?.recentApplications || 'Recent Applications'}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t.customer?.dashboard?.applicationId || 'Application ID'}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t.customer?.dashboard?.organization || 'Organization'}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t.customer?.form?.sector || 'Sector'}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t.customer?.dashboard?.status || 'Status'}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t.kpiDashboard?.esgScore || 'ESG Score'}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t.customer?.dashboard?.createdAt || 'Submitted'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {data.applications.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono text-slate-900 dark:text-white">{app.id}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{app.organizationName}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{app.sector}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[app.status]}`}>
                    {getStatusLabel(app.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {app.esgScore !== null ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            app.esgScore >= 80 ? 'bg-emerald-500' :
                            app.esgScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${app.esgScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{app.esgScore}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400 dark:text-slate-500">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{formatDate(app.submittedAt)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
