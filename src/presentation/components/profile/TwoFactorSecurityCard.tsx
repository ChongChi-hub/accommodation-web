'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { toast } from '@/presentation/stores/toast.store';
import { useTwoFactorAuth } from '@/presentation/hooks/useTwoFactorAuth';
import { ShieldCheck, ShieldAlert, Key, Copy, Check, QrCode } from 'lucide-react';

export function TwoFactorSecurityCard() {
  const { isEnabled, isLoading, setupMutation, verifyMutation, disableMutation } = useTwoFactorAuth();

  const [isSettingUp, setIsSettingUp] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [isDisabling, setIsDisabling] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const handleStartSetup = async () => {
    try {
      await setupMutation.mutateAsync();
      setIsSettingUp(true);
      setVerifyCode('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Khong the khoi tao 2FA');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim()) {
      toast.error('Vui long nhap ma xac thuc 6 chu so');
      return;
    }
    try {
      await verifyMutation.mutateAsync(verifyCode.trim());
      toast.success('Kich hoat xac thuc 2 lop thanh cong');
      setIsSettingUp(false);
      setVerifyCode('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Ma xac thuc khong chinh xac');
    }
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disableCode.trim()) {
      toast.error('Vui long nhap ma TOTP hoac ma du phong');
      return;
    }
    try {
      await disableMutation.mutateAsync(disableCode.trim());
      toast.success('Da vo hieu hoa bao mat 2 lop');
      setIsDisabling(false);
      setDisableCode('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Ma xac thuc khong hop le');
    }
  };

  const copyToClipboard = (text: string, type: 'secret' | 'codes') => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
    toast.success('Da sao chep vao bo nho tam');
  };

  const setupData = setupMutation.data;

  return (
    <Card className="p-6 border border-border">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isEnabled ? 'bg-success/10 text-success' : 'bg-foreground-muted/10 text-foreground-muted'}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-base">Xac thuc hai lop (2FA TOTP)</h3>
            <p className="text-xs text-foreground-muted mt-0.5">
              Bao ve tai khoan bang Google Authenticator hoac ung dung TOTP tuong thich.
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
          isEnabled ? 'bg-success/15 text-success' : 'bg-foreground-muted/15 text-foreground-muted'
        }`}>
          {isEnabled ? 'Dang bat' : 'Chua kich hoat'}
        </span>
      </div>

      {!isEnabled && !isSettingUp && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-lg bg-primary-50/50 dark:bg-primary-950/20 border border-primary/20 text-xs text-foreground-muted">
            Bat xac thuc 2 lop giup bao ve tai khoan truoc cac truy cap trai phep, bat buoc doi voi quan tri vien va chu tro khi rut tien.
          </div>
          <Button onClick={handleStartSetup} isLoading={setupMutation.isPending || isLoading}>
            <Key className="w-4 h-4 mr-2" />
            Thiet lap bao mat 2 lop
          </Button>
        </div>
      )}

      {!isEnabled && isSettingUp && setupData && (
        <div className="space-y-5 border-t border-border pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-background-subtle rounded-xl border border-border flex flex-col items-center justify-center text-center">
              <p className="text-xs font-medium text-foreground mb-3 flex items-center gap-1.5">
                <QrCode className="w-4 h-4" />
                1. Quet ma QR bang Google Authenticator
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(setupData.qrUri)}`}
                alt="2FA QR Code"
                className="w-44 h-44 rounded-lg bg-white p-2 border border-border"
              />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-foreground mb-1.5">2. Ma bi mat (Base32)</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-background px-2.5 py-1.5 rounded border border-border flex-1 select-all break-all">
                    {setupData.secret}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(setupData.secret, 'secret')}
                  >
                    {copiedSecret ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-medium text-foreground">3. Ma khoi phuc du phong (8 ma)</p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(setupData.backupCodes.join('\n'), 'codes')}
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {copiedCodes ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    Sao chep tat ca
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 p-2 bg-background rounded border border-border">
                  {setupData.backupCodes.map((code, idx) => (
                    <code key={idx} className="text-xs font-mono text-foreground-muted select-all">
                      {code}
                    </code>
                  ))}
                </div>
                <p className="text-[11px] text-warning mt-1">Luu lai cac ma tren o noi an toan de dung khi mat thiet bi.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-3 max-w-sm">
            <Input
              label="4. Nhap ma xac thuc 6 chu so de hoan tat"
              placeholder="VD: 123456"
              maxLength={6}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, ''))}
              required
            />
            <div className="flex items-center gap-2">
              <Button type="submit" isLoading={verifyMutation.isPending}>
                Xac nhan &amp; Kich hoat
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsSettingUp(false)}>
                Huy
              </Button>
            </div>
          </form>
        </div>
      )}

      {isEnabled && !isDisabling && (
        <div className="space-y-4">
          <p className="text-xs text-foreground-muted">
            Tai khoan cua ban da duoc bao ve boi ma TOTP. Ma xac thuc se duoc yeu cau khi dang nhap hoac thuc hien cac giao dich quan trong.
          </p>
          <Button variant="outline" onClick={() => setIsDisabling(true)}>
            Vo hieu hoa 2FA
          </Button>
        </div>
      )}

      {isEnabled && isDisabling && (
        <form onSubmit={handleDisable} className="space-y-3 max-w-sm border-t border-border pt-4">
          <div className="flex items-center gap-2 text-warning text-xs mb-1">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Nhap ma TOTP hien tai hoac ma du phong de xac nhan tat 2FA</span>
          </div>
          <Input
            label="Ma xac thuc TOTP / Du phong"
            placeholder="6 hoac 8 chu so"
            maxLength={8}
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value.replace(/[^0-9]/g, ''))}
            required
          />
          <div className="flex items-center gap-2">
            <Button type="submit" variant="destructive" isLoading={disableMutation.isPending}>
              Xac nhan tat
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsDisabling(false)}>
              Huy
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
