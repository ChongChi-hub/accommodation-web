import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ROOM_CATEGORY_ALIAS_MAP } from '@/shared/routes';

export type CategoryRouteKey = 'phongTro' | 'nhaNguyenCan' | 'canHo' | 'oGhep';

export async function buildCategoryMetadata(
  locale: string,
  categoryKey: CategoryRouteKey
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'categoryPages' });
  const tBrand = await getTranslations({ locale, namespace: 'brand' });
  const meta = ROOM_CATEGORY_ALIAS_MAP[categoryKey];
  const canonicalPath = locale === 'vi' ? meta.path : `/${locale}${meta.path}`;
  const title = `${t(`${categoryKey}.title`)} | ${tBrand('name')}`;
  const description = t(`${categoryKey}.description`);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
  };
}

