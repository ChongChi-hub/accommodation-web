# QUY CHUẨN BẢN QUYỀN VÀ NGUỒN GỐC HÌNH ẢNH (ASSETS & LICENSES)

## 1. Tuyên bố Bản quyền & Giấy phép
Tất cả các hình ảnh minh họa sử dụng làm dữ liệu mẫu (seed data) trong dự án **Tổ Ấm** được tạo lập nội bộ tuân thủ nghiêm ngặt các tiêu chuẩn pháp lý, sở hữu trí tuệ và quyền riêng tư:
- **Giấy phép**: MIT / Creative Commons Zero (CC0) 1.0 Universal. Miễn phí sử dụng thương mại, không phát sinh nghĩa vụ bản quyền hay bản quyền hình ảnh cá nhân.
- **Quyền riêng tư sinh trắc học**: Tuyệt đối không sử dụng ảnh chụp chân dung người thật trong seed data để bảo vệ quyền riêng tư theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.

## 2. Thông số Kỹ thuật & Bảng màu Nhận diện Thương hiệu

### 2.1. Hình ảnh Phòng trọ (`/uploads/rooms/`)
- **Định dạng**: WebP tối ưu hóa nén không mất mát chất lượng.
- **Độ phân giải & Tỷ lệ**: `1600 x 1200 px` (Tỷ lệ chuẩn 4:3).
- **Góc chụp (Perspective)**: Mỗi phòng có 4 góc ảnh độc lập:
  1. `_1.webp`: Tổng quan không gian phòng (`overview`)
  2. `_2.webp`: Góc phòng ngủ ấm cúng (`bedroom`)
  3. `_3.webp`: Khu vực bếp nấu và ban công (`kitchen`/`balcony`)
  4. `_4.webp`: Nhà vệ sinh khép kín (`bathroom`)
- **Quy tắc thiết kế thị giác**:
  - Minh họa phẳng (flat vector illustration).
  - Không vẽ chữ hay watermark trong ảnh (chữ được render thuần HTML/CSS để hỗ trợ SEO và tương thích đọc màn hình a11y).
  - Không sử dụng màu tím / violet.
  - Bảng màu chủ đạo:
    - **Teal Tổ Ấm**: `#0d9488`, `#0f766e`, `#115e59`
    - **Hổ phách ấm áp (Amber)**: `#d97706`, `#b45309`, `#f59e0b`
    - **Kem & Cát mềm (Cream/Sand)**: `#fffbeb`, `#fef3c7`, `#f0fdfa`
    - **Xám đá ấm (Warm Stone)**: `#fafaf9`, `#f5f5f4`, `#e7e5e4`, `#44403c`

### 2.2. Hình ảnh Tỉnh/Thành phố Trọng điểm (`/uploads/locations/`)
- **Định dạng**: WebP `800 x 600 px` (Tỷ lệ 4:3).
- **Biểu tượng đô thị**:
  - `ha-noi.webp`: Biểu tượng Khuê Văn Các & Tháp Rùa mặt nước hồ Hoàn Kiếm.
  - `ho-chi-minh.webp`: Đường chân trời Bitexco & Landmark 81 bên bờ sông Sài Gòn.
  - `da-nang.webp`: Vòm Cầu Rồng bắc qua sông Hàn.
  - `hai-phong.webp`: Cổng vòm cảng biển và cần cẩu hàng hải.
  - `can-tho.webp`: Cột tháp Cầu Cần Thơ và thuyền chợ nổi miền Tây.
  - `fallback.webp`: Cảnh quan nhà phố đô thị hiện đại Việt Nam.

### 2.3. Biểu ngữ Marketing (`/uploads/banners/`)
- **Định dạng**: WebP `1200 x 500 px` (Tỷ lệ 2.4:1).
- **Quy chuẩn**: Không chứa mặt người, không nhúng chữ cứng vào ảnh; hình họa phẳng trừu tượng kết hợp badge và typography HTML.
  - `banner_1.webp`: Nền Teal sẫm, khiên bảo vệ và ổ khóa (Chính sách Bảo hiểm tiền cọc 100%).
  - `banner_2.webp`: Nền Hổ phách ấm, máy tính bảng hợp đồng điện tử và con dấu xác thực.
  - `banner_3.webp`: Nền Teal & Đá ấm, đồng hồ công tơ điện tử và biểu tượng điện - nước minh bạch.

### 2.4. Ảnh đại diện Avatar (`/uploads/avatars/`)
- **Định dạng**: WebP / JPG `256 x 256 px` (Tỷ lệ 1:1).
- **Quy chuẩn**: Avatar chữ cái viết tắt (Initials Avatar) trên nền màu token thương hiệu phân loại theo vai trò người dùng (Tenant: Teal/Emerald; Landlord: Amber/Bronze; Admin/Mod: Deep Slate).

## 3. Nhật ký Kiểm toán Tài nguyên
- Bộ kiểm tra tự động: `scripts/audit_images.mjs`
- Kết quả kiểm kê: 100% hình ảnh khả dụng (0 liên kết hỏng, 0 lỗi 404).

