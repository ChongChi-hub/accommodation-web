# Bảng Theo Dõi Tiến Độ Rà Soát & Nghiệm Thu Từng Trang (Page Tracker)

> **Mục tiêu:** Rà soát, chuẩn hóa giao diện, hỗ trợ đa ngôn ngữ (i18n vi/en không chữ ghi cứng), Clean Architecture, đủ 4 trạng thái (loading/empty/error/success), responsive (1440/1024/768/390), accessibility, kiểm thử E2E và chụp ảnh nghiệm thu cho từng trang.

---

## 1. Nhóm Dùng Chung (Common)
| Route | Tên Trang | Ưu Tiên | Nguồn Dữ Liệu | Trạng Thái | Ngày | Ảnh Chụp (1440/1024/768/390 x light/dark x vi/en) | Ghi Chú & Tự Phê Bình Nghiệm Thu |
|---|---|---|---|---|---|---|---|
| `/403` | Truy cập không được phép | P1 | Tĩnh i18n | Hoàn thành | 07/11/2026 | `screenshots/common/matrix/403-*.png` (16 ảnh) | Tự phê bình: (1) Ban đầu padding 390px lệch -> Sửa căn giữa min-h-screen đối xứng; (2) Nút action co cụm ở mobile -> Đổi flex-col w-full; (3) Border card darkmode chìm -> Thêm viền border/80. Axe 0 lỗi. |
| `/session-expired` | Phiên đăng nhập hết hạn | P1 | Tĩnh i18n | Hoàn thành | 07/11/2026 | `screenshots/common/matrix/session-expired-*.png` (16 ảnh) | Tự phê bình: (1) Icon đồng hồ 390px quá bé -> Nâng lên w-20 h-20 khung bo tròn; (2) Thiếu link khi quên mật khẩu -> Thêm liên kết /forgot-password; (3) Tiếng Anh bị rớt 1 chữ cuối dòng -> Thêm max-w-md leading-relaxed. Axe 0 lỗi. |
| `/account-locked` | Tài khoản bị khóa tạm thời | P1 | Tĩnh i18n | Hoàn thành | 07/11/2026 | `screenshots/common/matrix/account-locked-*.png` (16 ảnh) | Tự phê bình: (1) Viền đỏ quá gắt -> Dịu màu với rose-200/rose-900; (2) Hotline không bấm gọi trực tiếp -> Gắn tel:19008888 và icon PhoneCall; (3) Chữ TẠM KHÓA ghi cứng -> Đã chuyển 100% i18n badge. Axe 0 lỗi. |
| `/maintenance` | Hệ thống đang bảo trì | P1 | Tĩnh i18n | Hoàn thành | 07/11/2026 | `screenshots/common/matrix/maintenance-*.png` (16 ảnh) | Tự phê bình: (1) Animation quay tít gây mỏi mắt -> Thay bằng bounce nhẹ kèm radar ping; (2) Thiếu múi giờ bảo trì -> Ghi rõ GMT+7; (3) Nút reload kéo dài ở desktop -> Giới hạn w-auto px-6. Axe 0 lỗi. |
| `/support` | Trung tâm hỗ trợ & Phiếu yêu cầu | P1 | `StaticSupportRepository` | Hoàn thành | 07/11/2026 | `screenshots/common/matrix/support-*.png` (16 ảnh) + `states/support-empty-state.png` | Tự phê bình: (1) Bảng 6 cột vỡ trên 390px -> Ẩn bớt cột phụ, đưa phân loại thành sub-line; (2) Thiếu aria-label thẻ select -> Đã bổ sung chuẩn WCAG; (3) Search không ra kết quả bị trống thô -> Bổ sung empty state có icon. Axe 0 lỗi. |
| `/support/new` | Tạo yêu cầu hỗ trợ mới | P1 | `StaticSupportRepository` | Hoàn thành | 07/11/2026 | `screenshots/common/matrix/support-new-*.png` (16 ảnh) + `states/support-new-success-state.png` | Tự phê bình: (1) Upload file mặc định xấu -> Làm khung dashed dropzone có icon Cloud; (2) 10 options ghi cứng -> Đã chuyển toàn bộ qua i18n category/priority; (3) Chưa chặn double click -> Thêm disabled và loading state. Axe 0 lỗi. |
| `/support/[id]` | Chi tiết phiếu hỗ trợ & Trao đổi | P1 | `StaticSupportRepository` | Hoàn thành | 07/11/2026 | `screenshots/common/matrix/support-detail-*.png` (16 ảnh) + `states/support-detail-error-state.png` | Tự phê bình: (1) Tin nhắn admin không có badge phân biệt -> Thêm badge CSKH Tổ Ấm nền teal nổi bật; (2) Timestamp hiển thị ISO thô -> Format giờ:phút ngày/tháng; (3) ID sai không có fallback -> Thêm error card not-found có nút quay về. Axe 0 lỗi. |

---

## 2. Nhóm Quản Trị Viên & Kiểm Duyệt Viên (Admin & Moderator)
| Route | Tên Trang | Ưu Tiên | Nguồn Dữ Liệu | Trạng Thái | Ngày | Ảnh Chụp | Ghi Chú |
|---|---|---|---|---|---|---|---|
| `/dashboard/admin` | Tổng quan sàn (Admin) | P1 | `StaticAdminRepository` | Hoàn thành Rework | 07/11/2026 | `before-after/overview-*.png` (8 ảnh) | Đã sửa CSS v4, font Plus Jakarta Sans, KPI cards, E2E visual pass |
| `/dashboard/moderator` | Hàng đợi kiểm duyệt (Moderator) | P1 | `StaticAdminRepository` | Chờ rà soát | - | - | Hàng đợi tập trung phòng + KYC + Báo cáo |
| `/dashboard/admin/rooms` | Duyệt tin đăng phòng | P1 | `StaticAdminRepository` | Hoàn thành Rework | 07/11/2026 | `before-after/rooms-*.png` (8 ảnh) | Bổ sung Drawer chi tiết, Tabs chuẩn, E2E visual pass |
| `/dashboard/admin/rooms/[id]` | Chi tiết phòng duyệt (Trang riêng) | P1 | `StaticAdminRepository` | Chờ rà soát | - | - | Link trực tiếp xem phòng kiểm duyệt |
| `/dashboard/admin/kyc` | Duyệt hồ sơ eKYC CCCD | P1 | `StaticAdminRepository` | Hoàn thành Rework | 07/11/2026 | `before-after/kyc-*.png` (8 ảnh) | So sánh CCCD 2 mặt + đối chiếu OCR + từ chối có lý do |
| `/dashboard/admin/kyc/[id]` | Chi tiết hồ sơ KYC (Trang riêng) | P1 | `StaticAdminRepository` | Chờ rà soát | - | - | Link trực tiếp hồ sơ người dùng |
| `/dashboard/admin/users` | Quản lý người dùng | P1 | `StaticAdminRepository` | Hoàn thành Rework | 07/11/2026 | `before-after/users-*.png` (8 ảnh) | Bổ sung User Detail Drawer, Tabs vai trò, E2E pass |
| `/dashboard/admin/users/[id]` | Chi tiết người dùng (Trang riêng) | P1 | `StaticAdminRepository` | Chờ rà soát | - | - | Lịch sử hoạt động, hợp đồng, vi phạm |
| `/dashboard/admin/reports` | Báo cáo vi phạm | P1 | `StaticAdminRepository` | Hoàn thành Rework | 07/11/2026 | `before-after/reports-*.png` (8 ảnh) | Bổ sung Report Detail Drawer, xử lý khiếu nại |
| `/dashboard/admin/reports/[id]` | Chi tiết báo cáo vi phạm (Trang riêng) | P1 | `StaticAdminRepository` | Chờ rà soát | - | - | Link đối soát bằng chứng vi phạm |
| `/dashboard/admin/reviews` | Kiểm duyệt đánh giá | P1 | `StaticAdminRepository` | Hoàn thành Rework | 07/11/2026 | `before-after/reviews-*.png` (8 ảnh) | Bổ sung Review Detail Drawer, ẩn/hiện, E2E pass |
| `/dashboard/admin/reviews/[id]` | Chi tiết đánh giá (Trang riêng) | P1 | `StaticAdminRepository` | Chờ rà soát | - | - | Chi tiết số sao, phản hồi từ chủ trọ |
| `/dashboard/admin/contracts` | Quản lý hợp đồng toàn sàn | P1 | `StaticContractRepository` | Chờ rà soát | - | - | Danh sách hợp đồng đang hiệu lực, hết hạn |
| `/dashboard/admin/contracts/[id]` | Chi tiết hợp đồng toàn sàn | P1 | `StaticContractRepository` | Chờ rà soát | - | - | Điều khoản, chữ ký điện tử, lịch sử |
| `/dashboard/admin/transactions` | Giao dịch & Đối soát sàn | P1 | `StaticTransactionRepository` | Chờ rà soát | - | - | Dòng tiền cọc, phí hoa hồng, lệnh hoàn tiền |
| `/dashboard/admin/disputes` | Quản lý tranh chấp hợp đồng | P1 | `StaticDisputeRepository` | Chờ rà soát | - | - | Tranh chấp cọc, hư hỏng đồ đạc |
| `/dashboard/admin/disputes/[id]` | Chi tiết giải quyết tranh chấp | P1 | `StaticDisputeRepository` | Chờ rà soát | - | - | Phán quyết sàn, giải phóng tiền cọc |
| `/dashboard/admin/support` | Quản lý vé hỗ trợ khách hàng | P1 | `StaticSupportRepository` | Chờ rà soát | - | - | Phân công nhân viên, xử lý yêu cầu |
| `/dashboard/admin/support/[id]` | Chi tiết vé hỗ trợ quản trị | P1 | `StaticSupportRepository` | Chờ rà soát | - | - | Phản hồi khách hàng từ admin |
| `/dashboard/admin/system-health` | Tình trạng hạ tầng Microservice | P1 | `StaticAdminRepository` | Chờ rà soát | - | - | Độ trễ, uptime, healthcheck từng service |
| `/dashboard/admin/profile` | Hồ sơ quản trị viên | P1 | `HttpAuthRepository` | Chờ rà soát | - | - | Thông tin cá nhân, vai trò quản trị |
| `/dashboard/admin/security` | Bảo mật & Phiên đăng nhập | P1 | `HttpAuthRepository` | Chờ rà soát | - | - | Đổi mật khẩu, danh sách thiết bị đăng nhập |
| `/dashboard/admin/dictionaries` | Danh mục & Từ điển hệ thống | P1 | `StaticAdminRepository` | Hoàn thành Rework | 07/11/2026 | `before-after/dictionaries-*.png` (8 ảnh) | Tabs danh mục chuẩn, modal tạo mới, E2E pass |
| `/dashboard/admin/analytics` | Thống kê nền tảng | P1 | `StaticAdminRepository` | Hoàn thành Rework | 07/11/2026 | `before-after/analytics-*.png` (8 ảnh) | ChartCards, thanh tiến độ khu vực semantic |
| `/dashboard/admin/audit-logs` | Nhật ký kiểm toán | P1 | `StaticAdminRepository` | Hoàn thành Rework | 07/11/2026 | `before-after/audit-logs-*.png` (8 ảnh) | IP monospace badges, search, E2E pass |
| `/dashboard/admin/settings` | Cấu hình hệ thống | P1 | `StaticAdminRepository` | Hoàn thành Rework | 07/11/2026 | `before-after/settings-*.png` (8 ảnh) | Toggle switches chuẩn, Ops/Payment/Security |
| `/dashboard/admin/roles` | Ma trận vai trò & Phân quyền | P2 | `StaticAdminRepository` | Chờ rà soát | - | - | Phân quyền chi tiết Admin/Mod/Staff |
| `/dashboard/admin/listing-plans` | Gói đăng tin & Mã khuyến mãi | P2 | `StaticAdminRepository` | Chờ rà soát | - | - | Quản lý bảng giá VIP, mã giảm giá |
| `/dashboard/admin/content/blog` | Quản lý bài viết blog | P2 | `StaticAdminRepository` | Chờ rà soát | - | - | Đăng bài, biên tập cẩm nang SEO |
| `/dashboard/admin/content/faq` | Quản lý câu hỏi thường gặp | P2 | `StaticAdminRepository` | Chờ rà soát | - | - | Phân loại câu hỏi cho người thuê/chủ trọ |
| `/dashboard/admin/content/banners` | Quản lý banner quảng bá | P2 | `StaticAdminRepository` | Chờ rà soát | - | - | Banner trang chủ, chiến dịch |
| `/dashboard/admin/broadcast-notifications` | Gửi thông báo hàng loạt | P2 | `StaticAdminRepository` | Chờ rà soát | - | - | Soạn thông báo đẩy, mẫu email sàn |

---

## 3. Nhóm Chủ Trọ (Landlord)
| Route | Tên Trang | Ưu Tiên | Nguồn Dữ Liệu | Trạng Thái | Ngày | Ảnh Chụp | Ghi Chú |
|---|---|---|---|---|---|---|---|
| `/dashboard/landlord` | Tổng quan chủ trọ | P1 | `StaticLandlordRepository` | Chờ rà soát | - | - | Doanh thu, phòng trống, việc cần làm |
| `/dashboard/landlord/rooms` | Danh sách phòng cho thuê | P1 | `HttpLandlordRoomRepository` | Hoàn thành | 07/11/2026 | `docs/screenshots/landlord-rooms/rooms-1440-light.png` | Bảng danh sách, phân trang, lọc theo 7 trạng thái, tìm kiếm, ẩn/hiện, xóa mềm bảo vệ RENTED |
| `/dashboard/landlord/rooms/new` | Đăng tin phòng mới | P1 | `HttpLandlordRoomRepository` | Hoàn thành | 07/11/2026 | `docs/screenshots/landlord-rooms/upload-step4-1440.png` | Stepper 4 bước, ImageManager multipart upload, kiểm tra magic bytes, >= 3 ảnh gửi duyệt, lưu nháp |
| `/dashboard/landlord/rooms/[id]` | Chi tiết phòng cho thuê | P1 | `StaticLandlordRepository` | Chờ rà soát | - | - | Tổng quan phòng, lịch sử thuê, ảnh, lượt xem |
| `/dashboard/landlord/rooms/[id]/edit` | Chỉnh sửa tin phòng | P1 | `HttpLandlordRoomRepository` | Hoàn thành | 07/11/2026 | - | Cập nhật thông tin phòng, quản lý ảnh trực tiếp (đổi ảnh bìa duy nhất, xóa ảnh, sắp xếp thứ tự) |
| `/dashboard/landlord/appointments` | Lịch hẹn xem phòng (Lịch/Bảng) | P1 | `StaticBookingRepository` | Chờ rà soát | - | - | Chế độ lịch tuần/tháng và bảng danh sách |
| `/dashboard/landlord/rental-requests` | Yêu cầu thuê phòng | P1 | `StaticBookingRepository` | Chờ rà soát | - | - | Danh sách hồ sơ xin thuê |
| `/dashboard/landlord/rental-requests/[id]` | Chi tiết hồ sơ ứng viên | P1 | `StaticBookingRepository` | Chờ rà soát | - | - | So sánh hồ sơ, thông tin ứng viên |
| `/dashboard/landlord/contracts` | Quản lý hợp đồng | P1 | `StaticContractRepository` | Chờ rà soát | - | - | Danh sách hợp đồng thuê |
| `/dashboard/landlord/contracts/new` | Lập hợp đồng mới | P1 | `StaticContractRepository` | Chờ rà soát | - | - | Tạo hợp đồng nhiều bước |
| `/dashboard/landlord/contracts/[id]` | Chi tiết hợp đồng | P1 | `StaticContractRepository` | Chờ rà soát | - | - | Gia hạn, chấm dứt, quyết toán cọc |
| `/dashboard/landlord/tenants` | Danh sách khách thuê | P1 | `StaticLandlordRepository` | Chờ rà soát | - | - | Khách đang ở, thông tin liên lạc |
| `/dashboard/landlord/tenants/[id]` | Chi tiết khách thuê | P1 | `StaticLandlordRepository` | Chờ rà soát | - | - | Lịch sử thanh toán, hợp đồng gắn liền |
| `/dashboard/landlord/utilities` | Ghi chỉ số điện nước | P1 | `StaticBillingRepository` | Chờ rà soát | - | - | Ghi công tơ, tính lượng tiêu thụ |
| `/dashboard/landlord/utilities/[roomId]` | Lịch sử chỉ số theo phòng | P1 | `StaticBillingRepository` | Chờ rà soát | - | - | Nhập hàng loạt chỉ số công tơ |
| `/dashboard/landlord/invoices` | Quản lý hóa đơn tiền phòng | P1 | `StaticBillingRepository` | Chờ rà soát | - | - | Hóa đơn định kỳ, trạng thái thu tiền |
| `/dashboard/landlord/invoices/new` | Lập hóa đơn mới (Hàng loạt) | P1 | `StaticBillingRepository` | Chờ rà soát | - | - | Sinh hóa đơn tự động theo chỉ số |
| `/dashboard/landlord/invoices/[id]` | Chi tiết hóa đơn | P1 | `StaticBillingRepository` | Chờ rà soát | - | - | Quét mã VietQR, xác nhận thanh toán |
| `/dashboard/landlord/deposits` | Quản lý tiền cọc giữ phòng | P1 | `StaticTransactionRepository` | Chờ rà soát | - | - | Danh sách cọc, trạng thái cọc |
| `/dashboard/landlord/maintenance` | Quản lý yêu cầu sửa chữa | P1 | `StaticMaintenanceRepository` | Chờ rà soát | - | - | Yêu cầu sự cố điện nước từ khách |
| `/dashboard/landlord/maintenance/[id]` | Chi tiết xử lý sự cố sửa chữa | P1 | `StaticMaintenanceRepository` | Chờ rà soát | - | - | Cập nhật tiến độ, chi phí sửa chữa |
| `/dashboard/landlord/analytics` | Báo cáo doanh thu | P1 | `StaticLandlordRepository` | Chờ rà soát | - | - | Biểu đồ doanh thu & tỷ lệ lấp đầy |
| `/dashboard/landlord/reviews` | Đánh giá nhận được | P1 | `StaticReviewRepository` | Chờ rà soát | - | - | Trả lời nhận xét của người thuê |
| `/dashboard/landlord/messages` | Tin nhắn trao đổi | P1 | `StaticChatRepository` | Chờ rà soát | - | - | Trò chuyện với khách thuê |
| `/dashboard/landlord/notifications` | Thông báo hệ thống | P1 | `StaticNotificationRepository` | Chờ rà soát | - | - | Thông báo cọc, tiền phòng, lịch hẹn |
| `/dashboard/landlord/kyc` | Xác thực chủ trọ (KYC) | P1 | `StaticKycRepository` | Chờ rà soát | - | - | Tải giấy tờ nhà đất & CCCD |
| `/dashboard/landlord/profile` | Hồ sơ chủ trọ | P1 | `HttpAuthRepository` | Chờ rà soát | - | - | Thông tin cá nhân, số hotline đón khách |
| `/dashboard/landlord/settings` | Cài đặt thanh toán | P1 | `StaticBillingRepository` | Chờ rà soát | - | - | Cấu hình VietQR & đơn giá điện nước |
| `/dashboard/landlord/expenses` | Quản lý chi phí & Lợi nhuận | P2 | `StaticLandlordRepository` | Chờ rà soát | - | - | Chi phí bảo trì, thuế, khấu hao |
| `/dashboard/landlord/contract-templates` | Mẫu hợp đồng tùy biến | P2 | `StaticContractRepository` | Chờ rà soát | - | - | Mẫu điều khoản riêng của chủ trọ |
| `/dashboard/landlord/subscription` | Gói đẩy tin & Dịch vụ VIP | P2 | `StaticLandlordRepository` | Chờ rà soát | - | - | Nâng cấp gói tin đăng nổi bật |
| `/dashboard/landlord/buildings` | Quản lý dãy trọ / Tòa nhà | P2 | `StaticLandlordRepository` | Chờ rà soát | - | - | Quản lý mô hình nhiều tòa nhà |

---

## 4. Nhóm Người Thuê (Tenant)
| Route | Tên Trang | Ưu Tiên | Nguồn Dữ Liệu | Trạng Thái | Ngày | Ảnh Chụp | Ghi Chú |
|---|---|---|---|---|---|---|---|
| `/dashboard/tenant` | Tổng quan người thuê | P1 | `StaticTenantRepository` | Chờ rà soát | - | - | Hợp đồng đang ở, hóa đơn đến hạn |
| `/dashboard/tenant/my-room` | Phòng đang thuê hiện tại | P1 | `StaticTenantRepository` | Chờ rà soát | - | - | Chi tiết phòng, nội quy, hotline chủ trọ |
| `/dashboard/tenant/maintenance` | Yêu cầu sửa chữa của tôi | P1 | `StaticMaintenanceRepository` | Chờ rà soát | - | - | Danh sách báo hỏng thiết bị |
| `/dashboard/tenant/maintenance/new` | Gửi báo cáo hư hỏng mới | P1 | `StaticMaintenanceRepository` | Chờ rà soát | - | - | Chụp ảnh thiết bị hỏng, mô tả sự cố |
| `/dashboard/tenant/maintenance/[id]` | Chi tiết tiến độ sửa chữa | P1 | `StaticMaintenanceRepository` | Chờ rà soát | - | - | Trạng thái tiếp nhận và xử lý |
| `/dashboard/tenant/move-out` | Yêu cầu trả phòng & Quyết toán cọc | P1 | `StaticTenantRepository` | Chờ rà soát | - | - | Đăng ký ngày rời đi, hoàn cọc |
| `/dashboard/tenant/deposits` | Tiền cọc phòng của tôi | P1 | `StaticTransactionRepository` | Chờ rà soát | - | - | Quản lý cọc giữ chỗ và cọc hợp đồng |
| `/dashboard/tenant/saved-rooms` | Phòng đã lưu | P1 | `StaticTenantRepository` | Chờ rà soát | - | - | Danh sách phòng yêu thích |
| `/dashboard/tenant/saved-searches` | Tìm kiếm đã lưu | P1 | `StaticTenantRepository` | Chờ rà soát | - | - | Bộ lọc nhận thông báo tự động |
| `/dashboard/tenant/appointments` | Lịch hẹn xem phòng | P1 | `StaticBookingRepository` | Chờ rà soát | - | - | Danh sách lịch hẹn |
| `/dashboard/tenant/appointments/[id]` | Chi tiết lịch hẹn | P1 | `StaticBookingRepository` | Chờ rà soát | - | - | Địa chỉ, số điện thoại chủ trọ, chỉ đường |
| `/dashboard/tenant/rental-requests` | Yêu cầu thuê phòng | P1 | `StaticBookingRepository` | Chờ rà soát | - | - | Trạng thái xét duyệt hồ sơ |
| `/dashboard/tenant/rental-requests/[id]` | Chi tiết yêu cầu thuê | P1 | `StaticBookingRepository` | Chờ rà soát | - | - | Phản hồi của chủ trọ, bước ký hợp đồng |
| `/dashboard/tenant/contracts` | Danh sách hợp đồng thuê | P1 | `StaticContractRepository` | Chờ rà soát | - | - | Danh sách hợp đồng |
| `/dashboard/tenant/contracts/[id]` | Chi tiết hợp đồng | P1 | `StaticContractRepository` | Chờ rà soát | - | - | Đọc điều khoản, ký số OTP, tải PDF |
| `/dashboard/tenant/invoices` | Danh sách hóa đơn | P1 | `StaticBillingRepository` | Chờ rà soát | - | - | Hóa đơn tiền nhà hàng tháng |
| `/dashboard/tenant/invoices/[id]` | Chi tiết hóa đơn thanh toán | P1 | `StaticBillingRepository` | Chờ rà soát | - | - | Quét mã VietQR thanh toán tiền phòng |
| `/dashboard/tenant/payments` | Lịch sử thanh toán | P1 | `StaticBillingRepository` | Chờ rà soát | - | - | Biên lai các khoản đã thanh toán |
| `/dashboard/tenant/reports` | Lịch sử khiếu nại đã gửi | P1 | `StaticTenantRepository` | Chờ rà soát | - | - | Trạng thái giải quyết báo cáo vi phạm |
| `/dashboard/tenant/messages` | Hộp thư tin nhắn | P1 | `StaticChatRepository` | Chờ rà soát | - | - | Trò chuyện trực tiếp với chủ trọ |
| `/dashboard/tenant/notifications` | Thông báo | P1 | `StaticNotificationRepository` | Chờ rà soát | - | - | Nhắc nợ tiền nhà, duyệt lịch xem phòng |
| `/dashboard/tenant/reviews` | Đánh giá của tôi | P1 | `StaticReviewRepository` | Chờ rà soát | - | - | Viết đánh giá phòng đã thuê |
| `/dashboard/tenant/profile` | Hồ sơ cá nhân | P1 | `HttpAuthRepository` | Chờ rà soát | - | - | Cập nhật tên, số điện thoại, email |
| `/dashboard/tenant/kyc` | Định danh cá nhân eKYC | P1 | `StaticKycRepository` | Chờ rà soát | - | - | Chụp CCCD 2 mặt |
| `/dashboard/tenant/settings` | Cài đặt bảo mật | P1 | `StaticTenantRepository` | Chờ rà soát | - | - | Đổi mật khẩu, tùy chọn thông báo |
| `/dashboard/tenant/recently-viewed` | Phòng đã xem gần đây | P2 | `StaticTenantRepository` | Chờ rà soát | - | - | Lịch sử các phòng vừa duyệt qua |
| `/dashboard/tenant/documents` | Kho lưu trữ giấy tờ số | P2 | `StaticTenantRepository` | Chờ rà soát | - | - | Hợp đồng, biên lai, giấy tạm trú |

---

## 5. Nhóm Xác Thực (Auth)
| Route | Tên Trang | Ưu Tiên | Nguồn Dữ Liệu | Trạng Thái | Ngày | Ảnh Chụp | Ghi Chú |
|---|---|---|---|---|---|---|---|
| `/login` | Đăng nhập | P1 | `HttpAuthRepository` | Chờ rà soát | - | - | API Backend identity-service |
| `/register` | Đăng ký | P1 | `HttpAuthRepository` | Chờ rà soát | - | - | API Backend identity-service |
| `/onboarding` | Hoàn thiện hồ sơ & Chọn vai trò | P1 | `HttpAuthRepository` | Chờ rà soát | - | - | Sau đăng ký Google/email, chọn Người thuê/Chủ trọ |
| `/become-landlord` | Nâng cấp tài khoản Chủ trọ | P1 | `HttpAuthRepository` | Chờ rà soát | - | - | Nâng cấp từ tài khoản người thuê trọ |
| `/forgot-password` | Quên mật khẩu | P1 | `HttpAuthRepository` | Chờ rà soát | - | - | Gửi OTP khôi phục |
| `/reset-password` | Đặt lại mật khẩu | P1 | `HttpAuthRepository` | Chờ rà soát | - | - | Nhập OTP & mật khẩu mới |
| `/verify-email` | Xác thực email | P1 | `HttpAuthRepository` | Chờ rà soát | - | - | Kích hoạt tài khoản người dùng |
| `/session-expired` | Thông báo phiên hết hạn | P1 | Tĩnh i18n | Chờ rà soát | - | - | Token hết hạn, chuyển hướng đăng nhập |
| `/account-locked` | Tài khoản bị tạm khóa | P1 | Tĩnh i18n | Chờ rà soát | - | - | Cảnh báo vi phạm bảo mật |
| `/settings/security` | Xác thực 2 lớp (2FA) | P2 | `HttpAuthRepository` | Chờ rà soát | - | - | Bật/tắt OTP TOTP Google Authenticator |

---

## 6. Nhóm Công Khai (Public)
| Route | Tên Trang | Ưu Tiên | Nguồn Dữ Liệu | Trạng Thái | Ngày | Ảnh Chụp | Ghi Chú |
|---|---|---|---|---|---|---|---|
| `/` | Trang chủ | P1 | `HttpListingRepository` | Chờ rà soát | - | - | API Backend listing-service |
| `/rooms` | Danh sách tìm kiếm phòng trọ | P1 | `HttpListingRepository` | Chờ rà soát | - | - | Bộ lọc giá, khu vực, tiện nghi |
| `/rooms/[id]` | Chi tiết phòng trọ | P1 | `HttpListingRepository` | Chờ rà soát | - | - | Thư viện ảnh, tiện ích, biểu phí |
| `/map` | Tìm phòng trên bản đồ | P1 | `HttpListingRepository` | Chờ rà soát | - | - | Bản đồ trực quan, ghim vị trí, lọc giá |
| `/compare` | So sánh phòng trọ | P1 | `HttpListingRepository` | Chờ rà soát | - | - | So sánh tối đa 3-4 phòng song song |
| `/for-landlords` | Dành cho chủ trọ | P1 | Tĩnh i18n | Chờ rà soát | - | - | Giới thiệu lợi ích và đăng tin cho chủ trọ |
| `/how-it-works` | Quy trình hoạt động | P1 | Tĩnh i18n | Chờ rà soát | - | - | Hướng dẫn thuê phòng an tâm 4 bước |
| `/help` | Trung tâm trợ giúp & FAQ | P1 | Tĩnh i18n | Chờ rà soát | - | - | Thanh tìm kiếm câu hỏi, hướng dẫn |
| `/hosts/[id]` | Hồ sơ chủ trọ công khai | P1 | `HttpListingRepository` | Chờ rà soát | - | - | Danh sách phòng đang quản lý, uy tín |
| `/about` | Về chúng tôi | P1 | Tĩnh i18n | Chờ rà soát | - | - | Sứ mệnh, đội ngũ phát triển |
| `/safety-guide` | Cẩm nang phòng tránh lừa đảo | P1 | Tĩnh i18n | Chờ rà soát | - | - | Hướng dẫn kiểm tra pháp lý nhà trọ |
| `/pricing` | Bảng giá dịch vụ | P1 | Tĩnh i18n | Chờ rà soát | - | - | Bảng giá gói đăng tin, hoa hồng sàn |
| `/faq` | Câu hỏi thường gặp | P1 | Tĩnh i18n | Chờ rà soát | - | - | Tổng hợp thắc mắc người thuê & chủ nhà |
| `/contact` | Liên hệ hỗ trợ | P1 | Tĩnh i18n | Chờ rà soát | - | - | Hotline, email, địa chỉ văn phòng |
| `/terms` | Điều khoản sử dụng | P1 | Tĩnh i18n | Chờ rà soát | - | - | Quy định pháp lý sàn thương mại |
| `/privacy` | Chính sách bảo mật | P1 | Tĩnh i18n | Chờ rà soát | - | - | Chính sách lưu trữ và bảo vệ dữ liệu |
| `/cookies` | Chính sách Cookie | P1 | Tĩnh i18n | Chờ rà soát | - | - | Quản lý đồng ý theo dõi cookie |
| `/blog` | Cẩm nang thuê trọ & Tin tức | P2 | `StaticSupportRepository` | Chờ rà soát | - | - | Danh sách bài viết tin tức, cẩm nang |
| `/blog/[slug]` | Chi tiết bài viết cẩm nang | P2 | `StaticSupportRepository` | Chờ rà soát | - | - | Bài viết SEO cẩm nang sống, trang trí phòng |
| `/areas/[tinh]` | Phòng trọ theo Tỉnh / Thành phố | P2 | `HttpListingRepository` | Chờ rà soát | - | - | SEO khu vực TP.HCM, Hà Nội, Đà Nẵng |
| `/areas/[tinh]/[quan]` | Phòng trọ theo Quận / Huyện | P2 | `HttpListingRepository` | Chờ rà soát | - | - | SEO chi tiết Quận 1, Cầu Giấy, Hải Châu... |
