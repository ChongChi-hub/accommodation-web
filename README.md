# To Am - Web Frontend Application (`accommodation-web`)

Ung dung web tim kiem va quan ly phong tro truc tuyen **To Am**, xay dung bang **Next.js 16.2 App Router**, **React 19**, **Tailwind CSS v4** va tuan thu nghiem ngat **Clean Architecture**.

---

## Cong Nghe Cot Loi
* **Framework:** Next.js 16.2.12 (App Router) + React 19.3.1.
* **Kien truc:** Clean Architecture (`domain/` -> `application/` -> `infrastructure/` -> `presentation/`), ep luat bang `eslint-plugin-boundaries`.
* **Design System:** Tailwind CSS v4.3.5 voi design tokens (`@theme`) tong mau chu dao Teal `#0F766E` va Amber `#F59E0B`.
* **Icon:** `lucide-react` (tuyet doi khong dung emoji).
* **Da ngon ngu:** `next-intl` (mac dinh tieng Viet `vi`, ho tro tieng Anh `en`).
* **State:** `@tanstack/react-query` (server state) + `zustand` (UI state).
* **Form & Validation:** `react-hook-form` + `zod`.

---

## Cac Trung Tam Chuc Nang & Man Hinh

### 1. Trang Cong Cong (Public Pages)
* Trang chu (`/`): Tim kiem da tieu chi, phong noi bat, khu vuc pho bien (Ha Noi, TP.HCM, Da Nang).
* Danh sach phong (`/rooms`): Bo loc gia, dien tich, tien nghi, quan huyen, sap xep.
* Chi tiet phong (`/rooms/[id]`): Bo suu tap anh, ban do, tien nghi, chu nha, danh gia, modal dat lich & thue phong.
* Trang ho so chu nha (`/hosts/[id]`): Thong tin chu nha, danh gia va cac phong dang quan ly.
* Cac trang thong tin: Gioi thieu (`/about`), Huong dan an toan (`/safety-guide`), Bang gia (`/pricing`), Cau hoi thuong gap (`/faq`), Lien he (`/contact`), Dieu khoan (`/terms`), Chinh sach bao mat (`/privacy`).

### 2. Xac Thuc & Tai Khoan (Authentication)
* Dang nhap (`/login`) & Dang ky (`/register`) voi form Zod validation va dang nhap Google.
* Quen mat khau (`/forgot-password`), Dat lai mat khau (`/reset-password`), Xac thuc email (`/verify-email`).

### 3. Bang Dieu Khien Nguoi Thue (Tenant Dashboard - `/dashboard/tenant`)
* Tong quan: Hop dong hien tai, hoa don den han, lich hen xem phong sap toi.
* Ho so ca nhan, eKYC xac minh CCCD 2 mat, phong da luu, tim kiem da luu.
* Quan ly lich hen, yeu cau thue phong, danh sach hop dong va chi tiet hop dong (ky OTP, tai PDF).
* Quan ly hoa don va chi tiet hoa don (ma VietQR), lich su thanh toan, hoi thoai tin nhan, thong bao, danh gia va cai dat.

### 4. Bang Dieu Khien Chu Tro (Landlord Dashboard - `/dashboard/landlord`)
* Tong quan: Doanh thu, ty le lap day, cong viec can xu ly ngay.
* Quan ly phong: Danh sach, tao phong moi (quy trinh Stepper 4 buoc), sua phong.
* Quan ly lich hen xem phong, duyet yeu cau thue, quan ly hop dong va lap hop dong moi.
* Danh sach khach thue, ghi chi so dien nuoc (cong to), tao hoa don va nhac no SMS.
* Phan tich bao cao doanh thu, danh gia nhan duoc, hoi thoai tin nhan, eKYC chu nha, cai dat VietQR va don gia tien ich.

### 5. Trung Tam Kiem Duyet & Quan Tri (Admin & Moderator Dashboard - `/dashboard/admin`)
* Tong quan: Chi so toan san, bieu do tang truong, trang thai cac microservices backend.
* Duyet tin dang phong tro (kiem duyet tin moi, modal tu choi kem ly do).
* Kiem duyet eKYC (xem anh CCCD 2 mat, thong tin chu nha/khach thue).
* Quan ly nguoi dung (khoa/mo khoa tai khoan, phan quyen vai tro).
* Xu ly bao cao vi pham, kiem duyet danh gia (an/hien danh gia vi pham).
* Quan ly danh muc he thong (loai phong, tien nghi, dia gioi hanh chinh).
* Phan tich chuyen sau san, nhat ky kiem toan he thong (Audit Logs).
* Cau hinh he thong (che do bao tri, duyet tin tu dong, cong VietQR, bao mat phien).

---

## Huong Dan Cai Dat & Khoi Chay

### 1. Yeu cau he thong
* **Node.js:** v22+ LTS
* **npm:** v10+

### 2. Thiet lap bien moi truong
Tao file `.env.local` tu mau:
```bash
cp .env.example .env.local
```
Noi dung mac dinh ket noi toi Backend Gateway:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_DEFAULT_LOCALE=vi
```

### 3. Cai dat phu thuoc & Chay moi truong Dev
```bash
# Cai dat thu vien
npm install

# Khoi chay may chu phat trien (Cong 3000)
npm run dev
```
Truy cap ung dung tai: `http://localhost:3000`.

### 4. Kiem tra chat luong ma nguon
```bash
# Kiem tra loi cu phap & luat kien truc Clean Architecture
npm run lint

# Kiem tra kieu TypeScript
npm run type-check

# Chay kiem thu tu dong (Unit tests + i18n parity + Route links verification)
npm run test

# Build ung dung san pham
npm run build
```

---

## Tai Khoan Thu Nghiem (Ket noi Backend)

| Vai tro | Email | Mat khau |
|---|---|---|
| **Nguoi thue (Tenant)** | `tenant@cozynest.vn` | `password123` |
| **Chu tro (Landlord)** | `landlord@cozynest.vn` | `password123` |
| **Kiem duyet vien (Moderator)** | `moderator@cozynest.vn` | `password123` |
| **Quan tri vien (Admin)** | `admin@cozynest.vn` | `password123` |

---

## Tai Lieu Ky Thuat
* Quy chuan lap trinh chi tiet: Xem tai [`AGENT.md`](./AGENT.md).
