'use client'

import { useI18n } from '@/lib/i18n'
import type { KPITimeSeries } from '@/lib/kpi-mock-client'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useTheme } from 'next-themes'

interface TimeSeriesStaticProps {
  data: KPITimeSeries
}

export function TimeSeriesStatic({ data }: TimeSeriesStaticProps) {
  const { t, dir } = useI18n()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const textColor = isDark ? '#94a3b8' : '#64748b'
  const tooltipBg = isDark ? '#1e293b' : '#ffffff'
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" dir={dir}>
      {/* Application Trend Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t.kpiDashboard?.applicationTrend || 'Application Trend'}
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.applicationTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fill: textColor }} />
              <YAxis tick={{ fill: textColor }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: isDark ? '#fff' : '#000'
                }}
              />
              <Legend />
              <Bar
                dataKey="submitted"
                name={t.kpiDashboard?.submitted || 'Submitted'}
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="approved"
                name={t.kpiDashboard?.approved || 'Approved'}
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="rejected"
                name={t.kpiDashboard?.rejected || 'Rejected'}
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Processing Time Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t.kpiDashboard?.processingTime || 'Average Processing Time'}
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.processingTime} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fill: textColor }} />
              <YAxis tick={{ fill: textColor }} unit=" days" />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: isDark ? '#fff' : '#000'
                }}
                formatter={(value: number) => [`${value} ${t.kpiDashboard?.days || 'days'}`, t.kpiDashboard?.avgProcessingDays || 'Avg. Processing']}
              />
              <Line
                type="monotone"
                dataKey="avgDays"
                name={t.kpiDashboard?.avgProcessingDays || 'Avg. Days'}
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
