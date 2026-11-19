import { BankAccountSettingsCard } from '@/presentation/components/profile/BankAccountSettingsCard';

export default function LandlordBankAccountPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Tài khoản ngân hàng &amp; Mã QR
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Cung cấp số tài khoản ngân hàng và mã QR cá nhân để Admin giải ngân tiền cọc phòng khi đủ điều kiện.
        </p>
      </div>

      <BankAccountSettingsCard userRole="LANDLORD" />
    </div>
  );
}

