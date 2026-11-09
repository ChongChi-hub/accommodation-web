'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MapPin } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/cn';

interface FaqItem {
  q: string;
  a: string;
}

interface SeoContent {
  title: string;
  description: string;
  faqs: FaqItem[];
}

const SEO_DATA_VI: Record<string, SeoContent> = {
  phongTro: {
    title: 'Kinh nghiệm thuê phòng trọ an toàn và minh bạch chi phí',
    description:
      'Thuê phòng trọ là giải pháp lưu trú quen thuộc cho sinh viên và người đi làm tại các trung tâm kinh tế, giáo dục lớn. Khi lựa chọn phòng, người thuê cần lưu ý đến vị trí kết nối giao thông, biểu giá điện nước sinh hoạt, chất lượng an ninh khu phố và điều khoản hoàn trả tiền cọc. CozyNest hỗ trợ xác minh danh tính chủ trọ và công khai mọi chi phí để người thuê dễ dàng đưa ra quyết định phù hợp với ngân sách cá nhân.',
    faqs: [
      {
        q: 'Mức tiền đặt cọc thuê phòng trọ thường là bao nhiêu?',
        a: 'Phổ biến nhất là 1 tháng tiền thuê phòng đối với hợp đồng 6-12 tháng. Bạn nên yêu cầu ghi rõ điều kiện hoàn trả cọc và biên lai ký nhận trong hợp đồng thuê.',
      },
      {
        q: 'Chi phí điện nước và dịch vụ được tính thế nào?',
        a: 'Điện nước có thể tính theo giá lũy tiến nhà nước hoặc đơn giá khoán theo số điện/khối nước. Chi tiết biểu phí được hiển thị minh bạch trong hồ sơ từng phòng trên CozyNest.',
      },
      {
        q: 'Làm thế nào để tránh rủi ro khi đặt cọc phòng?',
        a: 'Không chuyển tiền giữ chỗ cho bên thứ ba khi chưa kiểm tra căn phòng thực tế và xác minh thẻ căn cước của chủ trọ. Ưu tiên các tin đăng có huy hiệu Chủ trọ xác minh.',
      },
      {
        q: 'Thời hạn thuê phòng trọ tối thiểu là bao lâu?',
        a: 'Hợp đồng thông thường kéo dài từ 6 tháng đến 1 năm. Nếu có nhu cầu ở ngắn hạn, hãy liên hệ chủ trọ để thỏa thuận điều khoản thuê linh hoạt trước khi ký kết.',
      },
    ],
  },
  nhaNguyenCan: {
    title: 'Lưu ý khi thuê nhà nguyên căn cho gia đình và nhóm ở chung',
    description:
      'Nhà nguyên căn cung cấp không gian sinh hoạt biệt lập, thoải mái cho gia đình hoặc nhóm bạn thân muốn chia sẻ chi phí thuê. Khi nhận bàn giao nhà, người thuê nên kiểm tra kỹ hiện trạng tường nhà, hệ thống thoát nước, đường dây điện và thỏa thuận rõ biên bản phân định trách nhiệm sửa chữa bảo trì trang thiết bị gắn liền với căn nhà.',
    faqs: [
      {
        q: 'Thuê nhà nguyên căn có cần đăng ký tạm trú không?',
        a: 'Có, theo quy định người thuê cần chủ nhà phối hợp thực hiện thủ tục đăng ký tạm trú tại công an phường/xã trong vòng 30 ngày kể từ ngày chuyển đến.',
      },
      {
        q: 'Trách nhiệm sửa chữa nhà thuộc về ai khi xảy ra sự cố?',
        a: 'Hư hỏng kết cấu lớn và khấu hao tự nhiên do chủ nhà chi trả; các sửa chữa hỏng hóc do quá trình sử dụng thường ngày do người thuê chịu trách nhiệm.',
      },
      {
        q: 'Có được phép cho người khác thuê lại phòng không?',
        a: 'Bạn chỉ được phép cho thuê lại nếu hợp đồng có điều khoản đồng ý bằng văn bản của chủ sở hữu nhà.',
      },
      {
        q: 'Nhà nguyên căn có công tơ điện nước riêng không?',
        a: 'Hầu hết nhà nguyên căn sử dụng đồng hồ điện nước trực tiếp của công ty điện lực và cấp nước với giá nhà nước niêm yết.',
      },
    ],
  },
  canHo: {
    title: 'Căn hộ chung cư và chung cư mini hiện đại, tiện nghi',
    description:
      'Căn hộ chung cư đáp ứng nhu cầu sống văn minh với hệ thống kiểm soát an ninh 24/7, thang máy thẻ từ và môi trường thông thoáng. Ngoài tiền thuê cơ bản hàng tháng, người thuê cần tham khảo thêm phí dịch vụ quản lý tòa nhà, phí trông giữ xe và các tiện ích nội khu như hồ bơi, phòng tập hoặc sảnh sinh hoạt cộng đồng.',
    faqs: [
      {
        q: 'Phí dịch vụ quản lý chung cư bao gồm những gì?',
        a: 'Bao gồm vệ sinh khu vực hành lang, thu gom rác, vận hành thang máy, bảo trì hệ thống chiếu sáng chung và nhân sự an ninh tuần tra bảo vệ.',
      },
      {
        q: 'Chung cư mini có được cấp phép phòng cháy chữa cháy không?',
        a: 'CozyNest kiểm tra các chứng từ an toàn PCCC, thang thoát hiểm và lối thoát hiểm thứ hai trước khi duyệt hiển thị tin đăng chung cư mini trên hệ thống.',
      },
      {
        q: 'Có được nuôi thú cưng trong căn hộ không?',
        a: 'Phụ thuộc vào nội quy ban quản lý từng tòa nhà. Hãy sử dụng bộ lọc Cho phép nuôi thú cưng để tìm căn hộ phù hợp.',
      },
      {
        q: 'Hợp đồng thuê căn hộ có cần công chứng không?',
        a: 'Hợp đồng thuê nhà ở không bắt buộc phải công chứng, trừ khi một trong hai bên có yêu cầu công chứng để tăng tính pháp lý.',
      },
    ],
  },
  oGhep: {
    title: 'Giải pháp ở ghép giường tầng và ký túc xá văn minh, tiết kiệm',
    description:
      'Ở ghép giường tầng và căn hộ chung phòng là giải pháp tiết kiệm chi phí sinh hoạt tối ưu cho các bạn sinh viên và người mới đi làm. Để có trải nghiệm ở chung thoải mái, các thành viên cần tôn trọng giờ giấc yên tĩnh, phân chia lịch dọn dẹp phòng khoa học và thống nhất trước các quy ước sử dụng tiện ích chung như tủ lạnh, máy giặt.',
    faqs: [
      {
        q: 'Giá thuê ở ghép đã bao gồm điện nước chưa?',
        a: 'Đa số các phòng ở ghép trọn gói đã bao gồm tiền giường, điện máy lạnh, nước sinh hoạt, wifi và máy giặt chung trong đơn giá niêm yết.',
      },
      {
        q: 'Đồ đạc cá nhân có được bảo quản an toàn không?',
        a: 'Mỗi giường thường được trang bị tủ cá nhân có khóa riêng. Bạn nên tự trang bị thêm ổ khóa phụ cho các tài sản giá trị.',
      },
      {
        q: 'Phòng ở ghép có phân chia theo giới tính không?',
        a: 'Có, các phòng ký túc xá đều phân định rõ phòng Nam riêng và phòng Nữ riêng để bảo đảm sự riêng tư và an toàn.',
      },
      {
        q: 'Giờ giấc ra vào ký túc xá có quy định không?',
        a: 'Nhiều mô hình ở ghép hiện nay trang bị khóa vân tay mở cửa tự do 24/7, tuy nhiên vẫn cần giữ trật tự chung sau 23h đêm.',
      },
    ],
  },
};

const POPULAR_PROVINCES = [
  { code: 'HN', name: 'Hà Nội' },
  { code: 'HCM', name: 'TP. Hồ Chí Minh' },
  { code: 'DN', name: 'Đà Nẵng' },
  { code: 'BD', name: 'Bình Dương' },
];

export function RoomCatalogSeo({
  categoryKey = 'phongTro',
  categoryPath = '/phong-tro',
}: {
  categoryKey?: string;
  categoryPath?: string;
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const locale = useLocale();
  const data = SEO_DATA_VI[categoryKey] || SEO_DATA_VI.phongTro;

  // JSON-LD Structured Data
  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  return (
    <section className="mt-16 pt-12 border-t border-stone-200/80 dark:border-stone-800 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      {/* Editorial Content */}
      <div className="max-w-3xl space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          {data.title}
        </h2>
        <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          {data.description}
        </p>
      </div>

      {/* Popular Area Links */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          Khu vực tìm kiếm phổ biến
        </h3>
        <div className="flex flex-wrap gap-2">
          {POPULAR_PROVINCES.map((prov) => (
            <Link
              key={prov.code}
              href={`${categoryPath}?provinceCode=${prov.code}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-medium text-stone-700 dark:text-stone-300 hover:border-teal-500 hover:text-teal-700 dark:hover:text-teal-300 transition-colors shadow-xs"
            >
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>{prov.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Câu hỏi thường gặp
          </h3>
        </div>

        <div className="divide-y divide-stone-200/80 dark:divide-stone-800 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-xs">
          {data.faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="transition-colors">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200',
                      isOpen && 'rotate-180 text-teal-600'
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
