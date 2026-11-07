'use client';

import React from 'react';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Card } from '@/presentation/components/ui/Card';
import { ShieldCheck, Heart, Sparkles, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Breadcrumb items={[{ label: 'Về chúng tôi' }]} />

      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400">
          Câu chuyện của Tổ Ấm
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
          Kiến tạo trải nghiệm thuê trọ tin cậy & văn minh
        </h1>
        <p className="text-sm text-stone-500 max-w-2xl mx-auto leading-relaxed">
          Chúng tôi thành lập Tổ Ấm với khát vọng xóa bỏ nỗi lo phòng ảo, lừa tiền cọc và tranh chấp hợp đồng cho hàng triệu sinh viên, người đi làm trên khắp cả nước.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Card className="p-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Minh bạch 100%</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Mọi bài đăng đều được kiểm tra địa chỉ thực, giá thuê và giá dịch vụ niêm yết rõ ràng trước khi xuất bản.
          </p>
        </Card>

        <Card className="p-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Đồng hành gắn kết</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Hỗ trợ giải quyết tranh chấp công bằng giữa khách thuê và chủ trọ bằng quy chế hợp đồng điện tử chặt chẽ.
          </p>
        </Card>

        <Card className="p-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-50 dark:bg-cyan-950 flex items-center justify-center text-cyan-700 dark:text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Công nghệ hiện đại</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Quản lý hợp đồng số, ghi điện nước tự động và thanh toán hóa đơn an toàn qua cổng ngân hàng nội địa.
          </p>
        </Card>
      </div>

      <div className="p-8 rounded-3xl bg-teal-900 text-white space-y-4">
        <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold uppercase tracking-wider">
          <Award className="w-4 h-4" /> Cam kết chất lượng
        </div>
        <h2 className="text-2xl font-bold">Bảo vệ quyền lợi tối đa cho người đi thuê</h2>
        <p className="text-xs text-teal-100 leading-relaxed max-w-2xl">
          Nếu phòng nhận bàn giao không đúng với thông tin xác thực trên hệ thống Tổ Ấm, bạn sẽ được hoàn tiền cọc giữ phòng 100% kèm chính sách hỗ trợ tìm phòng khẩn cấp trong vòng 48 giờ.
        </p>
      </div>
    </div>
  );
}

