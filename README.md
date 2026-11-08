# Cozynest (Tổ Ấm) - Web Frontend Application (`accommodation-web`)

Ứng dụng web tìm kiếm, đặt lịch hẹn và quản lý phòng trọ trực tuyến **Cozynest (Tổ Ấm)**, xây dựng bằng **Next.js 16.2 App Router**, **React 19**, **Tailwind CSS v4** và tuân thủ nghiêm ngặt **Clean Architecture**.

---

## 1. Công Nghệ Cốt Lõi

* **Framework:** Next.js 16.2.12 (App Router & Turbopack) + React 19.3.1.
* **Kiến trúc:** Clean Architecture (`domain/` -> `application/` -> `infrastructure/` -> `presentation/`), thực thi qua `eslint-plugin-boundaries`.
* **Design System:** Tailwind CSS v4 với design tokens (`@theme`) tông màu chủ đạo Teal `#0F766E` và Amber `#F59E0B`.
* **Biểu tượng:** `lucide-react` (tối ưu SVG, không lạm dụng emoji).
* **Đa ngôn ngữ:** `next-intl` (mặc định tiếng Việt `vi`, hỗ trợ tiếng Anh `en`, 100% parity 689 keys).
* **Quản lý State:** `@tanstack/react-query` (server cache) + `zustand` (UI state).
* **Form & Validation:** `react-hook-form` + `zod`.

---

## 2. Các Phân Hệ & Màn Hình Chính

### Trang Công Cộng (Public)
* **Trang chủ (`/`)**: Tìm kiếm đa tiêu chí, khu vực nổi bật, phòng trọ mới xác thực nhất.
* **Danh sách phòng (`/rooms`)**: Bộ lọc giá, diện tích, tiện nghi, quận huyện, sắp xếp và phân trang.
* **Chi tiết phòng (`/rooms/[slug]`)**: Bộ sưu tập ảnh carousel, tiện nghi theo nhóm, bản đồ tọa độ, bảng chi phí dịch vụ, thông tin chủ trọ kèm nhãn xác minh, modal hẹn xem phòng & thuê phòng.
* **Trang thông tin**: Giới thiệu (`/about`), An toàn (`/safety-guide`), Bảng giá (`/pricing`), FAQ (`/faq`), Liên hệ (`/contact`), Điều khoản (`/terms`), Bảo mật (`/privacy`).

### Xác Thực & Tài Khoản (Authentication)
* **Đăng nhập (`/login`) & Đăng ký (`/register`)**: Đăng nhập mật khẩu bảo mật và Google Identity Services (GIS OAuth2) với Nonce & CSRF protection.
* **Luồng Đăng ký Tenant-First**: Mọi đăng ký mới khởi tạo vai trò Người thuê; chọn Chủ trọ sẽ tạo hồ sơ `AWAITING_KYC` chờ xét duyệt.
* **Quên & Đặt lại mật khẩu (`/forgot-password`, `/reset-password`)**: Xác thực OTP gửi qua email (Mailpit tích hợp).

### Bảng Điều Khiển Chủ Trọ (Landlord Dashboard - `/dashboard/landlord`)
* **Tổng quan**: Chỉ số doanh thu, tỷ lệ lấp đầy, thông báo cần xử lý.
* **Quản lý Lịch hẹn Xem phòng ([APPT-02])**: Danh sách lịch hẹn, lọc theo trạng thái (`PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`), modal chấp nhận và từ chối kèm lý do bắt buộc, che giấu thông tin nhạy cảm (PII).
* **Quản lý phòng trọ**: Danh sách phòng, đăng tin mới quy trình 4 bước, chỉnh sửa và cập nhật trạng thái phòng (Có sẵn, Đã thuê, Đang sửa chữa - [LANDLORD-05]).
* **Xác minh danh tính (eKYC)**: Tải ảnh CCCD 2 mặt ([KYC-01]) và xác thực khuôn mặt sinh trắc học ([KYC-02]).

### Bảng Điều Khiển Người Thuê (Tenant Dashboard - `/dashboard/tenant`)
* **Tổng quan**: Hợp đồng thuê hiện tại, hóa đơn sắp đến hạn, lịch hẹn xem phòng kế tiếp.
* **Phòng đã lưu (`/dashboard/tenant/saved-rooms`)**: Quản lý phòng yêu thích với cơ chế lưu idempotent ([ROOM-02]).
* **Lịch hẹn của tôi**: Theo dõi trạng thái lịch hẹn xem phòng đã gửi tới chủ trọ.

### Bảng Điều Khiển Quản Trị & Kiểm Duyệt (Admin/Moderator Dashboard - `/dashboard/admin`)
* **Kiểm duyệt phòng**: Xem xét, phê duyệt hoặc từ chối tin đăng phòng kèm phản hồi lý do.
* **Kiểm duyệt eKYC**: Đối chiếu ảnh chụp CCCD và dữ liệu sinh trắc khuôn mặt.
* **Quản lý người dùng & Hệ thống**: Phân quyền, khóa/mở khóa tài khoản, giám sát sức khỏe microservices.

---

## 3. Tài Khoản Kiểm Thử (Môi Trường Dev)

| Vai trò | Email | Mật khẩu | Màn hình mặc định |
|---|---|---|---|
| **Người thuê (Tenant)** | `tenant@cozynest.vn` | `password123` | `/dashboard/tenant` |
| **Chủ trọ (Landlord)** | `landlord@cozynest.vn` | `password123` | `/dashboard/landlord` |
| **Kiểm duyệt (Moderator)** | `moderator@cozynest.vn` | `password123` | `/dashboard/moderator` |
| **Quản trị (Admin)** | `admin@cozynest.vn` | `password123` | `/dashboard/admin` |

---

## 4. Hướng Dẫn Cài Đặt & Kiểm Thử

### Cài Đặt Thư Viện & Chạy Ứng Dụng
```bash
# Cài đặt dependencies
npm install

# Khởi chạy dev server (Cổng 3000)
npm run dev
```

### Bộ Lệnh Kiểm Tra Chất Lượng Mã Nguồn
```bash
# Kiểm tra định dạng & kiến trúc Clean Architecture
npm run lint

# Chạy kiểm thử tự động (Unit test, i18n parity, route link check)
npm test

# Chạy kịch bản E2E kiểm thử xác thực cô lập
npm run e2e:auth

# Biên dịch sản phẩm Next.js (166 routes)
npm run build
```
