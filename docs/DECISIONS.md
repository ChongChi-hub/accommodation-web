# Architectural Decisions Record (ADR) - Nền tảng Thuê Trọ "Tổ Ấm"

## 1. Bối cảnh & Mục tiêu
Xây dựng nền tảng thuê phòng trọ "Tổ Ấm" thay thế hệ thống cũ, với kiến trúc Microservice hướng miền (DDD) cho backend và Clean Architecture cho frontend (Next.js).

---

## 2. Quyết định về Phiên bản & Công nghệ (Thực tế & Tương thích)

### 2.1. Backend (`to-am-services`)
* **Java:**
  * *Đề xuất ban đầu:* Java 25 LTS.
  * *Khảo sát môi trường thực tế:* Máy trạm phát triển hiện tại cài đặt `Java 23.0.2` (Oracle JDK 23), Docker hỗ trợ `eclipse-temurin:25-jre-alpine` / `eclipse-temurin:23`.
  * *Quyết định:* Cấu hình Gradle `sourceCompatibility = 23` và `targetCompatibility = 23` để đảm bảo biên dịch cục bộ (local build/test) không gặp lỗi thiếu JDK, đồng thời Docker container dùng Java 23/25.
* **Spring Boot & Spring Framework:**
  * *Phiên bản lựa chọn:* `Spring Boot 4.1.2` (Spring Framework 7, Jakarta EE 11).
  * *Spring Cloud:* `2025.1.4` (bản tương thích chính thức với Spring Boot 4.1.x cho `spring-cloud-gateway`).
  * *Web Starter:* Chuyển sang `org.springframework.boot:spring-boot-starter-webmvc` đúng theo chuẩn Spring Boot 4.
  * *JSON & Jackson:* Jackson 3 (`tools.jackson.core` / `tools.jackson.databind`).
* **Bảo mật & JWT:**
  * Sử dụng `spring-security-oauth2-jose` kết hợp JJWT `0.12.7` / Nimbus JOSE, phân quyền RBAC và token blacklist lưu trữ tại Redis.
* **Database & Migration:**
  * *MySQL Connector:* `com.mysql:mysql-connector-j:9.7.0`.
  * *Flyway:* `org.flywaydb:flyway-core:13.12.1` & `flyway-mysql:13.12.1`.
* **Testing & Architecture Rules:**
  * *ArchUnit:* `com.tngtech.archunit:archunit-junit5:1.5.1` để ép buộc quy tắc DDD: tầng `domain` không phụ thuộc vào `application`, `infrastructure`, hay `interfaces`.
  * *Testcontainers:* `org.testcontainers:mysql:1.21.4`.
* **OpenAPI Documentation:**
  * `org.springdoc:springdoc-openapi-starter-webmvc-ui:3.2.0` (tương thích Spring Boot 4).

### 2.2. Frontend (`to-am-web`)
* **Next.js & React:**
  * `next: 16.2.12` (Next.js 16.2 App Router).
  * `react: 19.3.1`, `react-dom: 19.3.1`.
* **Styling & Design System:**
  * `tailwindcss: 4.3.5` (sử dụng `@theme` CSS-first).
  * `lucide-react: 1.70.0` (tuyệt đối không sử dụng emoji trong UI và code).
  * Cài đặt và tích hợp `taste-skill` (`design-taste-frontend` 2.5.0) đảm bảo giao diện độc bản, tinh tế, tỷ lệ chuẩn, responsive 1440/1024/768/390.
* **State & Data Fetching:**
  * Server State: `@tanstack/react-query: 5.107.1`.
  * Client/UI State: `zustand: 5.1.0`.
  * Form & Schema Validation: `react-hook-form: 7.91.0` + `@hookform/resolvers: 7.0.3` + `zod: 4.6.7`.
  * Đa ngôn ngữ: `next-intl: 4.14.9` (mặc định tiếng Việt `vi`, hỗ trợ tiếng Anh `en`).
* **Kiến trúc & Kiểm soát phụ thuộc:**
  * Clean Architecture: `presentation -> application -> domain`; `infrastructure -> application, domain`.
  * Ép luật phụ thuộc bằng `eslint-plugin-boundaries: 7.4.2`.

---

## 3. Quyết định về Ranh giới Bounded Context (Microservices)

1. **`api-gateway` (Port 8080):** Reverse proxy, CORS, JWT validation filter, rate limiter, OpenAPI gateway aggregator.
2. **`identity-service` (Port 8081):** Quản lý người dùng, đăng ký, đăng nhập, refresh token rotation, KYC (CCCD), hồ sơ.
3. **`listing-service` (Port 8082):** Danh mục địa giới hành chính (DVHCVN), phòng trọ, loại phòng, tiện nghi, nội quy, ảnh, đánh giá, phòng yêu thích.
4. **`booking-service` (Port 8083):** Lịch hẹn xem phòng, yêu cầu thuê phòng, hợp đồng điện tử và snapshot dữ liệu phòng.
5. **`billing-service` (Port 8084):** Chỉ số điện nước (đồng hồ), hóa đơn định kỳ, lịch sử giao dịch và thanh toán.
6. **`communication-service` (Port 8085):** Hội thoại chat trực tiếp, tin nhắn văn bản/ảnh, thông báo in-app.
7. **`admin-service` (Port 8086):** Bảng điều khiển quản trị, kiểm duyệt bài đăng/KYC, báo cáo vi phạm, nhật ký kiểm toán (audit logs).

---

## 4. Quyết định về Phạm vi Giai đoạn 1

* **Chạy thật 100%:** Luồng đăng ký, đăng nhập, refresh token, thông tin cá nhân `/me`, đổi mật khẩu; frontend có middleware bảo vệ route và phân luồng đúng theo Role (Tenant, Landlord, Moderator, Admin).
* **Dữ liệu hiển thị (Read-only APIs):** Toàn bộ các trang công khai và dashboard đều hiển thị dữ liệu thật được seed từ backend qua Flyway (không hardcode dữ liệu trong frontend).
* **Thao tác ghi khác:** Được thiết kế đầy đủ UI (modal, validation, preview) và hiển thị toast thông báo qua i18n ("Tính năng sẽ ra mắt").


---

## 5. Quyết định về Tách Biệt 2 Repository Độc Lập & Docker Compose

* **Bối cảnh:** Hai repository `accommodation-service` (Backend Microservices) và `accommodation-web` (Next.js Frontend) hoạt động độc lập, mỗi repo có Git remote, CI, Dockerfile riêng biệt.
* **Quyết định Docker Compose:**
  * Tại `accommodation-service`, file `docker-compose.yml` mặc định khởi chạy toàn bộ hạ tầng Backend (MySQL 9.7, Redis, Gateway port 8080 và các microservice).
  * Đồng thời bổ sung service `web` với Docker Compose profile `full` trỏ tới `../accommodation-web`.
  * Khi phát triển độc lập: Backend chạy `./gradlew bootRun` hoặc `docker compose up` (cổng 8080/8081); Frontend chạy `npm run dev` (cổng 3000) gọi API qua `NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`.
  * Khi cần khởi chạy trọn gói cả hệ thống bằng một lệnh: `docker compose --profile full up --build`.

---

## 6. Quyết định Cải tổ Hệ thống Giao diện Toàn cục (Global Design System & CSS)

### 6.1. Chẩn đoán nguyên nhân gốc rễ (Root Cause Analysis)
Qua việc mở trình duyệt kiểm tra thực tế trên Chromium ở cả 2 độ phân giải 1440px và 390px (Light/Dark mode):
1. **Lỗi Dark Mode tê liệt do thiếu `@custom-variant dark`:**
   - Trong Tailwind CSS v4, tính năng `dark:` mặc định lắng nghe media query `@media (prefers-color-scheme: dark)`. Ứng dụng bật/tắt dark mode bằng cách thêm class `.dark` vào thẻ `<html>`, nhưng thiếu chỉ thị `@custom-variant dark (&:where(.dark, .dark *));`.
   - Kết quả: Khi kích hoạt theme tối, background vẫn giữ nguyên màu trắng `#FAF7F2` và chữ màu tối `#1C1917`, toàn bộ class `dark:*` bị bỏ qua.
2. **Lỗi layout mobile (390px) do Sidebar cố định:**
   - Component `DashboardSidebar` sử dụng kích thước cứng `w-64` (256px) nằm trong container flex ngang cạnh `<main>`.
   - Trên màn hình di động 390px, thanh Sidebar chiếm 256px, ép nội dung chính `<main>` chỉ còn vỏn vẹn **134px**, dẫn đến vỡ nát toàn bộ giao diện bảng, biểu đồ, thẻ tóm tắt.
3. **Thiếu định nghĩa Semantic Tokens hai chiều:**
   - File `globals.css` chỉ khai báo màu tĩnh, không có bộ biến CSS semantic (`--background`, `--surface`, `--border`, `--foreground`, `--muted`) tự động đảo giá trị theo chế độ sáng/tối.
4. **Header chưa phân tách ngữ cảnh:**
   - `DashboardLayout` dùng chung Header công khai của khách vãng lai, thiếu nút điều khiển Drawer trên di động, chuông thông báo có badge, và menu quản trị viên.
5. **Thiếu chuẩn hóa Typography tiếng Việt:**
   - Sử dụng system font mặc định khiến hiển thị dấu tiếng Việt trên Windows bị lệch độ cao và co giãn chữ không đồng đều.

### 6.2. Phương án khắc phục triệt để ở tầng Design System
1. **Cấu hình lại Tailwind v4 & Biến CSS trong `globals.css`:**
   - Bổ sung `@custom-variant dark (&:where(.dark, .dark *));`.
   - Thiết lập bảng màu semantic:
     - Light: Background `#FAF8F5`, Surface `#FFFFFF`, Surface Muted `#F5F1EA`, Border `#E7E5E4`, Foreground `#1C1917`, Muted `#78716C`.
     - Dark: Background `#0C0A09`, Surface `#1C1917`, Surface Muted `#292524`, Border `#2E2A27`, Foreground `#F5F5F4`, Muted `#A8A29E`.
   - Tích hợp màu thương hiệu: Primary Teal (`#0F766E`), Accent Amber (`#F59E0B`), Danger Rose (`#E11D48`), Success Emerald (`#10B981`).
2. **Tích hợp Google Font `Plus Jakarta Sans` với subset Vietnamese:**
   - Nạp thông qua `next/font/google` trong layout gốc và ánh xạ vào biến `--font-sans`.
3. **Tái thiết kế `DashboardLayout` và `DashboardSidebar` đáp ứng Mobile:**
   - Trên màn hình `< 1024px`, Sidebar chuyển thành Offcanvas Drawer có nút toggle trên Header.
   - Nội dung `<main>` luôn chiếm toàn bộ chiều rộng (100% viewport width) trên di động.
4. **Chuẩn hóa bộ UI component:**
   - Button: cố định chiều cao (sm: 34px, md: 40px, lg: 46px), rounded-xl, bo viền và đổ bóng tinh tế.
   - Input/Select: cố định chiều cao 40px (md), bo góc rounded-xl, padding đều, focus ring thương hiệu rõ ràng.
   - Table: có lớp bọc `overflow-x-auto` với thanh cuộn mỏng, min-width chuẩn, phân cách dòng rõ nét.
   - Badge & Card: nhất quán border radius và độ tương phản màu chuẩn WCAG AA.

---

## 7. Quyết định Bổ sung Lược đồ Cơ sở Dữ liệu & Bounded Contexts Tương lai (Future Schemas & Entities)

Nhằm phục vụ mở rộng đầy đủ các tính năng trong giai đoạn tiếp theo mà không làm xáo trộn kiến trúc DDD hiện tại, các thực thể và bảng cơ sở dữ liệu backend sau đây được quy hoạch chi tiết:

1. **`maintenance_requests` (trong `booking-service` hoặc `maintenance-service`):**
   * *Mục đích:* Quản lý vòng đời yêu cầu bảo trì sửa chữa phòng trọ giữa người thuê và chủ nhà.
   * *Cấu trúc cột:* `id` (VARCHAR/UUID), `room_id` (VARCHAR), `tenant_id` (VARCHAR), `landlord_id` (VARCHAR), `title` (VARCHAR 255), `description` (TEXT), `category` (ELECTRICITY/WATER/APPLIANCE/INTERNET/STRUCTURE), `priority` (LOW/MEDIUM/HIGH/EMERGENCY), `status` (PENDING/IN_PROGRESS/RESOLVED/REJECTED), `cost` (DECIMAL 12,2), `images_json` (JSON), `created_at` (TIMESTAMP), `resolved_at` (TIMESTAMP).
2. **`support_tickets` & `support_messages` (trong `communication-service`):**
   * *Mục đích:* Quản lý khiếu nại, phản ánh và hỗ trợ kỹ thuật khách hàng toàn sàn.
   * *Cấu trúc cột tickets:* `id`, `user_id`, `subject`, `category` (ACCOUNT/PAYMENT/CONTRACT/VIOLATION/OTHER), `priority`, `status` (OPEN/ASSIGNED/IN_PROGRESS/RESOLVED/CLOSED), `assigned_admin_id`, `created_at`, `closed_at`.
   * *Cấu trúc cột messages:* `id`, `ticket_id`, `sender_id`, `sender_role`, `message`, `attachment_url`, `created_at`.
3. **`disputes` (trong `booking-service` hoặc `admin-service`):**
   * *Mục đích:* Xử lý tranh chấp tiền cọc, vi phạm hợp đồng hoặc hư hại tài sản có sự can thiệp của Quản trị sàn.
   * *Cấu trúc cột:* `id`, `contract_id`, `complainant_id`, `defendant_id`, `dispute_type` (DEPOSIT_RETURN/DAMAGE_COMPENSATION/EARLY_TERMINATION), `amount` (DECIMAL), `reason` (TEXT), `evidence_json` (JSON), `status` (PENDING/MEDIATING/RESOLVED/DISMISSED), `verdict` (TEXT), `resolved_by`, `resolved_at`.
4. **`transactions` (trong `billing-service`):**
   * *Mục đích:* Sổ cái theo dõi mọi luồng tiền ra vào: đặt cọc giữ chỗ, thanh toán tiền phòng, phí sàn, hoàn cọc.
   * *Cấu trúc cột:* `id`, `user_id`, `contract_id`, `invoice_id`, `amount`, `currency` (VND), `type` (DEPOSIT_HOLD/RENT_PAYMENT/COMMISSION_FEE/REFUND), `payment_method` (VIETQR/BANK_TRANSFER/WALLET), `status` (PENDING/SUCCESS/FAILED/REFUNDED), `reference_code` (VARCHAR), `created_at`.
5. **`blog_posts` & `cms_content` (trong `listing-service` hoặc `cms-service`):**
   * *Mục đích:* Quản lý cẩm nang sống, kinh nghiệm thuê trọ, SEO khu vực và bài viết tin tức.
   * *Cấu trúc cột:* `id`, `slug` (VARCHAR unique), `title`, `summary`, `content_markdown` (LONGTEXT), `thumbnail_url`, `author_id`, `status` (DRAFT/PUBLISHED/ARCHIVED), `view_count`, `published_at`.
6. **`listing_plans` & `promo_codes` (trong `billing-service`):**
   * *Mục đích:* Bảng giá gói đẩy tin nổi bật, gắn nhãn phòng VIP và mã giảm giá thanh toán.
7. **`contract_templates` (trong `booking-service`):**
   * *Mục đích:* Cho phép chủ trọ cấu hình các điều khoản pháp lý và quy định nội bộ mẫu trước khi sinh hợp đồng.
8. **`expenses` (trong `billing-service`):**
   * *Mục đích:* Hỗ trợ chủ trọ theo dõi dòng chi phí bảo trì định kỳ, tiền rác, thuế để tính toán biên lợi nhuận ròng.


