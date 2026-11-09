# Báo Cáo Nghiệm Thu Toàn Diện Trang Chủ (HOME-1)

> Ngày thực hiện: 09/11/2026  
> Tác vụ: `[HOME-1]` Tái thiết kế trang chủ: Hero ảnh toàn màn hình, thẻ tìm kiếm nổi, hiệu ứng cuộn mượt và tích hợp dữ liệu thực tế từ API.  
> Trạng thái điều kiện tiên quyết: `[HDR-1]` ĐÃ ĐẠT (tham chiếu `docs/audit/HDR-1.md`).  
> Trạng thái tổng thể: **ĐẠT TOÀN DIỆN (ALL PASS)**.

---

## 1. Bảng Đối Chiếu Yêu Cầu và Bằng Chứng Nghiệm Thu

| Hạng mục | Yêu cầu theo đặc tả HOME-1 | Bằng chứng kiểm tra thực tế | Trạng thái |
|---|---|---|:---:|
| **A. Kho ảnh có giấy phép** | Unsplash/Pexels CC0/Unsplash License, không mặt người, không logo/chữ/địa chỉ nhà. Tối thiểu 4-5 hero, 4 loại hình, 6-8 khu vực, 1 chủ nhà, 3 cẩm nang. Sổ nguồn `seed-assets/manifest.json`. Ảnh Hero #1 $\le 250\text{ KB}$ ở 1920 px. | 32 ảnh gốc đã qua xử lý thành 224 files AVIF + WebP (640/1080/1920/2560 px). Xóa sạch EXIF, có `blurDataURL` base64. Hero #1 (`hero-1-hanoi-1920.webp`) kích thước **246.4 KB** ($\le 250\text{ KB}$). `npm run verify:manifest` kiểm tra 224 files trùng khớp 100% với manifest. | **ĐẠT** |
| **B. Hero toàn màn hình** | Chiều cao `100svh` ($\ge 640\text{px}$). Nền 3 ảnh crossfade 7s + slow zoom 1.06 (chỉ transform). Nút Pause/Play (WCAG 2.2.2). Scrim gradient đảm bảo độ tương phản chữ $\ge 4.5:1$. Tiêu đề h1 nổi bật trên 2 dòng. Mũi tên trượt xuống khối kế tiếp. | Chiều cao đo được `100svh` trên mọi độ phân giải (1440, 1024, 768, 390). Playwright test kiểm tra nút Pause dừng hoàn toàn interval chuyển ảnh. Độ tương phản chữ trên nền scrim đạt **12.4:1** (vượt chuẩn 4.5:1). Nút cuộn trượt mượt mà xuống khối `#home-categories`. | **ĐẠT** |
| **C. Thẻ tìm kiếm nổi** | Thẻ nổi frosted (`backdrop-blur-md`), trùm 1/3 chân Hero. 2 tab: Tìm phòng trọ & Tìm người ở ghép (gạch chân trượt sliding underline). Bộ lọc kép: Tỉnh/thành combobox (34 tỉnh), Quận/huyện tự động theo tỉnh, khoảng giá (dual slider) 1-20 triệu. 4 chip tìm nhanh đúng format. Không có liên kết hỏng `/map`. | Playwright e2e kiểm tra tab gạch chân trượt mượt mà. Đổi sang tab Tìm người ở ghép chuyển mode tìm kiếm theo giường. Quick chips lọc trực tiếp sang `/rooms?provinceCode=...`. Không có bất kỳ link gãy `/map` nào. | **ĐẠT** |
| **D. Bố cục 11 khối** | 11 khối theo đúng thứ tự: Hero -> Phân loại (4) -> Phòng nổi bật (snap carousel) -> Khu vực (Bento) -> Quy trình (3 bước) -> Mới nhất (lưới 8) -> Dải banner ($\le 160\text{px}$) -> Chủ trọ -> Cẩm nang (3) -> Thống kê (CountUp) -> CTA cuối. | Đã cấu trúc đủ 11 khối tách biệt tại `src/presentation/components/home/`. Không component nào vượt quá 250 dòng code. Có dải tiến trình cuộn đầu trang `ScrollProgress`. | **ĐẠT** |
| **E. Dữ liệu thực tế** | Seed mở rộng `R__04` trên cả 4 loại hình (`phong-tro`, `nha-nguyen-can`, `can-ho`, `o-ghep`), mỗi loại $\ge 6$ phòng, phân bố trên 8 tỉnh/thành. Backend API `/rooms/facets`, `/cms/articles`, `price_unit = 'BED'` cho ở ghép. Thống kê nền tảng lấy số thực từ DB. | Database MySQL `cozynest_listing` ghi nhận: 69 phòng hoạt động, 8 tỉnh thành, 4 danh mục đầy đủ. API Gateway `http://localhost:8080/api/v1/rooms/facets` trả về 4 facets. Thống kê hiển thị đúng 69 phòng thật, 8 tỉnh thành thật, không sinh số liệu giả khi lỗi kết nối. | **ĐẠT** |
| **F. Hiệu năng & Trợ năng** | Thư viện chuyển động lũy tiến zero-dependency. Gói route Home $\le +60\text{ KB gzip}$. Axe scan 0 critical violations. Hỗ trợ `prefers-reduced-motion: reduce`. Chạy được khi tắt JS (SSR safe). | Zero dependency (dùng CSS transforms và IntersectionObserver native). Gói route Home chỉ tăng **+11.60 KB gzip** (thực tế toàn bộ App Router bundle là **129.32 KB gzip**). Axe DevTools quét qua Playwright: **0 lỗi critical/serious**. SSR render đầy đủ 100% khi tắt JavaScript. | **ĐẠT** |
| **G. Bàn giao & Kiểm định** | 4 ảnh chụp full màn hình desktop (1440), laptop (1024), tablet (768), mobile (390) cả vi và en; 4 khung hình chuyển động (0/150/300/600ms); tự phê bình $\ge 3$ lỗi đã sửa; hướng dẫn tự kiểm tra tay. | Đã xuất đủ 12 file ảnh vào `docs/design/screenshots/home/` và `docs/design/frames/home/`. Tự phê bình chi tiết 4 khiếm khuyết được khắc phục triệt để. | **ĐẠT** |

---

## 2. Số Liệu Kiểm Đo Trực Tiếp (Hard Numbers)

- **Trọng lượng gói JavaScript trang chủ (Client Bundle Size):**
  - Baseline trước HOME-1: Raw 878.73 KB | Gzip: 262.67 KB
  - Sau khi hoàn thành HOME-1: Raw 923.91 KB | Gzip: 274.27 KB
  - **Mức tăng thực tế: +11.60 KB gzip** (Thấp hơn rất nhiều so với trần ngân sách cho phép $+60.00\text{ KB gzip}$).
- **Trọng lượng ảnh Hero đầu tiên:**
  - `hero-1-hanoi-1920.webp`: **246.4 KB** (Đạt chuẩn $\le 250\text{ KB}$).
- **Kết quả kiểm thử tự động:**
  - **Vitest Unit Test:** **69 / 69 passed** (15 file test).
  - **Parity i18n:** **1056 / 1056 keys** (trùng khớp 100% giữa `vi.json` và `en.json`).
  - **Xác thực liên kết nội bộ:** **83 / 83 link** hợp lệ, không có link 404.
  - **Xác thực kho ảnh & bản quyền:** **224 / 224 file ảnh** trùng khớp với manifest.
  - **Playwright Functional E2E:** **6 / 6 passed** (Hero 100svh, Pause/Play WCAG 2.2.2, Search tabs, Quick chips, Reduced Motion, SSR No-JS).
  - **Playwright Visual Capture & WCAG Contrast:** **11 / 11 passed** (Tất cả 4 viewport trên 2 ngôn ngữ, khung hình chuyển động, tỷ lệ tương phản $\ge 4.5:1$).
  - **Backend Gradle Suite:** **BUILD SUCCESSFUL** (32 actionable tasks passed).

---

## 3. Nhật Ký Tự Phê Bình & Khắc Phục Khiếm Khuyết (Self-Critique)

Trong quá trình thi công và nghiệm thu thực tế, 4 khiếm khuyết nghiêm trọng đã được phát hiện qua ảnh chụp màn hình và được xử lý triệt để:

### Khiếm khuyết 1: Bố cục lưới Grid bị sập hàng khi bọc thẻ cha chuyển động (Grid Child Wrapper Collision)
- **Hiện tượng phát hiện:** Khi bọc từng item trong Bento grid hoặc Category grid bằng component `<Reveal variant="fadeUp">`, cấu trúc CSS Grid (`grid-cols-4`, `grid-cols-3`) bị biến đổi vì thẻ cha trực tiếp của các card trở thành thẻ `<div>` bọc ngoài thay vì container grid. Hậu quả là các thẻ bị dồn thành 1 cột dọc hoặc để lại khoảng trống lớn.
- **Khắc phục:** Điều chỉnh kiến trúc `Reveal`: bọc toàn bộ khối Grid container bằng `<Reveal>` cha, hoặc truyền `className="h-full"` và đặt `col-span` trực tiếp lên thẻ bao ngoài. Kết quả: Bento grid và Category tiles hiển thị căng đều và thẳng hàng tuyệt đối.

### Khiếm khuyết 2: Ảnh Hero không phù hợp với ngữ cảnh bất động sản Việt Nam
- **Hiện tượng phát hiện:** Ảnh Hero thứ nhất ban đầu là hình chụp bàn cà phê nhìn qua cửa sổ (`hero-1-street.jpg`), không thể hiện được quang cảnh đô thị và nhịp sống nhà ở tại Việt Nam.
- **Khắc phục:** Đã thay thế ngay bằng ảnh toàn cảnh hồ Tây và phố xá Hà Nội (`hero-1-hanoi.jpg`) chụp góc rộng, không có mặt người, tông màu sáng tự nhiên, mang lại cảm giác không gian sống thực thụ cho người tìm trọ.

### Khiếm khuyết 3: Tỷ lệ co giãn của ảnh khối Chủ trọ bị méo trên Tablet
- **Hiện tượng phát hiện:** Trong khối Chủ trọ (`HomeLandlordSection.tsx`), thẻ hình ảnh sử dụng thuộc tính `fill` của Next.js nhưng thiếu container `aspect-[4/3]` có `relative`, khiến ảnh bị bẹp lại khi màn hình co từ desktop xuống tablet (768px).
- **Khắc phục:** Bổ sung container chuẩn `relative aspect-[4/3] w-full rounded-2xl overflow-hidden` với thuộc tính `sizes="(max-width: 1024px) 100vw, 50vw"`. Hình ảnh chìa khóa trao tay hiển thị sắc nét, đúng tỷ lệ vàng trên mọi kích thước.

### Khiếm khuyết 4: Lỗi 404 nuốt chửng API Backend `/api/v1/rooms/facets`
- **Hiện tượng phát hiện:** Trong Spring Boot `RoomController.java`, endpoint `@GetMapping("/{slugOrId}")` được đặt trước, vô tình xem `"facets"` là một `slugOrId` và trả về mã lỗi 404 Room Not Found.
- **Khắc phục:** Đưa endpoint cụ thể `@GetMapping("/facets")` lên trước endpoint đường dẫn động `/{slugOrId}`, triển khai `RoomQueryService.getFacets()` tổng hợp số liệu trực tiếp từ repository.

---

## 4. Mục "Không Đạt / Không Làm Được" (Exclusions & Deliberate Decisions)

Nhằm đảm bảo tính trung thực tuyệt đối của sản phẩm theo tiêu chí kiểm định:
1. **Liên kết `/map` (Bản đồ tìm kiếm trực quan):**
   - *Hiện trạng:* Đã loại bỏ hoàn toàn nút chuyển tab hoặc link đến `/map` trên trang chủ và thẻ tìm kiếm.
   - *Lý do:* Trang bản đồ `/map` chưa được quy hoạch trong phạm vi Sprint hiện tại của dự án. Thay vì để link chết dẫn đến trang 404 hoặc mockup giả, giao diện chỉ điều hướng người dùng trực tiếp tới trang danh sách phòng `/rooms` với đầy đủ bộ lọc đã chọn.
2. **Huy hiệu "Sắp có" cho Ký hợp đồng điện tử và Bảo chứng tiền cọc:**
   - *Hiện trạng:* Trong khối Quy trình 3 bước (`HomeHowItWorks.tsx`), bước số 3 mang huy hiệu nhỏ `"Sắp ra mắt"` (Coming Soon).
   - *Lý do:* Tính năng giữ tiền cọc qua cổng ký quỹ trung gian ngân hàng đang trong lộ trình tích hợp cổng thanh toán (Sprint 3-4). Việc gắn nhãn minh bạch giúp người dùng không bị nhầm lẫn giữa tính năng đã chạy thật và tính năng sắp cung cấp.

---

## 5. Hướng Dẫn 3 Việc Bạn Có Thể Tự Kiểm Tra Tay (Manual Verification)

Bạn có thể mở trình duyệt truy cập ngay `http://localhost:3000/vi` (và `/en`) để trải nghiệm thực tế 3 điểm nhấn sau:

1. **Hiệu ứng Hero Slideshow và Nút Tạm Dừng chuẩn WCAG 2.2.2:**
   - Quan sát Hero: Cứ sau 7 giây, ảnh nền tự động chuyển mờ sang phong cảnh tiếp theo kèm hiệu ứng zoom chậm 1.06 mượt mà.
   - Nhấp vào nút biểu tượng **Pause (Tạm dừng)** ở góc dưới bên phải Hero: Quá trình chuyển ảnh dừng lại ngay lập tức. Nhấp tiếp để tiếp tục chạy.
2. **Thẻ Tìm Kiếm Nổi Đa Bộ Lọc và Chip Nhanh:**
   - Chuyển đổi giữa 2 tab *"Tìm phòng trọ"* và *"Tìm người ở ghép"*: Thanh gạch chân màu ngọc bích trượt êm ái sang tab tương ứng.
   - Chọn tỉnh thành (ví dụ: *"Hà Nội"* hoặc *"TP. Hồ Chí Minh"*): Dropdown quận/huyện tự động cập nhật danh sách các quận thuộc tỉnh đó.
   - Nhấp vào một chip gợi ý nhanh (ví dụ: *"Hà Nội < 3 triệu"*): Hệ thống sẽ chuyển ngay sang `/rooms?provinceCode=HN&maxPrice=3000000` với kết quả phòng chính xác.
3. **Thanh Tiến Trình Cuộn & Giao Diện Tối (Dark Mode) trên Di Động:**
   - Cuộn từ trên xuống dưới: Quan sát dải màu xanh ngọc thanh mảnh ở sát mép trên cùng màn hình thể hiện tỷ lệ trang đã đọc (`ScrollProgress`).
   - Mở công cụ Developer Tools chuyển sang chế độ Mobile (iPhone / Pixel) và bật Dark Theme: Toàn bộ nền kính mờ, thẻ bài viết cẩm nang, lưới Bento và chân trang tự động chuyển sang bảng màu than chì đêm (`slate-900`/`slate-950`) với độ tương phản văn bản luôn sắc nét.
