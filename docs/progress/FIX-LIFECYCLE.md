# FIX-LIFECYCLE-CHAT-LAYOUT-ADMINSTATS — Progress Tracker

## 1. Git & Branch Setup [CHẠY LẠI HÔM NAY]
- `accommodation-service`: branched `feat/fix-lifecycle-chat-layout-stats` from `main` (`97db6cc`), working tree clean.
- `accommodation-web`: stashed pre-existing `M package-lock.json` (`git stash push -m "pre-fix-lifecycle: package-lock.json from npm install"`), branched `feat/fix-lifecycle-chat-layout-stats` from `main` (`e322189`).

## 2. BASELINE (Pre-Fix) [CHẠY LẠI HÔM NAY]

| Check | Command | Result |
|---|---|---|
| BE Unit & ArchUnit | `.\gradlew.bat clean test --no-build-cache` | **461/461 PASSED** (0 fail, 0 skip) in 6m 14s |
| FE ESLint | `npx eslint . --max-warnings=0` | **PASS** (exit 0) |
| FE TypeScript | `npx tsc --noEmit` | **PASS** (exit 0) |
| FE Vitest + i18n + Links + Manifest | `npm test` | **PASS** (21 files, 96/96 tests; 2184/2184 i18n keys; 95 links; 224 images) |
| FE Production Build | `npm run build` | **PASS** (202/202 static pages) |
| FE Playwright E2E | `npx playwright test --reporter=list` | **194 passed / 47 failed / 5 did not run** (246 total, 10.6m) |

### BE Module Breakdown (461/461 PASSED)
- `admin-service`: 13 | `api-gateway`: 8 | `billing-service`: 35 | `booking-service`: 44
- `common`: 33 | `communication-service`: 30 | `identity-service`: 197 | `listing-service`: 101

### Pre-Existing Failing Playwright Tests (47 failed — recorded to prevent false regressions)
- `e2e/admin-rbac.spec.ts` (1): Moderator RBAC menu check
- `e2e/admin-reports.spec.ts` (2): 1440px & 390px
- `e2e/auth-forgot-mailpit-full-flow.spec.ts` (1): Forgot password Mailpit OTP flow
- `e2e/auth-rbac-middleware.spec.ts` (1): Admin real form login
- `e2e/auth-token-refresh.spec.ts` (1): Silent token refresh
- `e2e/auth-ui-live.spec.ts` (3): Register/phone login, forgot password Mailpit, Google Auth forged token
- `e2e/capture-landlord-screenshots.spec.ts` (1): 1440px timeout
- `e2e/capture-landlord-visuals.spec.ts` (1): 390px upload timeout
- `e2e/common-matrix-audit.spec.ts` (25): support / support-new / support-detail matrix + submit
- `e2e/common-pages.spec.ts` (6): support / support-new / support-detail 1440px & 390px
- `e2e/hdr1-live-verification.spec.ts` (1): Hero transparency/contrast
- `e2e/landlord-gateway-api-flow.spec.ts` (1): Real form login rooms 200 OK
- `e2e/list1-verification.spec.ts` (2): Mega-menu category context & Axe check
- `e2e/qa-fintech-sprint3.spec.ts` (1): Sprint 3 E2E timeout

## 3. PHA 0 Diagnosis Summary — Status: DONE-VERIFIED

| Item | Status | Root Cause Summary |
|---|---|---|
| H1 (Appointments Complete) | NOT-DONE | BE has `POST .../complete` (missing `PATCH .../complete` & `.../no-show`, missing `409 ERR_APPOINTMENT_NOT_STARTED`, missing idempotency, missing `tenantId`/`roomTitle` in outbox). FE `AppointmentListView.tsx` hides complete/no-show buttons before `scheduledStart` (only shows Cancel) and renders empty `SĐT khách:` label + blank tenant name when null. |
| H2 (Rental Requests & Contract) | NOT-DONE | FE `rental-requests/page.tsx` lines 101-128 use `status === 'PENDING' ? ... : CreateContractButton`, causing REJECTED/CANCELLED/EXPIRED to show "Tao hop dong". Also shows raw UUID (`tenantId`), `#roomId`, counts all statuses in title, mixes moveInDate & createdAt. BE `ContractService.createContract` never validates `requestId` status (`APPROVED`) or duplicate contract; `RentalRequest` lacks `rejectionReason`, `tenantName`, `roomTitle`. |
| H3 (Chat) | NOT-DONE | Polling in `useChat.ts` ignores `autoLoad` & `document.hidden`; `startOrGetConversation` has race condition (no unique lock); IDOR returns 403 instead of 404; no Redis rate limit/length cap/XSS sanitization/pagination; failed send clears draft; hardcoded `u-hao-01` alias collides with `u-landlord-02`; no chat entry from appointments/rental-requests; mobile layout stacks both panes inside fixed `h-[640px]`; input lacks Shift+Enter textarea. |
| H4 (Dashboard Layout) | NOT-DONE | `DashboardLayout.tsx` line 99 wraps both `DashboardSidebar` and `<main>` in `mx-auto w-full max-w-7xl` (measured `asideLeft = 80px` at 1440px), `<main>` lacks `min-w-0`, pages add redundant narrow `max-w-4xl`/`max-w-5xl`. |
| H5 (Admin Platform Stats) | NOT-DONE | `AdminDashboardController` runs cross-schema `jdbcTemplate` SQL (`cozynest_identity`, `cozynest_listing`, `cozynest_booking`) which silently fail under least-privilege `admin_user` and are swallowed -> `/analytics` returns `0 / []`, `/stats` falls back to static `daily_statistics` seed (`1420`, `520`, `285000000`). FE `admin/analytics/page.tsx` hardcodes fake `+6.2%`, `-1.5`, `+24.8%` and static sparkline arrays. Missing `/api/v1/admin/stats/overview` & `/timeseries`. |

## 4. Phase Checklist
- [x] PHA 0: Chẩn đoán & BASELINE (DONE-VERIFIED)
- [x] PHA 1 & 1B: H2 (GẤP) + H1 + Security/Fixture/Consumer/Tenant Verification (DONE-VERIFIED)
- [x] PHA 2: H4 Layout (DONE-VERIFIED)
- [x] PHA 3: H3 Chat (DONE-VERIFIED)
- [x] PHA 4: H5 Admin Stats (DONE-VERIFIED)
- [x] PHA 5: Nghiệm thu tổng & Tài liệu (DONE-VERIFIED)

## 5. PHA 1 & 1B Verification Summary [CHẠY LẠI HÔM NAY]
- **BE (`c52a3eb`, `51ad54c`)**:
  - Migration `V8__rental_request_snapshots_and_contract_unique_request.sql` applied on live MySQL (`uq_contracts_request_id` UNIQUE index active; 2 historical duplicate `PENDING_SIGN` contracts `e2c83aa1-2957-4bb9-9a1f-d494c6ba53f1` / `HD-2026-3E9E195A` and `010a704c-97bc-4524-8aae-55d2a440abae` / `HD-2026-DC4C5D3C` safely detached with `request_id = NULL`, zero rows deleted — proposed for owner decision to cancel; 0 REJECTED/CANCELLED/EXPIRED requests had contracts).
  - `DevAppointmentFixtureController` dual-gated with `@Profile({"dev", "test"})` AND `@ConditionalOnProperty(name = "app.booking.fixtures.enabled", havingValue = "true", matchIfMissing = false)` (OFF by default in `dev`, absent in `prod`, proven by `BookingLifecycleSecurityMatrixTest`).
  - Live 5-role + IDOR HTTP matrix verified: GUEST=401, TENANT=403, LANDLORD_OWNER=200/409, LANDLORD_B_IDOR=404, MODERATOR=403, ADMIN=403/404/409.
  - `communication-service`: `CommunicationEventListener` consumes `APPOINTMENT_COMPLETED`, `APPOINTMENT_NO_SHOW`, and `RENTAL_REQUEST_REJECTED` (with `rejectionReason`) idempotently via `CommunicationInboxStore` (`CommunicationAppointmentEventsTest`).
  - Direct contract (`requestId == null`) decision: kept for legitimate landlord direct-contract workflow (`ct-00000004`), hardened with mandatory room-owner verification via `BookingListingPort.getRoomOwnerId`.
- **FE (`617c097`)**: `e2e/fix-lifecycle-h1-h2.spec.ts` **2/2 PASSED**, 8 screenshots in `docs/design/screenshots/fix-lifecycle/pha1/`.

## 6. PHA 2 (H4 Layout) Verification Summary [CHẠY LẠI HÔM NAY]
- **FE (`4693d59`)**: Removed `mx-auto max-w-7xl` from outer `DashboardLayout` wrapper -> `asideLeft === 0px` across 1024/1440/1920/2560, content capped at `max-w-[1600px]`, desktop collapse toggle, mobile drawer `<1024px` with `Escape` + backdrop close, zero horizontal overflow across landlord/tenant/admin.
- **Playwright (`e2e/fix-layout-h4.spec.ts`)**: **2/2 PASSED**, 6 screenshots in `docs/design/screenshots/fix-lifecycle/pha2/`.

## 7. PHA 3 (H3 Chat) Verification Summary [CHẠY LẠI HÔM NAY]
- **BE (`7d51e6e`)**: Migration `V5__chat_unique_pair_key.sql` (`UNIQUE uq_conversations_pair_key`), `404 ConversationNotFoundException` IDOR guard, `429 ChatRateLimitException` (20 msgs / 10s), max 2000 chars, raw XSS stored verbatim, removed `u-hao-01` alias from `u-landlord-02`, optional `before` cursor pagination. `communication-service`: **34/34 PASSED**.
- **FE (`eb47600`)**: `SafeMessageContent.tsx` (HTML-escaped, linkifies `http`/`https` only), `useChat.ts` pauses polling when widget closed or `document.hidden`, draft preserved on send failure, `<textarea>` Enter/Shift+Enter + mobile 1-col toggle on landlord & tenant messages, "Nhắn tin" entry from rental requests & appointment drawer.
- **Playwright (`e2e/fix-chat-h3.spec.ts`)**: **1/1 PASSED** (2-browser Tenant <-> Landlord real-time messaging + XSS probe verified safe), 3 screenshots in `docs/design/screenshots/fix-lifecycle/pha3/`.

## 8. PHA 4 (H5 Admin Platform Statistics) Verification Summary [CHẠY LẠI HÔM NAY]
- **BE (`dbecc1f`)**: Removed all cross-schema SQL and `catch (Exception ignored)` from `AdminDashboardController`; preserved least-privilege `admin_user`. Added 4 internal endpoints secured by constant-time `X-Internal-Service-Key` (`identity`, `listing`, `booking`, `billing`), blocked at API Gateway (`404` proven in unit test & live HTTP). Added `GET /api/v1/admin/stats/overview` & `/timeseries` (`@PreAuthorize("hasRole('ADMIN')")`, 3s/5s timeouts, 30s cache, `degraded` flag + `failedSources` + `null` on failed source).
  - Live 5-role matrix: GUEST=401, TENANT=403, LANDLORD=403, MODERATOR=403, ADMIN=200, invalid date range=400, Gateway `/internal/stats/identity`=404.
  - Live DB reconciliation (`degraded=false`, all 4 sources `OK`): `totalUsers=25`, `pendingKyc=3`, `totalRooms=85`, `activeRooms=69`, `totalViews=23874`, `totalAppointments=47`, `completedAppointments=8`, `totalRentalRequests=8`, `totalContracts=6`, `activeContracts=2`, `paidInvoices=2`, `paidRevenue=9695000`, `fintechMode=SANDBOX_ONLY`.
- **FE (`d259c79`)**: Removed all fake hardcoded `+6.2%`, `-1.5`, `+24.8%`, static sparklines, and fake repository fallbacks. Connected to `/overview` & `/timeseries`, added 7/30/90/custom date range picker, CSV export (UTF-8 BOM), `SANDBOX_ONLY` badge, degraded warning banner.
- **Playwright (`e2e/fix-admin-stats-h5.spec.ts`)**: **1/1 PASSED**, 2 screenshots in `docs/design/screenshots/fix-lifecycle/pha4/`.

## 9. PHA 5 Final Verification vs BASELINE [CHẠY LẠI HÔM NAY]

| Check | Baseline | Final (PHA 5) | Delta |
|---|---|---|---|
| BE `.\gradlew.bat clean test --no-build-cache` | 461/461 PASSED (0 fail) | **484/484 PASSED** (0 fail, 0 skip) | **+23 new tests, 0 regressions** |
| FE `npx eslint . --max-warnings=0` | PASS (0) | **PASS (0)** | Clean |
| FE `npx tsc --noEmit` | PASS (0) | **PASS (0)** | Clean |
| FE `npm test` (Vitest + i18n + links + manifest) | 96/96, 2184 keys | **96/96, 2238/2238 keys, 96 links, 224 images** | +54 i18n keys (100% parity) |
| FE `npm run build` | 202/202 static pages | **202/202 static pages** | Clean |
| FE Playwright (`npx playwright test --reporter=list`) | 194 pass / 47 fail / 5 dnr (246) | **200 pass / 47 fail / 5 dnr (252)** -> after updating `landlord-appointments-visual.spec.ts:212` label: **201 pass / 46 fail / 5 dnr** | **+6/6 new tests PASS, +1 baseline improved (`auth-token-refresh`), 0 regressions** |


