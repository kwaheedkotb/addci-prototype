'use client'

import { useI18n } from '@/lib/i18n'
import type { KPIFunnel } from '@/lib/kpi-mock-client'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useTheme } from 'next-themes'

interface FunnelStaticProps {
  data: KPIFunnel
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: '#3b82f6',
  UNDER_REVIEW: '#f59e0b',
  CORRECTIONS_REQUESTED: '#f97316',
  APPROVED: '#10b981',
  REJECTED: '#ef4444'
}

const SECTOR_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#64748b']

export function FunnelStatic({ data }: FunnelStaticProps) {
  const { t, dir } = useI18n()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const tooltipBg = isDark ? '#1e293b' : '#ffffff'
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0'

  // Transform data for recharts compatibility
  const pieData = data.bySector.map(item => ({
    sector: item.sector,
    count: item.count,
    approved: item.approved
  }))

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" dir={dir}>
      {/* Application Funnel */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t.kpiDashboard?.applicationFunnel || 'Application Funnel'}
        </h3>
        <div className="space-y-3">
          {data.funnel.map((stage, index) => (
            <div key={stage.stage} className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {getStatusLabel(stage.stage)}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {stage.count} ({stage.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${stage.percentage}%`,
                    backgroundColor: STATUS_COLORS[stage.stage]
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Applications by Sector */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t.kpiDashboard?.bySector || 'Applications by Sector'}
        </h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="count"
                nameKey="sector"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                labelLine={true}
              >
                {pieData.map((entry, index) => (
                  <Cell key={entry.sector} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: isDark ? '#fff' : '#000'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
