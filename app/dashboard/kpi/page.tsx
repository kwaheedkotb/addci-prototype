'use client'

import { useEffect, useState, useRef } from 'react'
import { useI18n } from '@/lib/i18n'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  TopMetricsStatic,
  TimeSeriesStatic,
  FunnelStatic,
  ESGPanelStatic,
  AIPanelStatic,
  RecentApplicationsTableStatic
} from '@/components/kpi'
import {
  getAllKPIData,
  type KPISummary,
  type KPITimeSeries,
  type KPIFunnel,
  type KPIESG,
  type KPIAI,
  type RecentApplicationsData
} from '@/lib/kpi-mock-client'

interface KPIData {
  summary: KPISummary
  timeseries: KPITimeSeries
  funnel: KPIFunnel
  esg: KPIESG
  ai: KPIAI
  applications: RecentApplicationsData
}

export default function KPIDashboardPage() {
  const { t, locale, setLocale, dir } = useI18n()
  const [data, setData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)
  const dashboardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const kpiData = await getAllKPIData()
        setData(kpiData)
      } catch (error) {
        console.error('Failed to load KPI data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleDownloadSnapshot = async () => {
    if (!dashboardRef.current) return

    try {
      // Dynamic import for html2canvas
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#f8fafc',
        scale: 2
      })

      const link = document.createElement('a')
      link.download = `kpi-dashboard-${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Failed to download snapshot:', error)
      alert(t.kpiDashboard?.downloadError || 'Failed to download snapshot. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400">{t.common?.loading || 'Loading...'}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <p className="text-red-600 dark:text-red-400">{t.common?.error || 'Error loading data'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors" dir={dir}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {t.kpiDashboard?.title || 'KPI Dashboard'}
              </h1>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {t.kpiDashboard?.subtitle || 'ESG Certificate Portal Analytics'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Download Button */}
              <button
                onClick={handleDownloadSnapshot}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t.kpiDashboard?.downloadSnapshot || 'Download Snapshot'}
              </button>

              {/* Language Toggle */}
              <button
                onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                {locale === 'en' ? 'العربية' : 'English'}
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main ref={dashboardRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Top Metrics */}
          <section>
            <TopMetricsStatic data={data.summary} />
          </section>

          {/* Time Series Charts */}
          <section>
            <TimeSeriesStatic data={data.timeseries} />
          </section>

          {/* Funnel & Sector Distribution */}
          <section>
            <FunnelStatic data={data.funnel} />
          </section>

          {/* ESG Breakdown */}
          <section>
            <ESGPanelStatic data={data.esg} />
          </section>

          {/* AI Performance */}
          <section>
            <AIPanelStatic data={data.ai} />
          </section>

          {/* Recent Applications */}
          <section>
            <RecentApplicationsTableStatic data={data.applications} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {t.kpiDashboard?.footer || 'ESG Certificate Portal - Abu Dhabi Chamber'}
          </p>
        </div>
      </footer>
    </div>
  )
}
