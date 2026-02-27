# ADCCI Digital Platform — UI Standards & Component Library

> **Version:** 1.0
> **Last Updated:** 2026-02-27
> **Purpose:** Mandatory reference for all future service builds. Every new service page must follow these standards without deviation.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Design Tokens](#2-design-tokens)
3. [Layout & Grid](#3-layout--grid)
4. [Page Structure](#4-page-structure)
5. [Navigation & Routing](#5-navigation--routing)
6. [Components](#6-components)
7. [Forms](#7-forms)
8. [Modals & Panels](#8-modals--panels)
9. [Data Display Patterns](#9-data-display-patterns)
10. [Charts & Visualizations](#10-charts--visualizations)
11. [Map (Leaflet)](#11-map-leaflet)
12. [API Integration (Anthropic)](#12-api-integration-anthropic)
13. [Seed Data Conventions](#13-seed-data-conventions)
14. [File & Folder Conventions](#14-file--folder-conventions)
15. [Accessibility & UX Standards](#15-accessibility--ux-standards)
16. [Do's and Don'ts](#16-dos-and-donts)

---

## 1. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.0.7 |
| UI Library | React | 19.2.0 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| CSS Processing | @tailwindcss/postcss | ^4 |
| Dark Mode | next-themes | ^0.4.6 |
| Charts | Recharts | ^3.5.1 |
| Maps | Leaflet + react-leaflet | 1.9.4 / 5.0.0 |
| Map Clustering | leaflet.markercluster | 1.5.3 |
| Database ORM | Prisma | ^5.22.0 |
| Database | PostgreSQL (Vercel Postgres) | @vercel/postgres ^0.10.0 |
| i18n | next-intl + custom context | ^4.5.8 |
| Screenshot Export | html2canvas | ^1.4.1 |
| Fonts | Geist Sans + Geist Mono | via next/font/google |

### Key Configuration

**Tailwind v4** uses CSS-first configuration via `app/globals.css`:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --color-background: var(--bg);
  --color-foreground: var(--text);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

**PostCSS** (`postcss.config.mjs`):

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {}
  }
};
```

**TypeScript** path alias: `@/*` maps to the project root.

---

## 2. Design Tokens

All design tokens are CSS custom properties defined in `app/globals.css`. They power both light and dark modes.

### 2.1 Color Palette — Core

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--bg` | `#ffffff` | `#001620` | Page background |
| `--bg-2` | `#f8fafc` | `#001b2a` | Secondary background |
| `--panel` | `#ffffff` | `#071824` | Card/panel background |
| `--panel-2` | `#f1f5f9` | `#0a2236` | Secondary panel, skeleton bg |
| `--text` | `#0f172a` | `#ffffff` | Primary text |
| `--text-secondary` | `#475569` | `#cbd5e1` | Secondary text |
| `--muted` | `#6b7280` | `#9fb0bd` | Muted/helper text |
| `--primary` | `#2563eb` | `#3b82f6` | Primary actions, links |
| `--primary-hover` | `#1d4ed8` | `#60a5fa` | Primary hover state |
| `--accent-green` | `#16a34a` | `#22c55e` | Success, approved |
| `--accent-red` | `#dc2626` | `#ef4444` | Error, rejected |
| `--accent-amber` | `#d97706` | `#f59e0b` | Warning, corrections |
| `--border` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.06)` | Default borders |
| `--border-strong` | `rgba(0,0,0,0.15)` | `rgba(255,255,255,0.12)` | Emphasized borders |
| `--shadow` | `0 4px 12px rgba(0,0,0,0.08)` | `0 6px 18px rgba(0,0,0,0.5)` | Card shadow |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | `0 12px 36px rgba(0,0,0,0.6)` | Elevated shadow |

### 2.2 Color Palette — Status Chips

| Token | Light | Dark | Status |
|-------|-------|------|--------|
| `--chip-approved-bg` | `#dcfce7` | `rgba(34,197,94,0.15)` | Approved |
| `--chip-approved-text` | `#166534` | `#4ade80` | Approved |
| `--chip-submitted-bg` | `#dbeafe` | `rgba(59,130,246,0.15)` | Submitted |
| `--chip-submitted-text` | `#1e40af` | `#60a5fa` | Submitted |
| `--chip-rejected-bg` | `#fee2e2` | `rgba(239,68,68,0.15)` | Rejected |
| `--chip-rejected-text` | `#991b1b` | `#f87171` | Rejected |
| `--chip-warning-bg` | `#fef3c7` | `rgba(245,158,11,0.15)` | Corrections Requested |
| `--chip-warning-text` | `#92400e` | `#fbbf24` | Corrections Requested |
| `--chip-review-bg` | `#e0e7ff` | `rgba(99,102,241,0.15)` | Under Review |
| `--chip-review-text` | `#3730a3` | `#a5b4fc` | Under Review |

### 2.3 Color Palette — Input Fields

| Token | Light | Dark |
|-------|-------|------|
| `--input-bg` | `#ffffff` | `rgba(255,255,255,0.04)` |
| `--input-border` | `#d1d5db` | `rgba(255,255,255,0.1)` |
| `--input-focus` | `#2563eb` | `#3b82f6` |

### 2.4 Color Palette — Scrollbar

| Token | Light | Dark |
|-------|-------|------|
| `--scrollbar-track` | `#f1f1f1` | `#0a2236` |
| `--scrollbar-thumb` | `#c1c1c1` | `#1e3a5f` |
| `--scrollbar-thumb-hover` | `#a1a1a1` | `#2d4a6f` |

### 2.5 Brand Gradient Colors

Used on the landing page and header:

| Element | Light | Dark |
|---------|-------|------|
| Header gradient | `from-[#001B30] to-[#002040]` | Same |
| Landing page bg | `from-gray-50 via-gray-100 to-gray-200` | `from-[#000C14] via-[#001520] to-[#001B30]` |
| Primary brand color | `#003057` | `#003057` |

### 2.6 Category / Sector Badge Colors

Badges follow a consistent pattern across all services: `bg-{color}-100 dark:bg-{color}-500/20 text-{color}-800 dark:text-{color}-300 border-{color}-200 dark:border-{color}-500/30`

**Expert Library Categories:**

| Category | Color |
|----------|-------|
| Macroeconomics | blue |
| Real Estate | purple |
| Energy | emerald |
| Technology | cyan |
| Trade & Investment | amber |
| SME & Entrepreneurship | rose |

**Global Tenders Sectors:**

| Sector | Color |
|--------|-------|
| Infrastructure | blue |
| Technology | cyan |
| Energy | emerald |
| Healthcare | rose |
| Logistics | purple |
| Construction | amber |
| Consulting | indigo |
| Education | teal |

**Procurement Hub Sectors:**

| Sector | Color |
|--------|-------|
| IT Services | cyan |
| Construction | orange |
| Logistics | indigo |
| Consulting | purple |
| Facility Management | teal |
| Healthcare Supplies | rose |
| Food & Beverage | amber |
| Security Services | slate |
| Marketing & Media | pink |
| Engineering | blue |
| Legal Services | emerald |

**Market Directory Sectors:** Each sector has three properties (`bg`, `text`, `border`) stored in `sectorColors` in `lib/market-directory-data.ts`.

**Flagship Reports Sectors:**

| Sector | Color | Icon |
|--------|-------|------|
| Energy & Utilities | emerald | ⚡ |
| Real Estate & Construction | purple | 🏗️ |
| Financial Services | blue | 🏦 |
| Healthcare & Life Sciences | rose | 🏥 |
| Technology & Innovation | cyan | 💻 |
| Tourism & Hospitality | amber | ✈️ |
| Manufacturing & Industry | orange | 🏭 |
| Transportation & Logistics | indigo | 🚢 |
| Agriculture & Food Security | lime | 🌾 |
| Education & Human Capital | teal | 🎓 |

### 2.7 Platform Badge Colors

Used on the services directory (`app/services/page.tsx`):

| Platform | Light | Dark |
|----------|-------|------|
| ADC Platform | `bg-blue-100 text-blue-800` | `dark:bg-blue-500/20 dark:text-blue-300` |
| TAMM | `bg-purple-100 text-purple-800` | `dark:bg-purple-500/20 dark:text-purple-300` |
| Affiliates Platform | `bg-amber-100 text-amber-800` | `dark:bg-amber-500/20 dark:text-amber-300` |

### 2.8 Member Tier Colors

From `lib/procurement-hub-data.ts`:

| Tier | Classes |
|------|---------|
| Standard | `bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10` |
| Premium | `bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30` |
| Elite Plus | `bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30` |

### 2.9 Typography

| Element | Font Family | Size | Weight | Color |
|---------|-------------|------|--------|-------|
| Body | `Arial, Helvetica, sans-serif` (CSS) / Geist Sans (Tailwind) | 14px base | 400 | `var(--text)` |
| Page title (h1) | Geist Sans | `text-3xl` to `text-4xl` (1.875rem–2.25rem) | `font-bold` (700) | `var(--text)` or white on gradient |
| Section heading (h2) | Geist Sans | `text-xl` to `text-2xl` (1.25rem–1.5rem) | `font-bold` (700) | `var(--text)` |
| Card title (h3) | Geist Sans | `text-base` to `text-lg` (1rem–1.125rem) | `font-semibold` (600) | `var(--text)` |
| Body text | Geist Sans | `text-sm` (0.875rem) | 400 | `var(--text-secondary)` or `var(--muted)` |
| Caption/meta | Geist Sans | `text-xs` (0.75rem) | `font-medium` (500) | `var(--muted)` |
| Badge text | Geist Sans | `text-xs` (0.75rem) | `font-medium` (500) | Context-specific |
| Monospace (IDs) | Geist Mono | `text-xs` | `font-mono` | `var(--muted)` |

### 2.10 Spacing Scale

The platform uses Tailwind's default spacing scale. Commonly used values:

| Token | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Between inline badges |
| `gap-1.5` | 6px | Between stars in rating |
| `gap-2` | 8px | Between badge groups, small gaps |
| `gap-3` | 12px | Between avatar and text, button groups |
| `gap-4` | 16px | Grid gap (compact), section spacing |
| `gap-6` | 24px | Standard grid gap, section padding |
| `gap-8` | 32px | Between nav and content |
| `p-4` | 16px | Compact card padding |
| `p-6` | 24px | Standard card padding |
| `px-4 sm:px-6 lg:px-8` | 16/24/32px | Page horizontal padding |
| `mb-3` | 12px | Between card header and body |
| `mb-6` | 24px | Between page sections |
| `mb-8` | 32px | Between major sections |
| `mt-4 pt-4` | 16px | Footer section with border-top |

### 2.11 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-full` | 9999px | Badges, pills, avatar circles, language toggle |
| `rounded-2xl` | 1rem | Cards, modals |
| `rounded-xl` | 0.75rem | Buttons, inputs, map containers, avatars |
| `rounded-lg` | 0.5rem | Institution avatars, smaller elements |
| `rounded-md` | 0.375rem | Nav links |

### 2.12 Shadows

| Class | Light | Dark | Usage |
|-------|-------|------|-------|
| `shadow-sm` | Small shadow | — | KPI dashboard cards |
| `theme-panel` class | `var(--shadow)` | `var(--shadow)` | Standard card shadow |
| `hover:shadow-lg` | — | — | Card hover state |
| `shadow-2xl` | — | — | Modal overlay |
| `shadow-lg` | — | — | Header |

---

## 3. Layout & Grid

### 3.1 Page Layout Structure

```
┌─────────────────────────────────────────┐
│ Header (h-14, max-w-7xl)                │  ← components/Header.tsx
├─────────────────────────────────────────┤
│ Page Content                            │
│ ┌─────────────────────────────────────┐ │
│ │ Page Header (gradient banner)       │ │  ← Blue/service-specific gradient
│ │  Back link + Title + Subtitle       │ │
│ ├─────────────────────────────────────┤ │
│ │ Stats Strip (optional)              │ │  ← Key metrics row
│ ├─────────────────────────────────────┤ │
│ │ Filter Bar                          │ │  ← Search + filters + sort
│ ├─────────────────────────────────────┤ │
│ │ Content Grid                        │ │  ← Cards in responsive grid
│ │  (md:grid-cols-2 lg:grid-cols-3)    │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ AI Chat Assistant (floating)            │  ← Fixed bottom-right
└─────────────────────────────────────────┘
```

### 3.2 Wrapper / Container

The platform does **not** use a single consistent max-width container. Patterns vary:

| Context | Width | Padding |
|---------|-------|---------|
| Header | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` | Responsive |
| Service page content | `max-w-7xl mx-auto px-4 sm:px-6` | Responsive |
| Landing page | `max-w-2xl mx-auto` (search card) | `px-6` |
| KPI Dashboard | `max-w-7xl mx-auto p-6` | 24px all sides |
| Modals | `max-w-3xl mx-4 my-8` or `max-w-2xl` | Varies |

### 3.3 Grid System

The standard content grid:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

Special grid variants:

| Context | Grid | Gap |
|---------|------|-----|
| Standard card grid | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` | `gap-6` |
| Golden vendor strip | `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` | `gap-4` |
| Stats/metrics strip | `grid-cols-2 sm:grid-cols-2 lg:grid-cols-4` | `gap-4` |
| KPI top metrics | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` | `gap-4` |
| KPI charts (2-up) | `grid-cols-1 lg:grid-cols-2` | `gap-6` |
| ESG breakdown | `grid-cols-1 lg:grid-cols-4` | `gap-6` |
| Skeleton loading | Same as content grid | Same |

### 3.4 Split Layouts

Used in Market Directory (map + list):

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Left: Map (sticky) */}
  <div className="lg:sticky lg:top-20" style={{ height: 'calc(100vh - 200px)' }}>
    <MarketMap ... />
  </div>
  {/* Right: Company list */}
  <div className="space-y-4">
    {/* Cards */}
  </div>
</div>
```

### 3.5 Responsive Breakpoints

Tailwind v4 defaults (not customized):

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | 2-column flex, horizontal button groups |
| `md` | 768px | 2-column grid, desktop nav shows |
| `lg` | 1024px | 3-column grid, sidebar layouts |

---

## 4. Page Structure

### 4.1 Standard Service Page Anatomy

Every self-service page follows this structure:

```tsx
export default function ServicePage() {
  // 1. Access gate check (memberOnly flag)
  const [isMember] = useState(true) // Currently hardcoded
  if (!isMember) return <MemberAccessGuard ... />

  // 2. State: filters, search, modals, data
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState(...)
  const [selectedItem, setSelectedItem] = useState(null) // for modal
  const [isLoading, setIsLoading] = useState(true)

  // 3. Filtered/computed data with useMemo
  const filteredItems = useMemo(() => { ... }, [deps])

  // 4. Simulated loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Page Header (gradient banner) */}
      {/* Stats Strip (optional) */}
      {/* Filter Bar */}
      {/* Content Grid or Loading Skeletons */}
      {/* Empty State (if no results) */}
      {/* Detail Modal (if item selected) */}
    </div>
  )
}
```

### 4.2 Page Header Banner

Every service page has a gradient header banner:

```tsx
<div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    {/* Back link */}
    <Link href="/services" className="inline-flex items-center text-sm text-white/70 hover:text-white mb-4 transition-colors">
      <svg className="w-4 h-4 me-1 rtl:rotate-180" ...>
        <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      {isRtl ? 'العودة لدليل الخدمات' : 'Back to Service Directory'}
    </Link>
    {/* Title */}
    <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
    {/* Subtitle */}
    <p className="text-white/80 text-lg max-w-3xl">{subtitle}</p>
  </div>
</div>
```

### 4.3 Stats Strip

Used in Procurement Hub, Data Hub, and Market Directory:

```tsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
  {metrics.map(metric => (
    <div key={metric.id} className="theme-panel rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{metric.label}</span>
        {/* Trend indicator */}
        <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
          {metric.change}
        </span>
      </div>
      <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{metric.value}</div>
    </div>
  ))}
</div>
```

### 4.4 How Services Are Registered

Services are loaded from the database via `/api/services` in `app/services/page.tsx`. The six self-service pages have dedicated routes with hardcoded redirects in `app/services/[id]/page.tsx`:

```tsx
const DEDICATED_ROUTES: Record<string, string> = {
  'Expert Library': '/services/expert-library',
  'Global Tenders Hub': '/services/global-tenders-hub',
  'Data Hub': '/services/data-hub',
  'Flagship & Sectorial Reports': '/services/flagship-reports',
  'Procurement Hub': '/services/procurement-hub',
  'Market Directory': '/services/market-directory',
}
```

---

## 5. Navigation & Routing

### 5.1 Route Naming Convention

| Route | Pattern | Description |
|-------|---------|-------------|
| `/` | Landing page | AI-powered service finder |
| `/services` | Service hub | Directory of all services |
| `/services/{slug}` | Dedicated service | Kebab-case slug (e.g., `data-hub`, `expert-library`) |
| `/services/[id]` | Generic service detail | Dynamic route for non-dedicated services |
| `/services/[id]/apply` | Application form | ESG label application |
| `/customer` | Customer dashboard | Application list |
| `/customer/new` | New application | Form |
| `/customer/[id]` | Application detail | View/edit |
| `/staff` | Staff dashboard | Review queue |
| `/staff/[id]` | Staff review | Application review |
| `/dashboard/kpi` | KPI dashboard | Analytics |

### 5.2 How New Routes Are Registered

1. Create a directory under `app/` matching the route
2. Add a `page.tsx` file inside
3. If the service is self-service, add its slug to `DEDICATED_ROUTES` in `app/services/[id]/page.tsx`
4. Add a navigation entry in `app/services/page.tsx` in the routing logic

### 5.3 Active State Handling

In `components/Header.tsx`, active routes are detected via `usePathname()`:

```tsx
const pathname = usePathname()
const isServices = pathname.startsWith('/services')

// Active: bg-white/20 text-white
// Inactive: text-white/80 hover:bg-white/10 hover:text-white
```

### 5.4 Back Navigation

Every service page includes a back link to `/services`:

```tsx
<Link href="/services" className="inline-flex items-center text-sm text-white/70 hover:text-white mb-4 transition-colors">
  <svg className="w-4 h-4 me-1 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
  Back to Service Directory
</Link>
```

The `me-1` and `rtl:rotate-180` ensure RTL compatibility.

---

## 6. Components

### 6.1 Button

**No shared button component exists.** Buttons are styled inline with Tailwind classes. The following variants are used consistently:

#### Primary Button

```tsx
<button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
  {label}
</button>
```

Compact variant: `px-4 py-2 text-sm rounded-xl`

#### Secondary / Outline Button

```tsx
<button
  className="px-6 py-3 rounded-xl font-medium transition-colors"
  style={{ color: 'var(--primary)', border: '1px solid var(--border)' }}
>
  {label}
</button>
```

Or using Tailwind borders:
```tsx
<button className="px-6 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 font-medium rounded-xl hover:bg-white dark:hover:bg-white/10 transition-colors">
  {label}
</button>
```

#### Ghost / Text Button

```tsx
<button className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors" style={{ color: 'var(--primary)' }}>
  {label}
</button>
```

#### Destructive Button

```tsx
<button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
  Reject
</button>
```

#### Icon Button

```tsx
<button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" style={{ color: 'var(--muted)' }}>
  <svg className="w-5 h-5" .../>
</button>
```

#### Button with Loading State

```tsx
<button disabled={isSubmitting} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
  {isSubmitting ? (
    <span className="flex items-center gap-2">
      <svg className="w-4 h-4 animate-spin" .../>
      Loading...
    </span>
  ) : label}
</button>
```

### 6.2 Badge / Status Badge

**File:** `components/StatusBadge.tsx` (for application statuses)

**Props:**
```tsx
{ status: string }
```

**Application Status Badges** use CSS variable classes:

```tsx
const statusClasses: Record<Status, string> = {
  SUBMITTED: 'chip-submitted',
  UNDER_REVIEW: 'chip-review',
  CORRECTIONS_REQUESTED: 'chip-warning',
  APPROVED: 'chip-approved',
  REJECTED: 'chip-rejected',
}

<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
  {label}
</span>
```

**Service-specific badges** (defined inline in each service page) follow this pattern:

```tsx
<span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses}`}>
  {label}
</span>
```

The color pattern for all service badges: `bg-{color}-100 dark:bg-{color}-500/20 text-{color}-800 dark:text-{color}-300 border-{color}-200 dark:border-{color}-500/30`

### 6.3 Card

**No shared Card component.** Cards are built inline with consistent patterns:

#### Standard Card (used across all services)

```tsx
<div className="rounded-2xl p-6 theme-panel hover:shadow-lg transition-all group">
  {/* Header: avatar + title + badge */}
  <div className="flex items-start justify-between gap-3 mb-3">
    <div className="flex items-center gap-3 min-w-0">
      <Avatar name={name} />
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{name}</p>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>{subtitle}</p>
      </div>
    </div>
    <CategoryBadge category={category} />
  </div>

  {/* Title */}
  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
    {title}
  </h3>

  {/* Description */}
  <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--muted)' }}>
    {description}
  </p>

  {/* Tags */}
  <div className="flex flex-wrap gap-1.5 mb-3">
    {tags.slice(0, 2).map(tag => (
      <span key={tag} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--panel-2)', color: 'var(--muted)' }}>
        {tag}
      </span>
    ))}
    {tags.length > 2 && <span className="text-xs" style={{ color: 'var(--muted)' }}>+{tags.length - 2}</span>}
  </div>

  {/* Footer with actions */}
  <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
    <span className="text-xs" style={{ color: 'var(--muted)' }}>{meta}</span>
    <button className="px-4 py-2 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors">
      {actionLabel}
    </button>
  </div>
</div>
```

Key card elements:
- Container: `rounded-2xl p-6 theme-panel hover:shadow-lg transition-all group`
- Title hover: `group-hover:text-blue-600 dark:group-hover:text-blue-400`
- Text truncation: `line-clamp-2` on titles and descriptions
- Footer separator: `borderTop: '1px solid var(--border)'`

#### Dataset Card (Data Hub)

Same base pattern plus a **MiniChart** component at the top and CSV download action.

#### Tender Card (Global Tenders)

Same base pattern plus **countdown badge** and country flag emoji.

#### Supplier Card (Procurement Hub)

Same base pattern plus **StarRating** component, deal count, and save/bookmark toggle.

### 6.4 Modal

**Pattern:** Inline in each service page. No shared modal component.

```tsx
function DetailModal({ item, onClose, ... }) {
  // Escape key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" onClick={onClose}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      {/* Content */}
      <div
        className="relative w-full max-w-3xl mx-4 my-8 rounded-2xl shadow-2xl theme-panel"
        style={{ background: 'var(--panel)' }}
        onClick={e => e.stopPropagation()}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Close button (top-right) */}
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" style={{ color: 'var(--muted)' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {/* Modal body */}
        ...
      </div>
    </div>
  )
}
```

**Key behaviors:**
- Click outside (backdrop) closes modal
- Escape key closes modal
- Body scroll is locked on open, restored on close
- Max width: `max-w-3xl` (most modals) or `max-w-2xl` (smaller modals like forms)
- Top alignment: `items-start` with `my-8` margin

### 6.5 Filter Bar

**Pattern:** Inline in each service page. Consistent structure:

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
  <div className="flex flex-col lg:flex-row gap-4">
    {/* Search */}
    <div className="relative flex-1">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--muted)' }} .../>
      <input
        type="text"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 rounded-xl text-sm"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)' }}
      />
      {searchQuery && (
        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10">
          <svg className="w-4 h-4" .../>
        </button>
      )}
    </div>

    {/* Dropdown Filters */}
    <select
      value={selectedFilter}
      onChange={e => setSelectedFilter(e.target.value)}
      className="px-4 py-3 rounded-xl text-sm"
      style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)' }}
    >
      <option value="">All Categories</option>
      {categories.map(c => <option key={c} value={c}>{c}</option>)}
    </select>
  </div>

  {/* Active filter chips / results count */}
  <div className="flex items-center justify-between mt-4">
    <span className="text-sm" style={{ color: 'var(--muted)' }}>
      {filteredItems.length} results
    </span>
    {hasActiveFilters && (
      <button onClick={clearFilters} className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
        Clear all filters
      </button>
    )}
  </div>
</div>
```

### 6.6 Search Bar

- Input styling: `w-full pl-10 pr-10 py-3 rounded-xl text-sm`
- Background/border via CSS variables
- Search icon: absolute positioned left
- Clear button: absolute positioned right, appears when `searchQuery` is non-empty
- **Debounce:** Some pages use `useRef` + `setTimeout` for 300ms debounce; others filter directly via `useMemo`

```tsx
// Debounced search pattern (Expert Library, Flagship Reports)
const searchTimeoutRef = useRef<NodeJS.Timeout>()
const handleSearch = useCallback((value: string) => {
  setSearchInput(value)
  if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
  searchTimeoutRef.current = setTimeout(() => {
    setSearchQuery(value)
  }, 300)
}, [])
```

### 6.7 Active Filter Chips

Not a separate component. Filter state is tracked via individual `useState` hooks and displayed as "X results" + "Clear all filters" link.

### 6.8 Form Inputs

All form inputs use CSS variable-based global styling from `app/globals.css`:

```css
input, textarea, select {
  background: var(--input-bg);
  border-color: var(--input-border);
  color: var(--text);
}
input:focus, textarea:focus, select:focus {
  border-color: var(--input-focus);
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}
```

**Standard input:**
```tsx
<input
  type="text"
  className="w-full px-4 py-3 rounded-xl text-sm border"
  style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)' }}
/>
```

**Select:**
```tsx
<select className="px-4 py-3 rounded-xl text-sm border" style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)' }}>
```

**Textarea:**
```tsx
<textarea
  rows={4}
  className="w-full px-4 py-3 rounded-xl text-sm border resize-none"
  style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)' }}
/>
```

**Toggle switch:** Used in Procurement Hub for role switching (Buyer/Supplier):
```tsx
<div className="inline-flex rounded-xl p-1" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
  <button
    onClick={() => setMode('buyer')}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      mode === 'buyer'
        ? 'bg-blue-600 text-white shadow-sm'
        : '' /* uses var(--muted) */
    }`}
    style={mode !== 'buyer' ? { color: 'var(--muted)' } : undefined}
  >
    {buyerLabel}
  </button>
  <button
    onClick={() => setMode('supplier')}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      mode === 'supplier'
        ? 'bg-blue-600 text-white shadow-sm'
        : ''
    }`}
    style={mode !== 'supplier' ? { color: 'var(--muted)' } : undefined}
  >
    {supplierLabel}
  </button>
</div>
```

**Date input and file input:** Used in ESGAccordionForm and procurement forms with the same styling pattern as text inputs.

### 6.9 Toast / Notification

**No dedicated toast/notification component exists.** Success states are handled inline within modals:

```tsx
{submitted && (
  <div className="text-center py-12">
    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" ...>
        <path d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Submitted Successfully</h3>
    <p className="text-sm" style={{ color: 'var(--muted)' }}>Thank you for your submission.</p>
  </div>
)}
```

### 6.10 Loading Skeleton

Each service page defines its own `CardSkeleton` component. Common pattern:

```tsx
function CardSkeleton() {
  return (
    <div className="rounded-2xl p-6 theme-panel animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/10" />
        <div className="flex-1">
          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-white/10 mb-2" />
          <div className="h-3 w-20 rounded bg-gray-200 dark:bg-white/10" />
        </div>
      </div>
      <div className="h-3 w-full rounded bg-gray-200 dark:bg-white/10 mb-2" />
      <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-white/10 mb-4" />
      <div className="flex gap-2">
        <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-16" />
        <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-12" />
      </div>
    </div>
  )
}
```

**Usage:**
```tsx
{isLoading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
  </div>
) : (
  /* Real content */
)}
```

Skeleton placeholder color: `bg-gray-200 dark:bg-white/10`
Animation: `animate-pulse` (Tailwind built-in)
Skeleton count: 6 (matches typical 3-column × 2-row visible area)

### 6.11 Empty State

```tsx
<div className="text-center py-16">
  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
    <svg className="w-8 h-8" style={{ color: 'var(--muted)' }} ...>
      {/* Search or empty icon */}
    </svg>
  </div>
  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>No Results Found</h3>
  <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Try adjusting your filters or search terms.</p>
  <button onClick={clearFilters} className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
    Clear all filters
  </button>
</div>
```

### 6.12 Access Gate (Member-Only)

**`MemberAccessGuard`** — defined inline in each service page. Consistent structure:

```tsx
function MemberAccessGuard({ locale }: { locale: string }) {
  const isRtl = locale === 'ar'
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 dark:from-[#000C14] dark:via-[#001520] dark:to-[#001B30]">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full text-center">
          {/* Lock icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Members-Only Content</h2>
          {/* Description */}
          <p className="text-gray-600 dark:text-white/60 mb-8">{serviceSpecificMessage}</p>
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
              Login to Access
            </button>
            <button className="px-6 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 font-medium rounded-xl hover:bg-white dark:hover:bg-white/10 transition-colors">
              Become a Member
            </button>
          </div>
          {/* Back link */}
          <Link href="/services" className="inline-flex items-center mt-6 text-sm text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60 transition-colors">
            ← Back to Service Directory
          </Link>
        </div>
      </div>
    </div>
  )
}
```

Icon: Lock (amber-600 on amber-100 background)
Currently: `isMember` is hardcoded to `true` for demo purposes in all services.

### 6.13 Avatar / Logo Placeholder

Initials-based avatars are used across all services:

```tsx
function CompanyAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const colors = companyColors[name] || { bg: 'bg-gray-500', text: 'text-white' }
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const sizeClasses = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sizeClasses} ${colors.bg} ${colors.text} rounded-xl flex items-center justify-center font-bold flex-shrink-0`}>
      {initials}
    </div>
  )
}
```

**Size classes:**

| Size | Dimensions | Text | Border Radius |
|------|-----------|------|---------------|
| `sm` | `w-8 h-8` | `text-xs` | `rounded-xl` or `rounded-lg` |
| `md` | `w-10 h-10` | `text-sm` | `rounded-xl` or `rounded-lg` |
| `lg` | `w-14 h-14` | `text-lg` | `rounded-xl` |

**Color logic:** Each service data file exports a `companyColors` or `institutionColors` Record mapping entity names to `{ bg, text }` classes. Fallback: `bg-gray-500 text-white`.

**Initials logic:** `name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()`
For institutions with `&`: `name.split(/[\s&]+/).map(w => w[0])...`

### 6.14 Countdown / Deadline Indicator

Used in Global Tenders Hub:

```tsx
function daysUntil(deadline: string): number {
  const now = new Date(); now.setHours(0,0,0,0)
  const dl = new Date(deadline); dl.setHours(0,0,0,0)
  return Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function formatCountdown(days: number, isRtl: boolean): string {
  if (days < 0) return isRtl ? 'انتهى' : 'Expired'
  if (days === 0) return isRtl ? 'اليوم' : 'Today'
  if (days === 1) return isRtl ? 'غداً' : 'Tomorrow'
  return isRtl ? `${days} يوم` : `${days} days`
}
```

Display styling varies by urgency:
- `days <= 3`: Red text (`text-red-600`)
- `days <= 7`: Amber text (`text-amber-600`)
- `days > 7`: Green text (`text-emerald-600`)

### 6.15 Stat Tile

Used in KPI Dashboard (`components/kpi/TopMetricsStatic.tsx`):

```tsx
<div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
  <div className="flex items-center justify-between mb-4">
    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
      <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" .../>
    </div>
    {trend && (
      <span className={`text-sm font-medium ${trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
        {trend}
      </span>
    )}
  </div>
  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
</div>
```

### 6.16 Golden Vendor Badge

```tsx
function GoldenVendorBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {label}
    </span>
  )
}
```

### 6.17 Mode Toggle / Switcher

```tsx
<div className="inline-flex rounded-xl p-1" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
  {modes.map(m => (
    <button
      key={m.value}
      onClick={() => onChange(m.value)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        mode === m.value ? 'bg-blue-600 text-white shadow-sm' : ''
      }`}
      style={mode !== m.value ? { color: 'var(--muted)' } : undefined}
    >
      {m.label}
    </button>
  ))}
</div>
```

Used in: Procurement Hub (Buyer/Supplier), Market Directory (Explore/Advisor).

### 6.18 Bookmark / Save Button

Used in Procurement Hub. Uses `localStorage`:

```tsx
// State
const [savedIds, setSavedIds] = useState<string[]>([])
useEffect(() => {
  const saved = localStorage.getItem('procurement-saved-suppliers')
  if (saved) setSavedIds(JSON.parse(saved))
}, [])

// Toggle
const toggleSave = (id: string) => {
  setSavedIds(prev => {
    const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    localStorage.setItem('procurement-saved-suppliers', JSON.stringify(next))
    return next
  })
}

// Bookmark icon
<button onClick={() => toggleSave(id)}>
  <svg className={`w-5 h-5 ${isSaved ? 'text-amber-500 fill-amber-500' : ''}`}
    style={!isSaved ? { color: 'var(--muted)' } : undefined}
    fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
</button>
```

### 6.19 Star Rating

```tsx
function StarRating({ rating, reviewCount, reviewsLabel }: { rating: number; reviewCount: number; reviewsLabel: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{rating.toFixed(1)}</span>
      <span className="text-xs" style={{ color: 'var(--muted)' }}>({reviewCount} {reviewsLabel})</span>
    </div>
  )
}
```

### 6.20 Progress Tracker

**File:** `components/ProgressTracker.tsx`

**Props:** `{ status: string }`

Renders a 4-step horizontal progress bar for ESG application workflow:

| Step | Status | Color |
|------|--------|-------|
| Completed | `bg-emerald-500 text-white` (checkmark icon) | Green |
| Current (normal) | `bg-emerald-500 text-white ring-4 ring-emerald-100` | Green with ring |
| Current (corrections) | `bg-orange-500 text-white` | Orange |
| Current (rejected) | `bg-red-500 text-white` | Red |
| Upcoming | `bg-gray-200 dark:bg-gray-700` | Gray |

Connector line: `h-1 mx-2 bg-emerald-500` (completed) or `bg-gray-200 dark:bg-gray-700` (upcoming)

---

## 7. Forms

### 7.1 Standard Form Layout

Forms use vertical stacking with consistent spacing:

```tsx
<form onSubmit={handleSubmit} className="space-y-6">
  <div>
    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
      Field Label <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      required
      className="w-full px-4 py-3 rounded-xl text-sm border"
      style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)' }}
    />
  </div>
  {/* More fields */}
</form>
```

### 7.2 Label Positioning and Style

- Position: Above input (block)
- Style: `text-sm font-medium mb-2`, color `var(--text)`
- Required indicator: `<span className="text-red-500">*</span>` after label text

### 7.3 Validation

- **When:** On submit (not on blur)
- **Error message placement:** Below input
- **Error style:**

```tsx
{errors.fieldName && (
  <p className="mt-1 text-sm text-red-500">{errors.fieldName}</p>
)}
```

Input error border: `border-red-500` (via conditional class)

### 7.4 Submit Button Placement

- Aligned right (or center in modals)
- Uses loading state pattern:

```tsx
<div className="flex justify-end gap-3">
  <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium rounded-xl" style={{ color: 'var(--muted)' }}>
    Cancel
  </button>
  <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
    {isSubmitting ? 'Submitting...' : 'Submit'}
  </button>
</div>
```

### 7.5 Success State

After successful form submission, the entire form is replaced with:

```tsx
<div className="text-center py-12">
  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
    <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" ...>
      <path d="M5 13l4 4L19 7" />
    </svg>
  </div>
  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Success Title</h3>
  <p className="text-sm" style={{ color: 'var(--muted)' }}>Success description.</p>
</div>
```

### 7.6 Dynamic Field Patterns

Used in procurement forms (requirements list) and ESG form (documents):

```tsx
// Add item
<button onClick={() => setItems([...items, ''])} className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
  + Add Requirement
</button>

// Remove item
<button onClick={() => setItems(items.filter((_, idx) => idx !== index))} className="text-red-500 hover:text-red-700">
  <svg className="w-4 h-4" .../>
</button>
```

---

## 8. Modals & Panels

### 8.1 Opening and Closing

Modals are opened by setting state (typically `selectedItem`) and closed by clearing it:

```tsx
const [selectedItem, setSelectedItem] = useState<Item | null>(null)

// Open
<button onClick={() => setSelectedItem(item)}>View Details</button>

// Close
{selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
```

### 8.2 Backdrop Behavior

- **Click backdrop to close:** Yes — `onClick={onClose}` on outer container
- **Content click propagation stopped:** `onClick={e => e.stopPropagation()}`
- **Backdrop blur:** `bg-black/50 backdrop-blur-sm`

### 8.3 Modal Sizes

| Size | Class | Usage |
|------|-------|-------|
| Standard | `max-w-3xl` | Supplier detail, Report detail, Tender detail |
| Medium | `max-w-2xl` | Form modals (quote request, submit proposal) |
| Large | `max-w-4xl` | Not currently used |
| Full | Not used | — |

### 8.4 Slide-Over / Side Panel

No slide-over panels are currently implemented. All detail views use centered modals.

### 8.5 Scroll Behavior

- Body scroll: **Locked** when modal is open (`document.body.style.overflow = 'hidden'`)
- Modal scroll: `overflow-y-auto` on the outer container
- Content overflow: Handled naturally within modal body

---

## 9. Data Display Patterns

### 9.1 Tables

Used in KPI Dashboard (`RecentApplicationsTableStatic.tsx`) and Staff Portal:

```tsx
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="bg-slate-50 dark:bg-slate-700/50">
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Column
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
        <td className="px-6 py-4 text-sm">{value}</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 9.2 Lists vs Grids

- **Grids:** Default for all card-based content (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`)
- **Lists:** Used for related items in modals and for procurement request metadata
- **Split layout:** Map + list in Market Directory

### 9.3 Card Grid Responsive Behavior

| Breakpoint | Columns |
|------------|---------|
| Base (mobile) | 1 column |
| `md` (768px) | 2 columns |
| `lg` (1024px) | 3 columns |

Exception: Golden vendors strip uses `lg:grid-cols-4`, stats use `sm:grid-cols-2 lg:grid-cols-4`.

### 9.4 Pagination / Load More

**No pagination or load-more is currently implemented.** All datasets are rendered in full after filtering. This is feasible because seed data sizes are small (10–20 items per service).

**Note for future services:** If a service has >50 items, implement client-side pagination or load-more.

### 9.5 Sort + Filter + Search Interaction

All three operate simultaneously via `useMemo`:

```tsx
const filteredItems = useMemo(() => {
  let result = allItems

  // 1. Search
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    result = result.filter(item =>
      item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    )
  }

  // 2. Filter
  if (selectedCategory) {
    result = result.filter(item => item.category === selectedCategory)
  }

  // 3. Sort
  if (sortBy === 'newest') {
    result = [...result].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  return result
}, [allItems, searchQuery, selectedCategory, sortBy])
```

### 9.6 URL Sync Pattern

URL query params are **not** synced in any of the current service pages. All filter state is managed in React `useState` and resets on page navigation. `useSearchParams` and `useRouter` are imported in some pages but primarily used for reading initial route params, not for persisting filter state.

---

## 10. Charts & Visualizations

### 10.1 Library

**Recharts v3.5.1** — imported per chart type:

```tsx
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
```

### 10.2 Chart Types Implemented

| Chart Type | Location | Usage |
|------------|----------|-------|
| BarChart | Data Hub, KPI TimeSeriesStatic | Dataset visualization, application trends |
| LineChart | Data Hub, KPI TimeSeriesStatic | Time series, processing time trends |
| AreaChart | Data Hub, KPI AIPanelStatic | Trend fills, AI weekly usage |
| PieChart | Data Hub, KPI FunnelStatic | Distribution, sector breakdown |
| RadarChart | KPI ESGPanelStatic | ESG score breakdown |

### 10.3 Responsive Chart Wrapper

```tsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
    ...
  </BarChart>
</ResponsiveContainer>
```

Standard heights: `300px` for full charts, `80px` for mini charts (card thumbnails).

### 10.4 Chart Color Palette

Defined in `lib/data-hub-data.ts`:

```tsx
export const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
]
```

KPI status colors:

```tsx
const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: '#3b82f6',
  UNDER_REVIEW: '#f59e0b',
  CORRECTIONS_REQUESTED: '#f97316',
  APPROVED: '#10b981',
  REJECTED: '#ef4444',
}
```

### 10.5 Dark-Mode-Aware Tooltip Styling

```tsx
const { resolvedTheme } = useTheme()
const isDark = resolvedTheme === 'dark'

<Tooltip
  contentStyle={{
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '8px',
    color: isDark ? '#e2e8f0' : '#334155',
  }}
/>
```

Grid/axis styling:
```tsx
<CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
<XAxis tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
```

### 10.6 Mini Chart vs Full Chart

**Mini chart** (used in Data Hub card thumbnails):
- Height: 80px
- No axes, no grid, no tooltip, no legend
- Minimal margins: `{ top: 4, right: 4, left: 4, bottom: 4 }`
- `dot={false}` on lines

**Full chart** (used in expanded views and KPI dashboard):
- Height: 280–300px
- Full axes, grid, tooltip, legend
- Standard margins: `{ top: 5, right: 30, left: 20, bottom: 5 }`

### 10.7 CSV Export

```tsx
function downloadCSV(dataset: Dataset) {
  const hasMultiSeries = dataset.chartData.some(d => d.value2 !== undefined)
  const headers = hasMultiSeries ? ['Label', 'Value', 'Value 2'] : ['Label', 'Value']
  const rows = dataset.chartData.map(d =>
    hasMultiSeries ? [d.label, String(d.value), String(d.value2 ?? '')] : [d.label, String(d.value)]
  )
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${dataset.id}-${dataset.title.replace(/\s+/g, '-').toLowerCase()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
```

---

## 11. Map (Leaflet)

### 11.1 Setup and SSR Avoidance

**File:** `components/market-directory/MarketMap.tsx`

Leaflet is dynamically imported to avoid SSR issues:

```tsx
// In the page file
const MarketMap = dynamic(() => import('@/components/market-directory/MarketMap'), {
  ssr: false,
  loading: () => <MapSkeleton />,
})
```

**MapSkeleton** shows a spinner on `var(--panel-2)` background with min-height 400px.

### 11.2 Map Configuration

```tsx
<MapContainer
  center={[24.4539, 54.3773]}  // Abu Dhabi
  zoom={11}
  style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
  zoomControl={true}
>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="..." />
</MapContainer>
```

### 11.3 Marker Configuration

Custom div icons with sector-based colors:

```tsx
const icon = L.divIcon({
  className: 'market-cluster-icon',
  html: `<div style="
    width:28px; height:28px;
    background:${sectorHexColors[company.sector]};
    border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    color:white; font-weight:700; font-size:11px;
    ${company.isGoldenVendor ? 'box-shadow:0 0 0 3px gold;' : ''}
  ">${company.sector[0]}</div>`,
  iconSize: [28, 28],
})
```

Golden vendor markers get a `3px gold box-shadow`.

### 11.4 Map Modes

| Mode | Display |
|------|---------|
| `markers` | Individual company markers colored by sector |
| `heatmap` | CircleMarkers per area, radius/opacity by saturation level |
| `sectors` | Circles colored by dominant sector per area |

### 11.5 FlyTo Animation

```tsx
function FlyToCompany({ company }) {
  const map = useMap()
  useEffect(() => {
    if (company) map.flyTo([company.lat, company.lng], 15, { duration: 1.2 })
  }, [company, map])
  return null
}
```

### 11.6 CSS Overrides

From `app/globals.css`:

```css
.leaflet-container { border-radius: 0.75rem; font-family: inherit; }
.leaflet-popup-content-wrapper { background: var(--panel); color: var(--text); border: 1px solid var(--border); box-shadow: var(--shadow-lg); border-radius: 0.5rem; }
.leaflet-popup-tip { background: var(--panel); }
.leaflet-popup-content { margin: 8px 12px; }
.market-cluster-icon { background: transparent !important; border: none !important; }
```

---

## 12. API Integration (Anthropic)

### 12.1 API Call Structure

All AI endpoints are in `app/api/ai/*/route.ts`. The general pattern:

```tsx
// Client-side call
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, conversationHistory, locale }),
})
const data = await response.json()
```

### 12.2 API Key Access

The API key is accessed via environment variable in server-side route handlers:

```tsx
const apiKey = process.env.ANTHROPIC_API_KEY
```

### 12.3 Loading, Success, and Error States

```tsx
// Loading
const [isLoading, setIsLoading] = useState(false)
setIsLoading(true)
try {
  const res = await fetch('/api/ai/...')
  const data = await res.json()
  if (data.success) {
    // Handle success — set result state
  }
} catch (err) {
  console.error('AI error:', err)
} finally {
  setIsLoading(false)
}
```

### 12.4 JSON Parsing

AI responses that return structured data (compliance score, reviewer assist) are parsed as JSON from the response body:

```tsx
const data = await response.json()
// data.result contains the structured object
```

### 12.5 AI Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/ai/chat` | General chat with AI assistant |
| `/api/ai/precheck` | Pre-submission validation |
| `/api/ai/auto-fill` | Auto-fill form suggestions |
| `/api/ai/compliance-score` | ESG compliance scoring |
| `/api/ai/sector-template` | Sector-specific templates |
| `/api/ai/draft-report` | Draft ESG report generation |
| `/api/ai/esg-hints` | ESG improvement hints |
| `/api/ai/summary` | Application summary |
| `/api/ai/comment` | AI-generated review comment |
| `/api/ai/reviewer-assist` | Full AI review analysis |
| `/api/ai/document-classifier` | Document type detection |
| `/api/ai/ocr-review` | OCR document review |
| `/api/ai/renewal-forecast` | Certificate renewal prediction |
| `/api/ai/service-match` | Service recommendation matching |
| `/api/ai/service-recommendations` | Service suggestions |

---

## 13. Seed Data Conventions

### 13.1 File Location Pattern

All seed data lives in `lib/`:

| File | Service |
|------|---------|
| `lib/data-hub-data.ts` | Data Hub |
| `lib/expert-library-data.ts` | Expert Library |
| `lib/flagship-reports-data.ts` | Flagship & Sectorial Reports |
| `lib/global-tenders-data.ts` | Global Tenders Hub |
| `lib/market-directory-data.ts` | Market Directory |
| `lib/procurement-hub-data.ts` | Procurement Hub |
| `lib/kpi-mock-client.ts` | KPI Dashboard |

### 13.2 Naming Conventions

- File names: `kebab-case-data.ts`
- Exported arrays: `allItems` (e.g., `allSuppliers`, `allCompanies`, `allTenders`)
- Exported lookups: `camelCase` (e.g., `sectorColors`, `categoryColors`)
- Arabic variants: `fieldAr` suffix (e.g., `sectorsAr`, `categoriesAr`)
- ID pattern: `prefix-nnn` (e.g., `sup-001`, `fr-001`, `tnd-001`, `ds-001`)

### 13.3 Import Pattern

```tsx
import {
  type Supplier,
  type CatalogItem,
  allSuppliers,
  sectors,
  sectorsAr,
  sectorColors,
  companyColors,
} from '@/lib/procurement-hub-data'
```

### 13.4 Data Structure Pattern

Every seed data file exports:

1. **TypeScript interfaces** for the data types
2. **Constant arrays** for enum-like values (sectors, categories, regions)
3. **Arabic translation Records** for each array (`sectorsAr`, `categoriesAr`)
4. **Color mapping Records** for visual styling (`sectorColors`, `tierColors`)
5. **The data array** (e.g., `allSuppliers: Supplier[]`)

### 13.5 Bilingual Data Pattern

Every user-facing string has an Arabic counterpart:

```tsx
export interface Report {
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  category: string
  categoryAr: string
  tags: string[]
  tagsAr: string[]
}
```

Display logic:
```tsx
const title = isRtl ? report.titleAr : report.title
```

---

## 14. File & Folder Conventions

### 14.1 Full Directory Structure

```
esg-certificate-portal/
├── app/                              # Next.js App Router
│   ├── api/                          # API routes
│   │   ├── ai/                       # 16 AI endpoint directories
│   │   │   ├── auto-fill/route.ts
│   │   │   ├── chat/route.ts
│   │   │   ├── comment/route.ts
│   │   │   ├── compliance-score/route.ts
│   │   │   ├── document-classifier/route.ts
│   │   │   ├── draft-certificate/route.ts
│   │   │   ├── draft-report/route.ts
│   │   │   ├── esg-hints/route.ts
│   │   │   ├── ocr-review/route.ts
│   │   │   ├── precheck/route.ts
│   │   │   ├── renewal-forecast/route.ts
│   │   │   ├── reviewer-assist/route.ts
│   │   │   ├── sector-template/route.ts
│   │   │   ├── service-match/route.ts
│   │   │   ├── service-recommendations/route.ts
│   │   │   └── summary/route.ts
│   │   ├── applications/             # CRUD endpoints
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── status/route.ts
│   │   │       └── notes/route.ts
│   │   ├── market-directory/
│   │   │   └── setup-advisor/route.ts
│   │   └── services/
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── customer/                     # Customer portal
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── dashboard/
│   │   └── kpi/page.tsx
│   ├── services/                     # Service hub
│   │   ├── page.tsx                  # Directory
│   │   ├── data-hub/page.tsx
│   │   ├── expert-library/page.tsx
│   │   ├── flagship-reports/page.tsx
│   │   ├── global-tenders-hub/page.tsx
│   │   ├── market-directory/page.tsx
│   │   ├── procurement-hub/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── apply/page.tsx
│   ├── staff/                        # Staff portal
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── globals.css                   # Design tokens + base styles
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page
│   └── providers.tsx                 # ThemeProvider + I18nProvider
├── components/                       # Shared components
│   ├── kpi/                          # KPI dashboard components
│   │   ├── TopMetricsStatic.tsx
│   │   ├── ESGPanelStatic.tsx
│   │   ├── TimeSeriesStatic.tsx
│   │   ├── FunnelStatic.tsx
│   │   ├── RecentApplicationsTableStatic.tsx
│   │   ├── AIPanelStatic.tsx
│   │   └── index.ts                  # Barrel exports
│   ├── market-directory/
│   │   └── MarketMap.tsx
│   ├── AIChatAssistant.tsx
│   ├── AIPanel.tsx
│   ├── ESGAccordionForm.tsx
│   ├── Header.tsx
│   ├── ProgressTracker.tsx
│   ├── StatusBadge.tsx
│   ├── ThemeProvider.tsx
│   └── ThemeToggle.tsx
├── lib/                              # Utilities + seed data
│   ├── data-hub-data.ts
│   ├── expert-library-data.ts
│   ├── flagship-reports-data.ts
│   ├── global-tenders-data.ts
│   ├── market-directory-data.ts
│   ├── procurement-hub-data.ts
│   ├── i18n.tsx
│   ├── kpi-mock-client.ts
│   └── prisma.ts
├── locales/                          # Translation files
│   ├── en.json
│   └── ar.json
├── prisma/                           # Database
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── data/                             # Mock data for KPI
│   └── mock/
├── public/                           # Static assets
├── docs/                             # Documentation
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── eslint.config.mjs
```

### 14.2 Naming Conventions

| What | Convention | Example |
|------|-----------|---------|
| Route directories | kebab-case | `global-tenders-hub/` |
| Page files | `page.tsx` | `app/services/data-hub/page.tsx` |
| API routes | `route.ts` | `app/api/ai/chat/route.ts` |
| Shared components | PascalCase | `StatusBadge.tsx` |
| Component directories | kebab-case | `market-directory/` |
| Seed data files | kebab-case-data.ts | `procurement-hub-data.ts` |
| Utility files | camelCase.ts | `prisma.ts`, `i18n.tsx` |
| Translation files | lowercase.json | `en.json`, `ar.json` |

### 14.3 Component Location Rules

| Type | Location |
|------|----------|
| Shared across pages | `components/` |
| Feature-specific shared | `components/{feature}/` (e.g., `components/kpi/`) |
| Page-level (inline) | Defined inside `app/.../page.tsx` directly |
| Seed data | `lib/{service}-data.ts` |

**Note:** Most service-specific components (badges, cards, modals, skeletons) are defined inline within their page file, not as separate shared components. Only truly cross-cutting components live in `components/`.

---

## 15. Accessibility & UX Standards

### 15.1 Focus State Styling

Global focus style for inputs (from `app/globals.css`):

```css
input:focus, textarea:focus, select:focus {
  border-color: var(--input-focus);
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}
```

Button focus (ThemeToggle):
```tsx
className="focus:ring-2 focus:ring-white/20"
```

### 15.2 ARIA Patterns

- `aria-label` on icon-only buttons (theme toggle, chat button, bookmark)
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<button>`, `<table>`
- `dir="rtl"` or `dir="ltr"` set on key containers for bidirectional text

### 15.3 Keyboard Navigation

- **Escape** closes modals
- **Enter** submits chat messages
- **Tab** follows standard browser flow (no custom focus trapping in modals)
- No custom keyboard shortcuts beyond standard browser behavior

### 15.4 RTL Support

Comprehensive RTL support throughout:

```css
/* Global */
[dir="rtl"] { text-align: right; }
[dir="rtl"] input, [dir="rtl"] textarea, [dir="rtl"] select { text-align: right; }
```

**Component-level RTL patterns:**
- `dir={isRtl ? 'rtl' : 'ltr'}` on page containers
- `me-1` (margin-end) instead of `ml-1` for icon spacing
- `rtl:rotate-180` on directional icons (back arrows)
- `${isRtl ? 'flex-row-reverse' : ''}` for button groups
- Conditional text alignment in popups

### 15.5 Color Contrast

- Dark mode backgrounds use deep navy (`#001620`) with white text — high contrast
- Light mode uses `#0f172a` text on white — high contrast
- Muted text: `#6b7280` on white (4.48:1 ratio) and `#9fb0bd` on `#001620` (5.8:1 ratio)
- Status chip colors meet WCAG AA for their respective backgrounds

### 15.6 Mobile Touch Targets

- Navigation links: `px-3 py-2` (adequate)
- Buttons: `px-6 py-3` (standard), `px-4 py-2` (compact)
- Chat button: `w-14 h-14` (56px — exceeds 44px minimum)
- Icon buttons: `p-2` with SVG `w-5 h-5` — total ~36px (slightly below 44px minimum)

---

## 16. Do's and Don'ts

### Do's (Patterns Consistently Used)

1. **DO** use `'use client'` directive at the top of every interactive page
2. **DO** use CSS custom properties (`var(--text)`, `var(--panel)`, etc.) via `style={{ }}` for theme-dependent colors
3. **DO** use the `theme-panel` CSS class for card containers: `className="rounded-2xl p-6 theme-panel"`
4. **DO** provide bilingual content for every user-facing string — use the `field` / `fieldAr` pattern
5. **DO** use `useMemo` for filtered/sorted data computation
6. **DO** use `useCallback` for event handlers passed to child components
7. **DO** simulate loading states with `setTimeout` (600ms) for seed-data services
8. **DO** provide a `MemberAccessGuard` at the top of every service page
9. **DO** include a gradient header banner on every service page
10. **DO** use `line-clamp-2` for truncating card descriptions
11. **DO** use `transition-colors` or `transition-all` on all interactive elements
12. **DO** use `hover:shadow-lg` on cards for hover feedback
13. **DO** use `group-hover:text-blue-600` on card titles for interactive feel
14. **DO** use the standard badge pattern: `px-2.5 py-0.5 rounded-full text-xs font-medium border`
15. **DO** lock body scroll when modals are open
16. **DO** support Escape key to close modals
17. **DO** use `animate-pulse` for skeleton loading placeholders
18. **DO** export seed data types as TypeScript interfaces from data files
19. **DO** use the `@/` path alias for all imports

### Don'ts (Patterns Absent or Avoided)

1. **DON'T** create shared component files for one-off components — define them inline in the page file
2. **DON'T** use `useContext` for page-level state — use local `useState`/`useMemo` instead
3. **DON'T** use external state management libraries (no Redux, Zustand, Jotai)
4. **DON'T** use CSS modules or styled-components — Tailwind only
5. **DON'T** hardcode color values in components — use CSS variables or Tailwind classes
6. **DON'T** use `useEffect` for data fetching in service pages — seed data is imported statically
7. **DON'T** create separate API routes for seed-data services — import data directly
8. **DON'T** use pagination — filter and render all items (acceptable for current data sizes)
9. **DON'T** use animations beyond `transition-*` and `animate-pulse` (no framer-motion, no CSS keyframes beyond the blink animation)
10. **DON'T** nest routes deeper than `/services/{slug}` for service pages
11. **DON'T** use `next/image` — SVG icons are inline, no image optimization needed
12. **DON'T** use `getServerSideProps` or `getStaticProps` — this is App Router, not Pages Router
13. **DON'T** put seed data in the `data/` directory — use `lib/` (the `data/` directory is only for KPI mock JSON)
14. **DON'T** create README or documentation files in service directories

### Known Inconsistencies

1. **MemberAccessGuard** is duplicated in every service page with slight variations — could be extracted to a shared component
2. **Badge components** (SectorBadge, StatusBadge, CategoryBadge) are redefined in each page — the pattern is consistent but the code is duplicated
3. **CardSkeleton** is redefined per page with minor differences — could be shared
4. **Avatar components** differ slightly between services (rounded-xl vs rounded-lg, different split patterns for initials)
5. Some pages use `useSearchParams`/`useRouter` without actually syncing URL state
6. The KPI dashboard uses `bg-white dark:bg-slate-800` directly instead of `theme-panel` class
7. Form validation patterns vary between pages (some use `errors` object, some use HTML `required`)
8. The landing page (`app/page.tsx`) has its own navigation and styling independent of the shared Header component

---

## Appendix: Quick Reference for New Service Pages

### Minimum File Checklist

1. `lib/{service-name}-data.ts` — seed data with TypeScript types, bilingual strings, color maps
2. `app/services/{service-slug}/page.tsx` — the service page with all inline components
3. Update `app/services/[id]/page.tsx` — add redirect in `DEDICATED_ROUTES`
4. Update `app/services/page.tsx` — add routing logic for the new slug

### Template Structure for a New Service Page

```tsx
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { /* types and data */ } from '@/lib/{service-name}-data'

// ─── MemberAccessGuard ──────────────────────────────────────────────────────
function MemberAccessGuard({ locale }: { locale: string }) { /* ... */ }

// ─── Badge Components ───────────────────────────────────────────────────────
function CategoryBadge({ ... }) { /* ... */ }

// ─── Card Skeleton ──────────────────────────────────────────────────────────
function CardSkeleton() { /* ... */ }

// ─── Item Card ──────────────────────────────────────────────────────────────
function ItemCard({ ... }) { /* ... */ }

// ─── Detail Modal ───────────────────────────────────────────────────────────
function ItemDetailModal({ ... }) { /* ... */ }

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function ServicePage() {
  const { locale, t, dir } = useI18n()
  const isRtl = locale === 'ar'

  // Access gate
  const [isMember] = useState(true)
  if (!isMember) return <MemberAccessGuard locale={locale} />

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)

  // Loading simulation
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  // Filtering
  const filteredItems = useMemo(() => { /* ... */ }, [/* deps */])

  return (
    <div className={`min-h-screen ${isRtl ? 'rtl' : 'ltr'}`} style={{ background: 'var(--bg)' }} dir={dir}>
      {/* Header banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/services" className="...">← Back to Service Directory</Link>
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-white/80 text-lg">{subtitle}</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Search + filters */}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty state */
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => <ItemCard key={item.id} ... />)}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedItem && <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  )
}
```
