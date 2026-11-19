# FIX-PAYMENT-FLOW — Progress Tracker & PHA 0 Root-Cause Report

- **Nhánh làm việc:** `feat/fix-payment-flow`
  - `accommodation-service`: branched from `feat/fix-lifecycle-chat-layout-stats` @ `821e0bb`
  - `accommodation-web`: branched from `feat/fix-lifecycle-chat-layout-stats` @ `60ff4e8` (đã commit riêng `docs/review/` trước khi tách nhánh)
- **Trạng thái hiện tại:** **PHA 0 DONE-VERIFIED — DỪNG CHỜ XÁC NHẬN TRƯỚC PHA 1**

---

## 1. BASELINE trước khi sửa `[CHẠY LẠI HÔM NAY]`
*(Chạy trên cùng commit code `821e0bb` BE / `9a004cf` FE — `60ff4e8` chỉ thêm `docs/review/`)*

| Bộ kiểm thử | Kết quả Baseline |
|---|---|
| BE `.\gradlew.bat clean test --no-build-cache` | **484/484 PASSED** (0 fail, 0 skip — `admin`:18, `api-gateway`:9, `billing`:35, `booking`:57, `common`:33, `communication`:34, `identity`:197, `listing`:101) |
| FE `npx eslint . --max-warnings=0` | **PASS (0)** |
| FE `npx tsc --noEmit` | **PASS (0)** |
| FE `npm test` (Vitest + i18n + links + manifest) | **PASS** (21 files, 96/96 tests; 2238/2238 i18n keys; 96 links; 224 images) |
| FE `npm run build` | **PASS** (202/202 static pages) |
| FE Playwright (`npx playwright test --reporter=list`) | **201 pass / 46 fail / 5 did not run** (252 total; 46 fail đều là lỗi có sẵn từ trước) |

---

## 2. Sơ đồ liên kết thật & Chỗ nối còn thiếu `[ĐỌC TỪ MÃ]`

```
[RentalRequest: PENDING]
   |-- POST /booking/rental-requests/{id}/approve
   |     -> BUG-03: tạo sagaId = "saga-" + UUID (41 chars) -> INSERT appointment_event_outbox.aggregate_id VARCHAR(36) -> SQL 1406 -> 409!
   |     -> Tạo Contract (status = PENDING_SIGN) + gọi openEscrowHold
   v
[Contract: PENDING_SIGN]
   |-- POST /contracts/{id}/sign-landlord & /sign-tenant (OTP + emailVerified + kycVerified)
   |     -> THIẾU TRẠNG THÁI AWAITING_DEPOSIT: Contract.java:135 & 145 nhảy thẳng sang ACTIVE ngay sau khi 2 bên ký!
   v
[PaymentIntent: DEPOSIT]
   |-- POST /billing/payments/intent (FE tenant/deposits cho nhập tay depositAmount thay vì server tính từ contract!)
   |-- POST /billing/payments/sandbox/simulate-webhook -> PAID
   |     -> Ghi sổ cái kép (DEBIT GATEWAY / CREDIT ESCROW) + escrowService.recordDepositPaid + billing_event_outbox(PAYMENT_PAID)
   |     -> THIẾU LIÊN KẾT #1: Không có callback/event từ billing-service -> booking-service để chuyển Contract AWAITING_DEPOSIT -> ACTIVE và advance RentalSagaOrchestrator!
   |     -> THIẾU LIÊN KẾT #2: HttpBookingListingAdapter.releaseRoomHold() chỉ log.info (NO-OP), và listing-service CHƯA CÓ endpoint nội bộ đổi rooms.status -> RENTED / occupancy_status -> OCCUPIED!
   v
[Tenant My-Room (/dashboard/tenant/my-room)]
   |-- Đọc getTenantContracts() + public getRoomDetail(roomId)
   |     -> THIẾU LIÊN KẾT #3: Chưa có mã đơn TOAM-YYMMDD-XXXXXX, chưa tiết lộ địa chỉ đầy đủ + SĐT chủ trọ + hướng dẫn nhận phòng sau ACTIVE qua API riêng tư có bảo vệ IDOR 404.
```

---

## 3. Bảng Nguyên nhân gốc (PHA 0)

| Lỗi | Nguyên nhân gốc | File và dòng | Cách sửa dự kiến | Rủi ro phá code |
|---|---|---|---|---|
| **BUG-03** (`409` khi duyệt mọi yêu cầu thuê) | `sagaId = "saga-" + request.getId()` dài **41 ký tự** nhưng `appointment_event_outbox.aggregate_id` là `VARCHAR(36)` -> MySQL `ErrorCode 1406 Data too long` -> `DataIntegrityViolationException` -> `AppointmentExceptionHandler` trả nhầm `409 DATA_CONFLICT`. Tái hiện trên cả phòng `#206` và `#1`. | `RentalRequestService.java:225`, `RentalSagaOrchestrator.java:70`, `booking-service` schema `appointment_event_outbox` | Migration additive `V9` mở rộng `aggregate_id` lên `VARCHAR(64)` (và `saga_instances.saga_id` nếu cần); giữ thông báo lỗi xung đột rõ ràng cho xung đột thật. | Thấp (migration additive mở rộng cột) |
| **BUG-04** (`401` khi sinh hóa đơn từ hợp đồng) | (1) `GenerateFromContractCommand` dùng `long` nguyên thủy cho `serviceAmount`/`otherAmount` -> thiếu field gây `HttpMessageNotReadableException`; (2) `billing-service` `SecurityConfig` không `permitAll()` `/error` -> mọi `400` bị biến thành `401 ERR_AUTH_UNAUTHORIZED`. | `InvoiceDto.java:45-46`, `billing-service/.../SecurityConfig.java:43-53`, `InvoiceService.java:84-110` | Đổi `serviceAmount`/`otherAmount` sang `Long` (mặc định `0L`), thêm `"/error"` vào `permitAll()` và handler `HttpMessageNotReadableException -> 400`, giữ kiểm tra `ACTIVE` & chống trùng kỳ. | Thấp |
| **BUG-01** (`u-tenant-01` bị `403 EMAIL_NOT_VERIFIED`) | Seed `R__01_seed_demo_identity.sql` để `email_verified_at = NULL` cho `u-tenant-01` (và KYC chưa `APPROVED` đồng nhất). | `identity-service/src/main/resources/db/seed/R__01_seed_demo_identity.sql` | Cập nhật file seed lặp lại `R__` đặt `email_verified_at` và KYC `APPROVED` cho tài khoản demo (`u-tenant-01`, `u-tenant-02`, `u-landlord-01`), không sửa migration cũ. | Thấp |
| **Bước 05** (Tạo phòng mới) | Lỗi `400` trong audit do script thiếu `wardId`/`roomTypeId`. Form thật `/dashboard/landlord/rooms/new` gửi đúng `wardId`/`roomTypeCode` nhưng thiếu 2 ô nhập ROOM-03 (`availableDate`, `minLeaseMonths`). | `accommodation-web/.../dashboard/landlord/rooms/new/page.tsx:31-90` | Bổ sung 2 trường `availableDate`, `minLeaseMonths` vào form & test Playwright điền form thật tạo phòng thành công. | Thấp |
| **V1/V2/V3** (Đứt chuỗi hợp đồng -> cọc -> phòng `RENTED` -> My-Room) | `Contract` nhảy thẳng `PENDING_SIGN -> ACTIVE`; `PaymentIntent` nhận `amount` từ client; cọc `PAID` không gọi `booking-service` kích hoạt hợp đồng và không gọi `listing-service` đổi phòng sang `RENTED`; thiếu mã đơn `TOAM-...` & API tiết lộ thông tin nhận phòng theo giai đoạn. | `Contract.java:134-145`, `PaymentService.java:130,275-295`, `HttpBookingListingAdapter.java:132`, `tenant/deposits/page.tsx:26`, `tenant/my-room/page.tsx` | PHA 2: Thêm trạng thái `AWAITING_DEPOSIT`, server tự tính tiền cọc từ hợp đồng, kích hoạt idempotent + đổi phòng `RENTED` qua internal API + bù trừ, sinh mã đơn `TOAM-YYMMDD-XXXXXX`, tiết lộ PII theo giai đoạn & cập nhật UI My-Room/Deposits. | Trung bình (cần giữ tương thích test hợp đồng hiện có) |
| **BUG-05** (N6: 2 khách cùng đặt 1 phòng) | `RentalRequestService.createRequest` chỉ check `existsActiveRequest(roomId, tenantId)` theo từng tenant, không khóa hàng/không giữ phòng khi có 2 yêu cầu đồng thời từ 2 tenant khác nhau. | `RentalRequestService.java:119-130` | Thêm cơ chế hold/lock theo `roomId` (khi approve hoặc tạo giữ chỗ có hạn) + trả `409` thông báo tiếng Việt rõ ràng cho người thứ hai. | Trung bình |
| **BUG-06** (N7: IDOR trả `403`/`401` thay vì `404`) | Participant check ở `RentalRequestService`, `ContractService`, `PaymentService`, `InvoiceService` ném `AccessDeniedException` (403) thay vì `NotFoundException` (404). | `RentalRequestService.java:270`, `ContractService.java`, `PaymentService.java`, `InvoiceService.java` | Chuẩn hóa trả `404` cho cross-tenant IDOR và cập nhật có chủ ý các unit test cũ đang kỳ vọng `403`. | Trung bình (cần cập nhật test cũ có chủ ý) |
| **BUG-07** (`landlord/tenants` hiện `#ant-02` & `PENDING_SIGN`) | Trang cắt đuôi `tenantId` và không lọc `status === 'ACTIVE'`. | `accommodation-web/.../dashboard/landlord/tenants/page.tsx` | Lọc chỉ hợp đồng `ACTIVE`, hiển thị tên khách từ snapshot/i18n fallback (tuyệt đối không cắt UUID). | Thấp |
| **BUG-08** (N2: Hủy lịch hẹn trả `400`) | `CancelReasonCode` chỉ có `BUSY, ROOM_TAKEN, TENANT_NOT_ELIGIBLE, TIME_CONFLICT, OTHER` (không có `CHANGE_PLANS`). | `CancelReasonCode.java:3-9` | Thêm giá trị hợp lệ (additive, không đổi enum cũ) và đồng bộ giữa FE modal hủy lịch hẹn & BE. | Thấp |
| **BUG-02** (TENANT vào `/landlord/**` redirect `/dashboard/landlord/kyc`) | `proxy.ts:149-156` redirect mọi `TENANT` vào `/dashboard/landlord/kyc` mà không kiểm tra đã nộp hồ sơ hay chưa, và khi `localePrefix === ''` bị mất `/vi`. | `accommodation-web/src/proxy.ts:149-156` | Chuyển `TENANT` chưa nộp hồ sơ sang `/${locale}/403` (có nút "Đăng ký làm chủ trọ"); giữ redirect KYC cho người đã nộp hồ sơ chờ duyệt. | Thấp |
| **BUG-09** (`tenantName=null`, `max-w-5xl` ở `tenant/payments`) | `identityVerificationPort.resolveUserFullName` trả `null` nếu thiếu mapping; `tenant/payments/page.tsx:52` còn `max-w-5xl`. | `RentalRequestService.java:137-138`, `tenant/payments/page.tsx:52` | Sửa lookup `resolveUserFullName` (điền snapshot tên khách lúc tạo) và gỡ `max-w-5xl` trên `tenant/payments`. | Thấp |

