# Bảng Theo Dõi Tiến Độ Rà Soát & Nghiệm Thu Từng Trang (Page Tracker)

> **Mục tiêu:** Rà soát, chuẩn hóa giao diện, hỗ trợ đa ngôn ngữ (i18n vi/en không chữ ghi cứng), Clean Architecture, đủ 4 trạng thái (loading/empty/error/success), responsive (1440/1024/768/390), accessibility, kiểm thử E2E và chụp ảnh nghiệm thu cho từng trang.

---

## Danh Sách Trang & Tiến Độ Chi Tiết

### Nhóm 1: Quản Trị Viên & Kiểm Duyệt Viên (Admin & Moderator)
| Route | Tên Trang | Nguồn Dữ Liệu | Trạng Thái | Ngày | Ảnh Chụp | Ghi Chú |
|---|---|---|---|---|---|---|
| `/dashboard/admin` | Tổng quan sàn | `StaticAdminRepository` | Đạt (100%) | 07/11/2026 | `screenshots/admin/overview-*.png` (19 ảnh) | Đủ 4 trạng thái, i18n vi/en, a11y passed |
| `/dashboard/admin/rooms` | Duyệt tin đăng | `StaticAdminRepository` | Đạt (100%) | 07/11/2026 | `screenshots/admin/rooms-*.png` (19 ảnh) | Tabs trạng thái, bộ lọc tìm kiếm, modal lý do, 4 states, a11y passed |
| `/dashboard/admin/kyc` | Duyệt eKYC CCCD | `StaticAdminRepository` | Đạt (100%) | 07/11/2026 | `screenshots/admin/kyc-*.png` (19 ảnh) | So sánh CCCD 2 mặt, 4 states, i18n vi/en, a11y passed |
| `/dashboard/admin/users` | Quản lý người dùng | `StaticAdminRepository` | Đạt (100%) | 07/11/2026 | `screenshots/admin/users-*.png` (19 ảnh) | Tabs vai trò, tìm kiếm đa trường, khóa/mở khóa, 4 states, a11y passed |
| `/dashboard/admin/reports` | Báo cáo vi phạm | `StaticAdminRepository` | Đạt (100%) | 07/11/2026 | `screenshots/admin/reports-*.png` (19 ảnh) | Tabs trạng thái, xử lý khiếu nại, 4 states, a11y passed |
| `/dashboard/admin/reviews` | Kiểm duyệt đánh giá | `StaticAdminRepository` | Đạt (100%) | 07/11/2026 | `screenshots/admin/reviews-*.png` (19 ảnh) | Tabs hiển thị/ẩn, chuyển đổi trạng thái, 4 states, a11y passed |
| `/dashboard/admin/dictionaries` | Danh mục hệ thống | `StaticAdminRepository` | Chờ rà soát | - | - | Loại phòng, tiện nghi, địa giới |
| `/dashboard/admin/analytics` | Phân tích sâu | `StaticAdminRepository` | Chờ rà soát | - | - | Biểu đồ tìm kiếm & tỷ lệ lấp đầy |
| `/dashboard/admin/audit-logs` | Nhật ký hệ thống | `StaticAdminRepository` | Chờ rà soát | - | - | Tra cứu hành động & địa chỉ IP |
| `/dashboard/admin/settings` | Cấu hình toàn sàn | `StaticAdminRepository` | Chờ rà soát | - | - | Bảo trì, VietQR, bảo mật phiên |

### Nhóm 2: Chủ Trọ (Landlord)
| Route | Tên Trang | Nguồn Dữ Liệu | Trạng Thái | Ngày | Ảnh Chụp | Ghi Chú |
|---|---|---|---|---|---|---|
| `/dashboard/landlord` | Tổng quan chủ trọ | `StaticLandlordRepository` | Chờ rà soát | - | - | Doanh thu, phòng trống, việc cần làm |
| `/dashboard/landlord/rooms` | Danh sách phòng | `StaticLandlordRepository` | Chờ rà soát | - | - | Bảng phòng, trạng thái phòng |
| `/dashboard/landlord/rooms/new` | Đăng tin phòng mới | `StaticFormHandler` | Chờ rà soát | - | - | Stepper 4 bước đăng tin |
| `/dashboard/landlord/rooms/[id]/edit` | Chỉnh sửa phòng | `StaticFormHandler` | Chờ rà soát | - | - | Biểu mẫu cập nhật tin |
| `/dashboard/landlord/appointments` | Lịch hẹn xem phòng | `StaticBookingRepository` | Chờ rà soát | - | - | Duyệt/từ chối lịch hẹn |
| `/dashboard/landlord/rental-requests` | Yêu cầu thuê phòng | `StaticBookingRepository` | Chờ rà soát | - | - | Duyệt hồ sơ xin thuê |
| `/dashboard/landlord/contracts` | Quản lý hợp đồng | `StaticContractRepository` | Chờ rà soát | - | - | Lập hợp đồng mới, kết thúc hợp đồng |
| `/dashboard/landlord/tenants` | Danh sách khách thuê | `StaticLandlordRepository` | Chờ rà soát | - | - | Quản lý khách đang thuê |
| `/dashboard/landlord/utilities` | Chỉ số điện nước | `StaticBillingRepository` | Chờ rà soát | - | - | Ghi công tơ, tính lượng tiêu thụ |
| `/dashboard/landlord/invoices` | Quản lý hóa đơn | `StaticBillingRepository` | Chờ rà soát | - | - | Tạo hóa đơn, nhắc nợ SMS |
| `/dashboard/landlord/analytics` | Báo cáo doanh thu | `StaticLandlordRepository` | Chờ rà soát | - | - | Biểu đồ doanh thu & chi phí |
| `/dashboard/landlord/reviews` | Đánh giá nhận được | `StaticReviewRepository` | Chờ rà soát | - | - | Trả lời đánh giá của người thuê |
| `/dashboard/landlord/messages` | Tin nhắn trao đổi | `StaticChatRepository` | Chờ rà soát | - | - | Trò chuyện với khách thuê |
| `/dashboard/landlord/notifications` | Thông báo | `StaticNotificationRepository` | Chờ rà soát | - | - | Thông báo hệ thống |
| `/dashboard/landlord/kyc` | Xác thực chủ trọ | `StaticKycRepository` | Chờ rà soát | - | - | Tải giấy tờ nhà đất & CCCD |
| `/dashboard/landlord/settings` | Cài đặt thanh toán | `StaticBillingRepository` | Chờ rà soát | - | - | Tài khoản VietQR & đơn giá điện nước |

### Nhóm 3: Người Thuê (Tenant)
| Route | Tên Trang | Nguồn Dữ Liệu | Trạng Thái | Ngày | Ảnh Chụp | Ghi Chú |
|---|---|---|---|---|---|---|
| `/dashboard/tenant` | Tổng quan người thuê | `StaticTenantRepository` | Chờ rà soát | - | - | Hợp đồng hiện tại, hóa đơn đến hạn |
| `/dashboard/tenant/profile` | Hồ sơ cá nhân | `HttpAuthRepository` (API) | Chờ rà soát | - | - | API Backend identity-service |
| `/dashboard/tenant/kyc` | Định danh eKYC | `StaticKycRepository` | Chờ rà soát | - | - | Chụp CCCD 2 mặt |
| `/dashboard/tenant/saved-rooms` | Phòng đã lưu | `StaticTenantRepository` | Chờ rà soát | - | - | Danh sách phòng yêu thích |
| `/dashboard/tenant/saved-searches` | Tìm kiếm đã lưu | `StaticTenantRepository` | Chờ rà soát | - | - | Bộ lọc thông báo phòng mới |
| `/dashboard/tenant/appointments` | Lịch hẹn xem phòng | `StaticBookingRepository` | Chờ rà soát | - | - | Lịch hẹn đã đặt, hủy hẹn |
| `/dashboard/tenant/rental-requests` | Yêu cầu thuê phòng | `StaticBookingRepository` | Chờ rà soát | - | - | Trạng thái xét duyệt hồ sơ |
| `/dashboard/tenant/contracts` | Danh sách hợp đồng | `StaticContractRepository` | Chờ rà soát | - | - | Hợp đồng thuê nhà |
| `/dashboard/tenant/contracts/[id]` | Chi tiết hợp đồng | `StaticContractRepository` | Chờ rà soát | - | - | Tải PDF, ký OTP điện tử |
| `/dashboard/tenant/invoices` | Danh sách hóa đơn | `StaticBillingRepository` | Chờ rà soát | - | - | Hóa đơn tiền nhà hàng tháng |
| `/dashboard/tenant/invoices/[id]` | Chi tiết hóa đơn | `StaticBillingRepository` | Chờ rà soát | - | - | Quét mã VietQR thanh toán |
| `/dashboard/tenant/payments` | Lịch sử thanh toán | `StaticBillingRepository` | Chờ rà soát | - | - | Giao dịch đã thanh toán |
| `/dashboard/tenant/messages` | Hộp thư tin nhắn | `StaticChatRepository` | Chờ rà soát | - | - | Trao đổi với chủ nhà |
| `/dashboard/tenant/notifications` | Thông báo | `StaticNotificationRepository` | Chờ rà soát | - | - | Thông báo thanh toán, lịch hẹn |
| `/dashboard/tenant/reviews` | Đánh giá của tôi | `StaticReviewRepository` | Chờ rà soát | - | - | Đánh giá phòng trọ đã thuê |
| `/dashboard/tenant/settings` | Cài đặt bảo mật | `StaticTenantRepository` | Chờ rà soát | - | - | Đổi mật khẩu, cài đặt thông báo |

### Nhóm 4: Xác Thực (Auth)
| Route | Tên Trang | Nguồn Dữ Liệu | Trạng Thái | Ngày | Ảnh Chụp | Ghi Chú |
|---|---|---|---|---|---|---|
| `/login` | Đăng nhập | `HttpAuthRepository` (API) | Chờ rà soát | - | - | API Backend identity-service |
| `/register` | Đăng ký | `HttpAuthRepository` (API) | Chờ rà soát | - | - | API Backend identity-service |
| `/forgot-password` | Quên mật khẩu | `HttpAuthRepository` | Chờ rà soát | - | - | Gửi OTP khôi phục |
| `/reset-password` | Đặt lại mật khẩu | `HttpAuthRepository` | Chờ rà soát | - | - | Xác thực token & đổi pass |
| `/verify-email` | Xác thực email | `HttpAuthRepository` | Chờ rà soát | - | - | Kích hoạt tài khoản |

### Nhóm 5: Công Khai (Public)
| Route | Tên Trang | Nguồn Dữ Liệu | Trạng Thái | Ngày | Ảnh Chụp | Ghi Chú |
|---|---|---|---|---|---|---|
| `/` | Trang chủ | `HttpListingRepository` (API) | Chờ rà soát | - | - | API Backend listing-service |
| `/rooms` | Danh sách tìm kiếm | `HttpListingRepository` (API) | Chờ rà soát | - | - | API Backend listing-service |
| `/rooms/[id]` | Chi tiết phòng | `HttpListingRepository` (API) | Chờ rà soát | - | - | API Backend listing-service |
| `/hosts/[id]` | Hồ sơ chủ trọ | `HttpListingRepository` (API) | Chờ rà soát | - | - | API Backend listing-service |
| `/about` | Về chúng tôi | Nội dung tĩnh i18n | Chờ rà soát | - | - | Giới thiệu Tổ Ấm |
| `/safety-guide` | Cẩm nang an toàn | Nội dung tĩnh i18n | Chờ rà soát | - | - | Tránh bẫy lừa đảo thuê phòng |
| `/pricing` | Bảng giá dịch vụ | Nội dung tĩnh i18n | Chờ rà soát | - | - | Biểu phí đăng tin & tiện ích |
| `/faq` | Câu hỏi thường gặp | Nội dung tĩnh i18n | Chờ rà soát | - | - | FAQ người thuê và chủ trọ |
| `/contact` | Liên hệ hỗ trợ | Nội dung tĩnh i18n | Chờ rà soát | - | - | Hotline, email, trụ sở |
| `/terms` | Điều khoản sử dụng | Nội dung tĩnh i18n | Chờ rà soát | - | - | Điều khoản pháp lý sàn |
| `/privacy` | Chính sách bảo mật | Nội dung tĩnh i18n | Chờ rà soát | - | - | Quy định bảo mật thông tin |

---

## Thư Mục Lưu Trữ Ảnh Chụp Nghiệm Thu
`docs/design/screenshots/<vai-tro>/<ten-trang>-<viewport>-<theme>.png`
- Viewports: `1440` (Desktop), `1024` (Tablet ngang), `768` (Tablet dọc), `390` (Mobile)
- Themes: `light`, `dark`
- Locales: `vi`, `en`

