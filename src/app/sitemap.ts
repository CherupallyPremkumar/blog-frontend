import { MetadataRoute } from 'next';
import { getArticles } from '@/lib/api';

/**
 * Generate dynamic sitemap for all blog articles
 * This helps search engines discover and index all pages
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
    ];

    // Dynamic article routes
    let articleRoutes: MetadataRoute.Sitemap = [];

    try {
        const articles = await getArticles();

        articleRoutes = articles.map((article) => ({
            url: `${siteUrl}/blog/${article.slug}`,
            lastModified: new Date(article.updatedAt || article.publishedAt || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
    } catch (error) {
        console.error('Failed to generate sitemap for articles:', error);
    }

    return [...staticRoutes, ...articleRoutes];
}
