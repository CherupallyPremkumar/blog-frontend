// Recently Viewed Articles — localStorage helper
// Stores the last 10 articles the user has visited

interface RecentArticle {
    id: number;
    documentId: string;
    slug: string;
    title: string;
    coverUrl?: string;
    categoryName?: string;
    publishedAt: string;
    viewedAt: string;
}

const STORAGE_KEY = 'recently_viewed_articles';
const MAX_ITEMS = 10;

export function addRecentlyViewed(article: {
    id: number;
    documentId: string;
    slug: string;
    title: string;
    coverUrl?: string;
    categoryName?: string;
    publishedAt: string;
}): void {
    if (typeof window === 'undefined') return;

    try {
        const existing = getRecentlyViewed();

        // Remove if already exists (will re-add at the top)
        const filtered = existing.filter(a => a.id !== article.id);

        const entry: RecentArticle = {
            ...article,
            viewedAt: new Date().toISOString(),
        };

        // Add to front, trim to max
        const updated = [entry, ...filtered].slice(0, MAX_ITEMS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
        // localStorage not available
    }
}

export function getRecentlyViewed(): RecentArticle[] {
    if (typeof window === 'undefined') return [];

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as RecentArticle[];
    } catch {
        return [];
    }
}

export type { RecentArticle };
