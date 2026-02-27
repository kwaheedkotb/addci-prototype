# ADCCI Digital Platform — Architecture Reference

> **Last updated:** 2026-02-28
> **Stack:** Next.js 16.0.7 · React 19.2 · Prisma 5.22 · PostgreSQL (Neon) · Tailwind CSS 4 · TypeScript 5

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Directory Structure](#2-directory-structure)
3. [Database Schema](#3-database-schema)
4. [Application Data Flow](#4-application-data-flow)
5. [API Route Inventory](#5-api-route-inventory)
6. [Staff Portal Architecture](#6-staff-portal-architecture)
7. [Member-Facing Services](#7-member-facing-services)
8. [AI Endpoints](#8-ai-endpoints)
9. [Shared Infrastructure](#9-shared-infrastructure)
10. [Theming & Internationalization](#10-theming--internationalization)
11. [Known Gaps & Technical Debt](#11-known-gaps--technical-debt)
12. [Service Build Checklist](#12-service-build-checklist)

---

## 1. Project Overview

The ADCCI Digital Platform is a bilingual (English/Arabic) web application for the Abu Dhabi Chamber of Commerce and Industry. It provides:

- **Member self-service portal** — Service discovery, ESG Label application with AI-assisted form filling, document upload with OCR
- **Staff operations portal** — Application review, status management, SLA tracking, activity audit log, AI reviewer assist
- **KPI dashboard** — Static charts with mock data (Recharts)
- **AI chat assistant** — Contextual guidance on all pages except landing

**Runtime:** All pages are client-rendered (`'use client'`). API routes run server-side via Next.js Route Handlers. Database access uses Prisma ORM with a singleton client.

---

## 2. Directory Structure

```
├── app/
│   ├── layout.tsx                          # Root layout (Geist font, Providers wrapper)
│   ├── providers.tsx                       # ThemeProvider → I18nProvider → AppContent
│   ├── page.tsx                            # Landing page (AI-powered service search)
│   ├── globals.css                         # Theme tokens, RTL rules, utility classes
│   │
│   ├── customer/
│   │   ├── page.tsx                        # Member application dashboard
│   │   ├── new/page.tsx                    # New application form
│   │   └── [id]/page.tsx                   # Application detail (member view)
│   │
│   ├── services/
│   │   ├── page.tsx                        # Service directory with filters
│   │   ├── [id]/page.tsx                   # Service detail (ESG has custom layout)
│   │   ├── [id]/apply/page.tsx             # ESG application form entry point
│   │   ├── expert-library/page.tsx         # Expert Library (member-exclusive)
│   │   ├── flagship-reports/page.tsx       # Flagship & Sectorial Reports
│   │   ├── data-hub/page.tsx               # Data Hub with chart visualizations
│   │   ├── global-tenders-hub/page.tsx     # Global Tenders with deadlines
│   │   ├── procurement-hub/page.tsx        # Supplier directory + procurement
│   │   └── market-directory/page.tsx       # Interactive map + company directory
│   │
│   ├── staff/
│   │   ├── page.tsx                        # Staff hub (KPI cards, service grid, activity)
│   │   ├── [serviceSlug]/page.tsx          # Per-service application listing
│   │   └── application/[id]/page.tsx       # Full-page application detail + AI tools
│   │
│   ├── dashboard/
│   │   └── kpi/page.tsx                    # KPI dashboard (mock data, Recharts)
│   │
│   └── api/
│       ├── services/
│       │   ├── route.ts                    # GET — list/search services
│       │   └── [id]/route.ts               # GET — single service by ID
│       │
│       ├── applications/
│       │   ├── route.ts                    # GET (legacy), POST (creates BaseApplication + EsgApplication)
│       │   └── [id]/
│       │       ├── route.ts                # GET, PUT — legacy Application model
│       │       ├── status/route.ts         # PUT — status transition + certificate gen
│       │       └── notes/route.ts          # POST — add ReviewNote
│       │
│       ├── staff/
│       │   ├── applications/
│       │   │   ├── route.ts                # GET — list BaseApplications (filter/sort/page)
│       │   │   └── [id]/route.ts           # GET, PATCH — single BaseApplication
│       │   ├── stats/route.ts              # GET — dashboard KPIs from BaseApplication
│       │   └── activity/route.ts           # GET — paginated ActivityLog feed
│       │
│       ├── ai/                             # 16 AI endpoints (all mock, see Section 8)
│       │   ├── auto-fill/route.ts
│       │   ├── chat/route.ts
│       │   ├── comment/route.ts
│       │   ├── compliance-score/route.ts
│       │   ├── document-classifier/route.ts
│       │   ├── draft-certificate/route.ts
│       │   ├── draft-report/route.ts
│       │   ├── esg-hints/route.ts
│       │   ├── ocr-review/route.ts
│       │   ├── precheck/route.ts
│       │   ├── renewal-forecast/route.ts
│       │   ├── reviewer-assist/route.ts
│       │   ├── sector-template/route.ts
│       │   ├── service-match/route.ts
│       │   ├── service-recommendations/route.ts
│       │   └── summary/route.ts
│       │
│       └── market-directory/
│           └── setup-advisor/route.ts      # POST — market setup guidance
│
├── components/
│   ├── Header.tsx                          # Global nav (hidden on landing page)
│   ├── ThemeProvider.tsx                   # next-themes wrapper (dark default)
│   ├── ThemeToggle.tsx                     # Sun/moon toggle button
│   ├── AIChatAssistant.tsx                 # Floating chat (hidden on landing)
│   ├── AIPanel.tsx                         # AI sidebar panel
│   ├── ESGAccordionForm.tsx                # Multi-section ESG form (1,738 lines)
│   ├── ProgressTracker.tsx                 # Application progress indicator
│   ├── StatusBadge.tsx                     # Member-facing status chip
│   ├── market-directory/
│   │   └── MarketMap.tsx                   # Leaflet map (dynamic import, SSR disabled)
│   ├── kpi/
│   │   ├── TopMetricsStatic.tsx
│   │   ├── TimeSeriesStatic.tsx
│   │   ├── FunnelStatic.tsx
│   │   ├── ESGPanelStatic.tsx
│   │   ├── AIPanelStatic.tsx
│   │   └── RecentApplicationsTableStatic.tsx
│   └── staff/
│       ├── index.ts                        # Barrel exports
│       ├── StaffAccessGuard.tsx            # Auth wrapper (hardcoded true)
│       ├── ApplicationTable.tsx            # Sortable, paginated data table
│       ├── ApplicationDetailPanel.tsx      # Slide-over panel (used by detail panel)
│       ├── ApplicationStatusBadge.tsx      # Color-coded status chips
│       ├── StaffFilterBar.tsx              # Search + dropdown filters
│       └── SLAIndicator.tsx                # Green/amber/red SLA badge
│
├── lib/
│   ├── prisma.ts                           # PrismaClient singleton
│   ├── i18n.tsx                            # I18nProvider + useI18n hook
│   ├── activity-log.ts                     # logActivity() helper
│   ├── staff-service-map.ts                # Slug ↔ ServiceType mapping
│   ├── kpi-mock-client.ts                  # KPI data loader (static JSON)
│   ├── expert-library-data.ts              # Static report data
│   ├── flagship-reports-data.ts            # Static report data
│   ├── data-hub-data.ts                    # Static dataset + chart data
│   ├── global-tenders-data.ts              # Static tender listings
│   ├── procurement-hub-data.ts             # Static supplier/procurement data
│   └── market-directory-data.ts            # Static company + area data
│
├── locales/
│   ├── en.json                             # English translations
│   └── ar.json                             # Arabic translations
│
├── data/mock/                              # Static KPI JSON files
│   ├── kpi-summary.json
│   ├── kpi-timeseries.json
│   ├── kpi-funnel.json
│   ├── kpi-esg.json
│   ├── kpi-ai.json
│   └── recent-applications.json
│
├── prisma/
│   ├── schema.prisma                       # Full database schema
│   └── seed.ts                             # Seed script (services, applications, staff)
│
├── scripts/
│   └── migrate-esg-applications.ts         # One-time migration: Application → BaseApplication
│
├── package.json
├── tsconfig.json
├── next.config.ts                          # Minimal (empty config)
└── postcss.config.mjs                      # Tailwind CSS v4 plugin
```

---

## 3. Database Schema

### 3.1 Enums

```prisma
enum ServiceType {
  KNOWLEDGE_SHARING
  CHAMBER_BOOST
  BUSINESS_MATCHMAKING
  ESG_LABEL
  BUSINESS_DEVELOPMENT
  BUSINESS_ENABLEMENT
  POLICY_ADVOCACY
  LOYALTY_PLUS
  AD_CONNECT_CONCIERGE
}

enum StaffApplicationStatus {
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
  PENDING_INFO
  CLOSED
}

enum StaffRole {
  ADMIN
  REVIEWER
  VIEWER
}
```

### 3.2 Staff Portal Models (Active)

These are the primary models used by the staff portal and new submissions:

```
┌──────────────┐    1:N     ┌──────────────┐
│  StaffUser   │◄───────────│BaseApplication│
│              │assignedTo  │              │
│ id           │            │ id           │
│ email        │            │ serviceType  │
│ name/nameAr  │            │ status       │
│ role         │            │ submittedBy  │
│ department   │            │ memberTier   │
└──────────────┘            │ assignedToId │
                            │ reviewedAt   │
                            │ internalNotes│
                            └──────┬───────┘
                                   │
                      ┌────────────┼────────────┐
                      │ 1:N        │ 1:1        │
               ┌──────▼──────┐ ┌───▼───────────┐
               │ ActivityLog │ │EsgApplication │
               │             │ │               │
               │ action      │ │ phoneNumber   │
               │ performedBy │ │ subSector     │
               │ performedAt │ │ country       │
               │ notes       │ │ env/soc/gov   │
               └─────────────┘ │ eoiSubmittedAt│
                               │ endorsedAt    │
                               └───────────────┘
```

**BaseApplication** holds shared workflow fields for all 9 service types. Service-specific data goes into extension models linked via 1:1 relation. Currently only **EsgApplication** exists.

### 3.3 Legacy Models (Member Portal)

The original `Application` model is still in the schema and used by some member-facing read paths:

```
┌──────────────┐    1:N     ┌──────────────┐
│ Application  │◄───────────│  ReviewNote  │
│              │            │              │
│ applicantName│            │ authorType   │
│ email        │            │ note         │
│ description  │            └──────────────┘
│ status       │
│ esg profiles │    1:1     ┌──────────────┐
│              │◄───────────│ Certificate  │
│              │            │              │
│              │            │ certNumber   │
│              │    1:N     │ validUntil   │
│              │◄─────┐    └──────────────┘
└──────────────┘      │
                ┌─────▼──────────┐
                │ApplicationDoc  │
                │                │
                │ type           │
                │ fileName       │
                │ ocrText        │
                │ aiReview       │
                └────────────────┘
```

### 3.4 Service Catalog Model

```prisma
model Service {
  id            Int      @id @default(autoincrement())
  dept          String
  platform      String   // "ADC Platform" | "TAMM" | "Affiliates Platform"
  name          String
  nameAr        String
  description   String
  descriptionAr String
  channelType   String   // "INTERNAL" | "EXTERNAL"
  externalUrl   String?
  tags          String?  // JSON array of keywords (EN)
  tagsAr        String?  // JSON array of keywords (AR)
}
```

### 3.5 Prisma Client Singleton

```typescript
// lib/prisma.ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 3.6 Environment Variables

| Variable | Purpose | Used By |
|----------|---------|---------|
| `POSTGRES_PRISMA_URL` | Pooled connection (Neon) | Prisma runtime |
| `POSTGRES_URL_NON_POOLING` | Direct connection | Prisma migrations/push |

**Important:** Prisma CLI reads `.env`, not `.env.local`. To run migrations locally:
```bash
export $(grep -v '^#' .env.local | grep -v '^$' | xargs) && npx prisma db push
```

---

## 4. Application Data Flow

### 4.1 ESG Label Submission (the only implemented submission flow)

```
Member fills ESGAccordionForm
    │
    ├── AI assists: auto-fill, compliance-score, sector-template, draft-report
    │
    ▼
POST /api/applications
    │
    ├── 1. prisma.baseApplication.create({ serviceType: 'ESG_LABEL', status: 'SUBMITTED' })
    ├── 2. prisma.esgApplication.create({ baseApplicationId, ...esgFields })
    └── 3. logActivity(id, 'ESG_LABEL', 'Application submitted...', submittedBy)
```

**Actual POST handler** (`app/api/applications/route.ts`):

```typescript
const base = await prisma.baseApplication.create({
  data: {
    serviceType: 'ESG_LABEL',
    status: 'SUBMITTED',
    submittedBy: body.organizationName || body.applicantName,
    submittedByEmail: body.email,
    memberTier: body.memberTier ?? 'Standard',
  },
})
await prisma.esgApplication.create({
  data: {
    baseApplicationId: base.id,
    phoneNumber: body.phoneNumber ?? null,
    tradeLicenseNumber: body.tradeLicenseNumber ?? null,
    subSector: body.subSector ?? null,
    country: body.country ?? null,
    environmentalProfile: body.environmentalProfile ?? null,
    socialProfile: body.socialProfile ?? null,
    governanceProfile: body.governanceProfile ?? null,
    eoiSubmittedAt: new Date(),
  },
})
```

### 4.2 Staff Review Flow

```
Staff opens /staff
    │
    ├── GET /api/staff/stats → KPI cards (totalOpen, pendingReview, resolvedToday, avgResolution)
    ├── GET /api/staff/applications?serviceType=X&status=SUBMITTED → per-service counts
    └── GET /api/staff/activity?pageSize=15 → activity feed
    │
    ▼
Staff clicks service card → /staff/{slug}
    │
    ├── GET /api/staff/applications?serviceType=X&page=1&sortBy=submittedAt → table data
    └── Parallel: 6× GET per status for status count cards
    │
    ▼
Staff clicks application row → /staff/application/{id}
    │
    ├── GET /api/staff/applications/{id} → BaseApplication + EsgApplication + ActivityLogs
    │
    ├── AI tools:
    │   ├── POST /api/ai/summary → risk assessment
    │   ├── POST /api/ai/comment → draft comments
    │   └── POST /api/ai/reviewer-assist → decision recommendation
    │
    └── PATCH /api/staff/applications/{id} → status change, assignment, notes
        │
        └── logActivity() → audit trail entry
```

### 4.3 Status Transition Rules

```
SUBMITTED → UNDER_REVIEW → APPROVED (sets reviewedAt)
                         → REJECTED (sets reviewedAt)
                         → PENDING_INFO → UNDER_REVIEW (cycle)
                         → CLOSED (sets reviewedAt)
```

Terminal statuses (`APPROVED`, `REJECTED`, `CLOSED`) trigger `reviewedAt` and `reviewedBy` to be set on the BaseApplication.

---

## 5. API Route Inventory

### 5.1 Service Catalog

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/services` | List services with optional `platform`, `department`, `search` filters |
| GET | `/api/services/[id]` | Single service by numeric ID |

### 5.2 Applications (Member-Facing)

| Method | Path | Model | Purpose |
|--------|------|-------|---------|
| GET | `/api/applications` | Application (legacy) | List member's applications |
| POST | `/api/applications` | BaseApplication + EsgApplication | Submit new ESG application |
| GET | `/api/applications/[id]` | Application (legacy) | Single application detail |
| PUT | `/api/applications/[id]` | Application (legacy) | Resubmit after corrections |
| PUT | `/api/applications/[id]/status` | Application (legacy) | Status change + certificate gen |
| POST | `/api/applications/[id]/notes` | ReviewNote | Add review note |

### 5.3 Staff Portal

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/staff/applications` | List BaseApplications (filter, sort, paginate, search) |
| GET | `/api/staff/applications` (`staffList=true`) | Return StaffUser list for assignment dropdown |
| GET | `/api/staff/applications/[id]` | Single BaseApplication with activity logs + ESG data |
| PATCH | `/api/staff/applications/[id]` | Update status, assignment, notes, rejection reason |
| GET | `/api/staff/stats` | Dashboard KPIs (totalOpen, pendingReview, resolvedToday, avgResolution) |
| GET | `/api/staff/activity` | Paginated ActivityLog feed |

### 5.4 AI Endpoints

See [Section 8](#8-ai-endpoints) for full details.

### 5.5 Market Directory

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/market-directory/setup-advisor` | Market setup guidance |

---

## 6. Staff Portal Architecture

### 6.1 Service Routing

The staff portal uses a dynamic `[serviceSlug]` route. Valid slugs are defined in `lib/staff-service-map.ts`:

```typescript
export const STAFF_SERVICE_MAP: Record<string, ServiceMeta> = {
  'knowledge-sharing':    { serviceType: 'KNOWLEDGE_SHARING',    slaDays: 1    },
  'chamber-boost':        { serviceType: 'CHAMBER_BOOST',        slaDays: 2    },
  'business-matchmaking': { serviceType: 'BUSINESS_MATCHMAKING', slaDays: 10   },
  'esg-label':            { serviceType: 'ESG_LABEL',            slaDays: null },
  'business-development': { serviceType: 'BUSINESS_DEVELOPMENT', slaDays: 2    },
  'business-enablement':  { serviceType: 'BUSINESS_ENABLEMENT',  slaDays: null },
  'policy-advocacy':      { serviceType: 'POLICY_ADVOCACY',      slaDays: null },
  'loyalty-plus':         { serviceType: 'LOYALTY_PLUS',         slaDays: null },
  'ad-connect':           { serviceType: 'AD_CONNECT_CONCIERGE', slaDays: null },
}
```

Invalid slugs trigger `notFound()`. Reverse lookup available via `SERVICE_TYPE_TO_SLUG`.

### 6.2 Shared Staff Components

All exported from `components/staff/index.ts`:

| Component | Props | Purpose |
|-----------|-------|---------|
| `StaffAccessGuard` | `isAuthorized`, `children` | Auth wrapper (currently hardcoded `true`) |
| `ApplicationTable` | `applications`, `totalCount`, `page`, `onSort`, etc. | Sortable paginated table with bulk select |
| `ApplicationStatusBadge` | `status` | Color-coded status chip (6 statuses) |
| `StaffFilterBar` | `searchQuery`, `filters`, `activeFilters`, etc. | Search input + dynamic dropdown filters |
| `SLAIndicator` | `submittedAt`, `slaDays` | Green/amber/red SLA badge |
| `ApplicationDetailPanel` | `applicationId`, `serviceType`, `onClose` | Slide-over detail panel |

### 6.3 Application Detail Page

`app/staff/application/[id]/page.tsx` (613 lines) provides:

- Application info grid
- Activity log timeline
- Internal notes editing
- AI Reviewer Assistant (comprehensive analysis with decision recommendation)
- AI Summary generation (risk assessment)
- AI Comment generation (corrections/approval/rejection drafts)
- Status action buttons (Request Corrections, Approve, Reject)
- Certificate display when approved

The page fetches from `/api/staff/applications/{id}` (BaseApplication) first, falling back to `/api/applications/{id}` (legacy Application) for backward compatibility.

### 6.4 Activity Logging

All staff actions create `ActivityLog` entries via the `logActivity()` helper:

```typescript
// lib/activity-log.ts
export async function logActivity(
  applicationId: string,
  serviceType: ServiceType,
  action: string,
  performedBy: string,
  notes?: string
) {
  return prisma.activityLog.create({
    data: { applicationId, serviceType, action, performedBy, notes: notes ?? null },
  })
}
```

Logged actions include: status changes, staff assignment/unassignment, application submission.

---

## 7. Member-Facing Services

### 7.1 Landing Page (`app/page.tsx`)

AI-powered service search with rotating placeholder prompts. Calls `/api/ai/service-match` for keyword matching and `/api/ai/service-recommendations` for contextual suggestions.

### 7.2 Service Directory (`app/services/page.tsx`)

Fetches from `GET /api/services` with filters:
- Platform: ADC Platform, TAMM, Affiliates Platform
- Department
- Free-text search (name, description, bilingual)

Special routing for 6 dedicated service pages and external URL handling.

### 7.3 ESG Label Service

The only fully implemented application flow:

| Page | Component | Purpose |
|------|-----------|---------|
| `/services/[id]` | Service detail | ESG-specific hero layout with "What You'll Need", "How It Works" |
| `/services/[id]/apply` | `ESGAccordionForm` | 4-section accordion form (1,738 lines) |

**ESGAccordionForm sections:**
1. **Applicant Info** — name, org, email, phone, trade license, sector, country
2. **ESG Profiles** — Environmental, Social, Governance descriptions + KPIs
3. **Documents** — File upload with OCR processing + AI classification
4. **Review & Submit** — Completeness check, compliance score, draft report

**AI integrations in the form:**
- `/api/ai/esg-hints` — Profile improvement suggestions
- `/api/ai/auto-fill` — Document-based field suggestions
- `/api/ai/compliance-score` — 0–100 score with E/S/G breakdown
- `/api/ai/sector-template` — Sector-specific ESG templates
- `/api/ai/draft-report` — Full markdown ESG report generation
- `/api/ai/ocr-review` — Document OCR + AI review
- `/api/ai/document-classifier` — Document type detection

### 7.4 Member-Exclusive Services (Static Data)

These 6 services use hardcoded data from `lib/` files (no database):

| Service | Data Source | Key Features |
|---------|------------|--------------|
| Expert Library | `lib/expert-library-data.ts` | Report grid, multi-select filters, detail modal |
| Flagship Reports | `lib/flagship-reports-data.ts` | Flagship + sectorial reports, sector navigator |
| Data Hub | `lib/data-hub-data.ts` | Recharts visualizations, CSV export |
| Global Tenders | `lib/global-tenders-data.ts` | Deadline countdowns, country flags |
| Procurement Hub | `lib/procurement-hub-data.ts` | Supplier directory, golden vendor badges |
| Market Directory | `lib/market-directory-data.ts` | Leaflet map (dynamic import), company grid |

### 7.5 Customer Dashboard (`app/customer/`)

- `page.tsx` — Lists member's applications from `GET /api/applications` (legacy model)
- `[id]/page.tsx` — Application detail with status tracking
- `new/page.tsx` — New application form

---

## 8. AI Endpoints

All 16 endpoints are **mock implementations** returning deterministic responses after simulated delays. None call external AI APIs. Each is a POST handler returning JSON.

| Endpoint | Delay | Purpose | Key Output |
|----------|-------|---------|------------|
| `/ai/auto-fill` | 1200ms | Fill form fields from documents | Suggested field values |
| `/ai/chat` | 800ms | Conversational assistant | Response + suggested actions |
| `/ai/comment` | 1000ms | Draft reviewer comments | Comment by type (corrections/approval/rejection) |
| `/ai/compliance-score` | 800ms | ESG compliance rating | Score 0–100, E/S/G breakdown, readiness level |
| `/ai/document-classifier` | 600ms | Classify uploaded document | Detected type + confidence (0–1) |
| `/ai/draft-certificate` | 800ms | Generate certificate text | Bilingual certificate with ESG level |
| `/ai/draft-report` | 1500ms | Generate ESG report | Markdown report (6 sections) |
| `/ai/esg-hints` | 1200ms | Profile improvement tips | Suggestions, missing areas, sample KPIs |
| `/ai/ocr-review` | 1500ms | OCR + document review | Extracted text + AI review status |
| `/ai/precheck` | 1500ms | Application completeness | Detailed feedback + sector-specific tips |
| `/ai/renewal-forecast` | 500ms | Certificate renewal timeline | Validity months, renewal date, checklist |
| `/ai/reviewer-assist` | 1000ms | Staff decision support | Assessment, recommendation, red flags, confidence |
| `/ai/sector-template` | 400ms | Sector ESG templates | E/S/G templates + example KPIs |
| `/ai/service-match` | 0ms | Keyword service matching | Matched services with confidence scores |
| `/ai/service-recommendations` | 600ms | Context-aware recommendations | Top 5 services with relevance scores |
| `/ai/summary` | 2000ms | Application risk summary | Risk level (HIGH/MEDIUM/LOW), completeness score |

**`/ai/reviewer-assist`** is the only AI endpoint that reads from the database (fetches the Application record to analyze).

**`/ai/service-match`** is the only AI endpoint that queries the Service table for real-time matching.

---

## 9. Shared Infrastructure

### 9.1 Provider Hierarchy

```
RootLayout (app/layout.tsx)
  └── Providers (app/providers.tsx)
      └── ThemeProvider (next-themes, dark default)
          └── I18nProvider (custom React Context)
              └── AppContent
                  ├── Header (hidden on landing page)
                  ├── {children}
                  └── AIChatAssistant (hidden on landing page)
```

### 9.2 Header Navigation

`components/Header.tsx` provides 5 navigation links:

| Label Key | Path | Active When |
|-----------|------|-------------|
| `t.common.home` | `/` | `pathname === '/'` |
| `t.common.serviceHub` | `/services` | `pathname.startsWith('/services')` |
| `t.common.myApplications` | `/customer` | `pathname.startsWith('/customer')` |
| `t.common.staffPortal` | `/staff` | `pathname.startsWith('/staff')` |
| `t.common.dashboard` | `/dashboard/kpi` | `pathname.startsWith('/dashboard')` |

Plus: language toggle (EN/AR capsule) and theme toggle (sun/moon).

### 9.3 KPI Dashboard

`app/dashboard/kpi/page.tsx` loads all data from `lib/kpi-mock-client.ts` which reads static JSON files from `data/mock/`. Components are in `components/kpi/`:

| Component | Data Source | Visualization |
|-----------|------------|---------------|
| `TopMetricsStatic` | `kpi-summary.json` | 8 metric cards |
| `TimeSeriesStatic` | `kpi-timeseries.json` | Recharts line/area chart |
| `FunnelStatic` | `kpi-funnel.json` | Application funnel stages |
| `ESGPanelStatic` | `kpi-esg.json` | E/S/G performance breakdown |
| `AIPanelStatic` | `kpi-ai.json` | AI processing statistics |
| `RecentApplicationsTableStatic` | `recent-applications.json` | Recent application table |

### 9.4 Fonts

Geist Sans and Geist Mono loaded via `next/font/google` in `app/layout.tsx`, exposed as CSS variables `--font-geist-sans` and `--font-geist-mono`.

### 9.5 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.0.7 | Framework |
| `react` | 19.2.0 | UI library |
| `@prisma/client` | ^5.22.0 | Database ORM |
| `next-themes` | ^0.4.6 | Dark/light mode |
| `recharts` | ^3.5.1 | Charts (KPI dashboard, Data Hub) |
| `react-leaflet` | ^5.0.0 | Interactive maps (Market Directory) |
| `leaflet.markercluster` | ^1.5.3 | Map marker clustering |
| `html2canvas` | ^1.4.1 | Screenshot capture |
| `tailwindcss` | ^4 | Utility CSS framework |

---

## 10. Theming & Internationalization

### 10.1 Theme System

Defined in `app/globals.css` using CSS custom properties:

**Core tokens:**

| Token | Light | Dark |
|-------|-------|------|
| `--bg` | `#ffffff` | `#001620` |
| `--panel` | `#ffffff` | `#071824` |
| `--text` | `#0f172a` | `#ffffff` |
| `--primary` | `#2563eb` | `#3b82f6` |
| `--accent-green` | `#16a34a` | `#22c55e` |
| `--accent-red` | `#dc2626` | `#ef4444` |
| `--accent-amber` | `#d97706` | `#f59e0b` |
| `--border` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.06)` |

**Status chip classes:** `.chip-approved`, `.chip-submitted`, `.chip-rejected`, `.chip-warning`, `.chip-review`

**Panel utility classes:** `.theme-panel` (background + border + shadow), `.theme-panel-2`

**Theme provider** (`components/ThemeProvider.tsx`):
```typescript
<NextThemesProvider
  attribute="class"          // Adds .dark to <html>
  defaultTheme="dark"
  enableSystem={true}
  storageKey="esg-portal-theme"
/>
```

### 10.2 Internationalization

Custom implementation in `lib/i18n.tsx` (not using next-intl at runtime despite it being in dependencies):

```typescript
type Locale = 'en' | 'ar'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translations            // Full translation object from locales/*.json
  dir: 'ltr' | 'rtl'
}
```

- Translations loaded from `locales/en.json` and `locales/ar.json`
- Locale persisted to `localStorage` with key `'locale'`
- Hydration-safe: renders null until mounted
- Direction (`dir`) set on root `<div>` in `AppContent`

**RTL support** in `globals.css`:
- `[dir="rtl"]` rules for text alignment, table alignment, form inputs, placeholder alignment
- `.rtl\:rotate-180` utility for flipping icons
- `[dir="rtl"] .flex-row` reverses flex direction

### 10.3 Usage Pattern

All pages and components access translations identically:

```typescript
const { locale, t, dir } = useI18n()
const isRtl = locale === 'ar'

// Use translations
<h1>{isRtl ? data.nameAr : data.name}</h1>
<p>{t.common.submit}</p>
```

Data models store bilingual fields side-by-side: `name`/`nameAr`, `description`/`descriptionAr`.

---

## 11. Known Gaps & Technical Debt

### Critical

1. **Dual Application model** — `Application` (legacy) and `BaseApplication` (staff) coexist. Member-facing reads (`/customer`, `/api/applications GET`) still query the legacy `Application` model. New submissions write to `BaseApplication`. The customer dashboard will not show newly submitted applications.

2. **No authentication** — `StaffAccessGuard` is hardcoded to `isAuthorized=true`. No login, session, or role-based access control exists anywhere.

3. **Only ESG has an extension model** — 8 of 9 service types have no service-specific model (no `KnowledgeSharingApplication`, etc.). Only `EsgApplication` exists.

4. **Only ESG has a submission form** — The `ESGAccordionForm` is the only application form. Other services have no member-facing submission flow.

### Moderate

5. **All AI endpoints are mocks** — Hardcoded responses with simulated delays. No Anthropic API calls despite the application referencing AI capabilities. `next-intl` is installed but unused at runtime.

6. **Legacy status enum mismatch** — `Application.status` uses string values (`SUBMITTED`, `UNDER_REVIEW`, `CORRECTIONS_REQUESTED`, `APPROVED`, `REJECTED`). `BaseApplication.status` uses the `StaffApplicationStatus` enum which has `PENDING_INFO` instead of `CORRECTIONS_REQUESTED`, and adds `CLOSED`.

7. **No file storage** — `ApplicationDocument.filePath` exists in schema but no file upload infrastructure (S3, Vercel Blob, etc.) is implemented. Document OCR is fully mocked.

8. **Certificate generation writes to legacy model** — `PUT /api/applications/[id]/status` creates certificates on the `Application` model, not `BaseApplication`.

### Minor

9. **6 member services are static data** — Expert Library, Flagship Reports, Data Hub, Global Tenders, Procurement Hub, Market Directory use hardcoded arrays in `lib/` files, not database records.

10. **KPI dashboard is fully mock** — Reads from static JSON files in `data/mock/`, not from database queries.

11. **`next-intl` installed but unused** — The app uses a custom `I18nProvider` instead.

---

## 12. Service Build Checklist

To add a new service (e.g., `CHAMBER_BOOST`) to the platform with full staff + member functionality:

### Database Layer

- [ ] **Create extension model** in `prisma/schema.prisma`:
  ```prisma
  model ChamberBoostApplication {
    id                String          @id @default(cuid())
    baseApplication   BaseApplication @relation(fields: [baseApplicationId], references: [id], onDelete: Cascade)
    baseApplicationId String          @unique
    // Service-specific fields here
    createdAt         DateTime        @default(now())
    updatedAt         DateTime        @updatedAt
  }
  ```
- [ ] **Add reverse relation** on `BaseApplication`:
  ```prisma
  chamberBoostApplication ChamberBoostApplication?
  ```
- [ ] **Run schema sync**: `npx prisma generate && npx prisma db push`
- [ ] **Add seed data** in `prisma/seed.ts` — create BaseApplication + extension model records

### API Layer

- [ ] **Create or update submission endpoint** (`app/api/applications/route.ts` or new route):
  - POST creates `BaseApplication` with correct `serviceType`
  - POST creates linked extension model record
  - POST calls `logActivity()`
- [ ] **Update staff applications API** (`app/api/staff/applications/route.ts`):
  - Add conditional include for the new extension model:
    ```typescript
    include: {
      chamberBoostApplication: serviceType === 'CHAMBER_BOOST' ? true : false,
    }
    ```
- [ ] **Update staff application detail API** (`app/api/staff/applications/[id]/route.ts`):
  - Add the extension model to the `include` clause in both GET and PATCH

### Member-Facing UI

- [ ] **Create application form** component (similar to `ESGAccordionForm`)
- [ ] **Create service detail page** or add routing logic in `app/services/[id]/page.tsx`
- [ ] **Create apply page** at `app/services/[id]/apply/page.tsx`

### Staff Portal

- [ ] **Verify slug exists** in `lib/staff-service-map.ts` (already present for all 9 services)
- [ ] **Verify service card** exists in `app/staff/page.tsx` `SERVICE_CARDS` array (already present for all 9)
- [ ] The `[serviceSlug]` listing page and application detail page work automatically via the service map — no changes needed

### Testing

- [ ] Submit application via form → verify BaseApplication + extension model created
- [ ] Verify `/staff/{slug}` shows the application in the table
- [ ] Verify `/staff/application/{id}` shows full detail with extension fields
- [ ] Verify status changes create ActivityLog entries
- [ ] Verify `/api/staff/stats` includes the new applications in counts
- [ ] Verify activity feed shows the new entries
