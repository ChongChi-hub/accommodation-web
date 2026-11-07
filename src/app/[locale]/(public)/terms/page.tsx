'use client';

import React from 'react';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Card } from '@/presentation/components/ui/Card';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumb items={[{ label: 'Điều khoản dịch vụ' }]} />

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Điều khoản dịch vụ
        </h1>
        <p className="text-xs text-stone-400">Cập nhật lần cuối: Tháng 11 năm 2026</p>
      </div>

      <Card className="p-8 space-y-6 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">1. Quy định chung</h2>
          <p>
            Chào mừng bạn đến với nền tảng Tổ Ấm. Bằng việc truy cập, tạo tài khoản hoặc sử dụng bất kỳ dịch vụ nào trên hệ thống, bạn đồng ý tuân thủ toàn bộ các điều khoản và quy chế hoạt động này.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">2. Trách nhiệm của chủ nhà trọ</h2>
          <p>
            Chủ trọ có trách nhiệm cung cấp thông tin trung thực về giá phòng, diện tích, trang thiết bị và tính pháp lý của căn nhà. Nghiêm cấm các hành vi đăng tin ảo, lừa tiền cọc hoặc tự ý tăng giá ngoài hợp đồng.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">3. Trách nhiệm của người thuê</h2>
          <p>
            Người thuê có nghĩa vụ giữ gìn tài sản chung, sử dụng phòng đúng mục đích cư trú hợp pháp, thanh toán tiền thuê và chi phí dịch vụ đúng hạn theo thỏa thuận trong hợp đồng thuê điện tử.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">4. Giải quyết tranh chấp</h2>
          <p>
            Mọi khiếu nại phát sinh trong quá trình thuê phòng sẽ được giải quyết trước hết thông qua thương lượng hòa giải với sự hỗ trợ của Tổ Ấm. Trường hợp không đạt được thỏa thuận, vụ việc sẽ được đưa ra tòa án có thẩm quyền tại Việt Nam.
          </p>
        </section>
      </Card>
    </div>
  );
}
