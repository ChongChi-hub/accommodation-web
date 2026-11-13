'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Script from 'next/script';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { container } from '@/infrastructure/di/container';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { toast } from '@/presentation/stores/toast.store';
import { UserIdentity } from '@/domain/entities/UserIdentity';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { CheckCircle2, ShieldAlert, KeyRound, Loader2, Unlink } from 'lucide-react';

export function LinkedAccountsSection() {
  const t = useTranslations('profile');
  const { user } = useAuthStore();
  const [identities, setIdentities] = useState<UserIdentity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const linkNonceRef = useRef<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  const loadIdentities = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await container.profile.manageIdentitiesUseCase.getIdentities();
      setIdentities(list || []);
    } catch {
      // Ignore background error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIdentities();
  }, [loadIdentities]);

  const googleIdentity = identities.find((i) => i.provider === 'GOOGLE');
  const isGoogleOnly = !user?.hasPassword && identities.length <= 1;

  const handleLinkSuccess = useCallback(
    async (response: { credential?: string }) => {
      const credential = response?.credential;
      const nonce = linkNonceRef.current;
      if (!credential || !nonce) return;

      setIsLinking(true);
      try {
        await container.profile.manageIdentitiesUseCase.linkGoogle(credential, nonce);
        toast.success(t('googleLinkSuccess'));
        await loadIdentities();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t('googleLinkFailed');
        toast.error(msg);
      } finally {
        setIsLinking(false);
      }
    },
    [loadIdentities, t]
  );

  const triggerGoogleLink = useCallback(async () => {
    if (!window.google?.accounts?.id || !clientId) {
      toast.error(t('googleServiceUnavailable'));
      return;
    }
    try {
      const nonceRes = await container.auth.googleAuthUseCase.getNonce();
      linkNonceRef.current = nonceRes.nonce;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleLinkSuccess,
        nonce: nonceRes.nonce,
        auto_select: false,
      });
      window.google.accounts.id.prompt();
    } catch {
      toast.error(t('googleServiceUnavailable'));
    }
  }, [clientId, handleLinkSuccess, t]);

  const handleUnlink = async () => {
    setIsUnlinking(true);
    try {
      await container.profile.manageIdentitiesUseCase.unlinkGoogle();
      toast.success(t('googleUnlinkSuccess'));
      setShowConfirmModal(false);
      await loadIdentities();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('googleUnlinkFailed');
      toast.error(msg);
    } finally {
      setIsUnlinking(false);
    }
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGisLoaded(true)}
      />

      <Card className="p-6 border border-border space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">{t('linkedAccountsTitle')}</h3>
          <p className="text-xs text-foreground-muted mt-0.5">{t('linkedAccountsSubtitle')}</p>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 py-4 text-xs text-foreground-muted">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>{t('loadingLinkedAccounts')}</span>
          </div>
        ) : googleIdentity ? (
          <div className="p-4 rounded-xl border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-center font-bold text-teal-700 dark:text-teal-300">
                G
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{t('googleBrand')}</span>
                  <Badge variant="success" size="sm" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{t('linkedStatus')}</span>
                  </Badge>
                </div>
                <p className="text-xs text-foreground-muted mt-0.5">{googleIdentity.emailAtLink}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isGoogleOnly ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <span className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                    {t('lastLoginMethodNotice')}
                  </span>
                  <Link href="/forgot-password">
                    <Button size="sm" variant="outline" leftIcon={<KeyRound className="w-3.5 h-3.5" />}>
                      {t('setPasswordBtn')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-danger hover:bg-danger/10 border-danger/30"
                  leftIcon={<Unlink className="w-3.5 h-3.5" />}
                  onClick={() => setShowConfirmModal(true)}
                >
                  {t('unlinkBtn')}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center font-bold text-foreground-muted">
                G
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground">{t('googleBrand')}</span>
                <p className="text-xs text-foreground-muted mt-0.5">{t('notLinkedGoogleDesc')}</p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={triggerGoogleLink}
              isLoading={isLinking}
              disabled={!gisLoaded || isLinking}
            >
              {t('linkGoogleBtn')}
            </Button>
          </div>
        )}
      </Card>

      <Dialog
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={t('confirmUnlinkTitle')}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20 text-xs text-warning-foreground">
            <ShieldAlert className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <p>{t('confirmUnlinkWarning')}</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={isUnlinking}
            >
              {t('cancel')}
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="bg-danger hover:bg-danger/90 text-white"
              onClick={handleUnlink}
              isLoading={isUnlinking}
            >
              {t('confirmUnlinkBtn')}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
