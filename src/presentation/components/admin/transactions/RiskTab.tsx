'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { RiskProfile } from '@/domain/entities/Billing';
import { formatVnd } from '@/shared/utils/format-vnd';
import { AlertOctagon, Lock, RefreshCw, ShieldAlert, ShieldCheck, Unlock } from 'lucide-react';

interface RiskTabProps {
  profiles: RiskProfile[];
  onFreeze: (userId: string, reason?: string) => Promise<void>;
  onUnfreeze: (userId: string) => Promise<void>;
  onBlacklist: (userId: string, reason?: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function RiskTab({
  profiles,
  onFreeze,
  onUnfreeze,
  onBlacklist,
  onRefresh,
}: RiskTabProps) {
  const [busy, setBusy] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');
  const [targetReason, setTargetReason] = useState('');

  const frozenCount = profiles.filter((p) => p.frozen).length;
  const blacklistedCount = profiles.filter((p) => p.blacklisted).length;

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!targetUserId.trim()) return;
            setBusy(true);
            try {
              await onFreeze(targetUserId.trim(), targetReason.trim() || undefined);
              setTargetUserId('');
              setTargetReason('');
            } finally {
              setBusy(false);
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
        >
          <Input label="User ID cần phong tỏa mới" placeholder="VD: u-landlord-02" required value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} />
          <Input label="Lý do phong tỏa" placeholder="Nghi ngờ bất thường..." value={targetReason} onChange={(e) => setTargetReason(e.target.value)} />
          <Button type="submit" variant="outline" size="md" isLoading={busy} leftIcon={<Lock className="w-3.5 h-3.5" />}>
            Phong tỏa ví
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="md"
            className="text-rose-600"
            isLoading={busy}
            leftIcon={<AlertOctagon className="w-3.5 h-3.5" />}
            onClick={async () => {
              if (!targetUserId.trim()) return;
              setBusy(true);
              try {
                await onBlacklist(targetUserId.trim(), targetReason.trim() || undefined);
                setTargetUserId('');
                setTargetReason('');
              } finally {
                setBusy(false);
              }
            }}
          >
            Đưa vào Blacklist
          </Button>
        </form>
      </Card>
      {/* Risk Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Tổng tài khoản theo dõi rủi ro</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100">{profiles.length}</p>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Đang bị phong tỏa (Frozen)</span>
            <Lock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600">{frozenCount}</p>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Cấm giao dịch (Blacklist)</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600">{blacklistedCount}</p>
        </Card>
      </div>

      {/* Profiles Table */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-teal-600" />
            <span>Hồ sơ Kiểm soát Rủi ro Tài chính &amp; Chống Rút tiền Trái phép (FIN-RISK-01)</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            isLoading={busy}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={async () => {
              setBusy(true);
              try {
                await onRefresh();
              } finally {
                setBusy(false);
              }
            }}
          >
            Làm mới
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã người dùng</TableHead>
              <TableHead>Hạn mức ngày</TableHead>
              <TableHead>Đã rút hôm nay</TableHead>
              <TableHead>Tần suất ngày</TableHead>
              <TableHead>Khóa 24h đổi Bank</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-xs py-6 text-stone-500">
                  Chưa có hồ sơ rủi ro nào được ghi nhận
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((p) => {
                const isBankLocked = Boolean(p.bankChangedAt);
                return (
                  <TableRow key={p.userId}>
                    <TableCell className="font-mono text-xs font-bold">{p.userId}</TableCell>
                    <TableCell className="text-xs font-semibold">{formatVnd(p.dailyLimit)}</TableCell>
                    <TableCell className="text-xs font-bold text-teal-700">{formatVnd(p.dailyWithdrawnAmount)}</TableCell>
                    <TableCell className="text-xs">
                      <span className="font-mono">{p.velocityCount}</span> / 3 lần
                    </TableCell>
                    <TableCell className="text-xs">
                      {isBankLocked ? (
                        <Badge variant="warning" size="sm">Đang khóa 24h</Badge>
                      ) : (
                        <span className="text-stone-400">Không</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.blacklisted ? (
                        <Badge variant="danger" size="sm">Blacklist</Badge>
                      ) : p.frozen ? (
                        <Badge variant="warning" size="sm">Đóng băng</Badge>
                      ) : (
                        <Badge variant="success" size="sm">Bình thường</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        {p.frozen ? (
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Unlock className="w-3.5 h-3.5" />}
                            onClick={() => onUnfreeze(p.userId)}
                          >
                            Mở khóa
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-amber-600 hover:bg-amber-50"
                            leftIcon={<Lock className="w-3.5 h-3.5" />}
                            onClick={() => {
                              const reason = window.prompt('Nhập lý do phong tỏa tài khoản ví:');
                              if (reason !== null) {
                                onFreeze(p.userId, reason.trim() || undefined);
                              }
                            }}
                          >
                            Phong tỏa
                          </Button>
                        )}
                        {!p.blacklisted && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:bg-rose-50"
                            leftIcon={<AlertOctagon className="w-3.5 h-3.5" />}
                            onClick={() => {
                              const reason = window.prompt('Nhập lý do đưa vào Blacklist cấm giao dịch:');
                              if (reason !== null) {
                                onBlacklist(p.userId, reason.trim() || undefined);
                              }
                            }}
                          >
                            Cấm giao dịch
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
