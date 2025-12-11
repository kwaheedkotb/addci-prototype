/**
 * KPI Mock Client Adapter
 *
 * This module provides mock data for the KPI dashboard.
 * All data is loaded from static JSON files in data/mock/.
 *
 * To switch to real APIs, replace these functions with actual API calls:
 * - getKPISummary() -> fetch('/api/kpi/summary')
 * - getKPITimeSeries() -> fetch('/api/kpi/timeseries')
 * - getKPIFunnel() -> fetch('/api/kpi/funnel')
 * - getKPIESG() -> fetch('/api/kpi/esg')
 * - getKPIAI() -> fetch('/api/kpi/ai')
 * - getRecentApplications() -> fetch('/api/applications?limit=8')
 */

import kpiSummary from '@/data/mock/kpi-summary.json'
import kpiTimeseries from '@/data/mock/kpi-timeseries.json'
import kpiFunnel from '@/data/mock/kpi-funnel.json'
import kpiEsg from '@/data/mock/kpi-esg.json'
import kpiAi from '@/data/mock/kpi-ai.json'
import recentApplications from '@/data/mock/recent-applications.json'

// Type definitions
export interface KPISummary {
  totalApplications: number
  applicationsThisMonth: number
  approvalRate: number
  avgProcessingDays: number
  pendingReview: number
  certificatesIssued: number
  activeOrganizations: number
  totalDocumentsProcessed: number
}

export interface ApplicationTrend {
  month: string
  submitted: number
  approved: number
  rejected: number
}

export interface ProcessingTimeTrend {
  month: string
  avgDays: number
}

export interface KPITimeSeries {
  applicationTrend: ApplicationTrend[]
  processingTime: ProcessingTimeTrend[]
}

export interface FunnelStage {
  stage: string
  count: number
  percentage: number
}

export interface SectorBreakdown {
  sector: string
  count: number
  approved: number
}

export interface KPIFunnel {
  funnel: FunnelStage[]
  bySector: SectorBreakdown[]
}

export interface ESGMetrics {
  carbonReduction?: number
  energyEfficiency?: number
  wasteManagement?: number
  waterConservation?: number
  workforceDiversity?: number
  communityPrograms?: number
  healthAndSafety?: number
  employeeWellbeing?: number
  boardStructure?: number
  compliance?: number
  riskManagement?: number
  transparency?: number
}

export interface ESGCategory {
  score: number
  trend: string
  metrics: ESGMetrics
}

export interface TopPerformer {
  organization: string
  score: number
}

export interface KPIESG {
  breakdown: {
    environmental: ESGCategory
    social: ESGCategory
    governance: ESGCategory
  }
  averageScore: number
  topPerformers: TopPerformer[]
}

export interface DocumentTypeStats {
  type: string
  count: number
  accuracy: number
}

export interface WeeklyAITrend {
  week: string
  prechecks: number
  documents: number
}

export interface KPIAI {
  prechecksRun: number
  documentClassifications: number
  ocrExtractions: number
  aiSuggestionsAccepted: number
  avgConfidenceScore: number
  processingStats: {
    avgPrecheckTime: string
    avgOcrTime: string
    avgClassificationTime: string
  }
  topDocumentTypes: DocumentTypeStats[]
  weeklyTrend: WeeklyAITrend[]
}

export interface RecentApplication {
  id: string
  organizationName: string
  sector: string
  status: string
  submittedAt: string
  esgScore: number | null
}

export interface RecentApplicationsData {
  applications: RecentApplication[]
}

// Mock client functions
export async function getKPISummary(): Promise<KPISummary> {
  // Simulate network delay for realistic feel
  await new Promise(resolve => setTimeout(resolve, 100))
  return kpiSummary as KPISummary
}

export async function getKPITimeSeries(): Promise<KPITimeSeries> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return kpiTimeseries as KPITimeSeries
}

export async function getKPIFunnel(): Promise<KPIFunnel> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return kpiFunnel as KPIFunnel
}

export async function getKPIESG(): Promise<KPIESG> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return kpiEsg as KPIESG
}

export async function getKPIAI(): Promise<KPIAI> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return kpiAi as KPIAI
}

export async function getRecentApplications(): Promise<RecentApplicationsData> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return recentApplications as RecentApplicationsData
}

// Convenience function to get all KPI data at once
export async function getAllKPIData() {
  const [summary, timeseries, funnel, esg, ai, applications] = await Promise.all([
    getKPISummary(),
    getKPITimeSeries(),
    getKPIFunnel(),
    getKPIESG(),
    getKPIAI(),
    getRecentApplications()
  ])

  return {
    summary,
    timeseries,
    funnel,
    esg,
    ai,
    applications
  }
}
