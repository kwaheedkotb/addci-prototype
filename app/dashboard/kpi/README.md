# KPI Dashboard

A fully static, mock-driven KPI dashboard for the ESG Certificate Portal.

## Features

- **Static/Mock-driven**: All data comes from local JSON files - no backend API calls
- **Dark/Light Theme**: Toggle between themes (default: Dark), persists via localStorage
- **Bilingual (EN/AR)**: Full English and Arabic translations with RTL support
- **Responsive**: Works on all screen sizes
- **Download Snapshot**: Export dashboard as PNG image

## Structure

```
app/dashboard/kpi/
├── page.tsx            # Main dashboard page
└── README.md           # This file

components/kpi/
├── index.ts            # Export barrel
├── TopMetricsStatic.tsx         # Top 8 metric cards
├── TimeSeriesStatic.tsx         # Application trend & processing time charts
├── FunnelStatic.tsx             # Application funnel & sector pie chart
├── ESGPanelStatic.tsx           # ESG breakdown with radar chart
├── AIPanelStatic.tsx            # AI performance metrics
└── RecentApplicationsTableStatic.tsx  # Recent applications table

data/mock/
├── kpi-summary.json        # Top-level KPI metrics
├── kpi-timeseries.json     # Monthly trends
├── kpi-funnel.json         # Status funnel & sector breakdown
├── kpi-esg.json            # ESG scores by category
├── kpi-ai.json             # AI performance stats
└── recent-applications.json # Sample applications

lib/
└── kpi-mock-client.ts      # Mock data adapter with TypeScript types
```

## Accessing the Dashboard

Visit: `/dashboard/kpi`

## Switching to Real APIs

To replace mock data with real backend APIs, modify `lib/kpi-mock-client.ts`:

### Current Implementation (Mock)

```typescript
import kpiSummary from '@/data/mock/kpi-summary.json'

export async function getKPISummary(): Promise<KPISummary> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return kpiSummary as KPISummary
}
```

### Real API Implementation

```typescript
export async function getKPISummary(): Promise<KPISummary> {
  const res = await fetch('/api/kpi/summary')
  if (!res.ok) throw new Error('Failed to fetch KPI summary')
  return res.json()
}
```

### Functions to Replace

| Function | Mock Data File | Real API Endpoint |
|----------|---------------|-------------------|
| `getKPISummary()` | `kpi-summary.json` | `GET /api/kpi/summary` |
| `getKPITimeSeries()` | `kpi-timeseries.json` | `GET /api/kpi/timeseries` |
| `getKPIFunnel()` | `kpi-funnel.json` | `GET /api/kpi/funnel` |
| `getKPIESG()` | `kpi-esg.json` | `GET /api/kpi/esg` |
| `getKPIAI()` | `kpi-ai.json` | `GET /api/kpi/ai` |
| `getRecentApplications()` | `recent-applications.json` | `GET /api/applications?limit=8` |

## Mock Data Format

### kpi-summary.json
```json
{
  "totalApplications": 248,
  "applicationsThisMonth": 42,
  "approvalRate": 78.5,
  "avgProcessingDays": 4.2,
  "pendingReview": 15,
  "certificatesIssued": 194,
  "activeOrganizations": 156,
  "totalDocumentsProcessed": 1847
}
```

### kpi-timeseries.json
```json
{
  "applicationTrend": [
    { "month": "Jul", "submitted": 28, "approved": 22, "rejected": 4 }
  ],
  "processingTime": [
    { "month": "Jul", "avgDays": 5.2 }
  ]
}
```

### kpi-funnel.json
```json
{
  "funnel": [
    { "stage": "SUBMITTED", "count": 248, "percentage": 100 }
  ],
  "bySector": [
    { "sector": "Energy", "count": 45, "approved": 38 }
  ]
}
```

### kpi-esg.json
```json
{
  "breakdown": {
    "environmental": {
      "score": 72,
      "trend": "+5%",
      "metrics": { "carbonReduction": 68, ... }
    }
  },
  "averageScore": 76.3,
  "topPerformers": [{ "organization": "...", "score": 92 }]
}
```

### kpi-ai.json
```json
{
  "prechecksRun": 312,
  "documentClassifications": 1847,
  "ocrExtractions": 1523,
  "aiSuggestionsAccepted": 89.2,
  "avgConfidenceScore": 94.5,
  "processingStats": { "avgPrecheckTime": "2.3s", ... },
  "topDocumentTypes": [{ "type": "ESG Policy", "count": 248, "accuracy": 96.2 }],
  "weeklyTrend": [{ "week": "W1", "prechecks": 52, "documents": 285 }]
}
```

### recent-applications.json
```json
{
  "applications": [{
    "id": "APP-2024-001248",
    "organizationName": "Green Energy Corp",
    "sector": "Energy",
    "status": "APPROVED",
    "submittedAt": "2024-12-10T09:30:00Z",
    "esgScore": 92
  }]
}
```

## Dependencies

- `recharts` - Charts and visualizations
- `html2canvas` - Download snapshot feature
- `next-themes` - Theme management

## i18n Keys

Translations are in `locales/en.json` and `locales/ar.json` under the `kpiDashboard` key:

```json
{
  "kpiDashboard": {
    "title": "KPI Dashboard",
    "subtitle": "ESG Certificate Portal Analytics",
    "downloadSnapshot": "Download Snapshot",
    ...
  }
}
```
