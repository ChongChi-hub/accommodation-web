# Tổ Ấm - Web Frontend Application (`accommodation-web`)

Ứng dụng web tìm kiếm và quản lý phòng trọ trực tuyến **Tổ Ấm**, xây dựng bằng **Next.js 16.2 App Router**, **React 19**, **Tailwind CSS v4** và tuân thủ nghiêm ngặt **Clean Architecture**.

---

## 🚀 Công Nghệ Cốt Lõi
* **Framework:** Next.js 16.2.12 (App Router) + React 19.3.1.
* **Kiến trúc:** Clean Architecture (`domain/` -> `application/` -> `infrastructure/` -> `presentation/`), ép luật bằng `eslint-plugin-boundaries`.
* **Design System:** Tailwind CSS v4.3.5 với design tokens (`@theme`) tông màu chủ đạo Teal `#0F766E` và Amber `#F59E0B`.
* **Icon:** `lucide-react` (tuyệt đối không dùng emoji).
* **Đa ngôn ngữ:** `next-intl` (mặc định tiếng Việt `vi`, hỗ trợ tiếng Anh `en`).
* **State:** `@tanstack/react-query` (server state) + `zustand` (UI state).
* **Form & Validation:** `react-hook-form` + `zod`.

---

## ⚙️ Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Yêu cầu hệ thống
* **Node.js:** v22+ LTS
* **npm:** v10+

### 2. Thiết lập biến môi trường
Tạo file `.env.local` từ mẫu:
```bash
cp .env.example .env.local
```
Nội dung mặc định kết nối tới Backend Gateway:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_DEFAULT_LOCALE=vi
```

### 3. Cài đặt phụ thuộc & Chạy môi trường Dev
```bash
# Cài đặt thư viện
npm install

# Khởi chạy máy chủ phát triển (Cổng 3000)
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:3000`.

### 4. Kiểm tra chất lượng mã nguồn
```bash
# Kiểm tra lỗi cú pháp & luật kiến trúc Clean Architecture
npm run lint

# Kiểm tra kiểu TypeScript
npm run type-check

# Chạy unit tests
npm run test

# Build ứng dụng sản phẩm
npm run build
```

---

## 🔑 Tài Khoản Thử Nghiệm (Kết nối Backend)

| Vai trò | Email | Mật khẩu |
|---|---|---|
| **Người thuê (Tenant)** | `tenant@toam.vn` | `password123` |
| **Chủ trọ (Landlord)** | `landlord@toam.vn` | `password123` |
| **Kiểm duyệt viên (Moderator)** | `moderator@toam.vn` | `password123` |
| **Quản trị viên (Admin)** | `admin@toam.vn` | `password123` |

---

## 📑 Tài Liệu Kỹ Thuật
* Quy chuẩn lập trình chi tiết: Xem tại [`AGENT.md`](./AGENT.md).

