# MAIL-EMAILJS — Progress Tracker & Verification Report

- **Nhánh:** `feat/fix-payment-flow` (BE & FE)
- **Ngày thực hiện:** 2026-11-19 `[CHẠY LẠI HÔM NAY]`

## 1. PHA M0 — Chẩn đoán & Rà soát lộ khóa `[ĐỌC TỪ MÃ]` / `[CHẠY LẠI HÔM NAY]`
- **Khóa EmailJS từng bị hardcode:** Đã phát hiện `SERVICE_ID`, `PUBLIC_KEY`, `PRIVATE_KEY` và `TEMPLATES` của cả `ACC1` và `ACC2` nằm trực tiếp trong `src/infrastructure/services/emailjs.service.ts` và `src/app/api/email/send/route.ts`.
- **Kiểm tra lịch sử Git (`git log -S`):** **ĐÃ TỪNG BỊ COMMIT** tại các commit `b399f42`, `e7ba364`, `881269e`. Không viết lại lịch sử git khi chưa có lệnh. **HÀNH ĐỘNG BẮT BUỘC CỦA CON NGƯỜI (HUMAN): PHẢI ĐỔI (ROTATE) TOÀN BỘ PRIVATE KEY EMAILJS CỦA ACC1 & ACC2.**
- **Đánh giá `/api/email/send`:** Trước khi sửa là **open relay** (không kiểm tra Origin, không kiểm tra đăng nhập, không kiểm tra action allowlist, không giới hạn tần suất).

## 2. PHA M1 — Bảo mật FE & Route `/api/email/send` (`388a26b`) — DONE-VERIFIED
- Gỡ bỏ hoàn toàn khóa cứng khỏi `emailjs.service.ts` và `api/email/send/route.ts`; đọc 100% từ biến môi trường phía server (tuyệt đối không dùng `NEXT_PUBLIC_*`).
- Cập nhật `.env.example` với placeholder; `.env.local` nằm trong `.gitignore`.
- Siết `/api/email/send`: kiểm tra `Origin`, allowlist `REGISTER`/`VERIFY_EMAIL`/`CHANGE_PASSWORD`, yêu cầu cookie `cozynest_token` cho `VERIFY_EMAIL`/`CHANGE_PASSWORD`, kiểm tra định dạng email & OTP 6 số, rate-limit theo IP (10/10p) & người nhận (3/10p).
- Unit test `src/app/api/email/send/route.test.ts`: **5/5 PASSED** (mock `fetch`, không gọi mạng thật); FE `eslint=0`, `tsc=0`, `vitest 101/101 PASS`.

## 3. PHA M2 — Backend `communication-service` — DONE-VERIFIED (mã & mock test) / HUMAN (gửi thật)
- Migration additive `V6__email_outbox_audit_table.sql`: tạo bảng `email_outbox` (`SENT`/`FAILED`/`SKIPPED`, dedup `event_key`, đếm hạn mức theo `month_key`).
- `EmailDispatchGateway` (`@Primary` của `EmailServicePort`) + `EmailJsMailTransport`: hỗ trợ `EMAIL_PROVIDER` (`smtp` mặc định, `emailjs`, `log`), timeout 3s/5s, backoff retry chỉ cho `429`/`5xx`, không retry `400`, chống gửi trùng, hạn mức tháng `EMAIL_MONTHLY_CAP=150`, giới hạn tần suất người nhận, che PII trong log, `MAIL_REDIRECT_TO` chỉ cho `dev`/`test` (fail-fast khi khởi động ở `prod`), fail-fast nếu thiếu khóa khi `EMAIL_PROVIDER=emailjs`.
- Phủ thêm sự kiện: `APPOINTMENT_COMPLETED`, `APPOINTMENT_NO_SHOW`, `CONTRACT_CREATED`, `CONTRACT_ACTIVATED` (kèm `orderCode`), `PAYMENT_PAID` (gắn nhãn `SANDBOX_ONLY`), `INVOICE_GENERATED`.
- Cập nhật `scripts/mail-check.ps1` hỗ trợ kiểm tra cả `smtp` lẫn `emailjs` (không lộ khóa).
- Unit test `EmailDispatchAndEmailJsTest` (dùng local loopback `HttpServer`, không gọi mạng thật): **6/6 PASSED**.

## 4. Trạng thái gửi thật — HUMAN-CHƯA CÓ TEMPLATE
- **Điều kiện cần để bật gửi thật EmailJS:**
  1. Đổi lại Private Key của ACC1 & ACC2 trên dashboard EmailJS (do đã lộ trong git history cũ).
  2. Bật *"Allow EmailJS API for non-browser applications"* tại **EmailJS -> Account -> Security**.
  3. Tạo Template thông báo chung trên ACC2 (dùng `{{to_email}}`, `{{to_name}}`, `{{subject}}`, `{{message}}`, `{{{message_html}}}`, `{{action_url}}`) và điền `EMAILJS_TEMPLATE_ID_NOTIFY`, `EMAIL_PROVIDER=emailjs`, `MAIL_REDIRECT_TO=cuongdfle@gmail.com` vào `accommodation-service/.env`.
  4. Chạy `.\scripts\mail-check.ps1` để kiểm chứng HTML thực tế trên Gmail.
