# ADCCI Digital Platform — Bug Report

**Generated:** 2026-02-28
**Auditor:** Claude Code
**Status:** For review — no fixes applied

---

## Summary

| Category | Count |
|----------|-------|
| Critical bugs | 7 |
| Major bugs | 18 |
| Minor bugs | 30 |
| UI inconsistencies | 12 |
| API issues | 16 |
| Schema issues | 4 |
| TODOs / Technical debt | 8 |
| **Total** | **95** |

---

## Bug Index

| # | Severity | Area | Title | Status |
|---|----------|------|-------|--------|
| BUG-001 | Critical | API / DB | ESG form post-submission redirect broken — `BaseApplication` ID looked up in legacy `Application` table | Open |
| BUG-002 | Critical | API / DB | Staff detail page writes notes to legacy API — fails for BaseApplication records | Open |
| BUG-003 | Critical | API / DB | Staff detail page writes status updates to legacy API — fails for BaseApplication records | Open |
| BUG-004 | Critical | Staff Portal | `CORRECTIONS_REQUESTED` status not in `StaffApplicationStatus` enum — Prisma throws | Open |
| BUG-005 | Critical | Staff Portal | Staff application detail page has no StaffAccessGuard — unprotected | Open |
| BUG-006 | Critical | Config | `.env.example` defines `POSTGRES_URL_NON_POOLED` but schema.prisma expects `POSTGRES_URL_NON_POOLING` | Open |
| BUG-007 | Critical | Navigation | `/customer` and `/member` route trees mixed in same user journey | Open |
| BUG-008 | Major | API | `applicantName` silently dropped on ESG submission — not persisted in new model | Open |
| BUG-009 | Major | API | `sector` silently dropped on ESG submission — field does not exist in new model | Open |
| BUG-010 | Major | API | `description` silently dropped on ESG submission — field does not exist in new model | Open |
| BUG-011 | Major | API | Pagination broken when legacy records exist in member applications | Open |
| BUG-012 | Major | Navigation | Missing `/member/applications` list page — 404 route | Open |
| BUG-013 | Major | Member Portal | `/customer/new` page is orphaned — unreachable from UI | Open |
| BUG-014 | Major | UI | `/customer/new` page has no dark mode support — invisible text in dark theme | Open |
| BUG-015 | Major | Accessibility | `<html lang="en">` hardcoded — never updates for Arabic locale | Open |
| BUG-016 | Major | UI | KPI Dashboard renders duplicate header (page-local + global Header) | Open |
| BUG-017 | Major | Staff Portal | Activity feed badge shows serviceType instead of application status | Open |
| BUG-018 | Major | Staff Portal | Tier filter dropdown exists but never sends to API — dead feature | Open |
| BUG-019 | Major | Staff Portal | React hooks rules violation — conditional `notFound()` between hooks | Open |
| BUG-020 | Major | Staff Portal | Missing `fetchApplication` in useEffect dependency array | Open |
| BUG-021 | Major | API | Staff PATCH: nested KS update crashes if no linked KS record exists | Open |
| BUG-022 | Major | API | No validation on serviceType/status query params before Prisma enum cast | Open |
| BUG-023 | Major | API | Legacy GET `/api/applications` reads stale `Application` model | Open |
| BUG-024 | Major | API | Legacy GET/PUT `/api/applications/[id]` targets wrong model | Open |
| BUG-025 | Major | Config | `ANTHROPIC_API_KEY` missing from `.env.example` | Open |
| BUG-026 | Minor | API | `aiPrecheckResult` silently dropped on ESG submission | Open |
| BUG-027 | Minor | API | No input validation on ESG POST — empty body creates garbage records | Open |
| BUG-028 | Minor | API | `attachmentUrl` never populated — file upload incomplete for KS | Open |
| BUG-029 | Minor | API | Legacy apps ignore all query filters (status, service, date, search) in member API | Open |
| BUG-030 | Minor | API | Legacy status counts potentially double-counted in filterCounts | Open |
| BUG-031 | Minor | API | Internal notes filtering uses fragile substring match (`includes('internal')`) | Open |
| BUG-032 | Minor | Member Portal | ESG timeline references non-existent field `fullApplicationAt` | Open |
| BUG-033 | Minor | Member Portal | KS attendee details access non-existent flat fields — section is dead code | Open |
| BUG-034 | Minor | Member Portal | ESG detail view does not display E/S/G profile JSON data | Open |
| BUG-035 | Minor | Member Portal | "Application not found" text not translated to Arabic | Open |
| BUG-036 | Minor | Member Portal | Detail page has no error state for failed fetch — shows "not found" instead | Open |
| BUG-037 | Minor | Services | No search debounce on services directory — API call on every keystroke | Open |
| BUG-038 | Minor | Services | Services directory filters do not sync to URL params | Open |
| BUG-039 | Minor | Services | Knowledge Sharing is the only service page that does NOT sync filters to URL | Open |
| BUG-040 | Minor | Services | `router.replace()` called during render in `/services/[id]` — React anti-pattern | Open |
| BUG-041 | Minor | Services | No MemberAccessGuard on `/services/[id]/apply` — ESG form is unprotected | Open |
| BUG-042 | Minor | Staff Portal | Certificate section has hardcoded light-mode colors — no dark mode | Open |
| BUG-043 | Minor | Staff Portal | Staff detail page has no RTL/Arabic support | Open |
| BUG-044 | Minor | Staff Portal | Auto-save on blur silently swallows errors — user believes notes saved | Open |
| BUG-045 | Minor | Staff Portal | N+1 API calls for status counts — 6 parallel requests per service page load | Open |
| BUG-046 | Minor | API | AI `ks-actions` JSON.parse can return non-array — client `.map()` would crash | Open |
| BUG-047 | Minor | API | Certificate number collision risk — 4-digit random in 10k space | Open |
| BUG-048 | Minor | API | No note field validation on `/api/applications/[id]/notes` POST | Open |
| BUG-049 | Minor | API | Accepts arbitrary `authorType` from client — can impersonate SYSTEM | Open |
| BUG-050 | Minor | API | Case-sensitive search in services API | Open |
| BUG-051 | Minor | API | HTTP 200 returned instead of 201 for ESG/KS creation | Open |
| BUG-052 | Minor | API | No pagination bounds validation — allows `pageSize=1000000` | Open |
| BUG-053 | Minor | API | Activity log writes not in transaction with main update | Open |
| BUG-054 | Minor | Navigation | Dead link: "About" in home page side menu points to `#` | Open |
| BUG-055 | Minor | Navigation | "AI Assistant" button in side menu does nothing | Open |

---

## Critical Bugs

### BUG-001: ESG form post-submission redirect broken — BaseApplication ID not found in legacy table

**Severity:** Critical
**Area:** API / DB
**Page/File:** `components/ESGAccordionForm.tsx:680`, `app/customer/[id]/page.tsx:57`, `app/api/applications/route.ts:77`
**Description:** After submitting an ESG application via the accordion form, the POST creates a `BaseApplication` record (new model) and returns its ID. The form then redirects to `/customer/${id}`. But the `/customer/[id]` page fetches from `/api/applications/${id}`, which queries the **legacy `Application` table**. Since the ID belongs to `BaseApplication`, it is not found in the `Application` table. The user sees "Application not found" immediately after a successful submission.
**Steps to Reproduce:**
1. Navigate to ESG service and click "Apply"
2. Fill out the ESG accordion form
3. Submit the application
4. Observe redirect to `/customer/{id}`
**Expected:** Application detail page shows the newly submitted application
**Actual:** "Application not found" error — the ID does not exist in the legacy `Application` table
**Root Cause:** The POST route (`/api/applications`) writes to `BaseApplication` (new model) but the detail page reads from `Application` (legacy model). These are separate database tables with independent ID spaces.
**Affected Users:** Members

### BUG-002: Staff detail page writes notes to legacy API — fails for BaseApplication records

**Severity:** Critical
**Area:** API / DB
**Page/File:** `app/staff/application/[id]/page.tsx:255`
**Description:** The `saveNote` function posts to `/api/applications/${params.id}/notes`, which creates a `ReviewNote` linked to the legacy `Application` model. For `BaseApplication` records (all records created by the new flow), the ID does not exist in the `Application` table, causing a foreign key constraint error. Staff cannot save notes on any new application.
**Steps to Reproduce:**
1. Open a BaseApplication record in staff detail view
2. Type an internal note in the notes field
3. Click away (blur) to trigger auto-save
**Expected:** Note is saved and persisted
**Actual:** Prisma foreign key error — `applicationId` not found in `Application` table
**Root Cause:** Staff detail page calls the legacy `/api/applications/[id]/notes` endpoint instead of the staff PATCH endpoint or a dedicated notes endpoint for `BaseApplication`.
**Affected Users:** Staff

### BUG-003: Staff detail page writes status updates to legacy API — fails for BaseApplication records

**Severity:** Critical
**Area:** API / DB
**Page/File:** `app/staff/application/[id]/page.tsx:281`
**Description:** The `updateStatus` function posts to `/api/applications/${params.id}/status`, which updates the legacy `Application` model. For `BaseApplication` records, the ID does not exist in `Application`, so the update returns 404 or fails silently.
**Steps to Reproduce:**
1. Open a BaseApplication record in staff detail view
2. Click any status change button (e.g., "Start Review")
**Expected:** Application status is updated
**Actual:** 404 or database error — record not found in legacy `Application` table
**Root Cause:** Same as BUG-002 — staff detail page targets legacy API endpoints.
**Affected Users:** Staff

### BUG-004: `CORRECTIONS_REQUESTED` status not in StaffApplicationStatus enum

**Severity:** Critical
**Area:** Staff Portal
**Page/File:** `app/staff/application/[id]/page.tsx:1088,1177`
**Description:** The staff detail page has a "Request Corrections" button that calls `updateStatus('CORRECTIONS_REQUESTED')`. However, the `StaffApplicationStatus` Prisma enum only contains: `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `PENDING_INFO`, `CLOSED`. `CORRECTIONS_REQUESTED` is not a valid enum value. If this button were to reach the `BaseApplication` update (which it currently can't due to BUG-003), Prisma would throw a validation error.
**Steps to Reproduce:**
1. Open an application in staff detail view
2. Click "Request Corrections"
**Expected:** Status changes to a corrections-requested state
**Actual:** Would cause Prisma enum validation error (currently masked by BUG-003)
**Root Cause:** The UI references a status value (`CORRECTIONS_REQUESTED`) from the legacy model that was replaced by `PENDING_INFO` in the new enum.
**Affected Users:** Staff

### BUG-005: Staff application detail page has no StaffAccessGuard

**Severity:** Critical
**Area:** Staff Portal
**Page/File:** `app/staff/application/[id]/page.tsx`
**Description:** Unlike `/staff/page.tsx` and `/staff/[serviceSlug]/page.tsx` which wrap content in `<StaffAccessGuard>`, the application detail page does **not** use any access guard. Any user with the URL can view internal staff application details, AI analysis results, internal notes, and staff assignment information.
**Steps to Reproduce:**
1. Navigate directly to `/staff/application/{any-valid-id}`
**Expected:** Access is gated by StaffAccessGuard
**Actual:** Page loads without any authorization check
**Root Cause:** The `<StaffAccessGuard>` component was not added when the page was created.
**Affected Users:** Both (security issue)

### BUG-006: .env.example variable name mismatch with Prisma schema

**Severity:** Critical
**Area:** Config
**Page/File:** `prisma/schema.prisma:8`, `.env.example:6`
**Description:** The Prisma schema references `env("POSTGRES_URL_NON_POOLING")` for the `directUrl`, but `.env.example` defines the variable as `POSTGRES_URL_NON_POOLED` (different suffix). Any developer following `.env.example` will have a missing `directUrl`, causing Prisma migrations and `db push` to fail.
**Steps to Reproduce:**
1. Clone the repo
2. Copy `.env.example` to `.env.local`
3. Fill in database credentials
4. Run `npx prisma migrate dev`
**Expected:** Migration runs successfully
**Actual:** Prisma fails to connect — `POSTGRES_URL_NON_POOLING` environment variable not found
**Root Cause:** Naming inconsistency between `.env.example` and `schema.prisma`.
**Affected Users:** Developers

### BUG-007: /customer and /member route trees mixed in same user journey

**Severity:** Critical
**Area:** Navigation
**Page/File:** `components/Header.tsx:62`, `components/member/ApplicationsTable.tsx:448`
**Description:** The header "My Applications" link navigates to `/customer`. When a user clicks on an application row in the table, they navigate to `/member/applications/{id}`. This mixes two different route hierarchies in the same user journey. The back button on the detail page may not return to `/customer`, the header active state won't highlight correctly on `/member/*` routes, and the user experience is disorienting.
**Steps to Reproduce:**
1. Click "My Applications" in the header (goes to `/customer`)
2. Click on any application row
3. URL changes to `/member/applications/{id}`
4. Check header — "My Applications" is no longer highlighted as active
**Expected:** Consistent route hierarchy — either all `/customer/*` or all `/member/*`
**Actual:** User jumps between `/customer` and `/member` route trees
**Root Cause:** The My Applications page was originally at `/customer` but the new detail page was created under `/member`.
**Affected Users:** Members

---

## Major Bugs

### BUG-008: `applicantName` silently dropped on ESG submission

**Severity:** Major
**Area:** API
**Page/File:** `app/api/applications/route.ts:48`
**Description:** The ESG form submits `applicantName` as a separate field from `organizationName`. The API route uses `body.organizationName || body.applicantName` as `submittedBy`, so the individual contact name is lost. The `BaseApplication` model has no `applicantName` field, and `EsgApplication` does not store it either.
**Root Cause:** Schema gap — `BaseApplication` has `submittedBy` (org name) but no field for the individual applicant's name.
**Affected Users:** Members / Staff

### BUG-009: `sector` silently dropped on ESG submission

**Severity:** Major
**Area:** API
**Page/File:** `app/api/applications/route.ts:44-52`
**Description:** The ESG form sends a `sector` field but neither `BaseApplication` nor `EsgApplication` has a `sector` field. The legacy `Application` model has `sector` but the POST route writes to the new models. The primary sector classification is completely lost.
**Root Cause:** Schema gap — `sector` was not migrated from the legacy model to the new model structure.
**Affected Users:** Members / Staff

### BUG-010: `description` silently dropped on ESG submission

**Severity:** Major
**Area:** API
**Page/File:** `app/api/applications/route.ts:44-67`
**Description:** The ESG accordion form builds a comprehensive multi-line `description` string combining all ESG profiles and KPIs. Neither `BaseApplication` nor `EsgApplication` has a `description` field. The individual profile JSONs are stored in `EsgApplication`, but the unified description is lost.
**Root Cause:** Schema gap — `description` was not migrated to the new model.
**Affected Users:** Members / Staff

### BUG-011: Pagination broken when legacy records exist

**Severity:** Major
**Area:** API
**Page/File:** `app/api/member/applications/route.ts:262-270`
**Description:** `BaseApplication` records are paginated (skip/take), but legacy `Application` records are fetched **without pagination**. They are appended after paginated base records, then sliced to `limit`. On page 2+, legacy apps are re-fetched entirely and the dedup filter only covers the current page's base IDs, causing legacy records to appear on every page.
**Root Cause:** The merge logic does not properly integrate legacy records into the pagination scheme.
**Affected Users:** Members

### BUG-012: Missing /member/applications list page — 404

**Severity:** Major
**Area:** Navigation
**Page/File:** `app/member/applications/` (directory)
**Description:** There is no `app/member/applications/page.tsx`. Only the detail page at `app/member/applications/[id]/page.tsx` exists. If a user navigates to `/member/applications` directly (e.g., by truncating the URL after clicking a detail link), they get a 404.
**Affected Users:** Members

### BUG-013: /customer/new page is orphaned — unreachable from UI

**Severity:** Major
**Area:** Member Portal
**Page/File:** `app/customer/new/page.tsx`
**Description:** A full "New ESG Application" form exists at `/customer/new` with complete functionality. However, no link or button in the UI navigates to this page. The translation key `t.customer.dashboard.newApplication` exists but is not rendered. The customer dashboard only shows a "Browse Services" CTA.
**Affected Users:** Members

### BUG-014: /customer/new has no dark mode support

**Severity:** Major
**Area:** UI
**Page/File:** `app/customer/new/page.tsx:102-261`
**Description:** The new application form page uses hardcoded light-mode colors: `text-gray-900`, `text-gray-700`, `text-gray-600`, `bg-white`, `border-gray-300` without `dark:` variants. In dark mode, text becomes invisible (dark text on dark background). Every other page uses CSS custom properties or Tailwind `dark:` variants.
**Affected Users:** Members (dark mode users)

### BUG-015: `<html lang="en">` hardcoded — never updates for Arabic

**Severity:** Major
**Area:** Accessibility
**Page/File:** `app/layout.tsx:27`
**Description:** The `<html>` element has `lang="en"` hardcoded. When the user switches to Arabic via the locale toggle, the `lang` attribute remains "en". This violates WCAG accessibility guidelines and affects screen readers, search engines, and browser auto-translation behavior.
**Affected Users:** Both

### BUG-016: KPI Dashboard renders duplicate header

**Severity:** Major
**Area:** UI
**Page/File:** `app/dashboard/kpi/page.tsx:96-135`
**Description:** The KPI Dashboard renders its own `<header>` element with language and theme toggles. The global `Header` component from `providers.tsx` also renders for all non-home pages. Since `pathname.startsWith('/dashboard')` is truthy, two headers are stacked.
**Affected Users:** Both

### BUG-017: Activity feed badge shows serviceType instead of status

**Severity:** Major
**Area:** Staff Portal
**Page/File:** `app/staff/page.tsx:483`
**Description:** `<ApplicationStatusBadge status={entry.serviceType.replace(/_/g, ' ')} />` passes the service type (e.g., "KNOWLEDGE SHARING") where a status value (e.g., "SUBMITTED") is expected. The badge always falls back to default styling and shows a meaningless label.
**Affected Users:** Staff

### BUG-018: Tier filter dropdown is dead — never sent to API

**Severity:** Major
**Area:** Staff Portal
**Page/File:** `app/staff/[serviceSlug]/page.tsx:56-68,112-118`
**Description:** The `StaffFilterBar` includes a "Tier" dropdown and tracks `activeFilters.tier` in state, but `fetchApplications` never includes `tier` in the API query string. The `/api/staff/applications` endpoint also does not support a `tier` parameter. The filter is entirely non-functional.
**Affected Users:** Staff

### BUG-019: React hooks rules violation in service listing page

**Severity:** Major
**Area:** Staff Portal
**Page/File:** `app/staff/[serviceSlug]/page.tsx:103-105`
**Description:** `notFound()` is called conditionally between `useState` hooks (lines 82-100) and `useCallback`/`useEffect` hooks (lines 109-171). While `notFound()` throws (preventing further execution), placing a conditional throw between hooks violates the Rules of Hooks specification, which requires hooks to run in the same order on every render.
**Affected Users:** Staff

### BUG-020: Missing fetchApplication in useEffect dependency array

**Severity:** Major
**Area:** Staff Portal
**Page/File:** `app/staff/application/[id]/page.tsx:121-123`
**Description:** `useEffect` depends on `params.id` but does not include `fetchApplication` in its dependency array. `fetchApplication` is defined inline and not wrapped in `useCallback`. ESLint's `react-hooks/exhaustive-deps` rule would flag this as a potential stale closure bug.
**Affected Users:** Staff

### BUG-021: Staff PATCH nested KS update crashes if no linked record exists

**Severity:** Major
**Area:** API
**Page/File:** `app/api/staff/applications/[id]/route.ts:96-98`
**Description:** The PATCH handler uses `{ knowledgeSharingApplication: { update: ksFields } }` to update nested KS data. If a `KNOWLEDGE_SHARING` BaseApplication has no linked `KnowledgeSharingApplication` record, Prisma throws a `RecordNotFound` error. Should use `upsert` instead of `update`.
**Affected Users:** Staff

### BUG-022: No validation on serviceType/status query params before Prisma enum cast

**Severity:** Major
**Area:** API
**Page/File:** `app/api/staff/applications/route.ts:33-37`
**Description:** User-supplied query strings are cast directly to Prisma enum types without validation: `serviceType as Prisma.EnumServiceTypeFilter`. Invalid values (e.g., `?status=INVALID`) cause a Prisma runtime error and 500 response instead of a proper 400 validation error.
**Affected Users:** Staff

### BUG-023: Legacy GET /api/applications reads stale Application model

**Severity:** Major
**Area:** API
**Page/File:** `app/api/applications/route.ts:6-36`
**Description:** The GET handler reads from the legacy `Application` model. New ESG submissions go to `BaseApplication`, so this endpoint returns stale and incomplete data.
**Affected Users:** Members

### BUG-024: Legacy GET/PUT /api/applications/[id] targets wrong model

**Severity:** Major
**Area:** API
**Page/File:** `app/api/applications/[id]/route.ts`
**Description:** GET and PUT operations target the legacy `Application` table. IDs from `BaseApplication` will not be found, returning 404. The staff detail page falls back to this endpoint, perpetuating the model confusion.
**Affected Users:** Staff

### BUG-025: ANTHROPIC_API_KEY missing from .env.example

**Severity:** Major
**Area:** Config
**Page/File:** `.env.example`
**Description:** Multiple AI API routes (`/api/ai/ks-summary`, `/api/ai/ks-actions`, `/api/ai/reviewer-assist`, etc.) check for `process.env.ANTHROPIC_API_KEY`, but `.env.example` does not list this variable. New developers won't know it's needed and AI features will silently fail with 503.
**Affected Users:** Developers

---

## Minor Bugs

### BUG-026: aiPrecheckResult silently dropped on ESG submission
**File:** `app/api/applications/route.ts:44-67`
**Description:** The old form at `/customer/new` sends `aiPrecheckResult` but neither `BaseApplication` nor `EsgApplication` has this field. AI precheck results are lost.

### BUG-027: No input validation on ESG POST
**File:** `app/api/applications/route.ts:39-84`
**Description:** Unlike the Knowledge Sharing POST (which validates required fields), the ESG POST does zero input validation. An empty body creates a `BaseApplication` with empty/null values.

### BUG-028: attachmentUrl never populated — file upload incomplete
**File:** `app/api/services/knowledge-sharing/route.ts:49`
**Description:** `KnowledgeSharingApplication` has an `attachmentUrl` field but the API never writes it. The form sends `attachmentName` only — there is no file upload endpoint. The user picks a file but only the name is stored.

### BUG-029: Legacy apps ignore all query filters in member API
**File:** `app/api/member/applications/route.ts:146-149`
**Description:** Legacy `Application` records are fetched with only an email filter. They ignore `serviceType`, `status`, `department`, `dateFrom`, `dateTo`, and `search` filters. If a user filters by status "APPROVED", legacy apps with all statuses still appear.

### BUG-030: Legacy status counts potentially double-counted
**File:** `app/api/member/applications/route.ts:176-188`
**Description:** Legacy apps are always added to `byService['ESG_LABEL']` and `byStatus` counts regardless of whether they also exist in `BaseApplication`. Filter counts may be inflated.

### BUG-031: Internal notes filtering uses fragile substring match
**File:** `app/api/member/applications/[id]/route.ts:26-27,70-71`
**Description:** Internal activity logs are filtered by `log.action.toLowerCase().includes('internal')`. Any log with "internal" anywhere (e.g., "International trade review") is incorrectly filtered out. Conversely, staff notes without the word "internal" leak to members.

### BUG-032: ESG timeline references non-existent field
**File:** `components/member/ApplicationStatusTimeline.tsx:117`
**Description:** Code references `esg.fullApplicationAt` but the `EsgApplication` model field is `fullAppSubmittedAt`. The timeline always falls back to `app.updatedAt` for this stage.

### BUG-033: KS attendee details access non-existent flat fields
**File:** `components/member/ApplicationDetailView.tsx:440-478`
**Description:** Code checks `ks.attendeeName`, `ks.attendeeEmail`, `ks.attendeePhone` but the model stores attendees as a JSON string in `attendeeDetails`. These individual fields do not exist; the attendee section is dead code.

### BUG-034: ESG detail view does not display E/S/G profile data
**File:** `components/member/ApplicationDetailView.tsx:362-386`
**Description:** `renderESGSummary` only shows `subSector`, `country`, `phoneNumber`, `tradeLicenseNumber`. The full E/S/G profile JSONs (containing carbon emissions, workforce diversity, governance details — the core ESG data) are never parsed or displayed.

### BUG-035: "Application not found" text not translated
**File:** `app/member/applications/[id]/page.tsx:43`
**Description:** Hardcoded English "Application not found" shown even in Arabic locale.

### BUG-036: Detail page has no error state for failed fetch
**File:** `app/member/applications/[id]/page.tsx:16-30`
**Description:** If the fetch fails (network error), `application` remains null and "not found" is shown instead of an error message. No retry mechanism.

### BUG-037: No search debounce on services directory
**File:** `app/services/page.tsx:37,164`
**Description:** `searchQuery` triggers `fetchServices()` via `useEffect` on every keystroke. Each character typed fires an API call.

### BUG-038: Services directory filters do not sync to URL params
**File:** `app/services/page.tsx:32-33`
**Description:** Selected platform, department, and search query are only held in React state. Page refresh loses all filter state. Most other service pages sync filters to URL.

### BUG-039: Knowledge Sharing filters do not sync to URL params
**File:** `app/services/knowledge-sharing/page.tsx`
**Description:** Unlike other service pages that call `router.replace` to sync filter state, Knowledge Sharing does not. Page refresh loses all filter state.

### BUG-040: router.replace() called during render in /services/[id]
**File:** `app/services/[id]/page.tsx:122-196`
**Description:** `router.replace()` is called directly during rendering (not in a `useEffect`) for 6 different service types. This is a React anti-pattern that can cause render loops in strict mode.

### BUG-041: No MemberAccessGuard on ESG apply page
**File:** `app/services/[id]/apply/page.tsx`
**Description:** The ESG application form has zero auth gating. Anyone with the URL can access and submit an application.

### BUG-042: Staff certificate section has hardcoded light-mode colors
**File:** `app/staff/application/[id]/page.tsx:843-851`
**Description:** Certificate banner uses `bg-green-50`, `border-green-100`, `text-green-800` without `dark:` variants. Renders with light-mode styling on dark backgrounds.

### BUG-043: Staff detail page has no RTL/Arabic support
**File:** `app/staff/application/[id]/page.tsx`
**Description:** The page imports `useI18n()` for translations but does not extract `locale` or `dir`. No `dir` attribute is set on the root container. All text in KS detail sections, AI tools, and action buttons is hardcoded in English.

### BUG-044: Auto-save on blur silently swallows errors
**File:** `components/staff/ApplicationDetailPanel.tsx:158`
**Description:** The catch block is empty (`catch {}`). If the PATCH request fails, the user sees "Auto-saves on blur" text and believes notes are saved, but they are actually lost.

### BUG-045: N+1 API calls for status counts on service listing pages
**File:** `app/staff/[serviceSlug]/page.tsx:135-163`
**Description:** `fetchStatusCounts` fires 6 parallel API requests (one per status value) just to get counts, each requesting `pageSize=1` to read `totalCount`. Should be a single `groupBy` query.

### BUG-046: AI ks-actions JSON.parse can return non-array
**File:** `app/api/ai/ks-actions/route.ts:56-61`
**Description:** If the AI returns valid JSON that is not an array (e.g., an object), `actions` will be set to that value and returned. The client iterates with `.map()` which would crash.

### BUG-047: Certificate number collision risk
**File:** `app/api/applications/[id]/status/route.ts:4-8`
**Description:** Certificate numbers use a 4-digit random value (`ESG-{year}-{XXXX}`). With only 10,000 possible values per year and a `@unique` constraint, collisions cause the approval flow to crash.

### BUG-048: No note field validation
**File:** `app/api/applications/[id]/notes/route.ts:10-11`
**Description:** The `note` field from the request body is used directly. A null/undefined note creates a null database entry. No length validation.

### BUG-049: Accepts arbitrary authorType from client
**File:** `app/api/applications/[id]/notes/route.ts:11`
**Description:** Defaults to `'STAFF'` but accepts any string from the client. Could inject `'SYSTEM'` to impersonate system-generated notes.

### BUG-050: Case-sensitive search in services API
**File:** `app/api/services/route.ts:22-28`
**Description:** Search uses `{ contains: search }` without `mode: 'insensitive'`. Searching "knowledge" won't match "Knowledge".

### BUG-051: HTTP 200 returned instead of 201 for resource creation
**Files:** `app/api/applications/route.ts:77`, `app/api/services/knowledge-sharing/route.ts:65`
**Description:** Both ESG and KS POST endpoints return 200 instead of 201 for successful creation. Minor REST convention deviation.

### BUG-052: No pagination bounds validation
**Files:** `app/api/staff/applications/route.ts:23-24`, `app/api/staff/activity/route.ts:7-8`
**Description:** `page` and `pageSize` are parsed from user input with no bounds. `?pageSize=1000000` could cause excessive database load.

### BUG-053: Activity log writes not in transaction with main update
**File:** `app/api/staff/applications/[id]/route.ts:118-120`
**Description:** Activity log entries are written after the main update, outside a transaction. If the update succeeds but a log entry write fails, the system is left in an inconsistent state.

### BUG-054: Dead link "About" in home page side menu
**File:** `app/page.tsx:296`
**Description:** The "About" menu item links to `href="#"` — no `/about` route exists.

### BUG-055: "AI Assistant" button in side menu does nothing
**File:** `app/page.tsx:308-322`
**Description:** The button only closes the menu (`setIsMenuOpen(false)`). It does not navigate anywhere or open a chatbot. The `AIChatAssistant` component is hidden on the landing page.

---

## UI Inconsistencies

### UI-001: Hardcoded dark-mode hex colors across all pages
**Files:** `app/services/expert-library/page.tsx:20,247,403,572`, `app/services/global-tenders-hub/page.tsx:40,292,496,753`, `app/services/data-hub/page.tsx:50,160-163,582,748`, `app/services/flagship-reports/page.tsx:24,683`, `app/services/procurement-hub/page.tsx:441,1089,1152`, `app/services/market-directory/page.tsx:120,356,1050`, `app/services/knowledge-sharing/page.tsx:20,192,661`, `app/services/[id]/page.tsx:71,82,124,203,432,434,462`, `app/services/page.tsx:129`
**Standard Violated:** UI_STANDARDS.md requires CSS custom properties (`var(--bg)`, `var(--text)`, etc.) for all colors. Hex values like `#000C14`, `#071824`, `#0a2236`, `#0a2540`, `#0d3055` bypass theming.

### UI-002: RTL close button uses physical `right-4` instead of logical `end-4`
**File:** `app/services/market-directory/page.tsx:350`
**Standard Violated:** RTL support requires logical CSS properties. The close button on CompanyDetailModal uses `right-4`, which positions it on the physical right regardless of text direction. In RTL mode, the close button should be on the left.

### UI-003: Multiple pages manually handle RTL with `flex-row-reverse`
**Files:** `app/services/market-directory/page.tsx:294,355,787-788`, `app/services/procurement-hub/page.tsx:43`
**Standard Violated:** RTL should be handled via `dir="rtl"` on container elements, not manual `flex-row-reverse` conditions. Manual reversal creates fragile RTL support and potential double-reversal issues.

### UI-004: Services directory missing skeleton loading state
**File:** `app/services/page.tsx:244-250`
**Standard Violated:** All data-fetching pages should have skeleton loading states. The directory shows only a spinner.

### UI-005: All MemberAccessGuards are decorative only
**Files:** All 7 service pages (`expert-library`, `global-tenders-hub`, `data-hub`, `flagship-reports`, `procurement-hub`, `market-directory`, `knowledge-sharing`)
**Standard Violated:** MemberAccessGuard should gate access. Every page hardcodes `isMember = true` or `hasAccess = true`, making the guard dead code.

### UI-006: Missing filter chips on 5 of 8 service pages
**Files:** `app/services/expert-library/page.tsx`, `app/services/data-hub/page.tsx`, `app/services/flagship-reports/page.tsx`, `app/services/procurement-hub/page.tsx`, `app/services/market-directory/page.tsx`
**Standard Violated:** Active filters should have individual remove chips. Only `global-tenders-hub` and `knowledge-sharing` have individual chip removal. Others only have "Clear all filters".

### UI-007: Inconsistent language toggle UI between pages
**Files:** `components/Header.tsx` (capsule EN/AR toggle), `app/dashboard/kpi/page.tsx:119-128` (single button toggle)
**Standard Violated:** Consistent UI patterns across pages. KPI dashboard uses a different toggle style.

### UI-008: Metadata title says "ESG Certificate Portal"
**File:** `app/layout.tsx:16-19`
**Standard Violated:** The platform is "ADCCI Digital Platform" but the browser tab shows "ESG Certificate Portal".

### UI-009: Flagship reports download action uses `<span>` instead of `<button>`
**File:** `app/services/flagship-reports/page.tsx:257-264`
**Standard Violated:** Interactive elements should be `<button>` for accessibility. The download icon is a `<span>` with `onClick`, lacking keyboard focus and ARIA role.

### UI-010: No skeleton on member application detail page
**File:** `app/member/applications/[id]/page.tsx:32-38`
**Standard Violated:** All data-fetching pages should have skeleton loading states. The detail page shows a single spinner then jumps to full layout.

### UI-011: Dynamic Tailwind class name construction
**File:** `app/staff/page.tsx:313`
**Description:** `text-${isRtl ? 'start' : 'end'}` constructs class names dynamically. Tailwind's JIT compiler cannot detect these. Should use full conditional: `isRtl ? 'text-start' : 'text-end'`.

### UI-012: `console.log` statements left in production code
**Files:** `app/services/expert-library/page.tsx:554-555`, `app/services/global-tenders-hub/page.tsx:383-384`, `app/services/flagship-reports/page.tsx:654-655`, `app/services/procurement-hub/page.tsx:606,722,856`
**Standard Violated:** Production code should not log debug output to console.

---

## API Issues

### API-001: ESG POST hardcodes serviceType
**Route:** `POST /api/applications`
**Issue:** Line 47 hardcodes `serviceType: 'ESG_LABEL'`. The route path is generic (`/api/applications`) but only creates ESG applications.
**Risk:** Misleading API design if future services reuse this endpoint.

### API-002: No body.status validation on staff PATCH
**Route:** `PATCH /api/staff/applications/[id]`
**Issue:** `body.status` is cast to `StaffApplicationStatus` without validation (line 58). Invalid values cause Prisma runtime errors.
**Risk:** 500 errors instead of proper 400 validation responses.

### API-003: No rate limiting on AI endpoints
**Route:** `POST /api/ai/ks-summary`, `POST /api/ai/ks-actions`
**Issue:** No request size or rate limits. Large `activityLogs` arrays could exhaust Anthropic API tokens.
**Risk:** Cost blowout, API abuse.

### API-004: Prompt injection risk in AI endpoints
**Route:** `POST /api/ai/ks-summary`
**Issue:** User-supplied fields (`submittedBy`, `queryText`) are interpolated directly into the AI prompt string. Malicious input could override AI instructions.
**Risk:** AI misbehavior, data extraction.

### API-005: Services API fetches all records for filter values
**Route:** `GET /api/services`
**Issue:** A second unbounded `findMany` is called just to get distinct `dept` and `platform` values (lines 37-42). Should use `groupBy` or `distinct`.
**Risk:** Performance degradation as service catalog grows.

### API-006: Legacy status update route has certificate collision risk
**Route:** `PATCH /api/applications/[id]/status`
**Issue:** Certificate numbers use 4-digit random (`ESG-{year}-XXXX`). Only 10,000 possible values per year.
**Risk:** Unique constraint violation crashes the approval flow.

### API-007: No validation of authorType in notes endpoint
**Route:** `POST /api/applications/[id]/notes`
**Issue:** Accepts any arbitrary string for `authorType`. Client can inject `'SYSTEM'` to impersonate system notes.
**Risk:** Data integrity compromise.

### API-008: Extension data conditionally loaded in staff list
**Route:** `GET /api/staff/applications`
**Issue:** Lines 64-65: `esgApplication: serviceType === 'ESG_LABEL'` only loads extension data when filtered by specific service type. Listing all applications excludes all extension data.
**Risk:** Incomplete data in unfiltered views.

### API-009: Inconsistent Prisma import styles
**Route:** All API routes
**Issue:** Half the codebase uses `import prisma from '@/lib/prisma'` (default), the other half uses `import { prisma } from '@/lib/prisma'` (named). Both work but creates maintenance confusion.
**Risk:** Developer confusion.

### API-010: No pagination bounds validation
**Route:** `GET /api/staff/applications`, `GET /api/staff/activity`
**Issue:** `pageSize` accepts any integer from the client. `?pageSize=1000000` would load excessive data.
**Risk:** Database and memory exhaustion.

### API-011: Activity log writes not in transaction
**Route:** `PATCH /api/staff/applications/[id]`
**Issue:** Activity log entries are written after the main update, outside a transaction. If the log write fails, the update is orphaned.
**Risk:** Data inconsistency.

### API-012: Staff list fetch failure silently swallowed
**Route:** `GET /api/staff/applications?staffList=true` (consumed by `ApplicationDetailPanel.tsx:110`)
**Issue:** `.catch(() => {})` on the staff list fetch. If it fails, the assignment dropdown has no options with no error indication.
**Risk:** Silent feature degradation.

### API-013: Legacy note filtering should use authorType field
**Route:** `GET /api/member/applications/[id]`
**Issue:** Legacy `ReviewNote` has `authorType` field ('SYSTEM', 'STAFF') but filtering uses substring match on note content instead. The customer detail page (`/customer/[id]`) correctly uses `authorType`.
**Risk:** Inconsistent behavior between old and new detail pages.

### API-014: No error state for failed API calls on staff hub
**File:** `app/staff/page.tsx:255-284`
**Issue:** Both `fetchStats` and `fetchActivity` log errors to console but display no user-visible error. If the API is down, stats show nothing and activity shows misleading "No activity" message.
**Risk:** Staff unaware of system issues.

### API-015: Knowledge Sharing POST returns 200 instead of 201
**Route:** `POST /api/services/knowledge-sharing`
**Issue:** Returns HTTP 200 for resource creation instead of 201.
**Risk:** REST convention deviation.

### API-016: ESG POST returns 200 instead of 201
**Route:** `POST /api/applications`
**Issue:** Returns HTTP 200 for resource creation instead of 201.
**Risk:** REST convention deviation.

---

## Schema Issues

### DB-001: Legacy Application model not marked as deprecated
**Model:** `Application`
**Issue:** The `Application` model (schema lines 11-36) is the legacy ESG-only model, superseded by `BaseApplication` + extension models. It has no comments marking it as deprecated. Multiple API routes still read/write to it, creating confusion about which model is canonical.

### DB-002: Missing fields on BaseApplication vs legacy Application
**Model:** `BaseApplication`
**Issue:** `Application` has `applicantName`, `sector`, `description`, `aiPrecheckResult` — none of which exist on `BaseApplication` or its extension models. Data submitted through the new flow loses these fields.

### DB-003: Status type mismatch between models
**Model:** `Application` (String) vs `BaseApplication` (StaffApplicationStatus enum)
**Issue:** Legacy `Application.status` is a free-form string (includes `CORRECTIONS_REQUESTED`). `BaseApplication.status` is a strict enum that does not include `CORRECTIONS_REQUESTED`. The member API maps this to `PENDING_INFO`, losing the original status semantics.

### DB-004: Only 2 of 9 service types have extension models
**Model:** `EsgApplication`, `KnowledgeSharingApplication`
**Issue:** 7 service types (`CHAMBER_BOOST`, `BUSINESS_MATCHMAKING`, `BUSINESS_DEVELOPMENT`, `BUSINESS_ENABLEMENT`, `POLICY_ADVOCACY`, `LOYALTY_PLUS`, `AD_CONNECT_CONCIERGE`) have no extension model. If applications are created for these services, only `BaseApplication` fields are stored — insufficient for meaningful service-specific data.

---

## TODOs & Technical Debt

### TD-001: `any` types in critical member-facing components
**Files:** `components/member/ApplicationStatusTimeline.tsx:40,52,87,143`, `components/member/ApplicationDetailView.tsx:23,24,362,388,483`
**Description:** Functions `getStagesForService`, `buildESGStages`, `renderESGSummary`, `renderKSSummary`, `renderGenericSummary` all use `: any` parameters on the critical rendering path.

### TD-002: Duplicated `relativeTime` helper function
**Files:** `components/staff/ApplicationDetailPanel.tsx:51-64`, `app/staff/page.tsx:154-167`
**Description:** Identical function defined in two places. Should be extracted to a shared utility.

### TD-003: `eslint-disable-next-line` suppressions
**Files:** `app/services/expert-library/page.tsx:471`, `app/services/flagship-reports/page.tsx:550`, `app/services/data-hub/page.tsx:645,652`
**Description:** Suppress `react-hooks/set-state-in-effect` warnings, indicating state updates in effects that should be refactored.

### TD-004: Stale project name "esg-certificate-portal"
**Files:** `package.json:2`, `app/layout.tsx:16-19`
**Description:** Package name and HTML metadata still reference "ESG Certificate Portal". The project has evolved to "ADCCI Digital Platform".

### TD-005: I18nProvider returns null before mount
**File:** `lib/i18n.tsx:47-49`
**Description:** Returns `null` until `mounted` is true, causing a brief flash of blank content on initial page load.

### TD-006: Home nav link active state is dead code
**File:** `components/Header.tsx:12,43-47`
**Description:** The Home link has active state styling, but the Header is hidden on `/` (returns null). The active state can never be seen.

### TD-007: No hamburger toggle on inner page mobile nav
**File:** `components/Header.tsx:126-177`
**Description:** Inner pages show a horizontal scrollable nav strip on mobile instead of a hamburger menu. The home page uses a slide-out drawer. Two different mobile navigation paradigms.

### TD-008: Services [id] page has repeated redirect spinner JSX
**File:** `app/services/[id]/page.tsx:122-196`
**Description:** The same 9-line spinner/redirect block is copy-pasted 6 times for each service redirect. Should be extracted to a component.

---

## Deferred Items (Known, Out of Scope)

- **Authentication (Gap 2)** — All MemberAccessGuard and StaffAccessGuard instances use hardcoded `true` values. Real auth is deferred.
- **AI Mocks (Gap 5)** — AI endpoints use real Anthropic API when `ANTHROPIC_API_KEY` is set, with graceful 503 fallback. No mock mode.
- **Status Enum Mismatch (Gap 7)** — Legacy `Application.status` (String) vs `BaseApplication.status` (enum). Mapping logic exists but the original `CORRECTIONS_REQUESTED` semantics are lost.
- **File Storage (Gap 6)** — `attachmentUrl` fields exist in the schema but no file upload/storage infrastructure exists. Only file names are persisted.
- **Missing /dashboard root page** — `/dashboard` returns 404; only `/dashboard/kpi` exists.

---

*End of report*
