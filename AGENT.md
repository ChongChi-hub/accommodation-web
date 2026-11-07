# AGENT.md - Quy Chuẩn Kỹ Thuật Frontend Web (accommodation-web)

## 1. Mục Tiêu Dự Án & Bối Cảnh Nghiệp Vụ
"Tổ Ấm" là nền tảng thuê phòng trọ và nhà ở trực tuyến tại Việt Nam, mang đến trải nghiệm tìm kiếm minh bạch, đặt lịch hẹn xem phòng, ký hợp đồng điện tử và thanh toán số. Ứng dụng Frontend được xây dựng bằng Next.js 16.2 App Router tuân thủ nghiêm ngặt mô hình Clean Architecture, phân tách hoàn toàn tầng giao diện React khỏi tầng nghiệp vụ và kết nối API.

## 2. Công Nghệ & Phiên Bản Chuẩn
- **Framework:** Next.js 16.2.12 (App Router, Server & Client Components).
- **Core Library:** React 19.3.1, TypeScript 5.7+ (Strict Mode).
- **Styling & Design System:** Tailwind CSS v4.3.5 (`@theme` tokens), Lucide React 1.70.0.
- **Design Taste Skill:** Tuân thủ chuẩn `design-taste-frontend` 2.5.0 (anti-slop, 1-screen hero, 1440/1024/768/390 responsive, micro-interactions tinh tế).
- **State Management:**
  - Server State: `@tanstack/react-query` 5.107.1.
  - UI / Client State: `zustand` 5.1.0.
- **Forms & Validation:** `react-hook-form` 7.91.0 kết hợp `zod` 4.6.7 và `@hookform/resolvers`.
- **Đa ngôn ngữ (i18n):** `next-intl` 4.14.9 (mặc định tiếng Việt `vi`, có tiếng Anh `en`, route `/[locale]/...`).
- **Kiểm tra phụ thuộc kiến trúc:** `eslint-plugin-boundaries` 7.4.2.
- **Lệnh thực thi:**
  - Cài đặt: `npm install`
  - Chạy dev: `npm run dev` (cổng `http://localhost:3000`)
  - Kiểm tra kiểu: `npm run type-check` (hoặc `npx tsc --noEmit`)
  - Lint kiểm tra luật kiến trúc: `npm run lint`
  - Build sản phẩm: `npm run build`
  - Kiểm thử: `npm run test`

## 3. Cấu Trúc Thư Mục Clean Architecture (`src/`)

```text
src/
├── app/                       # CHỈ CHỨA ROUTING Next.js, Layout, Metadata (Mỏng, không logic nghiệp vụ)
│   └── [locale]/
│       ├── (public)/          # Khách vãng lai: Trang chủ, Tìm phòng, Chi tiết phòng
│       ├── (auth)/            # Đăng nhập, Đăng ký, Quên mật khẩu, Đặt lại mật khẩu
│       ├── (tenant)/          # Dashboard Người thuê: Hợp đồng, Hóa đơn, Lịch hẹn, Yêu thích
│       ├── (landlord)/        # Dashboard Chủ trọ: Quản lý phòng, Đăng tin, Hóa đơn, Doanh thu
│       └── (admin)/           # Dashboard Quản trị & Kiểm duyệt: Thống kê, Duyệt phòng, Duyệt KYC
├── domain/                    # TẦNG MIỀN (Thuần TypeScript, KHÔNG import React/Next/axios)
│   ├── entities/              # User, Room, Contract, Invoice, Appointment, Review
│   ├── value-objects/         # Money, PhoneNumber, EmailAddress
│   ├── errors/                # DomainError, AuthError, ValidationError
│   └── repositories/          # Interfaces (Ports) định nghĩa các hành vi lấy/ghi dữ liệu
├── application/               # TẦNG ỨNG DỤNG (Use Cases, DTOs, Mappers)
│   ├── use-cases/             # LoginUseCase, GetRoomListUseCase, SignContractUseCase
│   ├── dto/                   # Request/Response DTOs
│   └── mappers/               # Ánh xạ từ DTO sang Domain Entity
├── infrastructure/            # TẦNG HẠ TẦNG (Chi tiết kỹ thuật)
│   ├── http/                  # ApiClient, Interceptors (xử lý 401 & refresh token rotation)
│   ├── repositories/          # Hiện thực Domain Repositories (gọi HTTP API qua Gateway)
│   ├── storage/               # LocalStorage, CookieStorage (Token, Locale)
│   └── di/                    # Dependency Injection / Composition Root (nối UseCase với Repo)
├── presentation/              # TẦNG HIỂN THỊ (Giao diện React)
│   ├── components/            # UI components (atoms, molecules, layouts, features)
│   ├── hooks/                 # Custom hooks (bọc TanStack Query quanh Use Cases)
│   ├── stores/                # Zustand stores (ModalStore, ThemeStore, FilterStore)
│   └── providers/             # React Query Provider, Intl Provider, Auth Provider
├── i18n/                      # Cấu hình next-intl, routing, messages (`vi.json`, `en.json`)
├── styles/                    # Tokens màu sắc, typography, globals.css
└── lib/                       # Tiện ích thuần (format tiền VND, format ngày giờ theo locale)
```

### Luật Phụ Thuộc Bắt Buộc (Ép Tự Động Bằng `eslint-plugin-boundaries`)
- `presentation -> application -> domain`
- `infrastructure -> application, domain`
- `domain` TUYỆT ĐỐI KHÔNG import từ bất kỳ tầng nào khác.
- Server Component gọi Use Case qua Composition Root (`src/infrastructure/di/`).
- Client Component gọi Use Case qua Custom Hook bọc `@tanstack/react-query`.
- Tuyệt đối KHÔNG gọi `fetch` hay `axios` trực tiếp bên trong component React.

## 4. Hệ Thống Thiết Kế & Nhận Diện Thương Hiệu "Tổ Ấm"
- **Triết lý:** Căn phòng trọ là "tổ ấm" đầu tiên của người xa quê. Giao diện thể hiện sự ấm cúng, tin cậy, thanh bình, sáng sủa.
- **Bảng màu Design Tokens (`@theme`):**
  - **Primary (Teal đậm ấm):** `#0F766E` (nền tảng tin cậy, thanh bình).
  - **Accent (Hổ phách Amber):** `#F59E0B` (ánh đèn nhà ấm áp, dùng cho CTA phụ, huy hiệu xác minh).
  - **Nền & Bề mặt:** Nền kem ấm `#FAF7F2`, bề mặt thẻ `#FFFFFF`, chữ chính `#1C1917`.
  - **Trạng thái:** Success `#10B981`, Warning `#F59E0B`, Danger `#EF4444`, Info `#06B6D4`.
  - **Cấm:** Không dùng màu tím hoặc xanh dương mặc định kiểu template có sẵn.
- **Logo SVG:** Hình ảnh mái nhà cách điệu kết hợp ghim định vị và cánh chim/chiếc lá biểu trưng cho sự an cư.
- **Typography:** Font hỗ trợ dấu tiếng Việt chuẩn xác qua `next/font`, phân cấp rõ rệt từ Display Headline tới Body Text.

## 5. Quy Chuẩn 4 Trạng Thái Bắt Buộc Của Mọi Màn Hình
Mọi màn hình và thành phần dữ liệu phải có đủ 4 trạng thái:
1. **Loading State:** Skeleton loader đúng tỷ lệ hình học (không dùng spinner xoay đơn điệu).
2. **Empty State:** Hình vẽ/icon minh họa trang nhã, thông điệp rõ ràng, nút gợi ý hành động.
3. **Error State:** Thông báo lỗi thân thiện, kèm nút "Thử lại" (Retry).
4. **Success / Content State:** Dữ liệu hiển thị hoàn chỉnh, bố cục cân đối hai biên.

## 6. Quy Chuẩn Đa Ngôn Ngữ (i18n)
- Mọi chuỗi văn bản trên giao diện PHẢI thông qua `next-intl` (hook `useTranslations` hoặc `getTranslations`).
- Tuyệt đối không hardcode chuỗi hiển thị tiếng Việt hay tiếng Anh trong JSX/TSX.
- Khi thêm key mới, bắt buộc bổ sung đồng thời ở cả hai file `src/i18n/messages/vi.json` và `src/i18n/messages/en.json`.
- Định dạng tiền tệ VND, ngày tháng năm, tỷ lệ phần trăm phải dùng hàm tiện ích chuẩn theo locale (`Intl.NumberFormat`, `Intl.DateTimeFormat`).

## 7. Các Luật Cấm Tuyệt Đối (Zero-Tolerance Rules)
- KHÔNG dùng emoji trong code, giao diện, commit, thông báo. Dùng icon từ `lucide-react`.
- KHÔNG mock data cứng trong component. Toàn bộ dữ liệu hiển thị phải nạp từ backend.
- KHÔNG có link chết (`href="#"` hoặc liên kết tới trang 404). Mọi nút bấm, breadcrumb, menu phải dẫn tới route thật.
- KHÔNG dùng `any` hoặc `@ts-ignore` để qua mặt TypeScript strict mode.
- KHÔNG để lộ secret/API key trên Client Component.

## 8. Quy Chuẩn Git
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- Tiếng Anh, ngắn gọn, phản ánh đúng thay đổi (ví dụ: `feat(rooms): add multi-criteria filter component`).

