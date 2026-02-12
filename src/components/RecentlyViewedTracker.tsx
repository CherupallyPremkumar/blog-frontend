'use client';

import { useEffect } from 'react';
import { addRecentlyViewed } from '@/lib/recentlyViewed';

interface RecentlyViewedTrackerProps {
    article: {
        id: number;
        documentId: string;
        slug: string;
        title: string;
        coverUrl?: string;
        categoryName?: string;
        publishedAt: string;
    };
}

/**
 * Invisible component that records an article view to localStorage.
 * Drop this into any article page.
 */
export default function RecentlyViewedTracker({ article }: RecentlyViewedTrackerProps) {
    useEffect(() => {
        addRecentlyViewed(article);
    }, [article]);

    return null;
}
