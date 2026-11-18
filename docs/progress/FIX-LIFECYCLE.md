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
- [x] PHA 1: H2 (GẤP) + H1 (DONE-VERIFIED — waiting for "TIẾP PHA 2")
- [ ] PHA 2: H4 Layout
- [ ] PHA 3: H3 Chat
- [ ] PHA 4: H5 Admin Stats
- [ ] PHA 5: Nghiệm thu tổng

## 5. PHA 1 Verification Summary [CHẠY LẠI HÔM NAY]
- **BE `.\gradlew.bat clean test --no-build-cache`**: **472/472 PASSED** (+11 new H1/H2 tests in `booking-service`: 55/55, 0 fail, 0 skip).
- **FE Static/Unit/Build**: `eslint --max-warnings=0` PASS, `tsc --noEmit` PASS, `vitest` 96/96 PASS, i18n parity 2210/2210 PASS, `verify-links` 96/96 PASS, `verify-manifest` 224/224 PASS, `next build` 202/202 PASS.
- **FE Playwright (`e2e/fix-lifecycle-h1-h2.spec.ts`)**: **2/2 PASSED** (13.6s), 8 screenshots captured (1440/390, light/dark) in `docs/design/screenshots/fix-lifecycle/pha1/`.
- **DB Migration `V8`**: Applied cleanly (`uq_contracts_request_id` UNIQUE index active; 2 historical duplicate `contracts.request_id` rows safely detached without deleting any row; 0 REJECTED/CANCELLED/EXPIRED requests had contracts).
- **5 Baseline "did not run" Playwright tests**: `e2e/hdr1-live-verification.spec.ts` tests #2-#6 (serial mode aborted after pre-existing failure in test #1).
- **Intentional test update**: `RentalRequestServiceTest.shouldDenyCrossLandlordApprovalAndParticipantReadIdor` updated to expect `RentalRequestNotFoundException` (HTTP 404 IDOR protection per PHA 1 spec).
- **Direct contract (`requestId == null`) decision**: Kept for legitimate landlord direct-contract workflow (`dashboard/landlord/contracts/page.tsx`, `ct-00000004`), hardened with mandatory room-owner verification via `BookingListingPort.getRoomOwnerId`.

