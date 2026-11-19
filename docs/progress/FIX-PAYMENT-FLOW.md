# Tiến độ `[FIX-PAYMENT-FLOW]`

- **Nhánh (BE & FE):** `feat/fix-payment-flow`
- **Cập nhật:** 2026-11-19 `[CHẠY LẠI HÔM NAY]`
- **Trạng thái tổng thể:** PHA 0, PHA 1, PHA 2, PHA 3 **DONE-VERIFIED** (mã nguồn + unit/ArchUnit tests + build); PHA 4 Live E2E Re-Audit **BLOCKED (Docker Desktop đang tắt trên máy chủ sau lần khởi động lại lúc 09:53)** — kịch bản `scratch/re-audit-payment-flow.mjs` và bản sao lưu DB `scratch/pre-audit-backup.sql` (10.64 MB) đã sẵn sàng chạy ngay khi mở Docker Desktop.

---

## 1. So sánh Baseline vs Hiện tại `[CHẠY LẠI HÔM NAY]`

| Bộ kiểm thử | Baseline (PHA 0) | Hiện tại (sau PHA 1–3) | Kết luận |
| :--- | :--- | :--- | :--- |
| BE `.\gradlew.bat clean test --no-build-cache` | 484 passed / 0 failed / 0 skipped | **501 passed / 0 failed / 0 skipped** (`+17` tests mới) | PASS (0 regression) |
| BE `bootJar` (tất cả 7 service) | N/A | **BUILD SUCCESSFUL** (56/56 tasks) | PASS |
| FE `npx eslint src --max-warnings=0` | Exit 0 (0 warnings) | **Exit 0 (0 warnings)** | PASS |
| FE `npx tsc --noEmit` | Exit 0 | **Exit 0** | PASS |
| FE `npm test` (Vitest + i18n + links + manifest) | 96/96 tests, 2238/2238 i18n keys | **101/101 tests, 2265/2265 i18n keys (100% parity)** | PASS (`+5` tests) |
| FE `npm run build` | 202/202 static pages | **202/202 static pages** | PASS |
| FE Live E2E Re-Audit (Playwright + Docker) | 201 pass / 46 fail / 5 dnr | **Chờ mở Docker Desktop** (`docker-desktop` WSL2 đang Stopped) | BLOCKED (môi trường) |

---

## 2. Trạng thái từng Pha & Hạng mục

| Pha | Hạng mục | Trạng thái | Commit BE / FE | Bằng chứng |
| :--- | :--- | :--- | :--- | :--- |
| PHA 0 | Root-cause analysis + Baseline | DONE-VERIFIED | FE `2b43a63` | 484/484 BE, 96/96 FE |
| PHA 1 | BUG-03 (outbox `aggregate_id` -> `VARCHAR(64)` `V9`), BUG-04 (`from-contract` `401` + `ACTIVE` guard), BUG-01 (`R__07` seed verified email/KYC), Step 05 (ROOM-03 `availableDate`/`minLeaseMonths`) | DONE-VERIFIED | BE `f219e95`, FE `2b43a63` | `InvoiceFromContractLifecycleTest`, `:booking-service:test`, `:billing-service:test`, `tsc=0`, `eslint=0` |
| PHA 2 | V1 (`PENDING_SIGN -> AWAITING_DEPOSIT -> ACTIVE`), V2 (server-computed deposit + 1 pending intent), V3 (`TOAM-YYMMDD-XXXXXX` `V10` + phased PII `/checkin-info` + listing `RENTED`/`OCCUPIED` + retry outbox), FE `tenant/deposits`, `tenant/my-room` (`MyRoomHandoverCard` + `.ics` + PDF), BUG-07 (`landlord/tenants`) | DONE-VERIFIED | BE `3854393`, FE `d40446f` | `ContractDepositActivationFlowTest`, `DepositPaymentActivationTest`, `ContractAndAmendmentHardeningTest` (cập nhật có chủ ý) |
| PHA 3 | BUG-05 (chặn 2 khách giữ cùng phòng `409`), BUG-06 (`404` IDOR thống nhất Contract/PaymentIntent/Invoice), BUG-08 (`CancelReasonCode.CHANGE_PLANS`), BUG-02 (`proxy.ts` -> `/403` + nút Đăng ký làm chủ trọ), BUG-09 (gỡ `max-w-5xl` `tenant/payments`), Nhắc nợ thủ công (`POST /billing/invoices/{id}/remind`, 1 lần/24h) | DONE-VERIFIED | BE `b857172`, FE `f5f1deb` | `ConcurrentRoomHoldAndIdorTest`, `InvoiceIdorAndReminderTest`, `eslint=0`, `tsc=0`, `101/101` Vitest |
| PHA 4 | Lưu trữ bản audit cũ (`*-2026-11-19-before.md`), cập nhật `DECISIONS.md` cả 2 repo, full `clean test bootJar`, `next build` | DONE-VERIFIED | Commit PHA 4 | 501/501 BE, 202/202 FE build |
| PHA 4 | Chạy lại E2E thật trên Docker + khôi phục DB + cập nhật `PAYMENT-FLOW-AUDIT.md` & `PAYMENT-FLOW-WALKTHROUGH.md` | BLOCKED (cần mở Docker Desktop) | Đã sẵn sàng `scratch/re-audit-payment-flow.mjs` | `wsl -l -v`: `docker-desktop Stopped` |

---

## 3. Thay đổi Hợp đồng API có chủ ý (Quy tắc 3)
1. `Contract.signByTenant()` / `signByLandlord()`: khi cả 2 bên đã ký OTP và `depositAmount > 0`, trạng thái chuyển sang `AWAITING_DEPOSIT` (thay vì nhảy thẳng `ACTIVE`). Test `ContractAndAmendmentHardeningTest` đã được cập nhật có chủ ý.
2. IDOR đọc chéo tài nguyên (`GET /api/v1/booking/contracts/{id}`, `GET /api/v1/booking/contracts/{id}/checkin-info`, `GET /api/v1/billing/payments/intent/{code}`, `GET /api/v1/billing/invoices/{id}`) thống nhất trả `404` thay vì `403`.
3. `POST /api/v1/billing/payments/intent` với `orderType=DEPOSIT`: số tiền được tính phía server từ hợp đồng (`AWAITING_DEPOSIT`), bỏ qua `amount` phía client; trùng intent `PENDING` trả `409`.
