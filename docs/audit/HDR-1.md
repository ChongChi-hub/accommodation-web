# AUDIT & DESIGN RECORD: [HDR-1] Public Header, Navigation, Search Combobox & Unified UserMenu

> **Status**: Hoàn thành 100% & Đã kiểm chứng Live Production (`next start`) + Backend Microservices (`:8080`, MySQL `9.1`, Redis, Mailpit).  
> **Scope**: Frontend (`accommodation-web`) & Supporting Backend (`accommodation-service`: `listing-service`, `communication-service`, `identity-service`, `api-gateway`).  
> **Replaces**: `DESIGN-1` (verified: never executed/committed).  
> **Branch**: `feat/ui-auth-header-upgrade`

---

## Checklist Đầy Đủ `[HDR-1]`

- [x] **Bước 0a**: Đối chiếu tệp header công khai, header dashboard, UserMenu/chip tên, logo, `routes.ts`, cấu hình điều hướng; kiểm tra `DESIGN-1` đã chạy chưa.
- [x] **Bước 0b**: Đối chiếu `shortName`, `resolveHome`, `/me` kèm vai trò & `landlordApplication`, API `hot-areas`, bộ đếm thông báo/tin nhắn chưa đọc, danh mục `room_types` hiện có.
- [x] **Bước 0c**: Quy ước suy xuất cho hạng mục chưa có (`shortName <= 14`, `resolveHome`, `routes.ts`, `navigation.ts`).
- [x] **A.1**: `navigation.ts` có kiểu duy nhất (`routeKey`, `labelKey`, `roles`, `enabled`); mục `enabled=false` hoặc route chưa tồn tại không hiện; test crawler mọi mục trỏ route thật (`83/83` unique links across `323` source files).
- [x] **A.2**: Menu desktop (`>=1280`: Logo | Phòng trọ | Nhà nguyên căn | Căn hộ | Ở ghép | Khu vực | Blog | Ô tìm | Đăng tin | Chuông | Tài khoản); `1024-1279` gộp 4 loại hình vào "Khám phá"; `<1024` nút menu mở ngăn kéo.
- [x] **A.3**: Alias thân thiện `/phong-tro`, `/nha-nguyen-can`, `/can-ho`, `/o-ghep` + `h1`, mô tả, `generateMetadata`, canonical alias, breadcrumb; `/rooms?type=...` 308 redirect; `Blog -> /safety-guide`; Flyway `V11` bổ sung `room_types` (`SINGLE`, `FULL_HOUSE`, `SHARED`) + `icon` + API `/api/v1/room-types` + i18n; rỗng hiện EmptyState gợi ý.
- [x] **A.4**: Menu "Khu vực": 8 tỉnh/thành đầu theo API `hot-areas` + số phòng + "Xem tất cả khu vực"; hover trễ `120ms` / click / Enter; đóng bằng `Esc` / mouseleave / đổi route; điều khiển bàn phím.
- [x] **A.5**: Trạng thái đang chọn: gạch chân chạy trượt + `aria-current="page"`.
- [x] **B.6**: Ô tìm desktop pill (`/` hint), ARIA combobox (`role="combobox"`, `listbox`, `aria-activedescendant`): tìm gần đây (`localStorage`, nút xóa), khu vực phổ biến, gợi ý trực tiếp (`300ms` debounce, `AbortController`, tối đa 5 phòng có ảnh/giá/khu vực, lỗi mạng hiện `[role="alert"]`), "Xem tất cả kết quả" -> `/rooms?q=...`, Enter/Arrows/Esc.
- [x] **B.7**: Ở trang chủ đầu trang ẩn ô tìm header (hero có thẻ tìm lớn); khi thẻ hero ra khỏi khung nhìn (`IntersectionObserver`) ô tìm trượt vào header; hằng `HEADER_SEARCH_ON_HOME_TOP = false`; giữ chỗ bề rộng tránh CLS (`0.0008` scroll, `0.0000` slow API).
- [x] **B.8**: Mobile: nút kính lúp mở lớp tìm toàn màn hình (`MobileSearchOverlay` nền đục `--bg-background`).
- [x] **B.9**: Tham số tìm theo `docs/audit/SEARCH_02_03_AUDIT.md` & `RoomFilterParams.java` (`q`, `provinceCode`, `roomTypeCode` đa mã); tìm gần đây chỉ ở thiết bị người dùng + "Xóa lịch sử".
- [x] **C.10**: Khách: Đăng nhập (viền mảnh), Đăng ký (đặc), "Đăng tin" (`/register?role=landlord`), theme & ngôn ngữ.
- [x] **C.11**: Đã đăng nhập: CTA "Đăng tin" (`TENANT` -> "Trở thành chủ trọ" `/become-landlord`; applicant -> `"Hồ sơ chủ trọ: {trạng thái}"` `/dashboard/landlord/kyc`; `LANDLORD` -> `"Đăng tin mới"` `/dashboard/landlord/rooms/new`; `ADMIN`/`MODERATOR` ẩn); chuông thông báo real badge + popover 5 mục mới nhất + mark-all-read (`communication-service`); icon tin nhắn real unread badge; UserMenu; gỡ nút logout đứng riêng ở header công khai.
- [x] **C.12**: Dropdown tài khoản `320px` (mobile bottom sheet render qua Portal không bị cắt bởi header): trigger `36px` avatar + `shortName` + tooltip + chevron; đầu `48px` avatar/tên/email/role badge/"Xem hồ sơ"; Nhóm 1 Dashboard + đổi vai trò CHỈ khi có cả `TENANT` & `LANDLORD`; Nhóm 2 theo vai trò `<=5` mục thật; Nhóm 3 Tin nhắn / Thông báo / Hồ sơ / Bảo mật; Nhóm 4 Giao diện phân đoạn (Sáng/Tối/Hệ thống) + Ngôn ngữ; Chân Trợ giúp + Đăng xuất (danger + toast `"Đã đăng xuất"`); animation `scale 0.96->1` `150ms`, arrows + typeahead + Esc focus return + close on route change + no flicker skeleton.
- [x] **C.13**: Dùng chung ĐÚNG MỘT component `UserMenu` cho Header công khai và `DashboardHeader`.
- [x] **D.14**: `72px` desktop co `64px` khi cuộn, `64px` mobile; trang có hero trong suốt chữ trắng trên gradient scrim -> cuộn `>24px` kính mờ (`backdrop-blur`, token bg, border, ink); `@supports not (backdrop-filter)` solid; reduced-motion/transparency; dark mode; `Logo` variants (`full`, `icon`, `monoLight`, `monoDark`) bỏ tagline khỏi header.
- [x] **D.15**: Test tương phản pixel tự động ở `scrollY=0` trên nền hero thực (`>= 4.5:1`; đo thực tế `9.65–14.12:1`).
- [x] **D.16**: Ngăn kéo mobile full-height (ô tìm, loại hình, Khu vực gập mở, khối tài khoản dưới; bẫy focus, Esc, khóa cuộn, swipe đóng).
- [x] **E.17–21**: Unit table tests, live Playwright E2E + Auth UI + Mailpit (`19/19`), bounding-box + Axe WCAG 2A/2AA (`0` vi phạm nghiêm trọng), 15 screenshots (`01`–`15`) đã tự phê bình và sửa lỗi, các lệnh build/lint/test đều pass thực tế.

---

## BƯỚC 0. ĐỐI CHIẾU THỰC TẾ (Lệnh & Đầu ra Thật)

### 0a. Liệt kê tệp hiện có & kiểm tra `DESIGN-1`

**Lệnh chạy trong `D:\RIKKEI\THUC_TAP\PROJECT\accommodation-web`:**
```powershell
git log -n 10 --oneline
git log --all --grep="DESIGN-1" --oneline
Get-ChildItem -Path src -Recurse -File | Where-Object { $_.Name -match 'Header|UserMenu|Logo|navigation|routes|Drawer|Avatar|ThemeToggle|Notification' } | Select-Object -ExpandProperty FullName
Select-String -Path (Get-ChildItem -Path src -Recurse -File -Include *.ts,*.tsx) -Pattern 'shortName|resolveHome|HEADER_SEARCH_ON_HOME_TOP|landlordApplication'
```

**Đầu ra thật:**
```text
=== git log (last 10 + DESIGN-1 search) ===
4ab6a33 fix(ci): add missing google auth methods to mock auth repositories in unit tests
74dfb38 feat: [APPT-02] Dashboard duyệt lịch hẹn cho Chủ trọ (Chấp nhận, Hủy bỏ kèm lý do) bản update thêm update giao diện
3e4c3e6 refactor: complete cross-audit reconciliation and foundation fixes (P-CHECK-A)
e723016 feat(kyc): integrate face verification scanner, 2-part progress card, and side-by-side moderation (KYC-02)
54f1ae3 feat(auth): align UI and session routing with landlord approval flow (AUTH-FLOW-A)
...
(git log --all --grep="DESIGN-1" --oneline trả về rỗng: 0 commit)

D:\RIKKEI\THUC_TAP\PROJECT\accommodation-web\src\domain\entities\Notification.ts
D:\RIKKEI\THUC_TAP\PROJECT\accommodation-web\src\domain\repositories\NotificationRepository.ts
D:\RIKKEI\THUC_TAP\PROJECT\accommodation-web\src\infrastructure\static\StaticNotificationRepository.ts
D:\RIKKEI\THUC_TAP\PROJECT\accommodation-web\src\presentation\components\layout\DashboardHeader.tsx
D:\RIKKEI\THUC_TAP\PROJECT\accommodation-web\src\presentation\components\layout\Header.tsx
D:\RIKKEI\THUC_TAP\PROJECT\accommodation-web\src\presentation\components\layout\ThemeToggle.tsx
D:\RIKKEI\THUC_TAP\PROJECT\accommodation-web\src\presentation\components\ui\Avatar.tsx
D:\RIKKEI\THUC_TAP\PROJECT\accommodation-web\src\presentation\components\ui\Drawer.tsx
```

| Thành phần | Tệp hiện hành | Hiện trạng & Vấn đề |
| :--- | :--- | :--- |
| `DESIGN-1` | *(Không có commit)* | **Chưa từng chạy.** `[HDR-1]` làm mới & thay thế `DESIGN-1`. |
| Header công khai | [Header.tsx](file:///D:/RIKKEI/THUC_TAP/PROJECT/accommodation-web/src/presentation/components/layout/Header.tsx) (107 dòng) | Link phẳng có icon (`Trang chủ`, `Tìm phòng`, `Đăng tin`); hiện `fullName` dễ tràn; nút Logout đứng riêng; không có ô tìm, không chuông/tin nhắn, không dropdown tài khoản, map sai `MODERATOR -> /dashboard/admin`. |
| Header dashboard | [DashboardHeader.tsx](file:///D:/RIKKEI/THUC_TAP/PROJECT/accommodation-web/src/presentation/components/layout/DashboardHeader.tsx) (330 dòng) | Nhân đôi toàn bộ Notification Bell + User Menu (hardcode `rose-600`, cho phép người không phải chủ trọ bấm "Chuyển sang Chủ trọ", đột biến `user.roles`). |
| Sidebar dashboard | [DashboardSidebar.tsx](file:///D:/RIKKEI/THUC_TAP/PROJECT/accommodation-web/src/presentation/components/layout/DashboardSidebar.tsx) (360 dòng) | Hiển thị nút `"Đổi sang Chủ trọ - Switch"` cho người thuê thuần. |
| Logo | `public/logo.svg`, `public/logo-mark.svg` | Inline `<img>` với `fill="#0F766E"` cố định và tagline `"Nền tảng thuê trọ minh bạch"` nằm sẵn trong SVG — chưa có component `<Logo variant="..." />` không tagline. |
| `routes.ts` / `navigation.ts` | *(Không tồn tại)* | Route rải rác dạng chuỗi cứng; chưa có cấu hình tập trung. `eslint.config.mjs` chỉ khai báo `src/{lib,i18n,styles}/**/*` là `shared` nên cần bổ sung `shared` (`src/shared/**/*`). |

---

### 0b. Đối chiếu Dữ liệu, Hợp đồng & Endpoint Thật

**Lệnh chạy kiểm tra Gateway (`:8080`) & MySQL (`cozynest_listing`, `cozynest_communication`, `cozynest_identity`):**
```powershell
foreach ($url in @(
  "http://localhost:8080/api/v1/locations/hot-areas",
  "http://localhost:8080/api/v1/room-types",
  "http://localhost:8080/api/v1/me",
  "http://localhost:8080/api/v1/notifications",
  "http://localhost:8080/api/v1/notifications/unread-count",
  "http://localhost:8080/api/v1/chat/unread-count"
)) { ... }

docker exec cozynest_mysql mysql ... -e "
  SELECT id, code, name, description FROM cozynest_listing.room_types ORDER BY id;
  SELECT room_type_code, status, COUNT(*) as cnt FROM cozynest_listing.rooms WHERE deleted_at IS NULL GROUP BY room_type_code, status ORDER BY room_type_code, status;
  SHOW TABLES FROM cozynest_communication;
  SELECT COUNT(*) AS notif_cnt FROM cozynest_communication.notifications;
  SELECT COUNT(*) AS msg_cnt FROM cozynest_communication.messages;
"
```

**Đầu ra thật:**
```text
http://localhost:8080/api/v1/locations/hot-areas -> 200 (trả 5 tỉnh: HN:27, HCM:6, DNG:2, CT:1, HP:1)
http://localhost:8080/api/v1/room-types -> 404
http://localhost:8080/api/v1/me -> 404 (ApiGatewayApplication route sai /api/v1/me/kyc/**)
http://localhost:8080/api/v1/notifications -> 404
http://localhost:8080/api/v1/notifications/unread-count -> 404
http://localhost:8080/api/v1/chat/unread-count -> 404

room_types (4 dòng, KHÔNG có cột icon):
1 | MINI_APARTMENT | Chung cư mini
2 | STUDIO         | Căn hộ Studio
3 | APARTMENT      | Căn hộ nguyên căn
4 | HOMESTAY       | Phòng trọ cao cấp

rooms theo room_type_code & status:
APARTMENT      | AVAILABLE      | 1
FULL_HOUSE     | HIDDEN         | 1
HOMESTAY       | AVAILABLE      | 1
HOMESTAY       | PUBLISHED      | 1
HOMESTAY       | REJECTED       | 1
MINI_APARTMENT | AVAILABLE      | 2
MINI_APARTMENT | DRAFT          | 1
MINI_APARTMENT | PUBLISHED      | 10
MINI_APARTMENT | RENTED         | 1
SINGLE         | DRAFT/HIDDEN/PENDING/REJECTED/RENTED | ... (PUBLISHED = 20)
STUDIO         | AVAILABLE      | 2

cozynest_communication: đã có bảng notifications (6 dòng seed), conversations, conversation_participants, messages (3 dòng seed), nhưng service chỉ có HealthController và chưa có Spring Security/JWT filter.
```

| Hạng mục `[HDR-1]` | Trạng thái hiện tại | Kết luận xử lý |
| :--- | :--- | :--- |
| `shortName` (`DASH-FIX-1`) | **Chưa có** (`grep` trả về rỗng) | Tạo `formatShortName` trong `src/presentation/utils/user-display.ts` theo mục 0c. |
| `resolveHome` (`AUTH-FLOW-B`) | **Chưa có** | Tạo `resolveHome(user, preferredRole)` map đúng 4 role `ADMIN -> /dashboard/admin`, `MODERATOR -> /dashboard/moderator`, `LANDLORD -> /dashboard/landlord`, `TENANT -> /dashboard/tenant`. |
| `/me` + `landlordApplication` | BE [MeController.java](file:///D:/RIKKEI/THUC_TAP/PROJECT/accommodation-service/identity-service/src/main/java/vn/cozynest/identity/interfaces/rest/MeController.java) & [UserDto.java](file:///D:/RIKKEI/THUC_TAP/PROJECT/accommodation-service/identity-service/src/main/java/vn/cozynest/identity/application/dto/UserDto.java) ĐÃ trả đầy đủ (`roles`, `landlordApplication`, `emailVerified`, `phoneMissing`, `workspaceHint`), nhưng Gateway chỉ map `/api/v1/me/kyc/**` (`/api/v1/me` bị 404), còn FE `User` type & `auth.store.ts` chưa hứng field và `initSession()` chưa gọi `/users/me`. | Sửa Gateway route thêm `/api/v1/me` & `/api/v1/me/**`; mở rộng FE `User` + cập nhật `initSession` làm mới hồ sơ từ `/me` kèm trạng thái `isHydrated`. |
| API `hot-areas` | Đã chạy (`200`), [HomeDataService.java](file:///D:/RIKKEI/THUC_TAP/PROJECT/accommodation-service/listing-service/src/main/java/vn/cozynest/listing/application/service/HomeDataService.java) đang cắt `.limit(6)` & `RoomRepository.findHotAreas()` dùng `INNER JOIN HAVING COUNT(r.id) > 0` (chỉ có 5 tỉnh có tin). | Hỗ trợ `limit` tối đa 8 (`LEFT JOIN` có đếm phòng thật hoặc `?limit=8` ưu tiên 8 tỉnh hàng đầu gồm HN, HCM, DNG, CT, HP, HUE... theo số phòng giảm dần). |
| Thông báo / Tin nhắn chưa đọc | BE DB `cozynest_communication` đã có bảng & seed thật nhưng chưa có controller + JWT security; FE [container.ts](file:///D:/RIKKEI/THUC_TAP/PROJECT/accommodation-web/src/infrastructure/di/container.ts) dùng `StaticNotificationRepository` & `StaticBadgeRepository` (số giả). | Thêm controller + Spring Security + ArchUnit test trong `communication-service`; đổi FE sang `HttpNotificationRepository` & API đếm tin nhắn chưa đọc thật. |
| Danh mục `room_types` | Bảng chỉ có 4 mã (`MINI_APARTMENT`, `STUDIO`, `APARTMENT`, `HOMESTAY`), thiếu cột `icon` và thiếu `SINGLE`, `FULL_HOUSE`, `SHARED`; chưa có `GET /api/v1/room-types`. | Flyway `V11__room_types_catalog_and_icons.sql` thêm `icon` và seed idempotent `SINGLE` (Phòng trọ), `FULL_HOUSE` (Nhà nguyên căn), `SHARED` (Ở ghép); mở API `/api/v1/room-types` (+ Gateway + `SecurityConfig.permitAll()`). |
| Tìm kiếm `GET /api/v1/rooms` | `RoomFilterParams.java` đã định nghĩa `q`, `provinceSlug`, `roomTypeCode`, `priceMin`, `priceMax`, `sort`, NHƯNG [RoomController.java](file:///D:/RIKKEI/THUC_TAP/PROJECT/accommodation-service/listing-service/src/main/java/vn/cozynest/listing/infrastructure/web/RoomController.java) & [RoomQueryService.java](file:///D:/RIKKEI/THUC_TAP/PROJECT/accommodation-service/listing-service/src/main/java/vn/cozynest/listing/application/service/RoomQueryService.java) bỏ qua `q`, `provinceSlug`, chuỗi đa mã `roomTypeCode` (`MINI_APARTMENT,STUDIO,APARTMENT`). | Bổ sung nhận `q`, `provinceSlug`, đa mã `roomTypeCode`, `priceMin`/`priceMax`/`sort` chuẩn hợp đồng [SEARCH_02_03_AUDIT.md](file:///D:/RIKKEI/THUC_TAP/PROJECT/accommodation-web/docs/audit/SEARCH_02_03_AUDIT.md). |
| `docs/API_CONTRACT.md` | Không tồn tại | Theo chỉ dẫn đối chiếu: tham số tìm dùng chuẩn [SEARCH_02_03_AUDIT.md](file:///D:/RIKKEI/THUC_TAP/PROJECT/accommodation-web/docs/audit/SEARCH_02_03_AUDIT.md) + tương thích ngược `provinceCode`/`roomTypeCode` của BE (`q`, `provinceCode`/`province`, `roomTypeCode`/`type`, `maxPrice`/`priceMax`, `minPrice`/`priceMin`, `sort`/`sortBy`, `page`, `size`). |

---

### 0c. Quy ước Suy xuất cho Thành phần Chưa có

1. **`shortName(fullName, maxLen = 14)`**:
   - Chuẩn hóa khoảng trắng (trim + collapse spaces). Nếu rỗng trả về `"Người dùng"`/`User`.
   - Nếu `normalized.length <= 14`: `isTruncated = false`, giữ nguyên chuỗi gốc (không cắt).
   - Nếu dài hơn `14`: ưu tiên gom các từ cuối (tên riêng tiếng Việt dạng `Họ Đệm Tên` -> giữ `"Đệm Tên"` hoặc chữ cái đầu họ + tên, hoặc cắt tại ranh giới từ sao cho tổng `<= 14`; cụ thể thử bỏ phần giữa nếu dạng dài hoặc giữ tiền tố đủ từ sao cho `<= 14`, trường hợp từ đơn > 14 ký tự mới cắt `slice(0, 13) + '…'`), trả về `{ shortName, fullName: normalized, isTruncated: true }` để nút kích hoạt hiển thị `title={fullName}` / accessible tooltip.
   - Đảm bảo kiểm tra bảng test: tên dài có dấu, toàn chữ HOA, 1 từ dài, 2 từ ngắn.
2. **`resolveHome(user, preferredRole?)`**:
   - Nếu `!user`: `/login`.
   - Kiểm tra `ADMIN -> /dashboard/admin`, `MODERATOR -> /dashboard/moderator`, nếu có cả `LANDLORD` & `TENANT`: tôn trọng `preferredRole` nếu hợp lệ (mặc định `LANDLORD`), nếu chỉ `LANDLORD` -> `/dashboard/landlord`, ngược lại `/dashboard/tenant`.
3. **Đổi vai trò (`hasDualRole`)**:
   - CHỈ cho phép & hiển thị khi `user.roles.includes('LANDLORD') && user.roles.includes('TENANT')`.
   - Khi chuyển đổi KHÔNG ghi đè mảng `user.roles` mà cập nhật `activeRole` (`'TENANT' | 'LANDLORD'`) trong store & cookie `cozynest_role`, giữ nguyên quyền thật của tài khoản.
4. **Ánh xạ Alias Route Loại Phòng**:
   - `/phong-tro` -> `roomTypeCode=SINGLE,HOMESTAY` (có 20 phòng `SINGLE` + 2 `HOMESTAY` công khai).
   - `/nha-nguyen-can` -> `roomTypeCode=FULL_HOUSE` (chưa có tin công khai -> trang hiện EmptyState với gợi ý).
   - `/can-ho` -> `roomTypeCode=MINI_APARTMENT,STUDIO,APARTMENT` (theo spec: Căn hộ = chung cư mini + studio + căn hộ; có 15 phòng công khai).
   - `/o-ghep` -> `roomTypeCode=SHARED` (chưa có tin công khai -> trang hiện EmptyState với gợi ý).
   - `/rooms?type=...` (các giá trị `phong-tro`, `SINGLE`, `HOMESTAY`, `ROOM`, `nha-nguyen-can`, `FULL_HOUSE`, `can-ho`, `MINI_APARTMENT`, `STUDIO`, `APARTMENT`, `o-ghep`, `SHARED`) -> `308 Permanent Redirect` sang alias tương ứng, bảo toàn các query param khác (`provinceCode`, `q`, ...).
5. **Routes tồn tại thật (sử dụng trong `routes.ts` & `navigation.ts`)**:
   - Mọi mục trong `navigation.ts` và nhóm `UserMenu` chỉ dùng đường dẫn có thật trong `src/app/[locale]`:
     - Với `ADMIN`/`MODERATOR`: bổ sung `/dashboard/admin/notifications` & `/dashboard/moderator/notifications` sử dụng Notification API thật (hoặc `enabled` theo vai trò cho `Tin nhắn`, không bao giờ để link trỏ vào route 404).
     - Bổ sung `/become-landlord` cho CTA người thuê thuần (`TENANT` chưa có hồ sơ xin làm chủ trọ).



---

## 2. KẾT QUẢ TRIỂN KHAI, SỬA LỖI & KIỂM CHỨNG THỰC TẾ

### a. Kiến Trúc Frontend & Thành Phần Đã Xây Dựng
- **Định tuyến & Điều hướng tập trung**: Tạo `src/shared/routes.ts` và `src/shared/navigation.ts` với cấu trúc đồng nhất (`routeKey`, `labelKey`, `roles`, `enabled`), mở rộng `eslint.config.mjs` cho phép tầng `shared`.
- **4 Trang Alias SEO Loại hình & Chuyển hướng 308**:
  - Tạo `/phong-tro` (`SINGLE,HOMESTAY`), `/nha-nguyen-can` (`FULL_HOUSE`), `/can-ho` (`MINI_APARTMENT,STUDIO,APARTMENT`), `/o-ghep` (`SHARED`) dùng chung `RoomsCatalogClient.tsx` với metadata, `canonical`, breadcrumb và `EmptyState` gợi ý riêng (`category-metadata.ts`).
  - Cấu hình `308 Permanent Redirect` trong `src/middleware.ts` cho `/rooms?type=...` (bảo toàn query params khác) và `/tenant/*`, `/landlord/*`, `/admin/*`, `/moderator/*` -> `/dashboard/...`.
- **Unified `UserMenu` & Vai trò Hợp nhất (`UserMenu.tsx`, `UserMenuPanel.tsx`)**:
  - Dùng chung một component `UserMenu` duy nhất cho Header công khai (`Header.tsx`) và Dashboard (`DashboardHeader.tsx`, đã bỏ code trùng lặp & nút logout rời).
  - Bổ sung `formatShortName(fullName, 14)` (`user-display.ts`), `resolveHome(user, preferredRole)`, Portal bottom sheet cho mobile (`390px`), `switchRole` chỉ hiện khi tài khoản có đồng thời cả `TENANT` & `LANDLORD` (không đột biến mảng `user.roles`).
  - Gọi API thật qua `HttpNotificationRepository`, `NotificationBell`, `MessageBadgeLink`, kèm trang `/become-landlord` + `/dashboard/{admin,moderator}/notifications`.
- **ARIA Search Combobox & Mobile Search (`HeaderSearchCombobox.tsx`, `HeaderSearchResultsList.tsx`, `MobileSearchOverlay.tsx`, `useSearchSuggestions.ts`, `recent-searches.ts`)**:
  - Phím tắt `/`, `300ms` debounce, `AbortController`, tìm gần đây cục bộ kèm "Xóa lịch sử", hiển thị `[role="alert"]` khi lỗi mạng (không giả làm 0 kết quả).
  - Trên trang chủ (`HEADER_SEARCH_ON_HOME_TOP = false`), dùng `IntersectionObserver` theo dõi thẻ hero để chuyển mượt chiều cao header `72px -> 64px` (frosted glass) và hiện ô tìm kiếm mà vẫn giữ chỗ bề rộng cố định (`header-search-shell`) và skeleton `HomeBanners` giúp loại bỏ giật layout.

### b. Nâng Cấp Hỗ Trợ Backend (`accommodation-service`)
- **`listing-service`**: Flyway `V11__room_types_catalog_and_icons.sql` (cột `icon` + `SINGLE`, `FULL_HOUSE`, `SHARED`), `RoomTypeController` (`GET /api/v1/room-types`), `LocationController` / `HomeDataService` (hỗ trợ `?limit=8` cho `hot-areas`), `RoomController` & `RoomQueryService` hỗ trợ `q`, `provinceSlug`, chuỗi đa mã `roomTypeCode`.
- **`communication-service`**: Triển khai `NotificationController` (`GET /api/v1/notifications`, `unread-count`, `mark-as-read`), `ChatSummaryController` (`GET /api/v1/chat/unread-count`), Spring Security JWT + `CommunicationSecurityMatrixTest`.
- **`api-gateway`**: Mở route `/api/v1/me`, `/api/v1/me/**`, `/api/v1/room-types`, `/api/v1/notifications/**`, `/api/v1/chat/**`.

### c. Lỗi Thực Tế Đã Phát Hiện & Khắc Phục Khi Kiểm Chứng Live
1. **Persistence Theme (`ThemeToggle.tsx` & `theme-preference.ts`)**: Thống nhất lưu key `cozynest_theme` (`light | dark | system`) đồng bộ giữa `UserMenu` và script khởi tạo layout để không mất theme khi tải lại trang.
2. **Logout 500 trên `identity-service` (`RefreshTokenRepositoryAdapter.java`)**: Thiếu `@Transactional` trên `revokeAllByUserId` / `revokeAllExceptByUserId` khi thực thi câu `@Modifying JPQL`; đã bổ sung `@Transactional`.
3. **Gateway 404/order cho `/api/v1/me` và booking routes (`ApiGatewayApplication.java`)**: Mở rộng khớp chính xác `/api/v1/me` bên cạnh `/api/v1/me/**` và phân tách `order(10)` hợp lý.
4. **Avatar mặc định 404 & Fallback (`public/uploads/avatars/default.png`, `Avatar.tsx`)**: Bổ sung asset mặc định và fallback chữ cái đầu khi ảnh lỗi.
5. **Layout Shift khi tải trang chủ (`Header.tsx`, `HomeBanners.tsx`)**: Dự phòng sẵn bề rộng `header-search-shell` bằng `visibility` thay vì `w-0` và thêm skeleton có `aspect-21/9` cố định khi `HomeBanners` đang loading.
6. **Hibernate 7 Optimistic Locking 409 khi xin làm Chủ trọ (`LandlordProfileJpaEntity.java`)**: Bổ sung khởi tạo `@Version private Long version = 0L;` (kèm `LandlordProfileJpaEntityTest` & Testcontainers `LandlordProfilePersistenceTestcontainersTest`) sửa lỗi `/become-landlord` khi tạo hồ sơ mới.

### d. Kết Quả Đo Đạc Thực Tế Sau Cùng
| Hạng mục kiểm tra | Công cụ / Lệnh thực thi | Kết quả đo được |
|---|---|---|
| **ESLint & TypeScript (FE)** | `npm run lint && npm run type-check` | **`0` errors** (Clean Architecture + TypeScript strict) |
| **Vitest, i18n, Links & Seed (FE)** | `npm run test && npm run check:seed-text` | **`15` files / `69/69` tests pass**; **`930/930` i18n keys parity**; **`83/83` links hợp lệ** (`323` source files) |
| **Production Build & Secret Scan (FE)** | `npm run build` + quét `.next/static` | **`180/180` static + dynamic routes OK**; **`SECRET_SCAN_HITS: 0`** |
| **Backend Build & Tests (BE)** | `.\gradlew.bat clean build --no-daemon` | **`63/63` Gradle tasks OK**, **`73` suites / `300/300` tests pass** (`0` fail/err/skip) |
| **Full Live Playwright E2E Suite** | `npx playwright test e2e/hdr1-live-verification.spec.ts e2e/auth-*.spec.ts` | **`19/19` passed (`51.3s`)**, `0` console/page/HTTP>=400 errors (Test `6` `/become-landlord -> AWAITING_KYC` live DB pass) |
| **Auth E2E Flow (Mailpit Real OTP)** | `npm run e2e:auth` (`docs/audit/test_auth_e2e.mjs`) | **`8/8` bước passed** cả FE & BE repo (Mailpit OTP, reset, login, change password) |
| **Tương phản Pixel Hero (`scrollY=0`)** | Đo luminance trực tiếp từ screenshot PNG `1440px` | Tổ Ấm `14.12:1`, Phòng trọ `9.88:1`, Nhà nguyên căn `9.88:1`, Căn hộ `9.75:1`, Ở ghép `9.91:1`, Blog `9.65:1`, Khu vực `9.89:1` (tất cả `>= 4.5:1`) |
| **Ổn định Layout (CLS)** | `PerformanceObserver` (`0 -> 650 -> 0` px) | **`0.0008`** (`<= 0.01`) |
| **Trợ năng WCAG 2A/2AA** | `@axe-core/playwright` (`include('header')`) | **`0` vi phạm serious / critical** trên `/vi`, `/vi/phong-tro`, `/vi/become-landlord` |
| **Visual Screenshots Matrix** | `docs/design/screenshots/hdr-1/01..15*.png` | Đủ 15 ảnh `1440px`/`1280px`/`1024px`/`768px`/`390px` (Light/Dark, VI/EN, EmptyState, BottomSheet Portal, SearchOverlay) |
