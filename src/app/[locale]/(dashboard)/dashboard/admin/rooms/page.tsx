'use client';

import React, { Suspense, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminRooms } from '@/presentation/hooks/useAdminRooms';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Drawer } from '@/presentation/components/ui/Drawer';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Tabs } from '@/presentation/components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import {
  Check,
  X,
  ShieldAlert,
  Search,
  Eye,
  MapPin,
  User,
  Calendar,
  CreditCard,
  RefreshCw,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Phone,
  Sparkles,
  Zap,
  Droplets,
  Wifi,
  Wrench,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { PendingRoomItem } from '@/domain/repositories/AdminRepository';

function AdminRoomsContent() {
  const tAuto = useTranslations('autoI18n');
  const t = useTranslations('admin.rooms');
  const tCommon = useTranslations('common');
  const {
    rooms,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    isLoading,
    isRefreshing,
    refresh,
    error,
    retry,
    handleApprove,
    handleOpenReject,
    handleConfirmReject,
    rejectModalOpen,
    setRejectModalOpen,
    rejectReason,
    setRejectReason,
  } = useAdminRooms();

  const [selectedRoom, setSelectedRoom] = useState<PendingRoomItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleOpenRoomDetails = (room: PendingRoomItem) => {
    setSelectedRoom(room);
    setActiveImageIndex(0);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorState title={t('errorTitle')} message={t('errorDesc')} onRetry={retry} />
      </div>
    );
  }

  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + ' đ';

  const tabItems = [
    { id: 'PENDING', label: t('tabPending') },
    { id: 'APPROVED', label: t('tabApproved') },
    { id: 'REJECTED', label: t('tabRejected') },
    { id: 'ALL', label: t('tabAll') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <span>{t('title')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading || isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            className="rounded-xl shadow-xs"
          >
            {t('btnRefresh')}
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          items={tabItems}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as any)}
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-72">
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading || isRefreshing}
            title={t('btnRefresh')}
            className="shrink-0 h-10 px-3 rounded-xl sm:hidden"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Table or Empty State */}
      {rooms.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDesc')} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('colTitle')}</TableHead>
                <TableHead>{t('colLandlord')}</TableHead>
                <TableHead>{t('colAddress')}</TableHead>
                <TableHead>{t('colPrice')}</TableHead>
                <TableHead>{t('colSubmitted')}</TableHead>
                <TableHead className="text-right">{t('colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground">#{r.id}</span>
                      <Badge
                        variant={
                          r.status === 'APPROVED'
                            ? 'success'
                            : r.status === 'REJECTED'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {r.status === 'APPROVED' && t('statusApproved')}
                        {r.status === 'REJECTED' && t('statusRejected')}
                        {r.status === 'PENDING' && t('statusPending')}
                      </Badge>
                      {r.riskLevel === 'HIGH_RISK' && (
                        <Badge variant="danger" size="sm">
                          HIGH_RISK
                        </Badge>
                      )}
                    </div>
                    {r.riskLevel === 'HIGH_RISK' && r.riskReasons && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium truncate max-w-xs mt-0.5">
                        [{r.riskReasons}]
                      </p>
                    )}
                    <p className="text-xs text-foreground-muted truncate max-w-xs mt-0.5">
                      {r.title}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-foreground">{r.landlordName}</TableCell>
                  <TableCell className="text-xs text-foreground-muted max-w-[200px] truncate">{r.address}</TableCell>
                  <TableCell className="font-bold text-teal-700 dark:text-teal-400">
                    {formatPrice(r.price)}
                  </TableCell>
                  <TableCell className="text-xs text-foreground-muted">{r.submittedAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenRoomDetails(r)}
                        title={tCommon('details')}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {r.status === 'PENDING' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(r.id)}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            {t('btnApprove')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReject(r.id)}
                          >
                            <X className="w-3.5 h-3.5 text-rose-600 mr-1" />
                            {t('btnReject')}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Room Detail Drawer */}
      <Drawer
        isOpen={Boolean(selectedRoom)}
        onClose={() => setSelectedRoom(null)}
        title="Chi tiết bài đăng phòng trọ"
      >
        {selectedRoom && (
          <div className="space-y-5 pb-6">
            {/* Image Gallery */}
            <div className="space-y-2">
              <div className="relative rounded-2xl overflow-hidden bg-stone-900 border border-border aspect-video flex items-center justify-center group">
                {selectedRoom.images && selectedRoom.images.length > 0 ? (
                  <>
                    <img
                      src={selectedRoom.images[activeImageIndex] || selectedRoom.images[0]}
                      alt={selectedRoom.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[11px] font-medium backdrop-blur-xs flex items-center gap-1.5 shadow-xs">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>
                        {activeImageIndex + 1} / {selectedRoom.images.length}
                      </span>
                    </div>
                    {selectedRoom.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              prev > 0 ? prev - 1 : selectedRoom.images!.length - 1
                            )
                          }
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer"
                          aria-label="Ảnh trước"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              prev < selectedRoom.images!.length - 1 ? prev + 1 : 0
                            )
                          }
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer"
                          aria-label="Ảnh sau"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-foreground-muted p-8 text-center">
                    <ImageIcon className="w-10 h-10 opacity-30" />
                    <p className="text-xs font-medium">Chủ trọ chưa tải lên hình ảnh cho phòng này</p>
                  </div>
                )}
              </div>

              {/* Thumbnails row */}
              {selectedRoom.images && selectedRoom.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                  {selectedRoom.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-teal-600 ring-2 ring-teal-500/30 opacity-100'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-16 h-12 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Room Title & Status Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={
                    selectedRoom.status === 'APPROVED'
                      ? 'success'
                      : selectedRoom.status === 'REJECTED'
                      ? 'danger'
                      : 'warning'
                  }
                >
                  {selectedRoom.status === 'APPROVED' && t('statusApproved')}
                  {selectedRoom.status === 'REJECTED' && t('statusRejected')}
                  {selectedRoom.status === 'PENDING' && t('statusPending')}
                </Badge>
                {selectedRoom.roomTypeCode && (
                  <Badge variant="neutral" size="sm">
                    {selectedRoom.roomTypeCode}
                  </Badge>
                )}
                {selectedRoom.verifiedOwnership && (
                  <Badge variant="success" size="sm" className="gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Đã xác minh chính chủ
                  </Badge>
                )}
                <span className="text-xs text-foreground-muted">#{selectedRoom.id}</span>
              </div>
              <h3 className="text-base font-bold text-foreground leading-snug">{selectedRoom.title}</h3>
            </div>

            {/* High Risk Alert */}
            {selectedRoom.riskLevel === 'HIGH_RISK' && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Cảnh báo tin ảo / Rủi ro cao (HIGH_RISK)</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {selectedRoom.riskReasons || 'Tin đăng bị hệ thống phát hiện có dấu hiệu bất thường về giá hoặc trùng lặp ảnh.'}
                </p>
              </div>
            )}

            {/* Key Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-surface-muted border border-border/60 text-center">
                <span className="text-[11px] text-foreground-muted block">Diện tích</span>
                <span className="text-xs font-bold text-foreground">{selectedRoom.area} m²</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-muted border border-border/60 text-center">
                <span className="text-[11px] text-foreground-muted block">Tầng</span>
                <span className="text-xs font-bold text-foreground">{selectedRoom.floor ?? 1}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-muted border border-border/60 text-center">
                <span className="text-[11px] text-foreground-muted block">Số người</span>
                <span className="text-xs font-bold text-foreground">{selectedRoom.maxOccupants ?? 2} người</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-muted border border-border/60 text-center">
                <span className="text-[11px] text-foreground-muted block">Phòng ngủ / WC</span>
                <span className="text-xs font-bold text-foreground">
                  {selectedRoom.bedrooms ?? 1} PN / {selectedRoom.bathrooms ?? 1} WC
                </span>
              </div>
            </div>

            {/* Pricing & Utility Breakdown */}
            <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span className="text-foreground-muted flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  Giá thuê tháng
                </span>
                <span className="font-bold text-sm text-teal-700 dark:text-teal-400">
                  {formatPrice(selectedRoom.price)} / tháng
                </span>
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">Tiền cọc:</span>
                  <span className="font-semibold text-foreground">
                    {selectedRoom.deposit ? formatPrice(selectedRoom.deposit) : '0 đ'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500 shrink-0" /> Điện:
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedRoom.electricityCost ? `${formatPrice(selectedRoom.electricityCost)}/kWh` : 'Theo giá nhà nước'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-500 shrink-0" /> Nước:
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedRoom.waterCost ? `${formatPrice(selectedRoom.waterCost)}/m³` : 'Theo hóa đơn'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-violet-500 shrink-0" /> Internet:
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedRoom.internetCost ? `${formatPrice(selectedRoom.internetCost)}/tháng` : 'Miễn phí'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted flex items-center gap-1">
                    <Wrench className="w-3 h-3 text-slate-500 shrink-0" /> Dịch vụ:
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedRoom.serviceCost ? `${formatPrice(selectedRoom.serviceCost)}/tháng` : 'Miễn phí'}
                  </span>
                </div>
              </div>
            </div>

            {/* Address & Landlord Info Card */}
            <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-2 text-xs">
              <div className="flex items-start gap-2 text-foreground">
                <MapPin className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>{selectedRoom.address}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2 text-foreground">
                  <User className="w-4 h-4 text-teal-700 shrink-0" />
                  <span className="font-semibold">{selectedRoom.landlordName}</span>
                </div>
                {selectedRoom.landlordPhone && (
                  <div className="flex items-center gap-1.5 text-foreground-muted font-mono">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{selectedRoom.landlordPhone}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-foreground-muted pt-1 text-[11px]">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>Gửi duyệt: {selectedRoom.submittedAt}</span>
              </div>
            </div>

            {/* Description */}
            {selectedRoom.description && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-700" />
                  Mô tả bài đăng
                </h4>
                <div className="p-3 rounded-xl bg-surface-muted text-xs text-foreground/90 whitespace-pre-line leading-relaxed border border-border/60 max-h-48 overflow-y-auto">
                  {selectedRoom.description}
                </div>
              </div>
            )}

            {/* Amenities */}
            {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Tiện ích phòng ({selectedRoom.amenities.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRoom.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-medium"
                    >
                      <Check className="w-3 h-3 text-teal-600" />
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rules & Living Habits */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-foreground">Quy định & Nội quy phòng</h4>
              <div className="p-3 rounded-xl bg-surface-muted border border-border/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">Nuôi thú cưng:</span>
                  <span
                    className={`font-semibold ${
                      selectedRoom.allowPets ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground-muted'
                    }`}
                  >
                    {selectedRoom.allowPets ? 'Cho phép nuôi thú cưng' : 'Không cho phép'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">Nấu ăn trong phòng:</span>
                  <span
                    className={`font-semibold ${
                      selectedRoom.allowCooking ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground-muted'
                    }`}
                  >
                    {selectedRoom.allowCooking ? 'Cho phép nấu ăn' : 'Không cho phép'}
                  </span>
                </div>
                {selectedRoom.curfew && (
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted">Giờ giấc:</span>
                    <span className="font-semibold text-foreground">{selectedRoom.curfew}</span>
                  </div>
                )}
                {selectedRoom.houseRules && (
                  <p className="pt-1.5 border-t border-border/40 text-[11px] text-foreground-muted leading-relaxed">
                    Nội quy khác: {selectedRoom.houseRules}
                  </p>
                )}
              </div>
            </div>

            {/* Approval / Rejection Actions */}
            {selectedRoom.status === 'PENDING' && (
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    handleApprove(selectedRoom.id);
                    setSelectedRoom(null);
                  }}
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  {t('btnApprove')}
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => {
                    handleOpenReject(selectedRoom.id);
                    setSelectedRoom(null);
                  }}
                >
                  <X className="w-4 h-4 mr-1.5" />
                  {t('btnReject')}
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Reject Reason Dialog */}
      <Dialog
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={t('rejectModalTitle')}
        description={t('rejectModalDesc')}
      >
        <div className="space-y-4 pt-2">
          <textarea
            rows={3}
            placeholder={t('rejectReasonPlaceholder')}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full rounded-xl border border-border p-3 text-xs bg-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-teal-700/20"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRejectModalOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmReject}>
              {t('btnConfirmReject')}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default function AdminRoomsModerationPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AdminRoomsContent />
    </Suspense>
  );
}
