# Tài liệu Quy chuẩn Thiết kế Giao diện (Design Specification) - Nền tảng "Tổ Ấm"

> **Phiên bản:** 2.0 (Design System Rework)  
> **Áp dụng cho:** Toàn bộ phân hệ Frontend (`accommodation-web`)  
> **Nguyên tắc cốt lõi:** Tinh tế (Tasteful), Tỷ lệ vàng, Thống nhất Token, Không hardcode style, Responsive hoàn hảo (1440px -> 390px).

---

## 1. Hệ thống Token Cốt lõi (Design Tokens)

### 1.1. Bảng màu Semantic (Light & Dark Mode)

| Token Semantic | Biến CSS | Light Mode Hex | Dark Mode Hex | Mục đích sử dụng |
| :--- | :--- | :--- | :--- | :--- |
| **Background** | `--bg-background` | `#FAF7F2` (Warm Sand) | `#0C0A09` (Stone 950) | Nền tổng thể trang |
| **Surface** | `--bg-surface` | `#FFFFFF` (Pure White) | `#1C1917` (Stone 900) | Thẻ card, modal, dropdown, header |
| **Surface Muted** | `--bg-surface-muted` | `#F5F1EA` (Light Warm) | `#262320` (Stone 850) | Table row hover, badge neutral |
| **Border** | `--border-color` | `#E7E5E4` (Stone 200) | `#2E2A27` (Stone 800) | Đường kẻ ngăn cách, viền card, viền table |
| **Foreground** | `--text-foreground` | `#1C1917` (Stone 900) | `#F5F5F4` (Stone 100) | Tiêu đề chính, văn bản thông thường |
| **Foreground Muted** | `--text-foreground-muted`| `#78716C` (Stone 500) | `#A8A29E` (Stone 400) | Nhãn phụ, mô tả nhỏ, placeholder |

### 1.2. Màu sắc Thương hiệu & Trạng thái (Brand & Status Palette)

| Mục đích | Tên Token | Hex Chuẩn | Ánh xạ Tailwind v4 |
| :--- | :--- | :--- | :--- |
| **Brand Primary (Tràm ấm)** | `primary` | `#0F766E` (Teal 700) | `bg-teal-700`, `text-teal-700`, `border-teal-700` |
| **Brand Primary Hover** | `primary-hover` | `#115E59` (Teal 800) | `hover:bg-teal-800` |
| **Brand Accent (Hoàng yến)**| `accent` | `#F59E0B` (Amber 500) | `bg-amber-500`, `text-amber-500` |
| **Thành công (Success)** | `success` | `#10B981` (Emerald 500)| `bg-emerald-500`, `text-emerald-600` |
| **Cảnh báo (Warning)** | `warning` | `#F59E0B` (Amber 500) | `bg-amber-500`, `text-amber-600` |
| **Nguy hiểm/Lỗi (Danger)** | `danger` | `#E11D48` (Rose 600) | `bg-rose-600`, `text-rose-600` |
| **Thông tin (Info)** | `info` | `#0284C7` (Sky 600) | `bg-sky-600`, `text-sky-600` |

---

## 2. Thang Khoảng cách, Bo góc & Đổ bóng (Spatial System)

### 2.1. Thang khoảng cách (Spacing Scale)
* **2xs (4px / `p-1`, `gap-1`):** Khoảng cách giữa icon và chữ nhỏ, padding của checkbox.
* **xs (8px / `p-2`, `gap-2`):** Khoảng cách giữa các chip, thẻ tag, nút bấm nhỏ.
* **sm (12px / `p-3`, `gap-3`):** Padding trong ô bảng (table cell), padding nút tiêu chuẩn.
* **md (16px / `p-4`, `gap-4`):** Padding chuẩn của card nhỏ, gutter lưới (grid gap).
* **lg (24px / `p-6`, `gap-6`):** Padding chuẩn của card lớn, khoảng cách giữa các khối nội dung.
* **xl (32px / `p-8`, `gap-8`):** Khoảng cách giữa header trang và thân trang.

### 2.2. Bo góc (Border Radius)
* `rounded-lg` (8px): Badge, dropdown menu items, tooltip.
* `rounded-xl` (12px): Button, Input, Select, DatePicker.
* `rounded-2xl` (16px): Card, Table container, Modal dialog.
* `rounded-full` (9999px): Avatar, Pill badge, Toggle switch.

### 2.3. Đổ bóng (Box Shadow)
* `shadow-xs`: Đổ bóng tinh tế cho nút bấm, input khi hover (`0 1px 2px 0 rgba(0, 0, 0, 0.05)`).
* `shadow-sm`: Đổ bóng mặc định của Card trên nền warm background.
* `shadow-lg`: Đổ bóng của Modal dialog, Dropdown popover, Drawer offcanvas.

---

## 3. Hệ thống Typography (Font & Hierarchy)

* **Font chữ chính:** `Plus Jakarta Sans` nạp từ `next/font/google` với `subsets: ['latin', 'vietnamese']`.
* **Cấp bậc văn bản:**
  * **H1 (Page Title):** `text-xl md:text-2xl font-bold tracking-tight text-foreground`
  * **H2 (Section Title):** `text-lg md:text-xl font-bold text-foreground`
  * **H3 (Card Header):** `text-base font-semibold text-foreground`
  * **Body (Regular):** `text-sm font-normal text-foreground leading-relaxed`
  * **Caption / Label:** `text-xs font-medium text-foreground-muted`
  * **Overline / Badge text:** `text-[11px] font-bold uppercase tracking-wider`

---

## 4. Quy chuẩn Kích thước & Trạng thái Component

### 4.1. Button & Input Sizing
* **Button Small (`sm`):** Chiều cao cố định `h-8` (32px), `px-3 text-xs gap-1.5`, `rounded-xl`.
* **Button Medium (`md` - Chuẩn):** Chiều cao cố định `h-10` (40px), `px-4 text-sm gap-2`, `rounded-xl`.
* **Button Large (`lg`):** Chiều cao cố định `h-12` (48px), `px-6 text-base gap-2.5`, `rounded-xl`.
* **Input / Select:** Chiều cao chuẩn `h-10` (40px), padding `px-3.5`, font `text-sm`, `rounded-xl`, `border border-border bg-surface text-foreground placeholder:text-foreground-muted`, focus ring `focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700`.

### 4.2. Card
* Cấu trúc: `bg-surface border border-border rounded-2xl shadow-xs p-5 md:p-6 transition-all`.
* Hover state (interactive): `hover:border-teal-700/40 hover:shadow-sm`.

### 4.3. Table
* Bọc trong: `<div className="w-full overflow-x-auto rounded-2xl border border-border bg-surface">`
* Kích thước tối thiểu của thẻ `table`: `min-w-[640px] w-full text-left text-sm`.
* **Table Header (`thead`):** `bg-surface-muted text-xs font-semibold uppercase tracking-wider text-foreground-muted border-b border-border`.
* **Table Cell (`td`):** `px-4 py-3.5 align-middle border-b border-border/60 last:border-0`.
* **Row hover:** `hover:bg-surface-hover/60 transition-colors`.

### 4.4. Badge
* Cấu trúc: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold`.
* **Success:** `bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800`.
* **Warning:** `bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800`.
* **Danger:** `bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800`.
* **Info/Primary:** `bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800`.
* **Neutral:** `bg-surface-muted text-foreground-muted border border-border`.

### 4.5. Tabs
* Cấu trúc Tab Bar: Thanh bọc nền nhạt `bg-surface-muted p-1 rounded-xl inline-flex gap-1 border border-border`.
* Tab Item kích hoạt: `bg-surface text-teal-700 font-semibold shadow-xs rounded-lg px-3 py-1.5 text-xs`.
* Tab Item không kích hoạt: `text-foreground-muted hover:text-foreground rounded-lg px-3 py-1.5 text-xs transition`.

---

## 5. Bố cục Dashboard (Dashboard Layout Architecture)

### 5.1. Kích thước Khung hình (Dimensions)
* **Chiều rộng Sidebar cố định:** `w-64` (256px) trên Desktop (`lg:` trở lên).
* **Chiều cao Header Dashboard:** `h-16` (64px) cố định, `sticky top-0 z-40`, có backdrop blur.
* **Độ rộng nội dung tối đa:** `max-w-7xl` (1280px), căn giữa màn hình `mx-auto`.

### 5.2. Nguyên tắc Đáp ứng Đa thiết bị (Responsive Rules)
* **Màn hình lớn (Desktop >= 1024px):**
  * Sidebar luôn hiển thị cố định bên trái (`sticky top-16 h-[calc(100vh-4rem)]`).
  * Nội dung chính `<main>` chiếm trọn không gian còn lại (`flex-1 p-6 md:p-8`).
* **Màn hình di động & máy tính bảng (< 1024px, đặc biệt 390px):**
  * Sidebar **ẨN HOÀN TOÀN** khỏi dòng luồng flex (`hidden lg:flex`).
  * Nút **Hamburger (Menu)** xuất hiện bên trái Header để mở Sidebar dưới dạng **Drawer Offcanvas** trượt từ cạnh trái sang (có overlay làm mờ nền).
  * Thân trang `<main>` nhận `w-full p-4` (tuyệt đối không bị chèn ép, 100% viewport width).
  * Các bảng dữ liệu (Table) có thanh cuộn ngang độc lập mượt mà, không làm tràn trang (zero horizontal scroll on body).

---

## 6. Mẫu Trang Tiêu chuẩn (Page Layout Templates)

### 6.1. Mẫu Trang Danh sách Quản trị (List Page Template)
1. **Header trang:**
   * Tiêu đề lớn (H1) + Mô tả ngắn gọn (Subtitle).
   * Cụm nút hành động bên phải: Nút Lọc/Xuất file (Secondary) + Nút Tạo mới/Thêm (Primary).
2. **Thanh công cụ (Filter Bar):**
   * Ô tìm kiếm từ khóa với icon Search (`h-10`).
   * Dropdown lọc theo trạng thái, vai trò, ngày tháng (`h-10`).
   * Bộ đếm kết quả ("Hiển thị X / Y bản ghi").
3. **Bảng dữ liệu chính (Data Table):**
   * Responsive container bọc viền bo `rounded-2xl`.
   * Cột Action có các nút Xem chi tiết / Phê duyệt / Từ chối rõ ràng.
4. **Chân trang phân trang (Pagination):**
   * Nút Trang trước, Trang sau, các số trang có chỉ thị trang hiện tại.

### 6.2. Mẫu Xem Chi tiết / Phê duyệt (Detail Drawer / Modal Template)
* Kích thước Drawer: `max-w-lg md:max-w-xl` trượt từ phải sang.
* Phần đầu (Header): Tiêu đề thực thể + Mã ID + Badge trạng thái + Nút đóng (X).
* Phần thân (Body): Phân khu trực quan (Thông tin cơ bản, Ảnh/Tài liệu đính kèm, Lịch sử kiểm duyệt).
* Phần chân (Footer): Cố định ở đáy Drawer gồm nút Huỷ, nút Từ chối (Danger) và nút Phê duyệt (Primary).

