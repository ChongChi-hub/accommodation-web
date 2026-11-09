const RECENT_SEARCHES_KEY = 'cozynest_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): string[] {
  const normalized = query.replace(/\s+/g, ' ').trim().slice(0, 100);
  if (!normalized) return getRecentSearches();
  const current = getRecentSearches();
  const next = [
    normalized,
    ...current.filter((item) => item.toLowerCase() !== normalized.toLowerCase()),
  ].slice(0, MAX_RECENT_SEARCHES);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota/access errors
    }
  }
  return next;
}

export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore storage access errors
  }
}

