'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/presentation/components/ui/Table';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { useDlqManagement } from '@/presentation/hooks/useDlqManagement';
import { DeadLetterMessage } from '@/domain/entities/DeadLetterMessage';
import { DlqPayloadDialog } from '@/presentation/components/admin/DlqPayloadDialog';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Layers,
  RefreshCw,
  RotateCcw,
  Server,
  Trash2,
} from 'lucide-react';

export default function SystemHealthPage() {
  const {
    messages,
    metrics,
    isLoading,
    isRefetching,
    refetch,
    replay,
    isReplaying,
    discard,
    isDiscarding,
  } = useDlqManagement();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_REPLAY' | 'REPLAYED' | 'DISCARDED'>('ALL');
  const [selectedMessage, setSelectedMessage] = useState<DeadLetterMessage | null>(null);

  const filteredMessages = messages.filter((msg) => {
    if (statusFilter === 'ALL') return true;
    return msg.status === statusFilter;
  });

  const services = [
    { name: 'API Gateway (:8080)', role: 'Reverse Proxy & CORS', status: 'UP' },
    { name: 'Identity Service (:8081)', role: 'Auth, JWKS & KYC', status: 'UP' },
    { name: 'Listing Service (:8082)', role: 'Rooms & Locations', status: 'UP' },
    { name: 'Booking Service (:8083)', role: 'Appointments & Saga', status: 'UP' },
    { name: 'Billing Service (:8084)', role: 'Ledger & Invoices', status: 'UP' },
    { name: 'Communication (:8085)', role: 'Inbox & Notifications', status: 'UP' },
    { name: 'Admin Service (:8086)', role: 'Moderation & DLQ', status: 'UP' },
    { name: 'RabbitMQ 3.13 (:5672)', role: 'Message Broker', status: 'UP' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            Tình trạng hệ thống & Message Broker
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Giám sát vi dịch vụ, hàng đợi RabbitMQ và công cụ phục hồi sự kiện lỗi (DLQ)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2 border-border">
          <div className="flex items-center justify-between text-xs text-foreground-muted">
            <span>Tổng số sự kiện DLQ</span>
            <Layers className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">{metrics.total}</div>
          <p className="text-[11px] text-foreground-muted">Sự kiện chuyển vào Dead Letter</p>
        </Card>

        <Card className="p-4 space-y-2 border-border">
          <div className="flex items-center justify-between text-xs text-foreground-muted">
            <span>Chờ phát lại (Pending)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600">{metrics.pendingReplay}</div>
          <p className="text-[11px] text-foreground-muted">Cần quản trị viên kiểm tra và replay</p>
        </Card>

        <Card className="p-4 space-y-2 border-border">
          <div className="flex items-center justify-between text-xs text-foreground-muted">
            <span>Đã phát lại (Replayed)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">{metrics.replayed}</div>
          <p className="text-[11px] text-foreground-muted">Đã đẩy lại sàn thành công</p>
        </Card>

        <Card className="p-4 space-y-2 border-border">
          <div className="flex items-center justify-between text-xs text-foreground-muted">
            <span>Đã loại bỏ (Discarded)</span>
            <Trash2 className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600">{metrics.discarded}</div>
          <p className="text-[11px] text-foreground-muted">Payload rác đã cách ly vĩnh viễn</p>
        </Card>
      </div>

      {/* Services Health Mini-Grid */}
      <Card className="p-4 space-y-3 border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-foreground-muted" />
            Trạng thái kết nối dịch vụ
          </h2>
          <span className="text-[11px] text-emerald-600 font-medium">8/8 Dịch vụ hoạt động</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {services.map((svc) => (
            <div
              key={svc.name}
              className="p-2.5 rounded-xl bg-surface-muted border border-border/80 flex items-center justify-between"
            >
              <div>
                <span className="block text-xs font-medium text-foreground">{svc.name}</span>
                <span className="block text-[10px] text-foreground-muted">{svc.role}</span>
              </div>
              <Badge variant="success" size="sm">
                {svc.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* DLQ Management Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Hàng đợi sự kiện lỗi (Dead Letter Queue)</h2>
            <p className="text-xs text-foreground-muted">
              Tra cứu thông tin chi tiết sự kiện bị gián đoạn và phát lại vào RabbitMQ
            </p>
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-surface-muted rounded-xl border border-border text-xs">
            {(['ALL', 'PENDING_REPLAY', 'REPLAYED', 'DISCARDED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-surface text-foreground shadow-xs font-semibold'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                {st === 'ALL'
                  ? 'Tất cả'
                  : st === 'PENDING_REPLAY'
                    ? 'Chờ phát lại'
                    : st === 'REPLAYED'
                      ? 'Đã phát lại'
                      : 'Đã loại bỏ'}
              </button>
            ))}
          </div>
        </div>

        {filteredMessages.length === 0 ? (
          <EmptyState
            title="Không có sự kiện DLQ nào"
            description="Tất cả các sự kiện qua Message Broker đều được gửi và xử lý thông suốt."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loại sự kiện</TableHead>
                <TableHead>Nguồn</TableHead>
                <TableHead>Thực thể</TableHead>
                <TableHead>Lý do lỗi</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời điểm</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.map((msg) => (
                <TableRow key={msg.id}>
                  <TableCell className="font-mono text-xs font-semibold text-foreground">
                    {msg.eventType}
                  </TableCell>
                  <TableCell className="text-xs text-foreground-muted">{msg.sourceService}</TableCell>
                  <TableCell className="text-xs">
                    <span className="font-mono text-[11px] text-foreground">
                      {msg.aggregateType} #{msg.aggregateId.slice(0, 8)}...
                    </span>
                  </TableCell>
                  <TableCell className="text-xs max-w-xs truncate text-rose-600 dark:text-rose-400 font-mono text-[11px]">
                    {msg.failureReason}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        msg.status === 'PENDING_REPLAY'
                          ? 'warning'
                          : msg.status === 'REPLAYED'
                            ? 'success'
                            : 'neutral'
                      }
                      size="sm"
                    >
                      {msg.status === 'PENDING_REPLAY'
                        ? 'Chờ phát lại'
                        : msg.status === 'REPLAYED'
                          ? 'Đã phát lại'
                          : 'Đã loại bỏ'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] font-mono text-foreground-muted">
                    {new Date(msg.createdAt).toLocaleTimeString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMessage(msg)}
                      title="Xem chi tiết Payload"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    {msg.status === 'PENDING_REPLAY' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => replay(msg.id)}
                          disabled={isReplaying}
                          title="Phát lại sự kiện"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => discard(msg.id)}
                          disabled={isDiscarding}
                          title="Loại bỏ sự kiện"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Payload Dialog */}
      <DlqPayloadDialog
        isOpen={selectedMessage !== null}
        onClose={() => setSelectedMessage(null)}
        message={selectedMessage}
        onReplay={(id) => {
          replay(id);
          setSelectedMessage(null);
        }}
        onDiscard={(id) => {
          discard(id);
          setSelectedMessage(null);
        }}
        isReplaying={isReplaying}
        isDiscarding={isDiscarding}
      />
    </div>
  );
}
