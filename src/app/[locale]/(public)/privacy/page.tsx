'use client';

import React from 'react';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Card } from '@/presentation/components/ui/Card';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumb items={[{ label: 'Chính sách bảo mật' }]} />

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Chính sách bảo mật thông tin
        </h1>
        <p className="text-xs text-stone-400">Cập nhật lần cuối: Tháng 11 năm 2026</p>
      </div>

      <Card className="p-8 space-y-6 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">1. Thu thập thông tin cá nhân</h2>
          <p>
            Tổ Ấm chỉ thu thập các thông tin cần thiết phục vụ việc xác định danh tính (họ tên, số điện thoại, email, ảnh CCCD hai mặt khi thực hiện KYC) theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">2. Mục đích sử dụng dữ liệu</h2>
          <p>
            Dữ liệu được dùng để xác minh người dùng, lập hợp đồng thuê điện tử, bảo mật tài khoản và liên hệ khi có phát sinh giao dịch hoặc lịch hẹn xem phòng.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">3. Bảo mật và lưu trữ</h2>
          <p>
            Toàn bộ thông tin mật khẩu được mã hóa bằng thuật toán BCrypt. Các kết nối mạng và API được mã hóa bằng giao thức HTTPS/TLS tiêu chuẩn cao cấp. Chúng tôi không bao giờ chia sẻ dữ liệu của bạn cho bất kỳ bên thứ ba nào khi chưa có sự đồng ý.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">4. Quyền của chủ thể dữ liệu</h2>
          <p>
            Bạn có quyền yêu cầu tra cứu, chỉnh sửa hoặc xóa dữ liệu cá nhân của mình bất kỳ lúc nào bằng cách liên hệ với bộ phận hỗ trợ khách hàng qua email hotro@cozynest.vn.
          </p>
        </section>
      </Card>
    </div>
  );
}

