import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticleBySlug, getArticles, getImageUrl, ContentBlock } from "@/lib/api";
import { config } from "@/lib/config";
import ImageLightbox from "@/components/ImageLightbox";
import RichTextContent from "@/components/RichTextContent";
import MoreArticles from "@/components/MoreArticles";
import { Header, Footer } from "@/components/Layout";

export const revalidate = 60;

// Generate static params for SSG
export async function generateStaticParams() {
    try {
        const articles = await getArticles();
        return articles.map((article) => ({
            slug: article.slug,
        }));
    } catch {
        return [];
    }
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

// Dynamic metadata generation for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;

    try {
        const article = await getArticleBySlug(slug);

        if (!article) {
            return {
                title: "Article Not Found",
            };
        }

        const coverUrl = getImageUrl(article.coverImage, 'large');
        const siteUrl = config.site.url;

        return {
            title: article.title,
            description: article.excerpt || `Read ${article.title} on ${config.site.name}`,

            // Open Graph
            openGraph: {
                type: "article",
                title: article.title,
                description: article.excerpt || undefined,
                url: `${siteUrl}/blog/${slug}`,
                siteName: config.site.name,
                publishedTime: article.publishedAt || undefined,
                modifiedTime: article.updatedAt,
                authors: article.author?.name ? [article.author.name] : undefined,
                images: coverUrl ? [
                    {
                        url: coverUrl,
                        width: article.coverImage?.width || 1200,
                        height: article.coverImage?.height || 630,
                        alt: article.coverImage?.alternativeText || article.title,
                    }
                ] : undefined,
            },

            // Twitter Card
            twitter: {
                card: "summary_large_image",
                title: article.title,
                description: article.excerpt || undefined,
                images: coverUrl ? [coverUrl] : undefined,
            },

            // Canonical URL
            alternates: {
                canonical: `${siteUrl}/blog/${slug}`,
            },
        };
    } catch {
        return {
            title: "Article",
        };
    }
}

export default async function ArticlePage({ params }: PageProps) {
    const { slug } = await params;

    let article;
    try {
        article = await getArticleBySlug(slug);
    } catch {
        notFound();
    }

    if (!article) {
        notFound();
    }

    const coverUrl = getImageUrl(article.coverImage, 'large');

    // Generate JSON-LD structured data
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: article.title,
        description: article.excerpt,
        image: coverUrl,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        author: article.author ? {
            "@type": "Person",
            name: article.author.name,
        } : undefined,
        publisher: {
            "@type": "Organization",
            name: config.site.name,
            logo: {
                "@type": "ImageObject",
                url: `${config.site.url}/icon.png`,
            },
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${config.site.url}/blog/${slug}`,
        },
    };

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="min-h-screen bg-white flex flex-col">
                {/* Header */}
                <Header showBackLink />

                {/* Two Column Layout */}
                <div className="max-w-6xl mx-auto px-6 py-10 flex gap-8 flex-1">
                    {/* Article - Scrollable */}
                    <article id="main-content" className="flex-1 min-w-0">
                        {/* Meta */}
                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                            {article.category && (
                                <span className="uppercase text-xs tracking-wide">
                                    {article.category.name}
                                </span>
                            )}
                            {article.category && article.publishedAt && <span aria-hidden="true">•</span>}
                            {article.publishedAt && (
                                <time dateTime={article.publishedAt}>
                                    {new Date(article.publishedAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </time>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                            {article.title}
                        </h1>

                        {/* Author */}
                        {article.author && (
                            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-200">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 overflow-hidden">
                                    {article.author.avatar ? (
                                        <Image
                                            src={getImageUrl(article.author.avatar, 'thumbnail') || ''}
                                            alt={article.author.name}
                                            width={40}
                                            height={40}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span aria-hidden="true">{article.author.name?.charAt(0) || "?"}</span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {article.author.name}
                                    </p>
                                    {article.author.bio && (
                                        <p className="text-sm text-gray-500">
                                            {article.author.bio}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Cover Image */}
                        {coverUrl && (
                            <figure className="mb-8">
                                <div className="relative w-full aspect-video bg-gray-100">
                                    <Image
                                        src={coverUrl}
                                        alt={article.coverImage?.alternativeText || article.title}
                                        fill
                                        className="object-cover"
                                        priority
                                        sizes="(max-width: 768px) 100vw, 768px"
                                    />
                                </div>
                            </figure>
                        )}

                        {/* Content Blocks */}
                        <div className="prose prose-lg max-w-none">
                            {article.blocks && article.blocks.length > 0 ? (
                                article.blocks.map((block, index) => (
                                    <BlockRenderer key={block.id || index} block={block} />
                                ))
                            ) : (
                                <p className="text-gray-500 italic">
                                    No content yet.
                                </p>
                            )}
                        </div>
                    </article>

                    {/* Sidebar - Sticky */}
                    <aside className="hidden lg:block w-72 flex-shrink-0" aria-label="Related articles">
                        <div className="sticky top-8">
                            <MoreArticles currentSlug={slug} />
                        </div>
                    </aside>
                </div>

                {/* Mobile More Articles */}
                <div className="lg:hidden px-6">
                    <MoreArticles currentSlug={slug} />
                </div>

                {/* Footer */}
                <Footer />
            </div>
        </>
    );
}

function BlockRenderer({ block }: { block: ContentBlock }) {
    switch (block.__component) {
        case 'blocks.rich-text':
            return <RichTextContent html={formatContent(block.content)} />;

        case 'blocks.image':
            const imageUrl = getImageUrl(block.image, 'large');
            if (!imageUrl) return null;

            return (
                <ImageLightbox
                    src={imageUrl}
                    alt={block.altText || block.caption || 'Article image'}
                    caption={block.caption}
                />
            );

        case 'blocks.code-block':
            return (
                <div className="my-6">
                    <pre className="bg-gray-100 p-4 overflow-x-auto border border-gray-200 rounded-lg">
                        <code className="text-sm font-mono text-gray-800">
                            {block.code}
                        </code>
                    </pre>
                    {block.language && (
                        <p className="text-xs text-gray-500 mt-1">{block.language}</p>
                    )}
                </div>
            );

        default:
            return null;
    }
}

function formatContent(content: string): string {
    if (!content) return "";

    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || '';

    // Helper to fix image URLs
    const fixImageUrl = (url: string): string => {
        if (!url) return url;
        // Replace localhost URLs with production Strapi URL
        if (url.includes('localhost:1337')) {
            return url.replace(/http:\/\/localhost:1337/g, strapiUrl);
        }
        // Already absolute URL (not localhost)
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        // Relative path starting with /
        if (url.startsWith('/')) return `${strapiUrl}${url}`;
        // Just filename - assume it's in /uploads/
        return `${strapiUrl}/uploads/${url}`;
    };

    // Helper to clean alt text (remove file extension, clean up formatting)
    const cleanAltText = (alt: string): string => {
        if (!alt) return '';
        // Remove file extension
        return alt
            .replace(/\.(png|jpg|jpeg|gif|webp)$/i, '')
            .replace(/[-_]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    };

    return content
        // Images with markdown format ![alt](url)
        .replace(/!\[(.*?)\]\s*\((.*?)\)/g, (match, alt, url) => {
            const fixedUrl = fixImageUrl(url);
            const cleanedAlt = cleanAltText(alt);
            return `<figure class="my-6 overflow-hidden rounded-lg"><img src="${fixedUrl}" alt="${cleanedAlt}" class="w-full transition-transform duration-300 hover:scale-105 cursor-zoom-in" loading="lazy" /></figure>`;
        })
        // Standalone image filenames (filename.png or filename.jpg on their own line)
        .replace(/^([A-Za-z0-9_\-\s]+\.(png|jpg|jpeg|gif|webp))$/gm, (match, filename) => {
            const fixedUrl = `${strapiUrl}/uploads/${filename}`;
            return `<figure class="my-6 overflow-hidden rounded-lg"><img src="${fixedUrl}" alt="" class="w-full transition-transform duration-300 hover:scale-105 cursor-zoom-in" loading="lazy" /></figure>`;
        })
        // Links (must come after images) - handle optional space and fix localhost URLs
        .replace(/\[(.*?)\]\s*\((.*?)\)/g, (match, text, url) => {
            let fixedUrl = url;
            if (url.includes('localhost:3000')) {
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
                fixedUrl = url.replace(/http:\/\/localhost:3000/g, siteUrl);
            }
            return `<a href="${fixedUrl}" class="text-blue-600 underline hover:text-blue-800">${text}</a>`;
        })
        // Headers
        .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-4">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-gray-900 mt-10 mb-4">$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // Italic
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        // Numbered lists
        .replace(/^\d+\. (.*$)/gm, '<li class="mb-2 text-gray-900">$1</li>')
        // Bullet lists
        .replace(/^- (.*$)/gm, '<li class="mb-2 text-gray-900">$1</li>')
        // Bullet with •
        .replace(/^• (.*$)/gm, '<li class="mb-2 text-gray-900">$1</li>')
        // Paragraphs
        .split("\n\n")
        .map((p) => {
            if (p.startsWith("<h") || p.startsWith("<li") || p.startsWith("<figure")) return p;
            if (p.includes("<li>")) return `<ul class="list-disc pl-6 my-4 text-gray-900">${p}</ul>`;
            if (p.trim() === "") return "";
            // Convert single newlines to <br> and wrap in paragraph
            const withBreaks = p.replace(/\n/g, '<br/>');
            return `<p class="text-gray-900 leading-relaxed mb-4">${withBreaks}</p>`;
        })
        .join("\n");
}
