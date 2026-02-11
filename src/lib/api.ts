// API utility for Strapi integration
import { config } from './config';
import { sanitizeCmsContent } from './security';
import type {
    Article,
    Author,
    Category,
    StrapiMedia,
    StrapiResponse,
    ImageSize,
    User,
    AuthResponse,
    Comment,
    Like
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
 * Token management
 */
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
    authToken = token;
    if (typeof window !== 'undefined') {
        if (token) {
            localStorage.setItem('jwt', token);
        } else {
            localStorage.removeItem('jwt');
        }
    }
};

export const getAuthToken = () => {
    if (authToken) {
        return authToken;
    }
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('jwt');
        if (token) {
            authToken = token;
            return token;
        }
    }
    return null;
};

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
        next: {
            revalidate: config.cache.revalidateSeconds,
        },
    };

    const token = getAuthToken();
    if (token) {
        defaultOptions.headers = {
            ...defaultOptions.headers,
            Authorization: `Bearer ${token}`,
        };
    } else {
        // No token available
    }

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
                // If rate limited, wait longer (5 seconds)
                const delayMs = lastError instanceof ApiError && lastError.status === 429
                    ? 5000
                    : Math.pow(2, attempt) * 1000;

                if (config.isDev) {
                    console.warn(`[API] Waiting ${delayMs}ms before retry...`);
                }

                await delay(delayMs);
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
        `/api/articles?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[category][populate]=parent&populate[author][populate]=avatar&populate[coverImage]=true&populate[blocks][populate]=*`
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
/**
 * Build a recursive tree from flat categories
 */
function buildCategoryTree(categories: Category[]): Category[] {
    const map = new Map<string, Category & { children: Category[] }>();
    const roots: Category[] = [];

    // Initialize map with empty children arrays
    categories.forEach(cat => {
        map.set(cat.documentId, { ...cat, children: [] });
    });

    categories.forEach(cat => {
        const node = map.get(cat.documentId)!;
        // Check if this category has a parent in our collection
        const parentId = (cat as Category & { parent?: { documentId: string } }).parent?.documentId;

        if (parentId && map.has(parentId)) {
            map.get(parentId)!.children.push(node);
        } else {
            roots.push(node);
        }
    });

    // Recursively sort all levels by the order field
    const sortCategories = (nodes: Category[]): Category[] => {
        nodes.sort((a, b) => (a.order || 0) - (b.order || 0));
        nodes.forEach(node => {
            if (node.children && node.children.length > 0) {
                sortCategories(node.children);
            }
        });
        return nodes;
    };

    sortCategories(roots);
    return roots;
}

/**
 * Get all categories organized as a tree
 */
export async function getCategories(tree: boolean = false): Promise<Category[]> {
    const response = await fetchAPI<Category[]>('/api/categories?populate=*&sort=order:asc&pagination[pageSize]=100');
    const categories = response.data;

    if (tree) {
        return buildCategoryTree(categories);
    }

    return categories;
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

// ============================================================
// Auth Methods
// ============================================================

export async function login(identifier: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${STRAPI_API_URL}/api/auth/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Login failed');
    }

    const data = await response.json();
    setAuthToken(data.jwt);
    return data;
}

export async function register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${STRAPI_API_URL}/api/auth/local/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Registration failed');
    }

    const data = await response.json();
    setAuthToken(data.jwt);
    return data;
}

export async function getMe(): Promise<User> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${STRAPI_API_URL}/api/users/me?populate=avatar`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new ApiError('Failed to fetch user', res.status);
    }

    // Strapi /users/me returns the user object directly (not wrapped in { data })
    return res.json();
}

export async function updateProfile(bio?: string, avatar?: File): Promise<User> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const formData = new FormData();
    if (bio !== undefined) {
        formData.append('bio', bio);
    }
    if (avatar) {
        formData.append('files.avatar', avatar);
    }

    const res = await fetch(`${STRAPI_API_URL}/api/profile`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            // Do NOT set Content-Type — browser sets it with boundary for multipart
        },
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new ApiError(err?.error?.message || 'Failed to update profile', res.status);
    }

    return res.json();
}

export async function getMyLikedArticles(): Promise<Article[]> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${STRAPI_API_URL}/api/profile/liked-articles`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new ApiError('Failed to fetch liked articles', res.status);
    }

    const data = await res.json();
    return data.data;
}

// ============================================================
// Profile Methods (above) ↑
// ============================================================

// ============================================================
// Comment Methods
// ============================================================

export async function getComments(articleId: number): Promise<Comment[]> {
    const response = await fetchAPI<Comment[]>(
        `/api/comments?filters[article][id][$eq]=${articleId}&populate[author]=*&sort=createdAt:desc`
    );
    return response.data;
}

export async function createComment(articleId: number, content: string): Promise<Comment> {
    const response = await fetchAPI<Comment>('/api/comments', {
        method: 'POST',
        body: JSON.stringify({
            data: {
                content,
                article: articleId,
                // author is inferred from token by Strapi if set up, or needs to be passed.
                // Usually Users-Permissions sets `user` in context.
                // We might need to ensure backend assigns it.
            }
        }),
    });
    return response.data;
}

export async function updateComment(documentId: string, content: string): Promise<Comment> {
    const response = await fetchAPI<Comment>(`/api/comments/${documentId}`, {
        method: 'PUT',
        body: JSON.stringify({
            data: { content }
        }),
    });
    return response.data;
}

export async function deleteComment(documentId: string): Promise<void> {
    await fetchAPI(`/api/comments/${documentId}`, {
        method: 'DELETE',
    });
}

// ============================================================
// Like Methods
// ============================================================

export async function getLikes(articleId: number): Promise<Like[]> {
    const response = await fetchAPI<Like[]>(
        `/api/likes?filters[article][id][$eq]=${articleId}&populate[user]=*`
    );
    return response.data;
}

export async function createLike(articleId: number): Promise<Like> {
    const response = await fetchAPI<Like>('/api/likes', {
        method: 'POST',
        body: JSON.stringify({
            data: {
                article: articleId,
            }
        }),
    });
    return response.data;
}

export async function deleteLike(documentId: string): Promise<void> {
    await fetchAPI(`/api/likes/${documentId}`, {
        method: 'DELETE',
    });
}

export { STRAPI_API_URL };
