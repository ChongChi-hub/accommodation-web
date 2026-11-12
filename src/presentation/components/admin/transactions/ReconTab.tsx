'use client';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { AdminFinancialStats } from '@/domain/entities/Billing';
import { formatVnd } from '@/shared/utils/format-vnd';
import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { ReconciliationSummary } from './types';

interface ReconTabProps {
  reconData: ReconciliationSummary | null;
  adminStats: AdminFinancialStats | null;
  isReconciling: boolean;
  onRunReconcile: () => void;
}

export function ReconTab({ reconData, adminStats, isReconciling, onRunReconcile }: ReconTabProps) {
  return (
    <div className="space-y-6">
      {adminStats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4 space-y-1">
            <p className="text-xs text-stone-400">GMV</p>
            <p className="text-lg font-black text-teal-700">{formatVnd(adminStats.totalGmv)}</p>
          </Card>
          <Card className="p-4 space-y-1">
            <p className="text-xs text-stone-400">Platform Fee</p>
            <p className="text-lg font-black text-emerald-700">{formatVnd(adminStats.platformFeeRevenue)}</p>
          </Card>
          <Card className="p-4 space-y-1">
            <p className="text-xs text-stone-400">Escrow</p>
            <p className="text-lg font-black text-amber-600">{formatVnd(adminStats.totalEscrowBalance)}</p>
          </Card>
          <Card className="p-4 space-y-1">
            <p className="text-xs text-stone-400">Gateway Cash</p>
            <p className="text-lg font-black text-stone-800 dark:text-stone-200">{formatVnd(adminStats.totalGatewayCash)}</p>
          </Card>
        </div>
      )}

      {reconData && (
        <>
          <Card className="p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {reconData.isSystemBalanced ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
              <div>
                <p className="text-sm font-bold">{reconData.message}</p>
                <p className="text-xs text-stone-500">
                  Debit: {formatVnd(reconData.totalDebit)} • Credit: {formatVnd(reconData.totalCredit)} • Diff: {formatVnd(reconData.systemDifference)}
                </p>
              </div>
            </div>
            <Button variant="primary" size="sm" isLoading={isReconciling} leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={onRunReconcile}>
              Reconcile
            </Button>
          </Card>

          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Stored</TableHead>
                  <TableHead>Calculated</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reconData.walletBreakdowns.map((w) => (
                  <TableRow key={w.accountNumber}>
                    <TableCell className="font-mono text-xs font-semibold">{w.accountNumber} ({w.accountName})</TableCell>
                    <TableCell className="text-xs">{w.accountType}</TableCell>
                    <TableCell className="text-xs font-bold">{formatVnd(w.storedBalance)}</TableCell>
                    <TableCell className="text-xs">{formatVnd(w.calculatedBalance)}</TableCell>
                    <TableCell>
                      <Badge variant={w.isMatched ? 'success' : 'danger'} size="sm">
                        {w.isMatched ? 'MATCHED' : `DIFF ${formatVnd(w.difference)}`}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}

