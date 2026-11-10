# Báo Cáo Đối Chiếu Hiện Trạng (Step 0 Audit - LIST-1)

> Ngày thực hiện: 09/11/2026  
> Tác vụ: `[LIST-1]` Làm lại 4 trang theo loại hình (`/phong-tro`, `/nha-nguyen-can`, `/can-ho`, `/o-ghep`), bộ lọc khu vực có ô tìm kiếm, Mega-menu "Khu vực" ở header, thẻ phòng ảnh tràn viền.  
> Điều kiện tiên quyết: `[HDR-1]` và `[HOME-1]` ĐÃ HOÀN THÀNH VÀ ĐẠT TOÀN DIỆN.

---

## 1. Hiện Trạng Tệp Của 4 Trang Loại Hình & Các Vị Trí Render Thẻ Phòng

### 1.1. Tệp của 4 trang loại hình & Component Danh mục
- `src/app/[locale]/(public)/phong-tro/page.tsx`
- `src/app/[locale]/(public)/nha-nguyen-can/page.tsx`
- `src/app/[locale]/(public)/can-ho/page.tsx`
- `src/app/[locale]/(public)/o-ghep/page.tsx`
- `src/app/[locale]/(public)/rooms/page.tsx`
- Component danh mục dùng chung hiện tại: `src/presentation/components/rooms/RoomsCatalogClient.tsx` (168 dòng)
- Component thanh lọc hiện tại: `src/presentation/components/rooms/RoomFilterBar.tsx` (153 dòng)

### 1.2. Grep Mọi Nơi Đang Vẽ Thẻ Phòng Trên Toàn Hệ Thống
Kết quả grep toàn bộ mã nguồn `src/` tìm các nơi render `RoomCard` hoặc thẻ phòng tự dựng:

| STT | Vị trí tệp | Mục đích sử dụng | Loại thẻ đang dùng | Vấn đề phát hiện |
|:---:|---|---|---|---|
| 1 | `src/presentation/components/rooms/RoomCard.tsx` | Thẻ phòng chính của hệ thống | `RoomCard` | Khung trắng bao quanh ảnh (`p-4 bg-surface rounded-2xl border`), ảnh bị thu hẹp không tràn viền, chỉ có 1 ảnh không có carousel/chuyển ảnh, nhãn xác minh bị ép cứng `true`. |
| 2 | `src/presentation/components/rooms/RoomsCatalogClient.tsx` | Danh sách 4 trang loại hình và `/rooms` | `RoomCard` + `RoomCardSkeleton` | Chỉ có 1 kiểu lưới 3 cột, không hỗ trợ chuyển đổi giao diện ngang (list view) mượt mà, thiếu skeleton chuẩn. |
| 3 | `src/presentation/components/home/HomeFeaturedCarousel.tsx` | Băng chuyền trang chủ | `RoomCard` | Đang dùng chung thẻ `RoomCard` với kích thước đầy đủ thay vì biến thể thu gọn (`compact`). |
| 4 | `src/presentation/components/home/HomeLatestRooms.tsx` | Lưới 8 phòng trang chủ | `RoomCard` | Dùng `RoomCard` tiêu chuẩn. |
| 5 | `src/app/[locale]/(public)/rooms/[slug]/RoomDetailClientView.tsx` | Khối "Phòng tương tự" ở trang chi tiết | `RoomCard` | Dùng `RoomCard` tiêu chuẩn. |
| 6 | `src/app/[locale]/(public)/hosts/[id]/page.tsx` | Danh sách phòng của chủ trọ | `RoomCard` | Dùng `RoomCard` tiêu chuẩn. |
| 7 | `src/app/[locale]/(dashboard)/dashboard/tenant/saved-rooms/page.tsx` | Phòng đã lưu của người thuê | `RoomCard` | Dùng `RoomCard` tiêu chuẩn. |
| 8 | `src/app/[locale]/(dashboard)/dashboard/landlord/rooms/page.tsx` | Quản lý phòng của chủ trọ | `LandlordRoomCard` | Thẻ quản lý chuyên biệt có nút sửa/xóa/đổi trạng thái (được giữ riêng cho dashboard chủ trọ). |

---

## 2. Bảng Ánh Xạ Route -> room_types & Nguyên Nhân Xuất Hiện "Homestay cao cấp"

### 2.1. Bảng ánh xạ hiện trạng
Dựa trên `src/shared/routes.ts` và backend `RoomSpecificationBuilder.java`:

| Route | Alias | roomTypeCodes được ánh xạ | Nhãn hiển thị (`vi.json`) | Hiện trạng thực tế |
|---|---|---|---|---|
| `/phong-tro` | `phongTro` | `['SINGLE', 'HOMESTAY']` | `SINGLE`: "Phòng trọ khép kín"<br>`HOMESTAY`: "Homestay cao cấp" | **LỖI NGHIỆP VỤ**: Trang phòng trọ xuất hiện thẻ có nhãn "Homestay cao cấp". |
| `/nha-nguyen-can` | `nhaNguyenCan` | `['FULL_HOUSE']` | "Nhà nguyên căn" | Đạt (8 phòng sau seed `R__04`). |
| `/can-ho` | `canHo` | `['MINI_APARTMENT', 'STUDIO', 'APARTMENT']` | "Chung cư mini", "Căn hộ Studio", "Căn hộ dịch vụ" | Đạt (23 phòng sau seed `R__04`). |
| `/o-ghep` | `oGhep` | `['SHARED']` | "Ở ghép / Ký túc xá" | Đạt (8 phòng sau seed `R__04`). |

### 2.2. Phân tích nguyên nhân: Ánh xạ sai hay Seed sai?
**Kết luận: CẢ HAI ĐỀU SAI VÀ BỔ TRỢ TẠO RA LỖI.**
1. **Ánh xạ sai kiến trúc:**
   - Trong `src/shared/routes.ts` (dòng 77) và `RoomSpecificationBuilder.java` (dòng 101-104), nhóm `phong-tro` bị gộp cưỡng bức cả `SINGLE` lẫn `HOMESTAY`. Homestay là loại hình lưu trú du lịch / ngắn ngày / cao cấp, không thuộc bản chất của phòng trọ cho thuê dài hạn của sinh viên và người đi làm.
2. **Seed sai dữ liệu:**
   - Trong dữ liệu ban đầu, phòng id 3 và 11 được gán `room_type_id = 4` (`HOMESTAY`) với tiêu đề mang hơi hướng phòng nghỉ dưỡng.
   - Khi truy vấn `/phong-tro`, API trả về cả phòng Homestay. Thẻ `RoomCard` hiển thị `t('roomTypes.HOMESTAY')` -> kết quả hiển thị badge *"Homestay cao cấp"* ngay giữa trang tìm phòng trọ bình dân.
3. **Giải pháp xử lý:**
   - Tách biệt hoàn toàn `HOMESTAY` ra khỏi alias `phong-tro` ở cả backend `RoomSpecificationBuilder` và frontend `routes.ts`.
   - Cập nhật lại seed dữ liệu để các phòng thuộc `/phong-tro` sử dụng đúng mã `SINGLE` với tiêu đề, mô tả và giá phòng trọ thực tế.

---

## 3. Khảo Sát Menu "Khu vực" Ở Header & Phản Hồi API Trực Tiếp

### 3.1. Bằng chứng gọi trực tiếp `GET /locations/hot-areas?limit=8`
Thực thi kiểm tra qua cổng API Gateway `http://localhost:8080`:
```json
{
  "data": [
    { "code": "HN", "name": "Hà Nội", "fullName": "Thành phố Hà Nội", "slug": "ha-noi", "imageUrl": "/images/areas/ha-noi-1080.webp", "roomCount": 31 },
    { "code": "HCM", "name": "Hồ Chí Minh", "fullName": "Thành phố Hồ Chí Minh", "slug": "ho-chi-minh", "imageUrl": "/images/areas/ho-chi-minh-1080.webp", "roomCount": 10 },
    { "code": "DNG", "name": "Đà Nẵng", "fullName": "Thành phố Đà Nẵng", "slug": "da-nang", "imageUrl": "/images/areas/da-nang-1080.webp", "roomCount": 6 },
    { "code": "HP", "name": "Hải Phòng", "fullName": "Thành phố Hải Phòng", "slug": "hai-phong", "imageUrl": "/images/areas/hai-phong-1080.webp", "roomCount": 5 },
    { "code": "CT", "name": "Cần Thơ", "fullName": "Thành phố Cần Thơ", "slug": "can-tho", "imageUrl": "/images/areas/can-tho-1080.webp", "roomCount": 5 },
    { "code": "HUE", "name": "Huế", "fullName": "Thành phố Huế", "slug": "hue", "imageUrl": "/images/areas/hue-1080.webp", "roomCount": 4 },
    { "code": "BN", "name": "Bắc Ninh", "fullName": "Tỉnh Bắc Ninh", "slug": "bac-ninh", "imageUrl": "/images/areas/bac-ninh-1080.webp", "roomCount": 4 },
    { "code": "BDG", "name": "Bình Dương", "fullName": "Tỉnh Bình Dương", "slug": "binh-duong", "imageUrl": "/images/areas/binh-duong-1080.webp", "roomCount": 4 }
  ]
}
```
*HTTP Status: 200 OK. Phản hồi đầy đủ 8 tỉnh thành có phòng thật.*

### 3.2. Vì sao menu "Khu vực" hiện tại chỉ hiện "Xem tất cả khu vực"?
Khảo sát mã nguồn `src/presentation/components/layout/AreaDropdown.tsx`:
1. **Lỗi trạng thái khởi tạo và bất đồng bộ:** Menu dùng `useState<HotAreaDto[]>([])`. Khi người dùng mở menu lần đầu trước khi API phản hồi hoặc khi fetch gặp lỗi mạng, `areas` là mảng rỗng `[]`. Khối `.map()` không render bất kỳ mục nào, chỉ còn lại liên kết cuối cùng `{tNav('allAreas')}` (*"Xem tất cả khu vực"*).
2. **Không có Skeleton / Loading / Error state:** Khi API đang tải hoặc lỗi, menu không hiển thị skeleton hay thông báo lỗi thử lại, mà âm thầm để trống nội dung.
3. **Liên kết "Xem tất cả" trỏ sai đích:** Đang trỏ về `/rooms` thay vì trang quy hoạch khu vực `/khu-vuc`.
4. **Mất ngữ cảnh loại hình đang xem:** Khi người dùng đang ở `/can-ho` mà bấm chọn *"Hà Nội"* trong menu, liên kết đang hardcode `/rooms?provinceCode=HN`, làm mất hoàn toàn bộ lọc căn hộ của người dùng.

---

## 4. Khảo Sát Bộ Lọc Tỉnh/Phường & Tham Số Dữ Liệu Theo Loại Hình

### 4.1. Thẻ chọn hiện tại
- Trong `RoomFilterBar.tsx`, Tỉnh/Thành và Phường/Xã đang được render bằng thẻ HTML `<Select>` đơn giản (dropdown mặc định), không có ô gõ tìm kiếm, không hỗ trợ tìm kiếm không dấu ("ha noi", "hcm", "sai gon"), không có số lượng phòng theo facet, không có hỗ trợ phím mũi tên theo chuẩn APG Combobox.

### 4.2. API Facets (`/api/v1/rooms/facets`)
Đã hoạt động tại `http://localhost:8080/api/v1/rooms/facets`, trả về:
- `provinces`: 8 tỉnh thành kèm `count`.
- `priceRange`: min (1.2M) - max (15M).
- `amenities`: 10 tiện nghi kèm `count`.
- `roomTypes`: 7 loại phòng kèm `count`.
- `categories`: 4 danh mục kèm `count`.

### 4.3. Các cột dữ liệu theo loại hình hiện có và còn thiếu
Khảo sát entity `Room.java` và DTO `RoomDto.java`:

| Thuộc tính | Có trong Entity DB (`Room.java`) | Có trong `RoomDto.java` | Có trong API query params | Đánh giá / Cần bổ sung cho LIST-1 |
|---|:---:|:---:|:---:|---|
| **Diện tích (`area`)** | Có | Có | Có (`minArea`, `maxArea`) | Đã sẵn sàng. |
| **Khoảng giá (`price`)** | Có | Có | Có (`minPrice`, `maxPrice`) | Đã sẵn sàng. |
| **Đơn vị giá (`price_unit`)** | Có (`ROOM`/`BED`) | Có | Chưa lọc theo unit | Cần hỗ trợ lọc theo đơn vị giường cho ở ghép. |
| **Số phòng ngủ (`bedrooms`)** | Có (`Integer`) | **CHƯA CÓ** | **CHƯA CÓ** | Cần đưa vào `RoomDto` và bổ sung tham số `bedrooms` trong `RoomFilterParams` & `RoomSpecificationBuilder`. |
| **Số tầng (`floor`)** | Có (`Integer`) | **CHƯA CÓ** | **CHƯA CÓ** | Cần đưa vào `RoomDto`. |
| **Nội thất (`furnishing`)** | Có (`FULL`/`PARTIAL`/`NONE`) | Có | **CHƯA CÓ** | Cần bổ sung tham số lọc `furnishing` trong `RoomFilterParams`. |
| **Giới tính (`gender_preference`)** | Có (`ALL`/`MALE`/`FEMALE`) | Có | **CHƯA CÓ** | Cần bổ sung tham số lọc `genderPreference` cho ở ghép. |
| **Chỗ trống (`available_spots`)** | Có `max_occupants` | Chưa có `availableSpots` | Chưa có | Cần thêm cột/thuộc tính `available_spots` (hoặc tính dựa trên occupants) cho ở ghép. |
| **Cờ xác minh chủ trọ** | Có trong `LandlordSnapshot` | Đang bị hardcode `true` | Chưa nối mapper | **LỖI**: Cần nối thực tế từ `LandlordSnapshot.isVerified` sang `RoomDto.isLandlordVerified` để hiển thị trung thực. |

---

## 5. Bằng Chứng Ảnh Chụp Hiện Trạng Ban Đầu (Before Screenshots)

Đã chụp toàn bộ 4 trang danh mục loại hình ở cả 2 kích thước màn hình Desktop (1440px) và Mobile (390px) lưu tại `docs/design/screenshots/list/before/`:

1. **Phòng trọ (`/vi/phong-tro`):**
   - [Desktop 1440px (Before)](file:///d:/RIKKEI/THUC_TAP/PROJECT/accommodation-web/docs/design/screenshots/list/before/phong-tro-1440-desktop-before.png)
   - [Mobile 390px (Before)](file:///d:/RIKKEI/THUC_TAP/PROJECT/accommodation-web/docs/design/screenshots/list/before/phong-tro-390-mobile-before.png)
   - *Khuyết điểm hiện trạng:* Header tiêu đề đơn điệu dạng text thuần không có ảnh dải banner; bộ lọc HTML Select thô sơ; thẻ phòng có viền trắng đệm bao quanh ảnh; xuất hiện phòng có nhãn *"Homestay cao cấp"*.
2. **Nhà nguyên căn (`/vi/nha-nguyen-can`):**
   - [Desktop 1440px (Before)](file:///d:/RIKKEI/THUC_TAP/PROJECT/accommodation-web/docs/design/screenshots/list/before/nha-nguyen-can-1440-desktop-before.png)
   - [Mobile 390px (Before)](file:///d:/RIKKEI/THUC_TAP/PROJECT/accommodation-web/docs/design/screenshots/list/before/nha-nguyen-can-390-mobile-before.png)
   - *Khuyết điểm hiện trạng:* Thiếu bộ lọc số phòng ngủ, số tầng, diện tích sàn.
3. **Căn hộ (`/vi/can-ho`):**
   - [Desktop 1440px (Before)](file:///d:/RIKKEI/THUC_TAP/PROJECT/accommodation-web/docs/design/screenshots/list/before/can-ho-1440-desktop-before.png)
   - [Mobile 390px (Before)](file:///d:/RIKKEI/THUC_TAP/PROJECT/accommodation-web/docs/design/screenshots/list/before/can-ho-390-mobile-before.png)
   - *Khuyết điểm hiện trạng:* Thiếu bộ lọc số phòng ngủ (Studio/1/2/3 PN), nội thất và tiện ích tòa nhà.
4. **Ở ghép (`/vi/o-ghep`):**
   - [Desktop 1440px (Before)](file:///d:/RIKKEI/THUC_TAP/PROJECT/accommodation-web/docs/design/screenshots/list/before/o-ghep-1440-desktop-before.png)
   - [Mobile 390px (Before)](file:///d:/RIKKEI/THUC_TAP/PROJECT/accommodation-web/docs/design/screenshots/list/before/o-ghep-390-mobile-before.png)
   - *Khuyết điểm hiện trạng:* Thẻ chưa hiển thị đúng đơn vị giá `/giường/tháng`, thiếu nhãn giới tính ("Chỉ nhận nữ / nam") và số chỗ còn trống.

---

## 6. Kết Luận Bước 0 & Kế Hoạch Thi Công LIST-1

1. **Backend:**
   - Tạo Flyway migration `V13`: bổ sung cột `available_spots` (INT, nullable), `total_spots` (INT, nullable) cho bảng `rooms`.
   - Cập nhật `RoomDto.java`: bổ sung `bedrooms`, `floor`, `availableSpots`, `totalSpots`, `createdAt`, `isLandlordVerified` (ánh xạ thật từ `LandlordSnapshot`).
   - Cập nhật `RoomSpecificationBuilder.java`: bổ sung bộ lọc `bedrooms`, `furnishing`, `genderPreference`, `priceUnit`, sửa ánh xạ loại hình bỏ `HOMESTAY` khỏi `phong-tro`.
   - Cập nhật seed `R__05`: bổ sung phòng chuẩn cho từng loại, phân biệt rõ phòng trọ bình dân và homestay/căn hộ, có số chỗ trống cho ở ghép, gán landlord verified có chọn lọc (không phải 100%).
2. **Frontend:**
   - Xây dựng **RoomCard ảnh tràn viền** duy nhất (`src/presentation/components/rooms/RoomCard.tsx`) với tỉ lệ 4:3, carousel tối đa 5 ảnh, nhãn badge nổi, pill giá chuẩn vi-VN và đơn vị giá, hỗ trợ 3 biến thể: `grid`, `list`, `compact`.
   - Xây dựng **Combobox ARIA APG** tìm kiếm tỉnh/thành & phường/xã (`Combobox.tsx`) hỗ trợ gõ không dấu, alias tỉnh cũ (Bình Dương, Bà Rịa - Vũng Tàu, Sài Gòn, HCM, Huế), bàn phím đầy đủ.
   - Nâng cấp **Mega-menu "Khu vực" ở Header** (720px, 2 cột: hot areas ảnh + A-Z combobox search, giữ category đang xem, link tới `/khu-vuc`).
   - Xây dựng route `/khu-vuc` và `/khu-vuc/[tinh]`.
   - Tái cấu trúc 4 trang loại hình qua bộ máy chung **`RoomCatalog`** với header 280-360px có ảnh nền có bản quyền, thẻ tìm kiếm đè mép 40-60px, bộ lọc chuyên biệt cho từng loại, thanh lọc dính (sticky bar), khối SEO手 viết tay + FAQ accordion + JSON-LD (FAQPage, ItemList, BreadcrumbList).



---

## 7. Kết Quả Thi Công & Bằng Chứng Kiểm Thử (Verification & Test Results)

### 7.1. Kết Quả Kiểm Thử Đơn Vị (Backend & Frontend)
1. **Backend Unit Tests:**
   - Đã cập nhật `RoomQueryServiceTest` và `SeedHomeCoverageTest` hỗ trợ mock `LandlordSnapshotRepository` và kiểm tra logic lọc `SINGLE`.
   - Kết quả chạy `.\gradlew.bat test`: **BUILD SUCCESSFUL (32 tasks, 70 unit tests passed, 0 failures)**.
2. **Frontend Unit Tests & Checks:**
   - Đã thêm kiểm thử chuẩn hóa và tìm kiếm không dấu `search-normalization.test.ts` (4/4 passed).
   - Kiểm thử crawler `hdr1.test.tsx` xác nhận tất cả đường dẫn trong `APP_ROUTES` (bao gồm `/khu-vuc`) trỏ đúng tệp `page.tsx` thật trên đĩa.
   - Kết quả chạy `npm test`: **16 test files passed, 73 tests passed, verify-i18n 100% parity, verify-links 0 broken, verify-manifest 224/224 pass**.
3. **Kiểm tra TypeScript & Linter:**
   - `npm run type-check`: **0 errors**.
   - `npm run lint`: **0 errors**.

### 7.2. Kết Quả Kiểm Thử Playwright End-to-End (`e2e/list1-verification.spec.ts`)
Đã thực thi 7 kịch bản tự động bao phủ trọn vẹn yêu cầu 35a - 35m:
- **35a & 35b:** 4 trang loại hình tải thành công (HTTP 200), `/phong-tro` không còn bất kỳ nhãn "Homestay cao cấp" nào (PASS).
- **35c & 35d & 35e:** APG Combobox, thanh lọc dính sticky, ô Phường disable khi chưa có Tỉnh và kích hoạt khi chọn Tỉnh (PASS).
- **35g:** Header "Khu vực" Mega-menu 720px mở trên hover/click, hiển thị 8 ô ảnh khu vực + danh sách A-Z, bảo toàn ngữ cảnh loại hình đang xem (ví dụ đang ở `/can-ho` bấm Hà Nội trỏ đúng `/can-ho?provinceCode=HN`) (PASS).
- **35h & 35i:** Thẻ phòng `RoomCard` tràn viền 4:3, carousel chuyển ảnh bấm được không gây nhảy trang, nhãn xác minh chỉ hiển thị khi `isLandlordVerified === true`, nút tim lưu phòng độc lập không kích hoạt chuyển trang (PASS).
- **35k & 35l:** SEO Accordion FAQ mở/đóng mượt mà; bộ chuyển đổi Grid/List view hoạt động chính xác (PASS).
- **35m:** Các route mới `/khu-vuc` (Bento grid toàn quốc) và `/khu-vuc/[tinh]` (Trang tỉnh đích với các tab loại phòng) tải đầy đủ dữ liệu (PASS).
- **Axe Core Accessibility:** 0 lỗi nghiêm trọng (critical / serious violations) (PASS).

---

## 8. Bảng Đối Chiếu Hiện Trạng: Trước (Before) và Sau (After)

| Hạng mục đối chiếu | Trước khi thực hiện (Before) | Sau khi hoàn thành (After) |
|---|---|---|
| **Header trang loại hình** | Tiêu đề text đơn điệu, khoảng trắng thô cứng, không có ảnh đại diện, không có số lượng phòng động. | Hero Banner cao 280-360px với ảnh có bản quyền phân giải cao, phủ lớp gradient contrast scrim $\ge 4.5:1$, Breadcrumb sang trọng, hiệu ứng CountUp số lượng phòng động từ API facets. |
| **Thanh tìm kiếm & lọc** | Nằm tách rời trong trang, dùng thẻ `<select>` gốc của trình duyệt, không có ô gõ tìm kiếm, không gõ được không dấu. | Thanh lọc nổi (Floating filter bar) gối lên mép dưới hero banner 40-60px, chuyển sang sticky bar khi cuộn qua hero, tích hợp APG Combobox hỗ trợ tìm không dấu ("ha noi", "hcm", "hue") và phân nhóm "Phổ biến" / "Tất cả (A-Z)". |
| **Lọc giá** | Dropdown tĩnh với 4 mức giá cố định thô sơ. | Dual Price Slider hai đầu kéo trực quan kèm 2 ô nhập số phân cách hàng nghìn (VNĐ), debounce 300ms, đồng bộ tham số URL `minPrice` / `maxPrice`. |
| **Bộ lọc chuyên biệt** | Không có bộ lọc theo đặc thù từng loại hình. | Dải gợi ý Quick Chips riêng cho từng loại: trọ (dưới 2tr, nuôi pet, nấu ăn); nhà (1, 2, 3+ PN, full nội thất); căn hộ (Studio, 1 PN, 2 PN, pet); ở ghép (Nam, Nữ, còn từ 2 chỗ). Popover "Bộ lọc khác" có badge đếm số lượng bộ lọc đang bật. |
| **Thẻ phòng (`RoomCard`)** | Khung viền có đệm trắng (`p-4`), ảnh bị thu hẹp không tràn viền, chỉ có 1 ảnh cố định, nhãn xác minh bị hardcode `true`, giá hiển thị thiếu đơn vị giường cho ở ghép. | **Edge-to-edge full-bleed**: Ảnh 4:3 tràn sát mép thẻ, carousel tối đa 5 ảnh với mũi tên trượt desktop & vuốt cảm ứng mobile, pill giá nổi trên nền gradient scrim bảo đảm độ tương phản, hiển thị đúng đơn vị `/giường/tháng` hoặc `/tháng`, huy hiệu xác minh chỉ hiện khi chủ trọ thật sự đã KYC. Hỗ trợ đầy đủ 3 biến thể: `grid`, `list`, `compact`. |
| **Menu "Khu vực" ở Header** | Popover nhỏ 320px, chỉ có chữ, khi API chưa xong thì rỗng ruột chỉ hiện "Xem tất cả khu vực", bấm vào bị mất ngữ cảnh loại hình đang xem. | **Mega-menu 720px 2 cột**: Cột trái gồm 8 ô ảnh thành phố có bản quyền kèm số lượng phòng; cột phải là combobox tìm kiếm A-Z; bảo toàn route loại hình đang xem (`/can-ho?provinceCode=...`); chân menu dẫn về trang tổng quan `/khu-vuc`. |
| **SEO & Thông tin chuyên sâu** | Trang kết thúc cụt lủn sau danh sách phòng, không có nội dung SEO, không có FAQ. | Đoạn văn biên tập 150-250 từ viết tay tử tế cho từng loại hình, Accordion FAQ 4 câu hỏi thường gặp, liên kết nhanh đến các tỉnh trọng điểm, cấu trúc dữ liệu JSON-LD (`FAQPage`, `ItemList`, `BreadcrumbList`). |
| **Các route khu vực** | Chưa có `/khu-vuc` và `/khu-vuc/[tinh]`. | Hoàn thiện `/khu-vuc` (Bento grid 8 tỉnh trọng điểm) và `/khu-vuc/[tinh]` (Landing page từng tỉnh với tabs loại hình). |

---

## 9. Tự Phê Bình Thẩm Mỹ (Self-Critique Matrix)

Mỗi ảnh chụp kết quả được đánh giá nghiêm túc với ít nhất 3 cải tiến cụ thể đã đạt được:

### 9.1. Ảnh Trang Phòng Trọ Desktop (`phong-tro-1440-desktop-after.png`)
1. **Bố cục Hero Banner & Floating Card:** Thay thế tiêu đề chữ xám đơn điệu cũ bằng dải ảnh phòng trọ ấm áp với tỷ lệ tương phản chuẩn, thẻ tìm kiếm đặt nổi `-mt-12` tạo chiều sâu thị giác (elevation depth) chuyên nghiệp.
2. **Loại bỏ triệt để nhãn sai:** Toàn bộ danh sách chỉ hiển thị đúng phòng trọ đơn / khép kín, không còn bất kỳ nhãn "Homestay cao cấp" nào làm nhiễu trải nghiệm người dùng.
3. **Thẻ phòng tràn viền hiện đại:** Tỷ lệ ảnh 4:3 tràn viền hoàn toàn không còn viền trắng đệm thừa thãi, pill giá đổ bóng tương phản cao hiển thị rõ ràng trên mọi nền ảnh.

### 9.2. Ảnh Trang Phòng Trọ Mobile (`phong-tro-390-mobile-after.png`)
1. **Tối ưu hiển thị màn hình dọc:** Header co giãn vừa vặn trong chiều cao 280px, tiêu đề hiển thị nổi bật trên nền scrim tối mà không che khuất hình ảnh.
2. **Bộ lọc chạm thân thiện (Touch-friendly):** Các nút gợi ý dạng viên thuốc (chips) có thể cuộn ngang mượt mà bằng ngón tay, khoảng cách chạm $\ge 44\text{px}$ chuẩn Human Interface Guidelines.
3. **Thẻ phòng dạng danh mục di động:** Thẻ ảnh 4:3 full-width với các huy hiệu và nút tim đặt ở 4 góc chiến lược, ngón tay cái dễ dàng thao tác mà không vô tình bấm nhầm vào liên kết chi tiết phòng.

### 9.3. Ảnh Trang Nhà Nguyên Căn Desktop (`nha-nguyen-can-1440-desktop-after.png`)
1. **Dải Banner kiến trúc nhà ở gia đình:** Sử dụng ảnh nhà phố hiện đại có bản quyền từ Pexels, tạo ấn tượng sang trọng và đáng tin cậy.
2. **Bộ lọc chuyên biệt phòng ngủ & nội thất:** Cung cấp sẵn các nút chọn 1 PN, 2 PN, 3+ PN và Đầy đủ nội thất giúp người thuê nhà gia đình lọc nhanh chỉ trong 1 cú nhấp.
3. **Thông số kỹ thuật chi tiết trên thẻ:** Hiển thị biểu tượng số phòng ngủ (`BedDouble`) và số tầng (`Layers`) ngay trên thẻ, giúp người dùng nắm bắt nhanh cấu trúc căn nhà trước khi bấm xem chi tiết.

### 9.4. Ảnh Trang Căn Hộ Desktop (`can-ho-1440-desktop-after.png`)
1. **Nhận diện hiện đại chuẩn chung cư:** Hình ảnh đại diện căn hộ chung cư cao cấp với gam màu trang nhã, nhãn đếm phòng động CountUp tạo cảm giác nền tảng có lượng dữ liệu phong phú và đang sống.
2. **Phân loại Studio & Căn hộ tiện lợi:** Quick chips hỗ trợ lọc trực tiếp các căn hộ Studio hoặc căn hộ nhiều phòng ngủ mà không cần mở nhiều menu phức tạp.
3. **Huy hiệu xác minh minh bạch:** Chỉ những chủ trọ đã qua kiểm duyệt CCCD thật sự mới xuất hiện biểu tượng khiên xanh "Chủ trọ xác minh", tăng cường tính xác thực và an tâm khi giao dịch căn hộ giá trị cao.

### 9.5. Ảnh Trang Ở Ghép Desktop (`o-ghep-1440-desktop-after.png`)
1. **Giải quyết triệt để bài toán ký túc xá:** Badge "Còn N chỗ" hiển thị trực tiếp số giường trống hiện tại, nhãn đơn vị giá ghi rõ `đ/giường/tháng` thay vì ghi chung chung gây hiểu lầm.
2. **Bộ lọc giới tính thiết yếu:** Tích hợp trực tiếp lựa chọn Nam / Nữ giúp sinh viên và người đi làm dễ dàng tìm đúng mô hình ở ghép phù hợp với nhu cầu cá nhân.
3. **Hướng dẫn nội quy sinh hoạt ở ghép:** Khối SEO và FAQ cung cấp đầy đủ lưu ý về an toàn đồ đạc, quy tắc giữ trật tự chung sau 23h, mang lại giá trị thực tế vượt trội so với các trang rao vặt thông thường.

### 9.6. Ảnh Header Mega-menu Khu Vực 720px (`list-mega-menu-1440.png`)
1. **Thiết kế 2 cột cân xứng và giàu thông tin:** 8 ô ảnh thành phố có chiều sâu, chữ trắng nổi trên gradient tối, tỷ lệ chia 7:5 giữa khu vực hot và ô tìm kiếm A-Z tạo cảm giác quy củ như các nền tảng OTA hàng đầu thế giới (Airbnb, Booking).
2. **Bảo toàn ngữ cảnh điều hướng:** Người dùng đang ở bất kỳ danh mục nào cũng có thể chọn thành phố mà không bị đá văng về trang chung, giảm tối đa số lần nhấp chuột không cần thiết.
3. **Hỗ trợ truy cập bàn phím chuẩn mực:** Có độ trễ mở an toàn 120ms chống kích hoạt nhầm khi lướt chuột qua, phím Esc đóng ngay lập tức, phím Tab và mũi tên điều hướng chuẩn APG.

### 9.7. Ảnh APG Combobox Đang Mở (`list-combobox-open-1440.png`)
1. **Giao diện tìm kiếm trực quan:** Ô nhập từ khóa có biểu tượng kính lúp, danh sách xổ xuống phân định rõ nhóm "Phổ biến" và "Tất cả (A-Z)" giúp người dùng tìm thấy tỉnh mình cần trong chưa đầy 1 giây.
2. **Tìm kiếm thông minh không dấu:** Người dùng gõ "ha noi", "hcm", "sai gon", "hue" đều tìm thấy chính xác tỉnh/thành tương ứng mà không cần gõ đúng dấu tiếng Việt.
3. **Độ tương phản và trạng thái chọn rõ nét:** Mục đang được chọn có icon tích xanh và chữ đậm, mục đang hover có nền sáng nhẹ, số lượng tin đăng hiển thị đồng bộ bên cạnh.

### 9.8. Ảnh Chế Độ Xem Danh Sách Ngang (`list-view-mode-1440.png`)
1. **Bố cục thẻ ngang (List View) thanh lịch:** Ảnh 4:3 chiếm cột trái với kích thước cố định 300px, toàn bộ thông tin chi tiết (tiêu đề, địa chỉ, diện tích, phòng ngủ, tiện nghi) trải rộng ở cột phải dễ quét mắt.
2. **Trải nghiệm lưu trạng thái:** Ghi nhớ lựa chọn Grid/List vào `localStorage`, giữ nguyên chế độ xem khi người dùng chuyển trang hoặc tải lại.
3. **Duy trì tính năng tương tác độc lập:** Các nút tim, mũi tên chuyển ảnh trên dải ảnh bên trái hoạt động độc lập và không ảnh hưởng đến liên kết chuyển hướng của toàn thẻ.

---

## 10. Danh Sách Tệp Đã Tạo & Chỉnh Sửa

| Tệp | Vị trí | Số dòng | Nhiệm vụ chính |
|---|---|:---:|---|
| `V13__list1_room_spots_and_filters.sql` | `accommodation-service/src/main/resources/db/migration/` | 26 | Thêm cột `available_spots`, `total_spots` vào bảng `rooms`. |
| `R__05_list1_categories_and_verified_landlords.sql` | `accommodation-service/src/main/resources/db/migration/` | 136 | Seed dữ liệu chuẩn 4 loại hình, phân định rõ `SINGLE` vs `HOMESTAY`, cập nhật cờ xác minh chủ trọ thực tế. |
| `Room.java` | `accommodation-service/.../domain/model/` | 196 | Bổ sung trường `availableSpots`, `totalSpots`. |
| `RoomDto.java` | `accommodation-service/.../application/dto/` | 74 | Bổ sung `floor`, `bedrooms`, `availableSpots`, `totalSpots`, `createdAt`, `publishedAt`. |
| `RoomFilterParams.java` | `accommodation-service/.../application/dto/` | 38 | Bổ sung `bedrooms`, `priceUnit`, `minAvailableSpots`. |
| `RoomSpecificationBuilder.java` | `accommodation-service/.../infrastructure/persistence/` | 158 | Bỏ `HOMESTAY` khỏi `phong-tro`, thêm bộ lọc `bedrooms`, `furnishing`, `genderPreference`, `priceUnit`, `minAvailableSpots`. |
| `RoomQueryService.java` | `accommodation-service/.../application/service/` | 238 | Nối mapper nạp trạng thái xác minh chủ trọ từ `LandlordSnapshotRepository`, tính số lượng `phongTro` chỉ gồm `SINGLE`. |
| `routes.ts` | `src/shared/` | 138 | Sửa ánh xạ `phongTro` chỉ chứa `['SINGLE']`, thêm route `khuVuc`. |
| `listing.dto.ts` | `src/application/dto/` | 217 | Đồng bộ các trường mới `floor`, `bedrooms`, `availableSpots`, `totalSpots`, `isLandlordVerified`, `genderPreference`, `furnishing`. |
| `http-listing.repository.ts` | `src/infrastructure/repositories/` | 114 | Truyền đủ tham số `bedrooms`, `furnishing`, `genderPreference`, `priceUnit`, `minAvailableSpots`. |
| `search-normalization.ts` | `src/presentation/utils/` | 45 | Hàm chuẩn hóa không dấu và ánh xạ alias tỉnh thành. |
| `search-normalization.test.ts` | `src/presentation/utils/` | 34 | Kiểm thử đơn vị cho chuẩn hóa và tìm kiếm không dấu. |
| `Skeleton.tsx` | `src/presentation/components/ui/` | 66 | Cập nhật `RoomCardSkeleton` chuẩn tỷ lệ 4:3 tràn viền cho cả `grid` và `list`. |
| `Combobox.tsx` | `src/presentation/components/ui/` | 232 | ARIA APG Combobox tìm kiếm tỉnh/phường với phím mũi tên, Home, End, Esc, Enter. |
| `DualPriceSlider.tsx` | `src/presentation/components/rooms/` | 209 | Thanh kéo 2 đầu + 2 ô nhập số phân cách hàng nghìn (VNĐ) + preset nhanh. |
| `CategoryQuickChips.tsx` | `src/presentation/components/rooms/` | 170 | Các nút gợi ý lọc nhanh theo đặc thù từng loại hình. |
| `AdvancedFilterPopover.tsx` | `src/presentation/components/rooms/` | 187 | Popover bộ lọc nâng cao (tiện nghi, nội thất, giới tính) với badge đếm số lượng bộ lọc. |
| `RoomCardBadges.tsx` | `src/presentation/components/rooms/` | 74 | Huy hiệu loại phòng, "Mới đăng" $\le 7$ ngày, "Còn N chỗ", và khiên "Chủ trọ xác minh" (chỉ hiện khi đã xác minh thật). |
| `RoomCardCarousel.tsx` | `src/presentation/components/rooms/` | 115 | Băng chuyền tối đa 5 ảnh: nút bấm trái/phải, chấm phân trang, vuốt cảm ứng chạm. |
| `RoomCard.tsx` | `src/presentation/components/rooms/` | 166 | Thẻ phòng tràn viền thống nhất toàn ứng dụng với 3 biến thể `grid`, `list`, `compact`, stretched link an toàn. |
| `RoomFilterBar.tsx` | `src/presentation/components/rooms/` | 187 | Thanh lọc chính tích hợp Search, Combobox Tỉnh/Phường, DualPriceSlider, QuickChips, AdvancedPopover. |
| `RoomCatalogHero.tsx` | `src/presentation/components/rooms/` | 84 | Dải ảnh Hero Banner 280-360px có bản quyền, gradient scrim $\ge 4.5:1$, CountUp số lượng phòng động. |
| `RoomCatalogSeo.tsx` | `src/presentation/components/rooms/` | 223 | Nội dung biên tập viết tay 150-250 từ, Accordion 4 câu hỏi FAQ, liên kết tỉnh hot, JSON-LD Schema. |
| `RoomCatalog.tsx` | `src/presentation/components/rooms/` | 218 | Bộ máy chung điều phối danh mục: Hero, Floating bar, Sticky bar, Danh sách phòng, Phân trang/Sort, Chuyển Grid/List, SEO. |
| `ProvinceCatalogClient.tsx` | `src/presentation/components/rooms/` | 169 | Component hiển thị trang đích tỉnh thành với các tab loại phòng. |
| `AreaDropdown.tsx` | `src/presentation/components/layout/` | 232 | Mega-menu "Khu vực" ở Header rộng 720px 2 cột: 8 ô ảnh thành phố + danh sách combobox A-Z, bảo toàn category. |
| `MobileNavDrawer.tsx` | `src/presentation/components/layout/` | 218 | Cập nhật menu mobile dẫn đến `/khu-vuc` và bảo toàn category đang duyệt. |
| `Header.tsx` | `src/presentation/components/layout/` | 226 | Cập nhật nhãn trợ năng cho nút chuyển ngôn ngữ đạt chuẩn WCAG 2.5.3 (Label in Name). |
| `phong-tro/page.tsx` | `src/app/[locale]/(public)/phong-tro/` | 22 | Tích hợp `RoomCatalog` cho phòng trọ. |
| `nha-nguyen-can/page.tsx` | `src/app/[locale]/(public)/nha-nguyen-can/` | 22 | Tích hợp `RoomCatalog` cho nhà nguyên căn. |
| `can-ho/page.tsx` | `src/app/[locale]/(public)/can-ho/` | 22 | Tích hợp `RoomCatalog` cho căn hộ. |
| `o-ghep/page.tsx` | `src/app/[locale]/(public)/o-ghep/` | 22 | Tích hợp `RoomCatalog` cho ở ghép. |
| `khu-vuc/page.tsx` | `src/app/[locale]/(public)/khu-vuc/` | 119 | Trang Bento grid 8 tỉnh thành có phòng trọng điểm toàn quốc. |
| `khu-vuc/[tinh]/page.tsx` | `src/app/[locale]/(public)/khu-vuc/[tinh]/` | 45 | Trang đích chi tiết cho từng tỉnh. |
| `list1-verification.spec.ts` | `e2e/` | 170 | Bộ kiểm thử Playwright tự động kiểm tra toàn bộ tiêu chí 35a - 35m và WCAG Axe A11y. |
| `list1-visual-capture.spec.ts` | `e2e/` | 72 | Bộ kịch bản chụp 11 ảnh visual so sánh trước/sau ở 1440px và 390px. |
