# TIEN DO THUC HIEN [WALLET-VERIFY-LEDGER]

- **Nhanh git:** `feat/wallet-verify-ledger` (tao tu `feat/payment-harden` tren ca 2 repo `accommodation-service` va `accommodation-web`).
- **Sao luu DB truoc khi sua/test:** Da sao luu `cozynest_billing`, `cozynest_booking`, `cozynest_identity` (27,457,608 bytes).
- **Tai khoan san duy nhat:** Vietcombank (`VCB` / BIN `970436`), chu tai khoan `LE THANH CUONG`, so tai khoan `******1900` (doc tu bien moi truong `NEXT_PUBLIC_PLATFORM_*` / `fintech.platform.*`).

---

## 1. TOM TAT FRONTEND PHA 4 (`accommodation-web`)

| Man hinh / Thanh phan | File chinh | Thay doi da xac minh |
| :--- | :--- | :--- |
| Thanh toan VietQR khach thue | `VietQrRealPaymentCard.tsx` | Bam "Toi da chuyen" chi chuyen `SUBMITTED` ("Dang cho xac minh tien ve"), polling 5s, dem nguoc tu `expiresAt`, bang chung chi la thong tin ho tro, `role="status"`/`aria-live="polite"` |
| Bang coc khach thue | `TenantEscrowTable.tsx` | Hien ma rut gon `HD-XXXXXXXX` (khong UUID tho), khoa nut xac nhan nhan phong khi `AWAITING_DEPOSIT`, hien ro 50% coc giu lai den het hop dong vs 50% da giai phong |
| Vi Chu tro & Lich su so cai | `LandlordWalletPanel.tsx`, `dashboard/landlord/deposits/page.tsx` | 4 the KPI (Kha dung, Cho het ngay giu, Tam giu rut tien, Coc giu den het HD), lich su but toan tach rieng dong phi hoa hong 5% vs thuc nhan 95%, 4 trang thai (loading/empty/error+retry/success), tao lenh rut kem `Idempotency-Key`, nut Huy lenh rut, cot `bankTxCode` |
| Hang doi Admin xac minh & rut tien | `AdminInflowAndWithdrawalTab.tsx`, `AdminPayoutQrModal.tsx`, `dashboard/admin/transactions/page.tsx` | Tab `VERIFY_QUEUE` gom: 3 the KPI (Tien ve chua khop, Yeu cau rut cho xu ly, Doanh thu hoa hong 5%), bang `unmatched_bank_inflows`, bang xac nhan thu cong du phong (`bankTxCode` + ly do), bang rut tien kem modal **VietQR he thong sinh** (`systemVietQrUrl`), nut Duyet 2 nguoi / Xac nhan da chuyen / Tu choi |
| Domain & HTTP Repository | `WalletVerification.ts`, `Billing.ts`, `http-wallet-verification.repository.ts` | Kieu du lieu day du, ham `formatShortRef`, goi dung endpoint `/wallet/summary`, `/wallet/ledger`, `/payouts/{id}/cancel`, `/payouts/{id}/confirm-paid`, `/payments/unmatched`, `/payments/manual-confirm` |

---

## 2. KET QUA KIEM THU & TU PHE BINH GIAO DIEN (PHA 4 -> PHA 5)

- `npx eslint . --max-warnings=0`: **PASS** (0 errors, 0 warnings).
- `npx tsc --noEmit`: **PASS** (0 errors).
- `node scripts/verify-i18n.mjs`: **PASS** (`2266/2266` keys `vi.json` = `en.json` 100%).
- `npm test -- --run`: **PASS** (`23/23` files, `105/105` tests gom `WalletVerification.test.ts`; `verify-links.mjs` 98/98; `verify-manifest.mjs` 224/224).
- Docker `next build` (`cozynest_web`): **PASS** (206 static/dynamic pages, container `cozynest_web` healthy).
- Playwright:
  - `e2e/wallet-verify-ledger.spec.ts`: **3/3 PASS** (chup 10 anh tai `docs/screenshots/wallet-verify-ledger/` o `1440` sang/toi va `390` di dong).
  - Baseline specs (`smoke.spec.ts`, `auth-rbac-middleware.spec.ts`, `qa-fintech-sprint3.spec.ts` + `wallet-verify-ledger.spec.ts`): **61 passed, 3 failed** (dung 3 loi co san tu Pha 0 Baseline, **0 loi moi phat sinh**).
- **Tu phe binh 3 diem giao dien tu anh chup & da sua:**
  1. Bang rut tien Admin (`AdminInflowAndWithdrawalTab.tsx`) bi xuong dong so tien `500.000 d` va hep o nhap `bankTxCode`, dong thoi modal QR (`z-50`) bi de duoi banner cookie -> **Da sua** `whitespace-nowrap`, `min-w-[200px]`, nang modal len `z-[100]`, rebuild va chup lai anh xac nhan sach se.
  2. Ma `HD-3F66057C` va `PO-2026-001` bi ngat dong giua dau gach ngang trong bang -> **Da sua** `whitespace-nowrap` tren `TenantEscrowTable.tsx`, `LandlordEscrowTable.tsx`, `landlord/deposits/page.tsx`.
  3. Tieu de the Escrow chu tro tren man hinh 390px hoi chat -> **Da sua** `flex-wrap gap-1` va boc `overflow-x-auto` cho bang.
