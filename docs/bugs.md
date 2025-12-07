# Bug Report - ESG Certificate Portal

## Critical Bugs

### BUG-001: API Missing Server-Side Validation
**Severity:** Critical
**Location:** `app/api/applications/route.ts:36-70`
**Description:** The POST endpoint for creating applications does not validate input data. Empty strings, invalid emails, and missing required fields are accepted and saved to the database.
**Steps to Reproduce:**
1. Send POST request to `/api/applications` with empty or invalid data
2. Application is created successfully with empty fields
**Expected:** API should validate required fields and return 400 error for invalid data
**Actual:** API accepts any data including empty applicantName, invalid email format, empty description


### BUG-002: Hardcoded ESG Service ID in Chat Suggestions
**Severity:** High
**Location:**
- `app/api/ai/chat/route.ts:270`
- `components/AIChatAssistant.tsx:40`
**Description:** The AI chat assistant suggests `/services/1` for ESG application, but the actual ESG service ID is `5`.
**Steps to Reproduce:**
1. Open the chat assistant
2. Ask about ESG certificate
3. Click suggested action "Start ESG Application"
4. User is directed to wrong service or 404 page
**Expected:** Should link to `/services/5` or dynamically fetch the ESG service ID
**Actual:** Links to `/services/1` which may not be the ESG service


## Medium Bugs

### BUG-003: Document Upload Not Persisted to Database
**Severity:** Medium
**Location:** `app/services/[id]/apply/page.tsx`
**Description:** Documents uploaded in Step 3 of the wizard are stored only in component state. When the application is submitted, document metadata is not sent to the API or persisted.
**Steps to Reproduce:**
1. Start ESG application
2. Upload documents in Step 3
3. Submit application
4. Check database - no document records are created
**Expected:** Document information should be saved to ApplicationDocument table
**Actual:** Documents are lost after form submission


### BUG-004: Staff Portal API Route Returns HTML Instead of JSON
**Severity:** Medium
**Location:** `/api/staff`
**Description:** Accessing `/api/staff` returns a 404 HTML page instead of a JSON API response. The route appears to not exist as an API endpoint.
**Steps to Reproduce:**
1. Make GET request to `/api/staff`
2. Response is HTML 404 page
**Expected:** Should return JSON data or proper 404 JSON error
**Actual:** Returns HTML page


### BUG-005: Wizard Step 4 Validation Doesn't Re-validate Previous Steps
**Severity:** Medium
**Location:** `app/services/[id]/apply/page.tsx:384`
**Description:** The `validateStep(4)` function only validates Step 4 conditions, but doesn't verify that all previous steps were properly completed if user navigates directly.
**Steps to Reproduce:**
1. Start application wizard
2. Fill Step 1, proceed to Step 2
3. Go back to Step 1, clear required fields
4. Navigate directly to Step 4 using browser history
5. Submit - may succeed without re-validating Step 1
**Expected:** Submit should validate all steps before allowing submission
**Actual:** Only validates current step criteria


## Low Bugs

### BUG-006: Missing Loading State for ESG Service ID Fetch
**Severity:** Low
**Location:** `app/customer/page.tsx:73-75`
**Description:** The "Start New Application" button shows `/services` fallback while ESG service ID is being fetched, which can cause brief incorrect navigation.
**Steps to Reproduce:**
1. Navigate to `/customer` page
2. Immediately click "Start New Application" before fetch completes
3. User is sent to `/services` instead of ESG application
**Expected:** Button should show loading state or be disabled until service ID is fetched
**Actual:** Button is clickable immediately with fallback URL


### BUG-007: Application Description Concatenation Format
**Severity:** Low
**Location:** `app/services/[id]/apply/page.tsx:390-411`
**Description:** The description field concatenates ESG profiles with inconsistent formatting. Uses bullet points with dashes but also has "Not specified" fallbacks that may look unprofessional in the final description.
**Steps to Reproduce:**
1. Fill only the description fields, leave metric fields empty
2. Submit application
3. Description shows "- Carbon Emissions: Not specified" multiple times
**Expected:** Empty fields should be omitted or formatted more elegantly
**Actual:** Shows "Not specified" for all empty optional fields


### BUG-008: OCR Processing Simulation Never Fails
**Severity:** Low
**Location:** `app/services/[id]/apply/page.tsx` (simulateOCR function)
**Description:** The mocked OCR processing always succeeds (90% success rate simulated). In real implementation, error handling UI may not be properly tested.
**Steps to Reproduce:**
1. Upload any document
2. OCR always shows "complete" status eventually
**Expected:** Should occasionally show error state for testing purposes
**Actual:** Always succeeds


### BUG-009: Missing Error Boundary for AI Features
**Severity:** Low
**Location:** Multiple AI feature components
**Description:** If AI endpoints fail, error messages are logged to console but user feedback is minimal. No retry mechanism or graceful degradation.
**Steps to Reproduce:**
1. Disconnect from network
2. Try to use AI hints or completeness check
3. Silent failure with console error only
**Expected:** Clear user feedback about AI unavailability with retry option
**Actual:** Silent failure or generic error


### BUG-010: Home Page Search Input Text Color Contrast Issue
**Severity:** Low
**Location:** `app/page.tsx` (search input in hero section)
**Description:** The search input on the home page has poor color contrast. The placeholder text and user-typed text appear in black/dark color against the dark gradient background, making it difficult to read.
**Steps to Reproduce:**
1. Navigate to home page (`/`)
2. Look at the search input placeholder text
3. Type text into the search input
4. Text is black/dark colored which has poor contrast against the blue gradient background
**Expected:** Placeholder should be white/light grey, and typed text should be white for proper contrast
**Actual:** Text appears in dark color with poor visibility


### BUG-011: Application Submission Redirects Before Confirmation
**Severity:** Low
**Location:** `app/services/[id]/apply/page.tsx:435`
**Description:** After successful submission, user is immediately redirected to application detail page. No success message or confirmation is shown before redirect.
**Steps to Reproduce:**
1. Complete and submit application
2. Immediate redirect to `/customer/[id]`
**Expected:** Show success message/animation before redirect
**Actual:** Instant redirect without confirmation feedback


---

## Notes

- Testing performed on: December 7, 2025
- Environment: Development (localhost:3000)
- Database: SQLite (dev.db)
- All APIs are mocked implementations - real integrations may introduce additional bugs

