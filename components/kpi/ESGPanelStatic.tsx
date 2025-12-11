'use client'

import { useI18n } from '@/lib/i18n'
import type { KPIESG, ESGMetrics } from '@/lib/kpi-mock-client'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { useTheme } from 'next-themes'

interface ESGPanelStaticProps {
  data: KPIESG
}

interface ScoreCardProps {
  title: string
  score: number
  trend: string
  color: string
  metrics: ESGMetrics
  metricLabels: Record<string, string>
}

function ScoreCard({ title, score, trend, color, metrics, metricLabels }: ScoreCardProps) {
  const isPositive = trend.startsWith('+')

  return (
    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-slate-700 dark:text-slate-200">{title}</h4>
        <div className={`flex items-center text-sm ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {isPositive ? (
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          ) : (
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          )}
          {trend}
        </div>
      </div>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-bold" style={{ color }}>{score}</span>
        <span className="text-slate-500 dark:text-slate-400 mb-1">/100</span>
      </div>
      <div className="space-y-2">
        {(Object.entries(metrics) as [string, number | undefined][]).map(([key, value]) => (
          value !== undefined && (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">{metricLabels[key] || key}</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{value}%</span>
            </div>
          )
        ))}
      </div>
    </div>
  )
}

export function ESGPanelStatic({ data }: ESGPanelStaticProps) {
  const { t, dir } = useI18n()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const radarData = [
    { category: t.kpiDashboard?.environmental || 'Environmental', score: data.breakdown.environmental.score },
    { category: t.kpiDashboard?.social || 'Social', score: data.breakdown.social.score },
    { category: t.kpiDashboard?.governance || 'Governance', score: data.breakdown.governance.score }
  ]

  const envMetricLabels: Record<string, string> = {
    carbonReduction: t.wizard?.carbonEmissions || 'Carbon Reduction',
    energyEfficiency: t.wizard?.energyReduction || 'Energy Efficiency',
    wasteManagement: t.wizard?.wasteManagement || 'Waste Management',
    waterConservation: t.wizard?.waterConservation || 'Water Conservation'
  }

  const socialMetricLabels: Record<string, string> = {
    workforceDiversity: t.wizard?.workforceDiversity || 'Workforce Diversity',
    communityPrograms: t.wizard?.communityPrograms || 'Community Programs',
    healthAndSafety: t.wizard?.healthAndSafety || 'Health & Safety',
    employeeWellbeing: t.wizard?.employeeWellbeing || 'Employee Wellbeing'
  }

  const govMetricLabels: Record<string, string> = {
    boardStructure: t.wizard?.boardStructure || 'Board Structure',
    compliance: t.wizard?.complianceFrameworks || 'Compliance',
    riskManagement: t.wizard?.riskManagement || 'Risk Management',
    transparency: t.wizard?.transparency || 'Transparency'
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors" dir={dir}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t.kpiDashboard?.esgBreakdown || 'ESG Score Breakdown'}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {t.kpiDashboard?.averageScore || 'Average Score'}:
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {data.averageScore}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Radar Chart */}
        <div className="lg:col-span-1 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke={isDark ? '#334155' : '#e2e8f0'} />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
              />
              <Radar
                name="ESG Score"
                dataKey="score"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Score Cards */}
        <ScoreCard
          title={t.wizard?.environmental || 'Environmental'}
          score={data.breakdown.environmental.score}
          trend={data.breakdown.environmental.trend}
          color="#10b981"
          metrics={data.breakdown.environmental.metrics}
          metricLabels={envMetricLabels}
        />
        <ScoreCard
          title={t.wizard?.social || 'Social'}
          score={data.breakdown.social.score}
          trend={data.breakdown.social.trend}
          color="#3b82f6"
          metrics={data.breakdown.social.metrics}
          metricLabels={socialMetricLabels}
        />
        <ScoreCard
          title={t.wizard?.governance || 'Governance'}
          score={data.breakdown.governance.score}
          trend={data.breakdown.governance.trend}
          color="#8b5cf6"
          metrics={data.breakdown.governance.metrics}
          metricLabels={govMetricLabels}
        />
      </div>

      {/* Top Performers */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
          {t.kpiDashboard?.topPerformers || 'Top Performers'}
        </h4>
        <div className="flex flex-wrap gap-4">
          {data.topPerformers.map((performer, index) => (
            <div
              key={performer.organization}
              className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-4 py-2"
            >
              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-medium ${
                index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                index === 1 ? 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-200' :
                'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
              }`}>
                {index + 1}
              </span>
              <span className="text-sm text-slate-700 dark:text-slate-300">{performer.organization}</span>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{performer.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
