'use client';

import React, { useEffect } from 'react';
import { useHeaderHero } from '@/presentation/contexts/HeaderHeroContext';
import { useHomePageData } from '@/presentation/hooks/useHomePageData';
import { ScrollProgress } from '@/presentation/components/motion/ScrollProgress';
import { HomeHero } from '@/presentation/components/home/HomeHero';
import { HomeCategoryTiles } from '@/presentation/components/home/HomeCategoryTiles';
import { HomeFeaturedCarousel } from '@/presentation/components/home/HomeFeaturedCarousel';
import { HomeHotAreas } from '@/presentation/components/home/HomeHotAreas';
import { HomeHowItWorks } from '@/presentation/components/home/HomeHowItWorks';
import { HomeLatestRooms } from '@/presentation/components/home/HomeLatestRooms';
import { HomeBanners } from '@/presentation/components/home/HomeBanners';
import { HomeLandlordSection } from '@/presentation/components/home/HomeLandlordSection';
import { HomeGuidesSection } from '@/presentation/components/home/HomeGuidesSection';
import { HomeStatsSection } from '@/presentation/components/home/HomeStatsSection';
import { HomeFinalCta } from '@/presentation/components/home/HomeFinalCta';
import { HomeJsonLd } from '@/presentation/components/home/HomeJsonLd';

export default function HomePage() {
  const { setHeroMounted } = useHeaderHero();
  const {
    latestRooms,
    featuredRooms,
    hotAreas,
    banners,
    stats,
    facets,
    articles,
    retryLatestRooms,
    retryFeaturedRooms,
    retryHotAreas,
    retryBanners,
    retryStats,
    retryFacets,
    retryArticles,
  } = useHomePageData();

  useEffect(() => {
    setHeroMounted(true);
    return () => setHeroMounted(false);
  }, [setHeroMounted]);

  return (
    <>
      <HomeJsonLd />
      <ScrollProgress />

      <main className="flex flex-col w-full overflow-x-hidden">
        {/* 1. Full-Viewport Hero with Floating Frosted Search */}
        <HomeHero hotProvinces={hotAreas.data} />

        {/* 2. Category Tiles (4 genuine room types with real counts) */}
        <HomeCategoryTiles
          facetsState={facets}
          onRetry={retryFacets}
        />

        {/* 3. Featured Rooms Carousel (accessible snap carousel) */}
        <HomeFeaturedCarousel
          roomsState={featuredRooms}
          onRetry={retryFeaturedRooms}
        />

        {/* 4. Hot Areas Bento Grid (licensed photography) */}
        <HomeHotAreas
          areasState={hotAreas}
          onRetry={retryHotAreas}
        />

        {/* 5. How CozyNest Works (truthful steps with "Sắp có" badge) */}
        <HomeHowItWorks />

        {/* 6. Latest Listings Grid (8 cards + real count view all) */}
        <HomeLatestRooms
          roomsState={latestRooms}
          totalActiveRooms={stats.data?.activeRooms}
          onRetry={retryLatestRooms}
        />

        {/* 7. Platform Transparency Banners (slim strip <= 160px) */}
        <HomeBanners
          bannersState={banners}
          onRetry={retryBanners}
        />

        {/* 8. Landlord Partner Section (genuine photo + role-aware CTA) */}
        <HomeLandlordSection />

        {/* 9. Guides & Safety Advice (3 CMS articles) */}
        <HomeGuidesSection
          articlesState={articles}
          onRetry={retryArticles}
        />

        {/* 10. Platform Real Stats (live API counts + CountUp) */}
        <HomeStatsSection
          statsState={stats}
          onRetry={retryStats}
        />

        {/* 11. Final Call To Action (warm deep teal) */}
        <HomeFinalCta />
      </main>
    </>
  );
}
