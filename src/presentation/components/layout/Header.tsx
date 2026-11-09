'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Globe, Menu, Search } from 'lucide-react';
import { HEADER_SEARCH_ON_HOME_TOP } from '@/shared/routes';
import { NavVisibilityRole } from '@/shared/navigation';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { useHeaderHero } from '@/presentation/contexts/HeaderHeroContext';
import { getEffectiveRole, getHeaderCtaState } from '@/presentation/utils/user-display';
import { applyThemePreference, getStoredThemePreference } from '@/presentation/utils/theme-preference';
import { Logo } from './Logo';
import { HeaderNav } from './HeaderNav';
import { HeaderSearchCombobox } from './HeaderSearchCombobox';
import { NotificationBell } from './NotificationBell';
import { MessageBadgeLink } from './MessageBadgeLink';
import { UserMenu } from './UserMenu';
import { ThemeToggle } from './ThemeToggle';
import { MobileSearchOverlay } from './MobileSearchOverlay';
import { MobileNavDrawer } from './MobileNavDrawer';
import { cn } from '@/lib/cn';

export function Header() {
  const tNavAuth = useTranslations('nav');
  const tHeader = useTranslations('header');
  const tRoot = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user, activeRole, isAuthenticated, hasHydrated, initSession } = useAuthStore();
  const { hasHero, isScrolled, isHeroSearchInView } = useHeaderHero();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    void initSession();
    applyThemePreference(getStoredThemePreference());
  }, [initSession]);

  const onHeroTop = hasHero && !isScrolled;
  const showDesktopSearch =
    !hasHero || HEADER_SEARCH_ON_HOME_TOP || !isHeroSearchInView;

  const effectiveRole = getEffectiveRole(user, activeRole);
  const navRole: NavVisibilityRole = (effectiveRole || 'GUEST') as NavVisibilityRole;
  const ctaState = getHeaderCtaState(isAuthenticated ? user : null);

  const ctaLabel =
    ctaState.visible && ctaState.mode === 'applicant'
      ? tHeader('cta.landlordAppStatus', {
          status: tHeader.has(`cta.kycStatus.${ctaState.status}` as any)
            ? tHeader(`cta.kycStatus.${ctaState.status}` as any)
            : ctaState.status,
        })
      : ctaState.visible
      ? tRoot(ctaState.labelKey as any)
      : null;

  const toggleLocale = () => {
    router.replace(pathname as any, { locale: locale === 'vi' ? 'en' : 'vi' });
  };

  const closeMenu = useCallback(() => setMobileMenuOpen(false), []);
  const closeSearch = useCallback(() => setMobileSearchOpen(false), []);

  return (
    <>
      <header
        data-hero-top={onHeroTop ? 'true' : 'false'}
        data-scrolled={isScrolled ? 'true' : 'false'}
        className={cn(
          'hdr-animated fixed top-0 inset-x-0 z-40 w-full border-b transition-all duration-200',
          'h-16',
          isScrolled ? 'lg:h-16' : 'lg:h-[72px]',
          onHeroTop ? 'header-hero-transparent text-nav-on-hero' : 'header-frosted text-nav-ink'
        )}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-2 xl:gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 xl:gap-4 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label={tHeader('nav.openMenu')}
              className={cn(
                'lg:hidden p-2 -ml-2 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                onHeroTop ? 'text-white hover:bg-white/15' : 'text-nav-ink hover:bg-surface-muted'
              )}
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link
              href="/"
              className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
            >
              <Logo variant={onHeroTop ? 'monoLight' : 'full'} size="md" />
            </Link>

            <HeaderNav role={navRole} onHeroTop={onHeroTop} />
          </div>

          <div
            data-testid="header-search-shell"
            className={cn(
              'hdr-animated hidden lg:block flex-1 min-w-0 max-w-[260px] 2xl:max-w-[288px] transition-[opacity,transform] duration-200',
              showDesktopSearch
                ? 'visible opacity-100 translate-y-0 pointer-events-auto'
                : 'invisible opacity-0 -translate-y-1 pointer-events-none'
            )}
            aria-hidden={!showDesktopSearch}
          >
            <HeaderSearchCombobox onHeroTop={onHeroTop} />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setMobileSearchOpen(true)}
              aria-label={tHeader('aria.openSearch')}
              className={cn(
                'lg:hidden p-2 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                onHeroTop ? 'text-white hover:bg-white/15' : 'text-nav-muted hover:text-nav-ink hover:bg-surface-muted'
              )}
            >
              <Search className="w-5 h-5" />
            </button>

            {ctaState.visible && ctaLabel && (
              <Link
                href={ctaState.href}
                data-testid="header-cta-link"
                className={cn(
                  'hidden md:inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  onHeroTop
                    ? 'bg-accent text-stone-950 hover:bg-accent-400'
                    : 'bg-primary text-white hover:bg-primary-800'
                )}
              >
                {ctaLabel}
              </Link>
            )}

            {!hasHydrated ? (
              <div
                aria-hidden="true"
                className={cn(
                  'h-9 w-36 rounded-full animate-pulse shrink-0',
                  onHeroTop ? 'bg-white/20' : 'bg-surface-muted'
                )}
              />
            ) : isAuthenticated && user ? (
              <>
                <MessageBadgeLink
                  userId={user.id}
                  effectiveRole={effectiveRole}
                  hasHydrated={hasHydrated}
                  isAuthenticated={isAuthenticated}
                  onHeroTop={onHeroTop}
                />
                <NotificationBell
                  userId={user.id}
                  effectiveRole={effectiveRole}
                  hasHydrated={hasHydrated}
                  isAuthenticated={isAuthenticated}
                  onHeroTop={onHeroTop}
                />
                <UserMenu onHeroTop={onHeroTop} />
              </>
            ) : (
              <>
                <div className="hidden sm:flex items-center gap-1.5">
                  <ThemeToggle onHeroTop={onHeroTop} />
                  <button
                    type="button"
                    onClick={toggleLocale}
                    aria-label={`${locale.toUpperCase()} - ${tHeader('aria.switchLanguage')}`}
                    className={cn(
                      'inline-flex items-center gap-1 text-xs font-semibold uppercase px-2.5 py-2 rounded-xl border transition-colors cursor-pointer',
                      onHeroTop
                        ? 'border-white/30 text-white hover:bg-white/15'
                        : 'border-border text-nav-ink hover:bg-surface-muted'
                    )}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{locale}</span>
                  </button>
                </div>
                <Link
                  href="/login"
                  className={cn(
                    'inline-flex items-center px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-colors',
                    onHeroTop
                      ? 'border-white/45 text-white hover:bg-white/15'
                      : 'border-border text-nav-ink hover:bg-surface-muted'
                  )}
                >
                  {tNavAuth('login')}
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    'hidden sm:inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors',
                    onHeroTop
                      ? 'bg-white text-primary-950 hover:bg-stone-100'
                      : 'bg-primary text-white hover:bg-primary-800'
                  )}
                >
                  {tNavAuth('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <MobileSearchOverlay isOpen={mobileSearchOpen} onClose={closeSearch} />
      <MobileNavDrawer
        isOpen={mobileMenuOpen}
        onClose={closeMenu}
        onOpenSearch={() => setMobileSearchOpen(true)}
      />
    </>
  );
}
