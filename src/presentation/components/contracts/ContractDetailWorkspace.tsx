'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Input } from '@/presentation/components/ui/Input';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { container } from '@/infrastructure/di/container';
import { Contract, ContractAmendment, ContractOccupant } from '@/domain/entities/Contract';
import { RoomDetailDto } from '@/application/dto/listing.dto';
import { User } from '@/domain/entities/User';
import { toast } from '@/presentation/stores/toast.store';
import {
  formatIsoDate,
  formatIsoDateTime,
  formatVnd,
  numberToVietnameseWords,
} from '@/shared/utils/format-vnd';
import { ContractOccupantsSection } from './ContractOccupantsSection';
import { ContractAmendmentsSection } from './ContractAmendmentsSection';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Droplets,
  ExternalLink,
  PenTool,
  Printer,
  ShieldCheck,
  UploadCloud,
  XCircle,
  Zap,
} from 'lucide-react';

interface ContractDetailWorkspaceProps {
  contractId: string;
  role: 'TENANT' | 'LANDLORD';
  backHref: string;
}

export function ContractDetailWorkspace({ contractId, role, backHref }: ContractDetailWorkspaceProps) {
  const t = useTranslations('sprint3.contract');
  const tc = useTranslations('sprint3.common');
  const [contract, setContract] = useState<Contract | null>(null);
  const [roomDetail, setRoomDetail] = useState<RoomDetailDto | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [occupants, setOccupants] = useState<ContractOccupant[]>([]);
  const [amendments, setAmendments] = useState<ContractAmendment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // OTP digital signing dialog
  const [signOpen, setSignOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [signatureText, setSignatureText] = useState('');

  // Physical scan upload dialog (Landlord)
  const [uploadScanOpen, setUploadScanOpen] = useState(false);
  const [scanUrl, setScanUrl] = useState('');

  // Tenant reject dialog
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [busy, setBusy] = useState(false);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [c, occ, amd, profile] = await Promise.all([
        container.contract.contractRepository.getContract(contractId),
        container.contract.contractRepository.getOccupants(contractId).catch(() => []),
        container.contract.contractRepository.getAmendments(contractId).catch(() => []),
        container.auth.getProfileUseCase.execute().catch(() => null),
      ]);
      setContract(c);
      setOccupants(occ);
      setAmendments(amd);
      setCurrentUser(profile);

      if (c?.roomId) {
        try {
          const res = await container.listing.getRoomDetailUseCase.execute(c.roomId);
          if (res?.room) {
            setRoomDetail(res.room);
          }
        } catch {
          // Fall back gracefully to data in contract
        }
      }
    } catch {
      toast.error(tc('loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [contractId, tc]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const updated =
        role === 'TENANT'
          ? await container.contract.contractRepository.signTenant(contractId, otp.trim(), signatureText.trim() || undefined)
          : await container.contract.contractRepository.signLandlord(contractId, otp.trim(), signatureText.trim() || undefined);
      setContract(updated);
      setSignOpen(false);
      setOtp('');
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      let blob: Blob;
      try {
        const { signedUrl } = await container.contract.contractRepository.getSignedPdfUrl(contractId);
        blob = await container.contract.contractRepository.downloadPdfBlob(signedUrl);
      } catch {
        blob = await container.contract.contractRepository.downloadDirectPdfBlob(contractId);
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contract?.contractCode || contractId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleUploadScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanUrl.trim()) return;
    setBusy(true);
    try {
      const updated = await container.contract.contractRepository.uploadPhysicalScan(contractId, scanUrl.trim());
      setContract(updated);
      setUploadScanOpen(false);
      setScanUrl('');
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  const handleTenantConfirm = async () => {
    setBusy(true);
    try {
      const updated = await container.contract.contractRepository.tenantConfirmPhysical(contractId);
      setContract(updated);
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  const handleTenantReject = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const updated = await container.contract.contractRepository.tenantRejectPhysical(
        contractId,
        rejectReason.trim() || undefined
      );
      setContract(updated);
      setRejectOpen(false);
      setRejectReason('');
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  if (isLoading || !contract) {
    return <Skeleton className="h-96 w-full max-w-4xl rounded-xl" />;
  }

  const alreadySigned = role === 'TENANT' ? Boolean(contract.tenantSignedAt) : Boolean(contract.landlordSignedAt);

  // Derived party details
  const contractDate = contract.createdAt ? new Date(contract.createdAt) : new Date();
  const day = contractDate.getDate();
  const month = contractDate.getMonth() + 1;
  const year = contractDate.getFullYear();

  const landlordName =
    role === 'LANDLORD' && currentUser?.fullName
      ? currentUser.fullName
      : roomDetail?.landlord?.name || `Chủ trọ (Mã #${contract.landlordId})`;
  const landlordPhone =
    role === 'LANDLORD' && currentUser?.phone
      ? currentUser.phone
      : roomDetail?.landlord?.phone || 'Theo thông tin đăng ký CozyNest';
  const landlordEmail =
    role === 'LANDLORD' && currentUser?.email
      ? currentUser.email
      : roomDetail?.landlord?.email || 'Theo thông tin tài khoản CozyNest';

  const tenantName =
    role === 'TENANT' && currentUser?.fullName
      ? currentUser.fullName
      : `Khách thuê (Mã #${contract.tenantId})`;
  const tenantPhone =
    role === 'TENANT' && currentUser?.phone
      ? currentUser.phone
      : 'Theo hồ sơ khách thuê CozyNest';
  const tenantEmail =
    role === 'TENANT' && currentUser?.email
      ? currentUser.email
      : 'Theo tài khoản khách thuê CozyNest';

  const roomTitle = roomDetail?.title || `Phòng trọ #${contract.roomId}`;
  const roomAddress =
    roomDetail?.address ||
    (roomDetail?.provinceName ? `${roomDetail?.wardName ? `${roomDetail.wardName}, ` : ''}${roomDetail.provinceName}` : 'Địa chỉ phòng theo danh mục hệ thống CozyNest');
  const roomArea = roomDetail?.area || 25;

  const initialElec = contract.initialElectricityReading ?? roomDetail?.initialElectricityReading ?? 0;
  const initialWater = contract.initialWaterReading ?? roomDetail?.initialWaterReading ?? 0;
  const elecRate = contract.electricityRate ?? roomDetail?.electricityCost ?? 3500;
  const waterRate = contract.waterRate ?? roomDetail?.waterCost ?? 25000;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="print:hidden">
        <Breadcrumb items={[{ label: t('tenantTitle'), href: backHref }, { label: contract.contractCode }]} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">{contract.contractCode}</h1>
            <Badge variant={contract.status === 'ACTIVE' ? 'success' : 'warning'} size="md">
              {contract.status}
            </Badge>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">{t('legalRef')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            onClick={handlePrint}
          >
            {t('printContract')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleDownloadPdf}
          >
            {t('downloadPdf')}
          </Button>
          {!alreadySigned && contract.status !== 'ACTIVE' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PenTool className="w-3.5 h-3.5" />}
              onClick={() => setSignOpen(true)}
            >
              {t('signNow')}
            </Button>
          )}
        </div>
      </div>

      {/* Physical Paper Signing & Scan Verification Section */}
      <Card className="p-5 border-l-4 border-l-teal-600 space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                {t('physicalSigningTitle')}
              </h2>
              <p className="text-xs text-stone-500">
                {t('physicalStatusLabel')}:{' '}
                <strong className="text-stone-700 dark:text-stone-300">
                  {contract.physicalContractStatus || 'PENDING_PHYSICAL_SIGN'}
                </strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {contract.physicalContractScanUrl && (
              <a
                href={contract.physicalContractScanUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-teal-600 hover:underline font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {t('viewScan')}
              </a>
            )}
            {role === 'LANDLORD' && contract.status !== 'ACTIVE' && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
                onClick={() => setUploadScanOpen(true)}
              >
                {t('uploadScanBtn')}
              </Button>
            )}
          </div>
        </div>

        {/* Tenant Confirmation Banner */}
        {role === 'TENANT' && contract.physicalContractStatus === 'WAITING_TENANT_CONFIRMATION' && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                <p className="font-semibold">{t('tenantConfirmPrompt')}</p>
                <p>
                  Chủ trọ đã tải lên bản scan hợp đồng ký tay. Vui lòng đối chiếu các thông tin trên hợp đồng, đặc biệt là chỉ số điện nước ban đầu:
                </p>
                <div className="flex flex-wrap gap-4 pt-1 font-semibold text-amber-900 dark:text-amber-100">
                  <span>⚡ Chỉ số điện ban đầu: {initialElec} kWh ({formatVnd(elecRate)}/kWh)</span>
                  <span>💧 Chỉ số nước ban đầu: {initialWater} m³ ({formatVnd(waterRate)}/m³)</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={handleTenantConfirm}
                isLoading={busy}
              >
                {t('tenantConfirmBtn')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
                onClick={() => setRejectOpen(true)}
              >
                {t('tenantRejectBtn')}
              </Button>
            </div>
          </div>
        )}

        {/* Tenant Rejected Notice */}
        {contract.physicalContractStatus === 'REJECTED_BY_TENANT' && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{t('scanRejectedNotice')}</p>
              <p className="italic mt-0.5">{contract.tenantRejectReason || 'Khách thuê phát hiện sai lệch thông tin'}</p>
            </div>
          </div>
        )}

        {/* Successfully Active Notice */}
        {contract.status === 'ACTIVE' && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('physicalSignedNotice')}</span>
          </div>
        )}
      </Card>

      {/* Official Vietnamese Residential Lease Contract Document (Matching User's 4-Page Format) */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md rounded-2xl p-8 sm:p-12 max-w-4xl space-y-7 text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-serif leading-relaxed print:p-0 print:border-none print:shadow-none print:bg-transparent print:text-black">
        {/* National Header */}
        <div className="text-center space-y-1 border-b border-stone-200 dark:border-stone-800 pb-5">
          <p className="font-bold uppercase tracking-wider text-sm sm:text-base">
            CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </p>
          <p className="font-semibold text-xs sm:text-sm">Độc lập - Tự do - Hạnh phúc</p>
          <p className="italic text-stone-400 text-xs">---------o0o---------</p>
          <h2 className="text-lg sm:text-2xl font-bold uppercase pt-3 tracking-wide text-stone-950 dark:text-stone-50">
            HỢP ĐỒNG THUÊ NHÀ
          </h2>
          <p className="text-xs text-stone-500 font-mono">
            Mã hợp đồng: <strong>{contract.contractCode}</strong> | Ngày lập: {day}/{month}/{year}
          </p>
        </div>

        {/* Legal Bases */}
        <div className="space-y-1 text-xs sm:text-sm italic text-stone-700 dark:text-stone-300">
          <p>- Căn cứ Bộ Luật Dân sự của Quốc Hội nước CHXHCN Việt Nam năm 2015;</p>
          <p>- Căn cứ Luật Nhà ở số 27/2023/QH15 của Quốc Hội nước CHXHCN Việt Nam;</p>
          <p>- Căn cứ nhu cầu và khả năng của các Bên tham gia giao dịch;</p>
        </div>

        <p className="text-xs sm:text-sm">
          Hôm nay, ngày <strong>{day}</strong> tháng <strong>{month}</strong> năm <strong>{year}</strong>, tại địa chỉ: <strong>{roomAddress}</strong>, chúng tôi gồm có:
        </p>

        {/* Parties Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* Bên A - Chủ trọ */}
          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 space-y-1.5 text-xs sm:text-sm">
            <p className="font-bold uppercase tracking-wide text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-1">
              BÊN CHO THUÊ (Sau đây gọi tắt là Bên A):
            </p>
            <p>
              Ông/Bà: <strong className="text-stone-950 dark:text-stone-50">{landlordName}</strong>
            </p>
            <p>
              Mã chủ trọ trên hệ thống: <strong className="font-mono">{contract.landlordId}</strong>
            </p>
            <p>
              Số điện thoại: <strong>{landlordPhone}</strong>
            </p>
            <p>
              Email liên hệ: <strong>{landlordEmail}</strong>
            </p>
            <p className="text-[11px] text-stone-500">
              Đại diện cho thuê và quản lý tài sản tại nền tảng CozyNest.
            </p>
          </div>

          {/* Bên B - Khách thuê */}
          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 space-y-1.5 text-xs sm:text-sm">
            <p className="font-bold uppercase tracking-wide text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-1">
              BÊN THUÊ (Sau đây gọi tắt là Bên B):
            </p>
            <p>
              Ông/Bà: <strong className="text-stone-950 dark:text-stone-50">{tenantName}</strong>
            </p>
            <p>
              Mã khách thuê trên hệ thống: <strong className="font-mono">{contract.tenantId}</strong>
            </p>
            <p>
              Số điện thoại: <strong>{tenantPhone}</strong>
            </p>
            <p>
              Email liên hệ: <strong>{tenantEmail}</strong>
            </p>
            <p className="text-[11px] text-stone-500">
              Mã yêu cầu thuê tương ứng: <strong className="font-mono">{contract.requestId || 'N/A'}</strong>
            </p>
          </div>
        </div>

        <p className="italic text-xs sm:text-sm">
          Hai Bên tự nguyện cùng nhau thống nhất lập và ký kết Hợp đồng này để thực hiện việc thuê và cho thuê tài sản theo các thỏa thuận chi tiết sau đây:
        </p>

        {/* ĐIỀU 1 */}
        <section className="space-y-2">
          <h3 className="font-bold text-sm sm:text-base uppercase tracking-wide text-stone-900 dark:text-stone-100">
            ĐIỀU 1: DIỆN TÍCH CHO THUÊ VÀ MỤC ĐÍCH THUÊ
          </h3>
          <p>
            <strong>1.1</strong> Bên A đồng ý cho Bên B thuê, Bên B đồng ý thuê của Bên A toàn bộ phòng/nhà ở: <strong>{roomTitle}</strong> (Mã phòng: <strong>#{contract.roomId}</strong>) tại địa chỉ: <strong>{roomAddress}</strong>.
          </p>
          <p>
            Diện tích sử dụng: <strong>{roomArea} m²</strong>. Hiện trạng tài sản: Phòng khép kín, tình trạng kỹ thuật và vệ sinh bảo đảm tốt, trang bị hệ thống đồng hồ điện và công tơ nước độc lập. (Sau đây gọi tắt là &quot;Tài sản&quot; hoặc &quot;Tài sản thuê&quot;).
          </p>
          <p>
            <strong>1.2</strong> Mục đích thuê: Dùng để ở sinh hoạt và cư trú hợp pháp. Bên B cam kết không sử dụng tài sản thuê vào bất kỳ mục đích kinh doanh trái phép, gây mất an ninh trật tự hoặc các mục đích khác trái pháp luật.
          </p>
        </section>

        {/* ĐIỀU 2 */}
        <section className="space-y-2">
          <h3 className="font-bold text-sm sm:text-base uppercase tracking-wide text-stone-900 dark:text-stone-100">
            ĐIỀU 2: THỜI HẠN THUÊ, GIA HẠN VÀ CHẤM DỨT HỢP ĐỒNG
          </h3>
          <p>
            <strong>2.1</strong> Thời hạn thuê là từ ngày <strong>{formatIsoDate(contract.startDate)}</strong> đến hết ngày <strong>{formatIsoDate(contract.endDate)}</strong>.
          </p>
          <p>
            <strong>2.2</strong> Bên A bàn giao quyền sử dụng tài sản thuê cho Bên B vào ngày <strong>{formatIsoDate(contract.startDate)}</strong>.
          </p>
          <p>
            <strong>2.3</strong> Hợp đồng này có hiệu lực thi hành kể từ ngày các bên ký kết hoặc bản chụp/scan hợp đồng có chữ ký hợp lệ được tải lên và xác nhận trên hệ thống CozyNest.
          </p>
          <p>
            <strong>2.4</strong> Hợp đồng sẽ đương nhiên chấm dứt khi xảy ra các trường hợp sau:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>
              <strong>2.5</strong> Hết thời hạn thuê quy định tại Khoản 2.1 mà các bên không thống nhất gia hạn;
            </li>
            <li>
              <strong>2.6</strong> Nếu Bên B không thanh toán tiền nhà sau 15 (mười lăm) ngày kể từ ngày đến hạn thanh toán của mỗi đợt thì Bên A có quyền đơn phương chấm dứt Hợp đồng và Bên B không được bồi thường bất cứ một khoản chi phí nào;
            </li>
            <li>
              <strong>2.7</strong> Chấm dứt hợp đồng theo quy định của pháp luật hiện hành hoặc cơ quan nhà nước có thẩm quyền;
            </li>
            <li>
              <strong>2.8</strong> Trường hợp một trong hai bên chấm dứt Hợp đồng trước thời hạn:
              <ul className="list-none pl-4 space-y-1 pt-1 text-stone-700 dark:text-stone-300">
                <li>
                  + <em>Trường hợp Bên A chấm dứt trước thời hạn:</em> Bên A phải thông báo cho Bên B biết trước ít nhất <strong>30 ngày (01 tháng)</strong> bằng văn bản; hoàn trả cho Bên B số tiền thuê mà Bên B đã trả trước cho khoảng thời gian chưa sử dụng (nếu có); đồng thời hoàn trả toàn bộ tiền đặt cọc và bồi thường thêm một khoản tiền tương đương tiền đặt cọc theo quy định tại Điều 3.
                </li>
                <li>
                  + <em>Trường hợp Bên B chấm dứt trước thời hạn:</em> Bên B phải thông báo cho Bên A biết trước ít nhất <strong>30 ngày</strong> bằng văn bản; thanh toán đầy đủ các chi phí tiện ích tính đến ngày bàn giao nhà; và được Bên A hoàn trả số tiền thuê đã trả trước chưa sử dụng (nếu có). Tiền đặt cọc sẽ được xử lý theo thỏa thuận tại Điều 3.
                </li>
              </ul>
            </li>
            <li>
              <strong>2.9</strong> Trường hợp một trong hai bên muốn chấm dứt Hợp đồng trước thời hạn thì Bên A được quyền tiếp nhận lại tài sản thuê đúng ngày đã thông báo sau khi hai bên đã hoàn tất đối soát công nợ.
            </li>
            <li>
              <strong>2.10</strong> Việc một trong hai bên không thực hiện, thực hiện không đầy đủ hay thực hiện chậm các nghĩa vụ của mình theo Hợp đồng này sẽ không bị coi là vi phạm nếu nguyên nhân do thiên tai, dịch bệnh, chiến tranh, hỏa hoạn hoặc sự kiện bất khả kháng theo quy định của pháp luật.
            </li>
          </ul>
        </section>

        {/* ĐIỀU 3 */}
        <section className="space-y-2">
          <h3 className="font-bold text-sm sm:text-base uppercase tracking-wide text-stone-900 dark:text-stone-100">
            ĐIỀU 3: GIÁ THUÊ, ĐẶT CỌC VÀ PHƯƠNG THỨC THANH TOÁN
          </h3>
          <p>
            <strong>3.1 Giá cho thuê:</strong>
          </p>
          <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 space-y-1">
            <p>
              Số tiền thuê hàng tháng là: <strong className="text-teal-700 dark:text-teal-300 text-base">{formatVnd(contract.monthlyRent)}</strong> / 01 tháng.
            </p>
            <p className="italic text-stone-600 dark:text-stone-400">
              (Bằng chữ: <strong>{numberToVietnameseWords(contract.monthlyRent)}</strong>).
            </p>
            <p className="text-xs text-stone-500">
              Giá thuê trên áp dụng ổn định trong suốt thời hạn hợp đồng, chưa bao gồm các khoản thuế hoặc chi phí dịch vụ tiện ích phát sinh thực tế.
            </p>
          </div>

          <p>
            <strong>3.2 Tiền đặt cọc:</strong>
          </p>
          <div className="space-y-1.5 pl-2">
            <p>
              Bên B bàn giao cho Bên A một khoản tiền là: <strong>{formatVnd(contract.depositAmount)}</strong> (Bằng chữ: <strong>{numberToVietnameseWords(contract.depositAmount)}</strong>) ngay sau khi ký Hợp đồng này. Số tiền này là tiền đặt cọc để bảo đảm thực hiện nghiêm túc Hợp đồng cho thuê nhà kể từ ngày hợp đồng có hiệu lực.
            </p>
            <p>
              - Nếu Bên B đơn phương chấm dứt hợp đồng mà không thực hiện nghĩa vụ thông báo trước đúng thời hạn tới Bên A thì Bên A sẽ không phải hoàn trả lại Bên B số tiền đặt cọc này.
            </p>
            <p>
              - Nếu Bên A đơn phương chấm dứt hợp đồng mà không thực hiện nghĩa vụ thông báo trước đúng thời hạn tới Bên B thì Bên A sẽ phải hoàn trả lại Bên B số tiền đặt cọc và bồi thường thêm một khoản tiền bằng chính số tiền đặt cọc.
            </p>
            <p>
              - Vào thời điểm kết thúc Thời Hạn Thuê hoặc kể từ ngày Chấm dứt Hợp Đồng hợp pháp, Bên A sẽ hoàn lại cho Bên B toàn bộ số Tiền Đặt Cọc sau khi đã khấu trừ khoản tiền chi phí để khắc phục thiệt hại hư hỏng trang thiết bị hoặc công nợ tiện ích chưa thanh toán (nếu có).
            </p>
          </div>

          <p>
            <strong>3.3 Chu kỳ thanh toán:</strong> Bên B sẽ thanh toán tiền thuê tài sản cho Bên A theo định kỳ <strong>{contract.paymentCycleMonths || 1} tháng/lần</strong>, hoàn tất trước ngày <strong>{contract.paymentDueDay || 5}</strong> của mỗi kỳ thanh toán.
          </p>
          <p>
            <strong>3.4 Phương thức thanh toán:</strong> Thanh toán trực tuyến an toàn thông qua cổng thanh toán bảo đảm của nền tảng <strong>CozyNest</strong> (hoặc chuyển khoản vào số tài khoản ngân hàng do Bên A chỉ định). Hệ thống CozyNest sẽ tự động xuất hóa đơn và biên lai điện tử đối soát cho mỗi lần thanh toán thành công.
          </p>
        </section>

        {/* ĐIỀU 4 */}
        <section className="space-y-2">
          <h3 className="font-bold text-sm sm:text-base uppercase tracking-wide text-stone-900 dark:text-stone-100">
            ĐIỀU 4: PHÍ DỊCH VỤ VÀ BÀN GIAO CHỈ SỐ CÔNG TƠ TIỆN ÍCH BAN ĐẦU
          </h3>
          <p>
            <strong>4.1</strong> Bên A và Bên B thống nhất ghi nhận biên bản bàn giao chỉ số công tơ tiện ích ban đầu tại thời điểm Bên B bắt đầu nhận phòng như sau:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  Chỉ số ĐIỆN ban đầu: <strong>{initialElec} kWh</strong>
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Đơn giá: <strong>{formatVnd(elecRate)}</strong> / kWh
                </p>
                <p className="text-[11px] text-stone-400">Công tơ điện đo lường độc lập</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Droplets className="w-5 h-5 text-sky-500" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  Chỉ số NƯỚC ban đầu: <strong>{initialWater} m³</strong>
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Đơn giá: <strong>{formatVnd(waterRate)}</strong> / m³
                </p>
                <p className="text-[11px] text-stone-400">Đồng hồ nước đo lường độc lập</p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pl-2">
            <p>
              - Cước phí Internet / Wifi: <strong>{roomDetail?.internetCost ? `${formatVnd(roomDetail.internetCost)} / tháng` : 'Theo thỏa thuận / Gói mạng dùng chung'}</strong>.
            </p>
            <p>
              - Phí dịch vụ chung (vệ sinh, rác, vận hành chung): <strong>{roomDetail?.serviceCost ? `${formatVnd(roomDetail.serviceCost)} / tháng` : 'Theo thỏa thuận / Nội quy nhà trọ'}</strong>.
            </p>
            <p>
              <strong>4.2</strong> Hàng tháng, Bên A có trách nhiệm ghi nhận chỉ số công tơ điện nước tiêu thụ thực tế của kỳ, cập nhật số liệu và tải ảnh chụp mặt đồng hồ công tơ minh chứng lên hệ thống CozyNest. Bên B có quyền đối chiếu số liệu và hình ảnh công tơ thực tế trước khi thanh toán hóa đơn.
            </p>
            <p>
              <strong>4.3</strong> Các khoản thuế, phí và lệ phí riêng biệt (nếu có) phát sinh do bên nào thì bên đó tự chịu trách nhiệm thanh toán theo quy định của pháp luật.
            </p>
          </div>
        </section>

        {/* ĐIỀU 5 */}
        <section className="space-y-2">
          <h3 className="font-bold text-sm sm:text-base uppercase tracking-wide text-stone-900 dark:text-stone-100">
            ĐIỀU 5: QUYỀN VÀ NGHĨA VỤ CỦA BÊN A
          </h3>
          <p>
            <strong>5.1 Nghĩa vụ của Bên A:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Bàn giao tài sản cho Bên B trong tình trạng vệ sinh sạch sẽ, trang thiết bị hoạt động an toàn theo đúng thỏa thuận;</li>
            <li>Bảo đảm cho Bên B quyền sử dụng ổn định và độc lập tài sản thuê trong suốt thời hạn hợp đồng;</li>
            <li>Tạo điều kiện thuận lợi để Bên B sử dụng điện, nước và các dịch vụ thiết yếu phục vụ sinh hoạt;</li>
            <li>Có trách nhiệm phối hợp thực hiện thủ tục đăng ký tạm trú cho Bên B và người cùng ở tại cơ quan Công an địa phương theo quy định. Kịp thời gia hạn tạm trú khi Bên B cung cấp đầy đủ giấy tờ tùy thân.</li>
          </ul>
          <p>
            <strong>5.2 Quyền của Bên A:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Nhận đủ tiền thuê tài sản và các khoản phí dịch vụ theo đúng kỳ hạn đã thỏa thuận;</li>
            <li>Yêu cầu Bên B bồi thường thiệt hại nếu Bên B làm hư hỏng, mất mát tài sản do lỗi chủ quan;</li>
            <li>Cải tạo, sửa chữa, nâng cấp tài sản thuê khi được Bên B đồng ý và không làm xáo trộn sinh hoạt bất hợp lý.</li>
          </ul>
        </section>

        {/* ĐIỀU 6 */}
        <section className="space-y-2">
          <h3 className="font-bold text-sm sm:text-base uppercase tracking-wide text-stone-900 dark:text-stone-100">
            ĐIỀU 6: QUYỀN VÀ NGHĨA VỤ CỦA BÊN B
          </h3>
          <p>
            <strong>6.1 Nghĩa vụ của Bên B:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Sử dụng tài sản đúng mục đích đã thỏa thuận (dùng để ở và sinh hoạt);</li>
            <li>Trả đủ tiền thuê tài sản và các chi phí điện, nước, tiện ích đúng kỳ hạn đã cam kết;</li>
            <li>Giữ gìn, bảo quản tài sản thuê, tự chịu trách nhiệm sửa chữa những hư hỏng nhỏ do mình gây ra trong quá trình sử dụng;</li>
            <li>Tôn trọng nếp sống văn minh đô thị, quy tắc sinh hoạt tập thể và giữ gìn an ninh trật tự chung khu vực cư trú;</li>
            <li>Phải tự bảo quản tài sản của mình, bảo vệ tài sản chung, giữ gìn vệ sinh chung, có trách nhiệm cao trong công tác phòng cháy chữa cháy (PCCC);</li>
            <li>Không được tự ý thay đổi kết cấu, đục khoét, sửa chữa hiện trạng ban đầu của tài sản thuê nếu không được sự đồng ý bằng văn bản của Bên A;</li>
            <li>Nếu gây ra những hư hỏng do lỗi chủ quan thì Bên B phải chịu trách nhiệm bồi thường thiệt hại theo giá thị trường;</li>
            <li>Tuyệt đối không được sử dụng tài sản thuê để tàng trữ hàng cấm, vũ khí, chất cháy nổ hoặc tổ chức các hoạt động vi phạm pháp luật;</li>
            <li>Bàn giao lại tài sản cho Bên A trong tình trạng sạch sẽ, nguyên vẹn khi chấm dứt hợp đồng.</li>
          </ul>
          <p>
            <strong>6.2 Quyền của Bên B:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Nhận bàn giao tài sản thuê và trang thiết bị theo đúng thỏa thuận;</li>
            <li>Yêu cầu Bên A kịp thời sửa chữa các hư hỏng kết cấu lớn khách quan nhằm bảo đảm điều kiện sinh hoạt an toàn.</li>
          </ul>
        </section>

        {/* ĐIỀU 7 */}
        <section className="space-y-2">
          <h3 className="font-bold text-sm sm:text-base uppercase tracking-wide text-stone-900 dark:text-stone-100">
            ĐIỀU 7: GIẢI QUYẾT TRANH CHẤP
          </h3>
          <p>
            Trong quá trình thực hiện Hợp đồng này, nếu phát sinh tranh chấp, các bên cùng nhau thương lượng giải quyết trên nguyên tắc tôn trọng quyền lợi của nhau; trong trường hợp không thương lượng được thì một trong hai bên có quyền khởi kiện để yêu cầu Tòa án nhân dân có thẩm quyền giải quyết theo quy định của pháp luật.
          </p>
        </section>

        {/* ĐIỀU 8 */}
        <section className="space-y-2">
          <h3 className="font-bold text-sm sm:text-base uppercase tracking-wide text-stone-900 dark:text-stone-100">
            ĐIỀU 8: CÁC ĐIỀU KHOẢN CHUNG
          </h3>
          <p>
            <strong>8.1</strong> Hợp đồng này thay thế cho toàn bộ các thỏa thuận miệng, hoặc bằng văn bản trước đó được ký kết giữa hai Bên liên quan đến nội dung Hợp đồng.
          </p>
          <p>
            <strong>8.2</strong> Mọi sửa đổi hoặc bổ sung Hợp đồng này phải được lập thành văn bản (Phụ lục hợp đồng) và được ký bởi đại diện của các Bên tham gia Hợp đồng.
          </p>
          <p>
            <strong>8.3</strong> Hiệu lực của từng điều khoản của Hợp đồng mang tính độc lập. Việc một vài điều khoản vô hiệu không làm ảnh hưởng đến hiệu lực của các điều khoản còn lại của Hợp đồng.
          </p>
          <p>
            <strong>8.4</strong> Hợp đồng được lập thành 02 (hai) bản có giá trị pháp lý như nhau, mỗi bên giữ 01 (một) bản làm căn cứ thi hành. Bản điện tử có giá trị đối soát toàn vẹn trên hệ thống CozyNest.
          </p>
          {contract.terms && (
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs">
              <p className="font-semibold text-stone-800 dark:text-stone-200 mb-0.5">Thỏa thuận riêng bổ sung:</p>
              <p className="whitespace-pre-wrap">{contract.terms}</p>
            </div>
          )}
        </section>

        {/* Signature Section - 2 Columns (Matching User's Format) */}
        <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-stone-300 dark:border-stone-700">
          {/* Bên A - Chủ trọ */}
          <div className="text-center space-y-2">
            <p className="font-bold uppercase tracking-wide text-xs sm:text-sm text-stone-950 dark:text-stone-50">
              BÊN CHO THUÊ TÀI SẢN (Bên A)
            </p>
            <p className="italic text-stone-500 text-xs">(Ký/điểm chỉ, ghi rõ họ tên)</p>

            <div className="h-28 flex flex-col items-center justify-center my-2">
              {contract.landlordSignedAt ? (
                <div className="inline-flex flex-col items-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-700 dark:text-emerald-300 text-xs">
                  <CheckCircle2 className="w-5 h-5 mb-0.5" />
                  <span className="font-bold">ĐÃ KÝ SỐ ĐIỆN TỬ</span>
                  <span className="text-[10px]">{formatIsoDateTime(contract.landlordSignedAt)}</span>
                </div>
              ) : contract.physicalContractScanUrl ? (
                <div className="inline-flex flex-col items-center p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-300 text-teal-700 dark:text-teal-300 text-xs">
                  <CheckCircle2 className="w-5 h-5 mb-0.5" />
                  <span className="font-bold">ĐÃ KÝ TAY TRÊN BẢN SCAN</span>
                  <span className="text-[10px]">Đã đính kèm minh chứng hợp đồng</span>
                </div>
              ) : (
                <div className="text-stone-300 dark:text-stone-600 italic text-xs">
                  (Ký tên và đóng dấu nếu có)
                </div>
              )}
            </div>

            <p className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
              Họ và tên: <strong>{landlordName}</strong>
            </p>
          </div>

          {/* Bên B - Khách thuê */}
          <div className="text-center space-y-2">
            <p className="font-bold uppercase tracking-wide text-xs sm:text-sm text-stone-950 dark:text-stone-50">
              BÊN THUÊ TÀI SẢN (Bên B)
            </p>
            <p className="italic text-stone-500 text-xs">(Ký/điểm chỉ, ghi rõ họ tên)</p>

            <div className="h-28 flex flex-col items-center justify-center my-2">
              {contract.tenantSignedAt ? (
                <div className="inline-flex flex-col items-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-700 dark:text-emerald-300 text-xs">
                  <CheckCircle2 className="w-5 h-5 mb-0.5" />
                  <span className="font-bold">ĐÃ KÝ SỐ ĐIỆN TỬ</span>
                  <span className="text-[10px]">{formatIsoDateTime(contract.tenantSignedAt)}</span>
                </div>
              ) : contract.tenantConfirmedAt ? (
                <div className="inline-flex flex-col items-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-700 dark:text-emerald-300 text-xs">
                  <CheckCircle2 className="w-5 h-5 mb-0.5" />
                  <span className="font-bold">ĐÃ XÁC NHẬN BẢN KÝ TAY</span>
                  <span className="text-[10px]">{formatIsoDateTime(contract.tenantConfirmedAt)}</span>
                </div>
              ) : (
                <div className="text-stone-300 dark:text-stone-600 italic text-xs">
                  (Ký và ghi rõ họ tên)
                </div>
              )}
            </div>

            <p className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
              Họ và tên: <strong>{tenantName}</strong>
            </p>
          </div>
        </div>

        {contract.documentHash && (
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-400 font-mono break-all text-center">
            {t('docHash')}: {contract.documentHash}
          </div>
        )}
      </div>

      <div className="print:hidden space-y-6">
        <ContractOccupantsSection
          contractId={contractId}
          role={role}
          occupants={occupants}
          onOccupantAdded={(added) => setOccupants((prev) => [...prev, added])}
          onOccupantRemoved={(id) => setOccupants((prev) => prev.filter((item) => item.id !== id))}
        />

        <ContractAmendmentsSection
          contract={contract}
          role={role}
          amendments={amendments}
          onAmendmentCreated={(created) => setAmendments((prev) => [created, ...prev])}
          onAmendmentSigned={async (updated) => {
            setAmendments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
            await loadAll();
          }}
        />
      </div>

      {/* OTP Digital Sign Dialog */}
      <Dialog isOpen={signOpen} onClose={() => setSignOpen(false)} title={t('signTitle')} size="sm">
        <form onSubmit={handleSign} className="space-y-4 pt-2">
          <Input
            label={t('otpLabel')}
            required
            pattern="[0-9]{6}"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            helperText="Nhập mã OTP 6 số để xác thực ký hợp đồng."
          />
          <Input
            label={t('signatureLabel')}
            value={signatureText}
            onChange={(e) => setSignatureText(e.target.value)}
            placeholder={role === 'TENANT' ? tenantName : landlordName}
            helperText="Họ tên hoặc chữ ký điện tử xác nhận của bạn."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setSignOpen(false)}>
              {tc('cancel')}
            </Button>
            <Button variant="primary" type="submit" isLoading={busy}>
              {t('signNow')}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Landlord Upload Physical Scan Dialog */}
      <Dialog
        isOpen={uploadScanOpen}
        onClose={() => setUploadScanOpen(false)}
        title={t('uploadScanTitle')}
        size="md"
      >
        <form onSubmit={handleUploadScan} className="space-y-4 pt-2">
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Vui lòng in mẫu hợp đồng chuẩn phía trên ra giấy (A4), hai bên ký tên và điểm chỉ, sau đó chụp hoặc scan và tải lên đường dẫn ảnh/tài liệu hợp đồng.
          </p>
          <Input
            label={t('scanUrlLabel')}
            required
            type="url"
            value={scanUrl}
            onChange={(e) => setScanUrl(e.target.value)}
            placeholder={t('scanUrlPlaceholder')}
            helperText="Hỗ trợ liên kết ảnh Google Drive, Cloudinary hoặc S3 chứa bản scan hợp đồng đã ký."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setUploadScanOpen(false)}>
              {tc('cancel')}
            </Button>
            <Button variant="primary" type="submit" isLoading={busy}>
              {tc('confirm')}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Tenant Reject Dialog */}
      <Dialog
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title={t('tenantRejectTitle')}
        size="md"
      >
        <form onSubmit={handleTenantReject} className="space-y-4 pt-2">
          <Input
            label={t('rejectReasonLabel')}
            required
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={t('rejectReasonPlaceholder')}
            helperText="Nêu rõ điểm sai lệch (ví dụ: sai số điện nước ban đầu, giá cọc không đúng thỏa thuận...) để chủ trọ chỉnh sửa."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setRejectOpen(false)}>
              {tc('cancel')}
            </Button>
            <Button variant="primary" type="submit" isLoading={busy}>
              {tc('confirm')}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
