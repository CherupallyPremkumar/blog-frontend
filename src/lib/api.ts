// API utility for Strapi integration
import { config } from './config';
import { sanitizeCmsContent } from './security';
import type {
    Article,
    Author,
    Category,
    StrapiMedia,
    StrapiResponse,
    ImageSize
} from '@/types';

// Re-export types for backward compatibility
export type {
    Article,
    Author,
    Category,
    StrapiMedia,
    StrapiResponse,
    ContentBlock,
    RichTextBlock,
    ImageBlock,
    CodeBlock,
} from '@/types';

const STRAPI_API_URL = config.api.strapiUrl;

/**
 * API Error class for better error handling
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Get full image URL from Strapi media
 */
export function getImageUrl(media?: StrapiMedia, size?: ImageSize): string | null {
    if (!media) return null;

    // Try to get the requested size, fallback to original
    if (size && media.formats?.[size]) {
        return `${STRAPI_API_URL}${media.formats[size].url}`;
    }

    return `${STRAPI_API_URL}${media.url}`;
}

/**
 * Delay utility for retry backoff
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch data from Strapi API with retry logic and timeout
 */
async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<StrapiResponse<T>> {
    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const mergedOptions: RequestInit = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    const url = `${STRAPI_API_URL}${endpoint}`;
    let lastError: Error | null = null;

    // Retry logic with exponential backoff
    for (let attempt = 0; attempt < config.api.retryAttempts; attempt++) {
        try {
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);

            const res = await fetch(url, {
                ...mergedOptions,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                // Special handling for 503 - backend is spinning up
                if (res.status === 503 || res.status === 502) {
                    throw new ApiError(
                        'Backend is spinning up. Please wait...',
                        res.status,
                        'BACKEND_SPINNING'
                    );
                }
                throw new ApiError(
                    `API request failed: ${res.status} ${res.statusText}`,
                    res.status
                );
            }

            return res.json();
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));

            // Don't retry on client errors (4xx) except 429 (rate limit)
            if (err instanceof ApiError && err.status >= 400 && err.status < 500 && err.status !== 429) {
                throw err;
            }

            // Log retry attempt
            if (config.isDev) {
                console.warn(
                    `[API] Attempt ${attempt + 1}/${config.api.retryAttempts} failed for ${endpoint}:`,
                    lastError.message
                );
            }

            // Wait before retrying (exponential backoff)
            if (attempt < config.api.retryAttempts - 1) {
                await delay(Math.pow(2, attempt) * 1000);
            }
        }
    }

    // All retries exhausted
    throw lastError || new Error('Failed to fetch data');
}

/**
 * Get all published articles, sorted by order field
 */
export async function getArticles(): Promise<Article[]> {
    const response = await fetchAPI<Article[]>('/api/articles?populate=*&sort=order:asc');
    return response.data;
}

/**
 * Get a single article by slug with all blocks populated
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
    // Validate slug to prevent injection
    if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
        return null;
    }

    const response = await fetchAPI<Article[]>(
        `/api/articles?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`
    );

    const article = response.data[0] || null;

    // Sanitize article content if present
    if (article?.blocks) {
        article.blocks = article.blocks.map(block => {
            if (block.__component === 'blocks.rich-text') {
                return {
                    ...block,
                    content: sanitizeCmsContent(block.content),
                };
            }
            return block;
        });
    }

    return article;
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
    const response = await fetchAPI<Category[]>('/api/categories?populate=*');
    return response.data;
}

/**
 * Get articles by category slug
 */
export async function getArticlesByCategory(categorySlug: string): Promise<Article[]> {
    // Validate slug to prevent injection
    if (!categorySlug || !/^[a-z0-9-]+$/i.test(categorySlug)) {
        return [];
    }

    const response = await fetchAPI<Article[]>(
        `/api/articles?filters[category][slug][$eq]=${encodeURIComponent(categorySlug)}&populate=*&sort=order:asc`
    );
    return response.data;
}

/**
 * Get all authors
 */
export async function getAuthors(): Promise<Author[]> {
    const response = await fetchAPI<Author[]>('/api/authors?populate=*');
    return response.data;
}

/**
 * Get paginated articles
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of articles per page
 */
export async function getPaginatedArticles(
    page: number = 1,
    pageSize: number = 10
): Promise<{ articles: Article[]; total: number; pageCount: number }> {
    const response = await fetchAPI<Article[]>(
        `/api/articles?populate=*&sort=order:asc&pagination[page]=${page}&pagination[pageSize]=${pageSize}`
    );

    return {
        articles: response.data,
        total: response.meta?.pagination?.total || response.data.length,
        pageCount: response.meta?.pagination?.pageCount || 1,
    };
}

export { STRAPI_API_URL };
