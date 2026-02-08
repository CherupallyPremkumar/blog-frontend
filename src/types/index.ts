// Centralized type definitions for the blog frontend

// ============================================================
// Media Types
// ============================================================

export interface StrapiMedia {
    id: number;
    url: string;
    alternativeText: string | null;
    width: number;
    height: number;
    formats?: {
        thumbnail?: { url: string };
        small?: { url: string };
        medium?: { url: string };
        large?: { url: string };
    };
}

// ============================================================
// Content Block Types
// ============================================================

export interface RichTextBlock {
    __component: 'blocks.rich-text';
    id: number;
    content: string;
}

export interface ImageBlock {
    __component: 'blocks.image';
    id: number;
    image: StrapiMedia;
    caption?: string;
    altText?: string;
}

export interface CodeBlock {
    __component: 'blocks.code-block';
    id: number;
    code: string;
    language?: string;
}

export type ContentBlock = RichTextBlock | ImageBlock | CodeBlock;

// ============================================================
// Entity Types
// ============================================================

export interface Author {
    id: number;
    documentId: string;
    name: string;
    bio: string | null;
    avatar?: StrapiMedia;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: number;
    documentId: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: string;
}

export interface Article {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    excerpt: string | null;
    order: number;
    coverImage?: StrapiMedia;
    blocks?: ContentBlock[];
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    author?: Author;
    category?: Category;
}

// ============================================================
// API Response Types
// ============================================================

export interface StrapiPagination {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
}

export interface StrapiResponse<T> {
    data: T;
    meta?: {
        pagination?: StrapiPagination;
    };
}

export interface StrapiError {
    status: number;
    name: string;
    message: string;
    details?: Record<string, unknown>;
}

// ============================================================
// Component Props Types
// ============================================================

export interface RichTextContentProps {
    html: string;
}

export interface ImageLightboxProps {
    src: string;
    alt: string;
    caption?: string;
}

export interface MoreArticlesProps {
    currentSlug: string;
}

export interface ArticlePageProps {
    params: Promise<{ slug: string }>;
}

// ============================================================
// Utility Types
// ============================================================

export type ImageSize = 'thumbnail' | 'small' | 'medium' | 'large';

export interface GroupedArticles {
    date: Date;
    articles: Article[];
}
