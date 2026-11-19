# PAYMENT-FLOW-WALKTHROUGH — Hướng dẫn Chi tiết Viết Kịch bản Demo Thuê Trọ & Thanh Toán

Tài liệu này mô tả chính xác luồng chạy thực tế trên hệ thống (nhánh `feat/fix-lifecycle-chat-layout-stats`, BE `821e0bb`, FE `9a004cf`) kèm **dữ liệu mẫu**, **chữ hiển thị thật**, **mốc chờ**, **cách xử lý khi demo (workaround)** và **câu hỏi hội đồng dự kiến** ở từng cảnh.

---

## 0. Chuẩn bị bắt buộc trước khi quay/trình diễn Demo

1. **Tài khoản seed sử dụng (mật khẩu: `xem seed`):**
   - **Admin:** `admin@cozynest.vn` (role `ADMIN`)
   - **Moderator:** `moderator@cozynest.vn` (role `MODERATOR`)
   - **Chủ trọ (Landlord):** `landlord@cozynest.vn` (`u-landlord-01`, role `LANDLORD`, `TENANT`)
   - **Người thuê 1 (Tenant):** `tenant@cozynest.vn` (`u-tenant-01`, role `TENANT`)
   - **Người thuê 2 (Test IDOR / Từ chối):** `tenant2@cozynest.vn` (`u-tenant-02`, role `TENANT`)
2. **Điều kiện bắt buộc (Workaround BUG-01 trước khi demo):**
   - Vì seed mặc định của `u-tenant-01` chưa có `email_verified_at`, cần chạy lệnh chuẩn bị sau trước giờ demo (hoặc xác minh email qua Mailpit `http://localhost:8025`):
     ```sql
     UPDATE cozynest_identity.users
     SET email_verified_at = COALESCE(email_verified_at, UTC_TIMESTAMP(3))
     WHERE id IN ('u-tenant-01', 'u-tenant-02', 'u-landlord-01');
     ```
3. **Lưu ý Rate-Limit khi chuyển tài khoản liên tục:**
   - Khi đăng nhập/đăng xuất liên tục >6 lần trong 1 phút trên cùng máy, nên dùng **2 cửa sổ trình duyệt riêng (1 cửa sổ thường cho Chủ trọ, 1 cửa sổ ẩn danh cho Người thuê)** thay vì đăng xuất/đăng nhập lại nhiều lần trên cùng 1 tab.

---

## Cảnh 1: Chủ trọ chuẩn bị & Xác minh KYC (~1 phút)

- **Vai trò:** Chủ trọ (`landlord@cozynest.vn`) & Admin (`admin@cozynest.vn`)
- **Trang:** `/vi/dashboard/landlord/kyc` -> `/vi/dashboard/admin/kyc`
- **Thao tác:**
  1. Đăng nhập Chủ trọ tại `/vi/login`, mở mục **"Xác thực chủ nhà (KYC)"**.
  2. Mở tab Admin vào `/vi/dashboard/admin/kyc` (tiêu đề thật: **"Kiểm duyệt hồ sơ định danh chủ trọ"**) để trình bày hàng chờ duyệt CCCD.
- **Lưu ý lỗi đang có (BUG-02):** Không demo bước dùng tài khoản `TENANT` vào `/vi/dashboard/landlord/rooms/new` để chứng minh trang `403` cho đến khi sửa BUG-02 (hiện đang redirect sang `/dashboard/landlord/kyc`).
- **Câu hỏi hội đồng:** *"Nếu chủ trọ chưa KYC thì có đăng phòng hay ký hợp đồng được không?"* -> Trả lời theo code thật: `ContractSigningCoordinator` kiểm tra bắt buộc `emailVerified` và `kycVerified` (fail-closed) trước khi cho ký hợp đồng.

---

## Cảnh 2: Tạo phòng mới & Kiểm duyệt (~1.5 phút)

- **Vai trò:** Chủ trọ (`landlord@cozynest.vn`) & Admin/Moderator (`admin@cozynest.vn`)
- **Trang:** `/vi/dashboard/landlord/rooms/new` -> `/vi/dashboard/admin/rooms`
- **Dữ liệu mẫu nhập trên UI:**
  - Tiêu đề: `Phòng Studio Ban Công Thoáng Cầu Giấy`
  - Giá thuê: `5.500.000 đ/tháng` | Tiền cọc: `5.500.000 đ` | Diện tích: `30 m²`
  - Địa chỉ: chọn đủ Tỉnh/Thành phố -> Phường/Xã theo danh mục hành chính 2 cấp mới + địa chỉ chi tiết.
- **Lưu ý thực tế:** API tạo phòng yêu cầu đủ `wardId` và `roomTypeId` (kiểu số). Nếu cần rút gọn thời gian demo, có thể trình bày form đăng phòng rồi chuyển sang phòng đã duyệt sẵn (`#206` hoặc `#1`) trong `/vi/dashboard/admin/rooms`.
- **Câu hỏi hội đồng:** *"Phòng vừa đăng có lên trang chủ ngay không?"* -> Không, phải qua bước kiểm duyệt của Moderator/Admin (`PENDING_REVIEW -> PUBLISHED`).

---

## Cảnh 3: Khách tìm phòng, kiểm tra ẩn PII & Đặt lịch xem phòng (~1.5 phút)

- **Vai trò:** Khách chưa đăng nhập -> Người thuê (`tenant@cozynest.vn`)
- **Trang:** `/vi/rooms` -> `/vi/rooms/nha-nguyen-can-binh-duong-206` -> `/vi/dashboard/tenant/appointments`
- **Điểm nhấn bảo mật (PASS thật):**
  - Khi chưa đăng nhập xem chi tiết phòng, API trả `landlordPhone: null` và ẩn địa chỉ số nhà cụ thể, chống cò mồi cạo dữ liệu.
- **Thao tác:** Đăng nhập `tenant@cozynest.vn`, chọn khung giờ xem phòng (tối thiểu sau hiện tại 1–2 giờ), nhập lời nhắn `"Em muốn xem phòng trực tiếp ạ."` -> Bấm đặt lịch -> Lịch hẹn ở trạng thái `PENDING`.

---

## Cảnh 4: Chủ trọ xác nhận & Hoàn thành lịch hẹn (~1 phút)

- **Vai trò:** Chủ trọ (`landlord@cozynest.vn`)
- **Trang:** `/vi/dashboard/landlord/appointments`
- **Thao tác & Mốc chờ thời gian:**
  1. Bấm **"Xác nhận"** -> lịch chuyển `CONFIRMED`.
  2. **Điểm nhấn nghiệp vụ (PASS thật):** Khi chưa đến giờ hẹn, nút **"Hoàn thành"** và **"Không đến"** bị khóa (`disabled`) kèm gợi ý *"Chỉ có thể hoàn thành từ thời điểm bắt đầu lịch hẹn"*; nếu gọi API trực tiếp backend trả `409 ERR_APPOINTMENT_NOT_STARTED`.
  3. **Cách xử lý khi demo (Workaround thời gian):** Chạy câu lệnh SQL lùi `scheduled_start` về 1 giờ trước cho lịch hẹn vừa tạo (hoặc bật cờ test `app.booking.fixtures.enabled=true` ở môi trường dev/test):
     ```sql
     UPDATE cozynest_booking.viewing_appointments
     SET scheduled_start = DATE_SUB(UTC_TIMESTAMP(3), INTERVAL 1 HOUR),
         scheduled_end = DATE_SUB(UTC_TIMESTAMP(3), INTERVAL 15 MINUTE)
     WHERE id = '<appointment_id>';
     ```
  4. Tải lại trang -> bấm **"Hoàn thành"** -> lịch chuyển `COMPLETED` (gọi lặp trả `200` idempotent, gửi thông báo in-app sang `communication-service`).

---

## Cảnh 5: Yêu cầu thuê, Hợp đồng điện tử & Ký OTP (~1.5 phút)

- **Vai trò:** Người thuê (`tenant@cozynest.vn`) & Chủ trọ (`landlord@cozynest.vn`)
- **Trang:** `/vi/dashboard/landlord/rental-requests` -> `/vi/dashboard/landlord/contracts` -> `/vi/dashboard/tenant/contracts`
- **Lưu ý lỗi cần biết trước khi demo (BUG-03):**
  - Việc tạo yêu cầu thuê (`POST /api/v1/booking/rental-requests`) thành công `200` (cũng có thể demo nhánh **N1**: Chủ trọ bấm **"Từ chối"** kèm lý do -> nút "Tạo hợp đồng" biến mất hoàn toàn, gọi API tạo hợp đồng trả `409 ERR_RENTAL_REQUEST_INVALID_STATE`).
  - Hiện tại bước duyệt yêu cầu (`POST .../approve`) trên phòng `#206` đang gặp `409` (BUG-03). Trong kịch bản demo tạm thời trước khi sửa BUG-03, chuyển sang xem hợp đồng seed `ct-00000001` (`ACTIVE`) hoặc hợp đồng `PENDING_SIGN` có sẵn để trình bày giao diện hợp đồng, hash SHA-256 và tải PDF.
- **Câu hỏi hội đồng:** *"Nếu chủ trọ cố tình tạo hợp đồng cho yêu cầu đã từ chối hoặc tạo 2 hợp đồng cho cùng 1 yêu cầu thì sao?"* -> Trả lời: Đã chặn cứng ở cả UI, Service (`409 ERR_RENTAL_REQUEST_INVALID_STATE`), và ràng buộc `UNIQUE uq_contracts_request_id` ở tầng MySQL (`409 ERR_CONTRACT_ALREADY_EXISTS`).

---

## Cảnh 6: Thanh toán tiền cọc VietQR & Sổ cái kép — CHẾ ĐỘ SANDBOX (~1.5 phút)

- **Vai trò:** Người thuê (`tenant@cozynest.vn`)
- **Trang:** `/vi/dashboard/tenant/deposits`
- **Cơ chế thật (SANDBOX_ONLY):**
  - Màn hình hiển thị rõ nhãn **Chế độ thử nghiệm (SANDBOX)** (`fintech.mode=SANDBOX_ONLY`, không thu tiền thật).
  - Người thuê chọn hợp đồng `ct-00000001`, nhập số tiền cọc `5.500.000 đ` -> hệ thống gọi `POST /api/v1/billing/payments/intent` sinh mã `PAY-...` (hạn 15 phút) và mã QR VietQR.
  - Bấm nút mô phỏng thanh toán (`POST /api/v1/billing/payments/sandbox/simulate-webhook`, tự động bị chặn `404` ở profile `prod`) -> trạng thái chuyển `PAID`.
  - **Sổ cái kép (PASS thật):** Hệ thống tự ghi bút toán Nợ/Có; kiểm tra `GET /api/v1/billing/ledger/integrity` luôn trả `isBalanced: true` (`Tổng Nợ == Tổng Có`). Gửi lại webhook lần 2 không ghi sổ trùng (`delta = 0`).
- **Câu hỏi hội đồng:**
  - *"Khách chuyển thiếu hoặc thừa tiền thì xử lý sao?"* -> Chuyển thiếu -> `PARTIAL_PAID`, chuyển thừa -> `OVERPAID`, chuyển sau khi hết hạn 15 phút -> giữ `EXPIRED` + ghi nhận `paidAmount` và đưa vào hàng chờ đối soát thủ công (`GET /api/v1/billing/payments/manual-queue`).
  - *"Webhook ngân hàng bị gửi trùng 2 lần có cộng tiền 2 lần không?"* -> Không, kiểm tra idempotency theo `paymentCode`, số dòng `ledger_postings` không đổi (`delta = 0`).

---

## Cảnh 7: Sau thanh toán — Phòng của tôi & Khách thuê hiện tại (~1 phút)

- **Vai trò:** Người thuê (`tenant@cozynest.vn`) & Chủ trọ (`landlord@cozynest.vn`)
- **Trang:** `/vi/dashboard/tenant/my-room` & `/vi/dashboard/landlord/tenants`
- **Thực tế cần lưu ý:**
  - Người thuê thấy thông tin phòng đang ở tại `/vi/dashboard/tenant/my-room`.
  - Chủ trọ thấy danh sách khách tại `/vi/dashboard/landlord/tenants` (lưu ý BUG-07: đang còn hiển thị mã cắt `#ant-02` và hợp đồng `PENDING_SIGN`).
  - Lưu ý nhất quán (Kiểm tra chéo #1): Thanh toán `DEPOSIT` độc lập chưa tự đổi `rooms.status` sang `RENTED` nếu chưa đi qua luồng kích hoạt hợp đồng đầy đủ.

---

## Cảnh 8: Vận hành sau thuê — Điện nước & Hóa đơn tháng (~1 phút)

- **Vai trò:** Chủ trọ (`landlord@cozynest.vn`) & Người thuê (`tenant@cozynest.vn`)
- **Trang:** `/vi/dashboard/landlord/utilities`, `/vi/dashboard/landlord/invoices`, `/vi/dashboard/tenant/invoices`
- **Thực tế:**
  - Ghi chỉ số điện nước (`POST /api/v1/billing/utility-readings`, ví dụ điện `100 -> 150`, nước `20 -> 25`) hoạt động thật (`200 OK`, tự tính bậc thang EVN).
  - Bước sinh hóa đơn từ hợp đồng (`POST /api/v1/billing/invoices/from-contract`) hiện đang bị lỗi `401 ERR_AUTH_UNAUTHORIZED` (BUG-04) — cần sửa trước khi demo trực tiếp bước sinh hóa đơn mới.
  - Xem danh sách hóa đơn hiện có của người thuê trên `/vi/dashboard/tenant/invoices` hoạt động bình thường (`200 OK`).
  - Tính năng nút gửi nhắc nợ thủ công trên UI: **NOT-IMPLEMENTED** (mới có cột theo dõi trong DB).

