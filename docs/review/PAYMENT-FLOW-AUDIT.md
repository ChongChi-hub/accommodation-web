# PAYMENT-FLOW-AUDIT — Báo cáo Kiểm thử Luồng Thuê Trọ & Thanh Toán

- **Ngày kiểm thử:** 2026-11-19 `[CHẠY LẠI HÔM NAY]`
- **Nhánh & Commit đang kiểm tra:**
  - `accommodation-service`: `feat/fix-lifecycle-chat-layout-stats` @ `821e0bb` (working tree sạch, không sửa mã)
  - `accommodation-web`: `feat/fix-lifecycle-chat-layout-stats` @ `9a004cf` (chỉ thêm tài liệu/ảnh trong `docs/review/`)
- **Môi trường:** 11 container BE (`healthy`, Gateway `http://localhost:8080`), FE production build (`http://localhost:3000/vi`), Mailpit (`http://localhost:8025`), MySQL 8.4 (`cozynest_mysql`).
- **Bảo vệ dữ liệu:** Đã dump toàn bộ 6 schema trước khi chạy (`pre-audit-backup.sql`, 10.64 MB) và **đã khôi phục nguyên trạng** sau khi chạy (`FINAL_RESTORE_EXIT=0`, khớp 100% số dòng ở cả 10 bảng cốt lõi).

---

## (a) Tóm tắt một trang

| Trạng thái | Số bước (Cảnh 1–8) | Danh sách bước |
|---|---:|---|
| **PASS** | **5** | Bước 02, 03, 07, 08, 16 |
| **WORKAROUND** | **2** | Bước 09 (xác minh email seed trong DB để đặt lịch), Bước 10 (lùi `scheduled_start` trong DB để bấm Hoàn thành sau giờ hẹn) |
| **SANDBOX** | **2** | Bước 14 (đặt cọc VietQR + webhook mô phỏng + sổ cái kép), Bước 18 (thanh toán hóa đơn tháng sandbox) |
| **PARTIAL** | **6** | Bước 04, 06, 11 (tạo được sau workaround email nhưng `tenantName=null`), 15, 17 (ghi điện nước `200`, sinh hóa đơn `401`), 18 |
| **FAIL** | **3** | Bước 01 (TENANT vào `/landlord/rooms/new` bị chuyển `/dashboard/landlord/kyc` thay vì `/403`), Bước 05 (tạo phòng mới `400`), Bước 12–13 (duyệt yêu cầu thuê trả `409` trên phòng #206 nên không ký OTP/tải PDF trên hợp đồng mới) |
| **NOT-IMPLEMENTED** | **1** | Nhắc nợ hóa đơn quá hạn tự động có nút/giao diện chủ động trên FE Cảnh 8 (BE có cột `overdue_notified_at`/`reminder_count` nhưng chưa có nút gửi nhắc nợ thủ công trên UI) |

> **Tổng thời gian chạy luồng chính trên trình duyệt (18 bước):** **~55.4 giây** (chạy tự động bằng Playwright; thời lượng thuyết trình demo trực tiếp ước tính **8–10 phút**).

---

## (b) Bảng chi tiết 18 bước (Cảnh 1 – Cảnh 8) `[CHẠY LẠI HÔM NAY]`

File CSV đầy đủ: [steps.csv](file:///d:/RIKKEI/THUC_TAP/PROJECT/accommodation-web/docs/review/payment-flow/steps.csv) | Video quay luồng chính: [page@05d0740e5e5cd09c6eee13438439aee8.webm](file:///d:/RIKKEI/THUC_TAP/PROJECT/accommodation-web/docs/review/payment-flow/page@05d0740e5e5cd09c6eee13438439aee8.webm)

| Bước | Cảnh | Vai trò (Email seed, MK: xem seed) | URL / Thao tác | API thật (HTTP) | Thay đổi trạng thái & Sổ cái | Thời gian | Trạng thái | Ảnh |
|---:|---|---|---|---|---|---:|---|---|
| 01 | Cảnh 1 | TENANT (`tenant@cozynest.vn`) | Mở `/vi/dashboard/landlord/rooms/new` kiểm tra chặn quyền | Navigation redirect | URL chuyển sang `/dashboard/landlord/kyc` (thiếu `/vi`, không sang `/403`) | 2.82s | **FAIL** | `step-01-s1-guard-landlord-route.png` |
| 02 | Cảnh 1 | LANDLORD (`landlord@cozynest.vn`) | Đăng nhập & mở `/vi/dashboard/landlord/kyc` | `POST /api/auth/login -> 200` | Không đổi DB; không lộ JWT trong `document.cookie` / `localStorage` | 3.06s | **PASS** | `step-02-s1-landlord-kyc.png` |
| 03 | Cảnh 1 | ADMIN (`admin@cozynest.vn`) | Mở `/vi/dashboard/admin/kyc` | `GET /api/v1/admin/kyc -> 200` | Hiện tiêu đề "Kiểm duyệt hồ sơ định danh chủ trọ" | 3.00s | **PASS** | `step-03-s1-admin-kyc-queue.png` |
| 04 | Cảnh 2 | LANDLORD (`landlord@cozynest.vn`) | Mở `/vi/dashboard/landlord/rooms/new` kiểm tra trường ROOM-03 | `GET /api/v1/locations/* -> 200` | Form tải sạch, nhưng bước đầu không hiện rõ nhãn trường ROOM-03 (`availableDate`, `minLeaseMonths`) | 3.09s | **PARTIAL** | `step-04-s2-landlord-new-room-form.png` |
| 05 | Cảnh 2 | LANDLORD (`landlord@cozynest.vn`) | Gửi `POST /api/v1/landlord/rooms` tạo phòng mới | `POST /api/v1/landlord/rooms -> 400` | Bị từ chối Validation Failed (`wardId` / `roomTypeId` bắt buộc số); fallback phòng `#206` | 0.48s | **FAIL** | `step-05-s2-create-room-submit.png` |
| 06 | Cảnh 2 | ADMIN (`admin@cozynest.vn`) | Mở `/vi/dashboard/admin/rooms` duyệt tin | `GET /api/v1/admin/rooms -> 200` | Dùng phòng đã duyệt `#206` (`PUBLISHED`) do Bước 05 lỗi | 2.94s | **PARTIAL** | `step-06-s2-admin-approve-room.png` |
| 07 | Cảnh 3 | GUEST (Chưa đăng nhập) | Mở `/vi/rooms` & kiểm tra phòng `#206` công khai | `GET /api/v1/rooms/206 -> 200` | Phòng `#206` (`nha-nguyen-can-binh-duong-206`, `PUBLISHED`) hiển thị công khai | 1.69s | **PASS** | `step-07-s3-guest-search-rooms.png` |
| 08 | Cảnh 3 | GUEST (Chưa đăng nhập) | Mở `/vi/rooms/nha-nguyen-can-binh-duong-206` kiểm tra ẩn PII | `GET /api/v1/rooms/nha-nguyen-can-binh-duong-206 -> 200` | `landlordPhone=null` (không lộ SĐT), địa chỉ số nhà không lộ công khai | 2.09s | **PASS** | `step-08-s3-guest-room-detail-privacy.png` |
| 09 | Cảnh 3 | TENANT (`tenant@cozynest.vn`) | Đặt lịch xem phòng `#206` (`POST /api/v1/tenant/appointments`) | Gốc: `403 EMAIL_NOT_VERIFIED`; sau workaround DB: `200` | `viewing_appointment`: `NONE -> PENDING` (sau khi bật `email_verified_at` cho seed `u-tenant-01`) | 3.33s | **WORKAROUND** | `step-09-s3-tenant-book-appointment.png` |
| 10 | Cảnh 4 | LANDLORD (`landlord@cozynest.vn`) | Xác nhận lịch -> thử Hoàn thành sớm -> lùi giờ DB -> Hoàn thành -> gọi lặp | `confirm -> 200`, `complete(sớm) -> 409 ERR_APPOINTMENT_NOT_STARTED`, `complete(sau giờ) -> 200`, `repeat -> 200` | `PENDING -> CONFIRMED -> COMPLETED` (idempotent; cần lùi `scheduled_start` trong DB khi demo) | 3.30s | **WORKAROUND** | `step-10-s4-landlord-confirm-complete-appt.png` |
| 11 | Cảnh 5 | TENANT (`tenant@cozynest.vn`) | Gửi yêu cầu thuê phòng `#206` (`POST /api/v1/booking/rental-requests`) | Gốc: `403 EMAIL_NOT_VERIFIED`; sau workaround: `200` | `rental_request`: `NONE -> PENDING`; `roomTitle` có giá trị nhưng `tenantName=null` | 3.35s | **PARTIAL** | `step-11-s5-rental-request-created.png` |
| 12 | Cảnh 5 | LANDLORD (`landlord@cozynest.vn`) | Duyệt yêu cầu thuê & tạo hợp đồng | `POST .../approve -> 409`; `POST /contracts -> 409 ERR_RENTAL_REQUEST_INVALID_STATE` | Duyệt yêu cầu trả `409` trên phòng `#206` (không sang được `APPROVED` -> chặn tạo hợp đồng đúng luật H2) | 1.62s | **FAIL** | `step-12-s5-approve-req-create-contract.png` |
| 13 | Cảnh 5 | LANDLORD + TENANT | Ký OTP hợp đồng, kiểm tra SHA-256 & tải PDF | Bị chặn theo Bước 12 (`[ĐỌC TỪ MÃ]`: yêu cầu `emailVerified=true`, `kycVerified=true`, OTP qua `identity-service`) | Chuyển sang dùng hợp đồng seed `ct-00000001` (`ACTIVE`) làm workaround để kiểm thử Cảnh 6–8 | 2.92s | **FAIL** | `step-13-s5-contract-otp-sign-pdf.png` |
| 14 | Cảnh 6 | TENANT (`tenant@cozynest.vn`) | Mở `/vi/dashboard/tenant/deposits`, tạo `DEPOSIT` PaymentIntent (5.500.000đ), chạy sandbox webhook | `POST /payments/intent -> 200`, `POST /sandbox/simulate-webhook -> 200`, `GET /ledger/integrity -> 200` | `payment_intent`: `PENDING -> PAID`; hiện nhãn `SANDBOX`; Sổ cái cân đối `Tổng Nợ = Tổng Có = 9.500.000đ` (cuối phiên `16.000.000đ`) | 4.13s | **SANDBOX** | `step-14-s6-deposit-payment-sandbox-ledger.png` |
| 15 | Cảnh 7 | TENANT (`tenant@cozynest.vn`) | Mở `/vi/dashboard/tenant/my-room`, kiểm tra trạng thái phòng `#206` & tìm kiếm công khai | `GET /api/v1/rooms?keyword=... -> 200` | Phòng `#206` vẫn ở `PUBLISHED / AVAILABLE` trong DB (không tự đổi `RENTED` khi thanh toán cọc độc lập qua `PaymentIntent`) | 1.84s | **PARTIAL** | `step-15-s7-tenant-my-room-and-room-status.png` |
| 16 | Cảnh 7 | LANDLORD (`landlord@cozynest.vn`) | Mở `/vi/dashboard/landlord/tenants` | `GET /api/v1/booking/contracts/landlord -> 200` | Trang tải được `(4)` khách thuê, nhưng hiện mã thô `Khách thuê #ant-02` và liệt kê cả `PENDING_SIGN` | 3.43s | **PASS** *(có lỗi UI)* | `step-16-s7-landlord-current-tenants.png` |
| 17 | Cảnh 8 | LANDLORD (`landlord@cozynest.vn`) | Ghi chỉ số điện nước (`100->150` kWh, `20->25` m3) & sinh hóa đơn tháng | `POST /billing/utility-readings -> 200`; `POST /billing/invoices/from-contract -> 401 ERR_AUTH_UNAUTHORIZED` | Ghi điện nước thành công (`200`), nhưng sinh hóa đơn từ hợp đồng trả `401` dù dùng cùng JWT hợp lệ của Landlord | 1.68s | **PARTIAL** | `step-17-s8-landlord-utilities-invoice.png` |
| 18 | Cảnh 8 | TENANT (`tenant@cozynest.vn`) | Mở `/vi/dashboard/tenant/invoices` xem & thanh toán hóa đơn tháng | `GET /api/v1/billing/invoices/tenant -> 200` | Danh sách hóa đơn tải được; không tạo được hóa đơn mới do Bước 17 (`401`); chưa có nút nhắc nợ thủ công trên UI | 2.85s | **PARTIAL** | `step-18-s8-tenant-invoices-pay.png` |

---

## (c) Danh sách lỗi phát hiện (BUG-01 đến BUG-09)

| Mã lỗi | Mức độ | Bước tái hiện | Kết quả thực tế | Kết quả mong đợi | File nghi vấn `[ĐỌC TỪ MÃ]` | Đề xuất sửa (chưa tự sửa) |
|---|---|---|---|---|---|---|
| **BUG-01** | **CAO** | Bước 09, 11: Đăng nhập `tenant@cozynest.vn` (seed chính) và đặt lịch xem phòng hoặc gửi yêu cầu thuê | API trả `403 EMAIL_NOT_VERIFIED` vì `users.email_verified_at` của `u-tenant-01` là `NULL` trong seed | Tài khoản demo seed `tenant@cozynest.vn` phải sẵn sàng đặt lịch & gửi yêu cầu thuê | `identity-service/.../db/seed/R__01_seed_demo_identity.sql` | Cập nhật seed đặt `email_verified_at = NOW(3)` và KYC `APPROVED` cho `u-tenant-01`, `u-landlord-01` |
| **BUG-02** | **CAO** | Bước 01: Đăng nhập `tenant@cozynest.vn` (role `TENANT`), mở `/vi/dashboard/landlord/rooms/new` | Chuyển hướng sang `/dashboard/landlord/kyc` (thiếu `/vi`, không sang `/vi/403`) | Chặn ngay tại middleware và chuyển hướng sang `/vi/403` | `accommodation-web/src/proxy.ts` (hoặc middleware RBAC) | Kiểm tra role `LANDLORD` trước khi redirect KYC; giữ locale prefix `/vi` |
| **BUG-03** | **CAO** | Bước 12: Chủ trọ gọi `POST /api/v1/booking/rental-requests/{id}/approve` cho phòng `#206` | Trả `409 Conflict`, chặn toàn bộ chuỗi duyệt yêu cầu -> tạo hợp đồng -> ký OTP | Duyệt yêu cầu hợp lệ trên phòng `PUBLISHED` phải trả `200 APPROVED` | `booking-service/.../RentalRequestService.java` + `listing-service/.../InternalRoomUsageController` | Kiểm tra log lý do `409` khi hold phòng `#206` (mapping `landlordId` numeric vs UUID giữa listing & booking) |
| **BUG-04** | **CAO** | Bước 17: Chủ trọ gọi `POST /api/v1/billing/utility-readings` (`200`) rồi gọi ngay `POST /api/v1/billing/invoices/from-contract` với cùng JWT | Trả `401 ERR_AUTH_UNAUTHORIZED` dù JWT hợp lệ | Trả `200 OK` và sinh hóa đơn tháng `ISSUED` | `billing-service/.../InvoiceController.java` & `InvoiceService.java` (gọi internal `booking-service` lấy hợp đồng) | Kiểm tra header `X-Internal-Service-Key` hoặc token forward khi `billing-service` gọi `booking-service` trong `generateFromContract` |
| **BUG-05** | **CAO** | Nhánh N6: Hai người thuê (`u-tenant-01`, `u-tenant-02`) gửi đồng thời `POST /api/v1/booking/rental-requests` cho cùng phòng `#4` | Cả 2 cùng trả `200 OK` (`tenant1=200, tenant2=200`) | Chỉ 1 yêu cầu giữ chỗ thành công hoặc có cơ chế lock/cảnh báo rõ khi phòng đang có hold | `booking-service/.../RentalRequestService.java` | Bổ sung ràng buộc kiểm tra hold/pessimistic lock khi tạo hoặc duyệt yêu cầu đồng thời |
| **BUG-06** | **TRUNG BÌNH** | Nhánh N7: `tenant2@cozynest.vn` gọi `GET` vào đơn thuê, hợp đồng, payment intent của `tenant@cozynest.vn` | Trả `403` (rental-request, contract) và `401` (payment intent) thay vì `404` | Trả `404 Not Found` thống nhất trên mọi tài nguyên để chống IDOR enumeration | `ContractController.java`, `RentalRequestService.java`, `PaymentController.java` | Đổi `AccessDeniedException` sang `*NotFoundException` (404) cho participant check |
| **BUG-07** | **TRUNG BÌNH** | Bước 16: Mở `/vi/dashboard/landlord/tenants` | Hiển thị tên thô `Khách thuê #ant-02` (cắt chuỗi UUID) và đếm cả hợp đồng `PENDING_SIGN` | Hiện tên thật khách thuê từ snapshot và chỉ lọc hợp đồng `ACTIVE` | `accommodation-web/src/app/[locale]/(dashboard)/dashboard/landlord/tenants/page.tsx` | Lọc `status === 'ACTIVE'`, dùng `tenantName` snapshot thay vì cắt chuỗi `tenantId` |
| **BUG-08** | **TRUNG BÌNH** | Nhánh N2: Người thuê gọi `POST /api/v1/tenant/appointments/{id}/cancel` với `{ reasonCode: "CHANGE_PLANS" }` | Trả `400 Bad Request` | Trả `200 OK` chuyển lịch hẹn sang `CANCELLED` | `booking-service/.../CancelAppointmentRequest.java` & `TenantAppointmentService.java` | Kiểm tra danh sách enum `reasonCode` hợp lệ và đồng bộ giữa FE và BE |
| **BUG-09** | **THẤP** | Bước 04–05 & UI chung | `tenant/payments/page.tsx` vẫn còn `max-w-5xl`; `rental_request` tạo mới trả `tenantName=null`; đăng nhập lặp >6 lần trong 1 phút khi đổi vai trò demo bị rate-limit | Nhất quán full-width, điền snapshot `tenantName`, và tài liệu hóa mốc rate-limit cho người demo | `RentalRequestService.java`, `tenant/payments/page.tsx` | Điền `tenantName` từ `identity-service` hoặc JWT claim khi tạo yêu cầu; gỡ `max-w-5xl` |

---

## (d) Kết quả các nhánh lỗi N1 – N7 `[CHẠY LẠI HÔM NAY]`

| Nhánh | Kịch bản kiểm thử | Kết quả thực tế | Trạng thái |
|---|---|---|---|
| **N1** | Chủ trọ từ chối yêu cầu thuê -> thử tạo hợp đồng | `create=200`, `reject=200`, `POST /contracts` trả **`409 ERR_RENTAL_REQUEST_INVALID_STATE`** ("Chi co the tao hop dong tu yeu cau thue da duoc duyet (trang thai hien tai: REJECTED)") | **PASS** |
| **N2** | Người thuê hủy lịch hẹn & hủy yêu cầu thuê | `reqCreate=200`, `reqCancel=200`; `apptCreate=200`, **`apptCancel=400`** (xem BUG-08) | **PARTIAL** |
| **N3** | Thanh toán quá hạn (lùi `expires_at` 5 phút trước, gửi webhook) | `intent=200`, webhook sau hết hạn trả `200` nhưng giữ `status=EXPIRED`, ghi nhận `paidAmount=3.000.000đ` để đưa vào hàng chờ xử lý thủ công (`manual-queue`), không tự đánh dấu `PAID` | **SANDBOX** |
| **N4** | Thanh toán thiếu tiền, thừa tiền, sai mã nội dung | Thiếu tiền (`1.5M/4M`) -> `200` `PARTIAL_PAID`; thừa tiền (`5M/4M`) -> `200` `OVERPAID` (vào `manual-queue`); sai mã `PAY-INVALID-9999` -> `400` | **SANDBOX** |
| **N5** | Gửi webhook thanh toán 2 lần cùng `paymentCode` | Lần 2 trả `200` idempotent; số dòng `ledger_postings` trước = `10`, sau = `10` (**delta = 0**, không ghi sổ kép trùng!) | **PASS** |
| **N6** | Hai người thuê cùng đặt phòng `#4` đồng thời | Cả 2 cùng trả `200` (`tenant1=200, tenant2=200`) — xem **BUG-05** | **FAIL** |
| **N7** | IDOR: `tenant2` truy cập đơn/hợp đồng/thanh toán của `tenant1` | `rentalRequest=403`, `contract=403`, `paymentIntent=401` (đều bị chặn đọc dữ liệu người khác, nhưng chưa thống nhất `404` — xem **BUG-06**) | **PARTIAL** |

---

## (e) Kết quả kiểm tra chéo (1 – 5) `[CHẠY LẠI HÔM NAY]`

1. **Nhất quán thực thể:** Có độ lệch ở bước đặt cọc độc lập (`PaymentIntent` `DEPOSIT` -> `PAID` trong `cozynest_billing` nhưng `rooms.status` trong `cozynest_listing` vẫn là `PUBLISHED/AVAILABLE`, chưa tự động chuyển `RENTED` nếu không chạy qua luồng Saga kích hoạt hợp đồng).
2. **Toàn vẹn Sổ cái kép (Double-entry Ledger):** **ĐẠT 100%**. `GET /api/v1/billing/ledger/integrity` trả `isBalanced: true`, `totalDebit: 16.000.000`, `totalCredit: 16.000.000`, `"Sổ cái cân đối hoàn toàn (Tổng Nợ = Tổng Có)"`. Không ghi trùng khi webhook lặp (N5).
3. **Lộ dữ liệu (PII / Địa chỉ / SĐT):** **ĐẠT**. Trên trang chi tiết phòng công khai (`/vi/rooms/nha-nguyen-can-binh-duong-206`), khách chưa đăng nhập nhận `landlordPhone=null` và không thấy địa chỉ số nhà cụ thể.
4. **Bảo mật nhanh:** **ĐẠT về Token** (`cookieHasJwt=false`, `localStorage` chỉ chứa `cozynest_user`, không có `accessToken`/`refreshToken`). **Cần khắc phục** BUG-02 (redirect `/dashboard/landlord/kyc` cho TENANT) và BUG-06 (đổi 403/401 IDOR sang 404).
5. **Nhãn thử nghiệm (`SANDBOX_ONLY`):** **ĐẠT**. Trang `/vi/dashboard/tenant/deposits` hiển thị rõ chế độ thử nghiệm/mô phỏng (`SandboxLabel=true`).

---

## (f) Lệnh Sao lưu & Khôi phục DB (Đã kiểm chứng chạy thành công)

```powershell
# 1. Sao lưu trước khi chạy demo/audit (đọc mật khẩu từ .env, không in ra màn hình)
$pwd = (Select-String -Path d:\RIKKEI\THUC_TAP\PROJECT\accommodation-service\.env -Pattern '^DB_PASSWORD=' | Select-Object -First 1).Line -replace '^DB_PASSWORD=', ''
docker exec -e MYSQL_PWD="$pwd" cozynest_mysql mysqldump -uroot --databases cozynest_identity cozynest_listing cozynest_booking cozynest_billing cozynest_communication cozynest_admin --single-transaction --routines --triggers > pre-audit-backup.sql

# 2. Khôi phục nguyên trạng sau khi chạy (đã kiểm chứng: FINAL_RESTORE_EXIT=0)
Get-Content -Raw pre-audit-backup.sql | docker exec -i -e MYSQL_PWD="$pwd" cozynest_mysql mysql -uroot
docker exec cozynest_redis redis-cli FLUSHDB
```

