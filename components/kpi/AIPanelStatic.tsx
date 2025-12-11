'use client'

import { useI18n } from '@/lib/i18n'
import type { KPIAI } from '@/lib/kpi-mock-client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTheme } from 'next-themes'

interface AIPanelStaticProps {
  data: KPIAI
}

export function AIPanelStatic({ data }: AIPanelStaticProps) {
  const { t, dir } = useI18n()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const textColor = isDark ? '#94a3b8' : '#64748b'
  const tooltipBg = isDark ? '#1e293b' : '#ffffff'
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0'

  const statCards = [
    {
      label: t.kpiDashboard?.prechecksRun || 'AI Pre-checks Run',
      value: data.prechecksRun.toLocaleString(),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
    },
    {
      label: t.kpiDashboard?.documentClassifications || 'Document Classifications',
      value: data.documentClassifications.toLocaleString(),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30'
    },
    {
      label: t.kpiDashboard?.ocrExtractions || 'OCR Extractions',
      value: data.ocrExtractions.toLocaleString(),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30'
    },
    {
      label: t.kpiDashboard?.suggestionsAccepted || 'Suggestions Accepted',
      value: `${data.aiSuggestionsAccepted}%`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      ),
      color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30'
    }
  ]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors" dir={dir}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t.kpiDashboard?.aiPerformance || 'AI Performance'}
        </h3>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
          <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            {data.avgConfidenceScore}% {t.kpiDashboard?.confidence || 'Confidence'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className={`p-2 rounded-lg ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Chart */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
            {t.kpiDashboard?.weeklyTrend || 'Weekly AI Usage'}
          </h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.weeklyTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="week" tick={{ fill: textColor, fontSize: 12 }} />
                <YAxis tick={{ fill: textColor, fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '8px',
                    color: isDark ? '#fff' : '#000'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="prechecks"
                  name={t.kpiDashboard?.prechecks || 'Pre-checks'}
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="documents"
                  name={t.kpiDashboard?.documents || 'Documents'}
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Document Types Table */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
            {t.kpiDashboard?.topDocumentTypes || 'Top Document Types'}
          </h4>
          <div className="space-y-2">
            {data.topDocumentTypes.map((docType, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{docType.type}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">({docType.count})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${docType.accuracy}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {docType.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Processing Stats */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
          {t.kpiDashboard?.processingStats || 'Processing Times'}
        </h4>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {t.kpiDashboard?.avgPrecheckTime || 'Avg Pre-check'}:
            </span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {data.processingStats.avgPrecheckTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {t.kpiDashboard?.avgOcrTime || 'Avg OCR'}:
            </span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {data.processingStats.avgOcrTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {t.kpiDashboard?.avgClassificationTime || 'Avg Classification'}:
            </span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {data.processingStats.avgClassificationTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
