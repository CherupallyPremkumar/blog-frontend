import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticleBySlug, getArticles, getImageUrl, getComments, getLikes, ContentBlock } from "@/lib/api";
import { config } from "@/lib/config";
import ImageLightbox from "@/components/ImageLightbox";
import RichTextContent from "@/components/RichTextContent";
import MoreArticles from "@/components/MoreArticles";
import { PageLayout } from "@/components/Layout";
import Mermaid from "@/components/Mermaid";
import PlantUML from "@/components/PlantUML";
import LikeButton from "@/components/likes/LikeButton";
import CommentSection from "@/components/comments/CommentSection";
import RecentlyViewedTracker from "@/components/RecentlyViewedTracker";
import TableOfContents from "@/components/TableOfContents";
import { extractHeadings } from "@/lib/toc-utils";
import ReadingProgress from "@/components/ReadingProgress";

export const revalidate = 3600;

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

// Extract reading time from content
function getReadingTime(blocks: ContentBlock[]): number {
    let wordCount = 0;
    for (const block of blocks) {
        if (block.__component === 'blocks.rich-text' && block.content) {
            wordCount += block.content.split(/\s+/).length;
        }
        if (block.__component === 'blocks.code-block' && block.code) {
            wordCount += block.code.split(/\s+/).length;
        }
    }
    return Math.max(1, Math.ceil(wordCount / 200));
}

export default async function ArticlePage({ params }: PageProps) {
    const { slug } = await params;

    let article;
    let error: string | null = null;

    try {
        article = await getArticleBySlug(slug);
    } catch (e) {
        error = e instanceof Error ? e.message : "Failed to fetch article";
    }

    // If it's a "real" 404 (article not found in database)
    if (!article && !error) {
        notFound();
    }

    // If it's a server error (e.g. timeout, backend spin-up)
    if (error) {
        return (
            <PageLayout>
                <div className="max-w-3xl mx-auto py-12 px-4">
                    <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-8 text-center rounded-2xl shadow-sm">
                        <h2 className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-2">Server Error</h2>
                        <p className="text-amber-800 dark:text-amber-300 mb-6">
                            Unable to load this article. The backend might be starting up.
                        </p>
                        <a
                            href={`/blog/${slug}`}
                            className="px-6 py-2.5 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-all shadow-md active:scale-95"
                        >
                            Refresh Page
                        </a>
                    </div>
                </div>
            </PageLayout>
        );
    }

    // At this point, article is guaranteed to be defined
    const coverUrl = getImageUrl(article!.coverImage, 'large');

    // Fetch interactive data (likes & comments)
    const [initialComments, initialLikes] = await Promise.all([
        getComments(article!.id).catch(() => []),
        getLikes(article!.id).catch(() => [])
    ]);

    // Extract headings for Table of Contents
    const rawHeadings = (article!.blocks || [])
        .filter((b): b is ContentBlock & { content: string } => b.__component === 'blocks.rich-text' && 'content' in b && typeof b.content === 'string')
        .flatMap(b => extractHeadings(b.content));

    // Deduplicate IDs across all blocks to prevent key errors
    const seenHeadingIds = new Set<string>();
    const allHeadings = rawHeadings.map(heading => {
        let id = heading.id;
        // If ID matches an existing one, append a counter until unique
        if (seenHeadingIds.has(id)) {
            let counter = 1;
            while (seenHeadingIds.has(`${id}-${counter}`)) {
                counter++;
            }
            id = `${id}-${counter}`;
        }
        seenHeadingIds.add(id);
        return { ...heading, id };
    });

    // Calculate reading time
    const readingTime = getReadingTime(article!.blocks || []);

    // Generate JSON-LD structured data
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: article!.title,
        description: article!.excerpt,
        image: coverUrl,
        datePublished: article!.publishedAt,
        dateModified: article!.updatedAt,
        author: article!.author ? {
            "@type": "Person",
            name: article!.author.name,
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
        <PageLayout maxWidth="wide">
            {/* Reading Progress Bar */}
            <ReadingProgress />

            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Track recently viewed */}
            <RecentlyViewedTracker
                article={{
                    id: article!.id,
                    documentId: article!.documentId,
                    slug: article!.slug,
                    title: article!.title,
                    coverUrl: coverUrl || undefined,
                    categoryName: article!.category?.name,
                    publishedAt: article!.publishedAt || article!.createdAt,
                }}
            />

            {/* Mobile Table of Contents */}
            {allHeadings.length > 0 && (
                <div className="lg:hidden">
                    <TableOfContents headings={allHeadings} />
                </div>
            )}

            {/* Two Column Layout */}
            <div className="flex gap-8 flex-1">
                {/* Article - Scrollable */}
                <article id="main-content" className="flex-1 min-w-0 pt-6">
                    {/* Breadcrumbs */}
                    <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-neutral-400 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
                        <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
                        <span className="opacity-30">/</span>
                        <Link href="/categories" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Categories</Link>
                        {article!.category?.parent && (
                            <>
                                <span className="opacity-30">/</span>
                                <Link
                                    href={`/category/${article!.category.parent.slug}`}
                                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    {article!.category.parent.name}
                                </Link>
                            </>
                        )}
                        {article!.category && (
                            <>
                                <span className="opacity-30">/</span>
                                <Link
                                    href={`/category/${article!.category.slug}`}
                                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    {article!.category.name}
                                </Link>
                            </>
                        )}
                        <span className="opacity-30">/</span>
                        <span className="text-gray-900 dark:text-white font-medium truncate">{article!.title}</span>
                    </nav>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-neutral-400 mb-4">
                        {article!.category && (
                            <span className="uppercase text-xs tracking-wide">
                                {article!.category.name}
                            </span>
                        )}
                        {article!.category && article!.publishedAt && <span aria-hidden="true">•</span>}
                        {article!.publishedAt && (
                            <time dateTime={article!.publishedAt}>
                                {new Date(article!.publishedAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </time>
                        )}
                        <span aria-hidden="true">•</span>
                        <span>{readingTime} min read</span>
                    </div>

                    {/* Title & Like Button */}
                    <div className="flex justify-between items-start gap-4 mb-6">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight flex-1">
                            {article!.title}
                        </h1>
                        <div className="flex-shrink-0 pt-2">
                            <LikeButton articleId={article!.id} initialLikes={initialLikes} />
                        </div>
                    </div>

                    {/* Author */}
                    {article!.author && (
                        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-200 dark:border-neutral-800">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-neutral-800 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 dark:text-neutral-300 overflow-hidden">
                                {article!.author.avatar ? (
                                    <Image
                                        src={getImageUrl(article!.author.avatar, 'thumbnail') || ''}
                                        alt={article!.author.name}
                                        width={40}
                                        height={40}
                                        className="object-cover"
                                    />
                                ) : (
                                    <span aria-hidden="true">{article!.author.name?.charAt(0) || "?"}</span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                                    {article!.author.name}
                                </p>
                                {article!.author.bio && (
                                    <p className="text-sm text-gray-500 dark:text-neutral-400">
                                        {article!.author.bio}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Cover Image */}
                    {coverUrl && (
                        <figure className="mb-8">
                            <div className="relative w-full aspect-video bg-gray-100 dark:bg-neutral-900">
                                <Image
                                    src={coverUrl}
                                    alt={article!.coverImage?.alternativeText || article!.title}
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
                        {article!.blocks && article!.blocks.length > 0 ? (
                            article!.blocks.map((block, index) => (
                                <BlockRenderer key={block.id || index} block={block} />
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-neutral-400 italic">
                                No content yet.
                            </p>
                        )}
                    </div>

                    <CommentSection articleId={article!.id} initialComments={initialComments} />
                </article>

                {/* Sidebar - Sticky */}
                <aside className="hidden lg:block w-72 flex-shrink-0" aria-label="Article navigation">
                    <div className="sticky top-32 space-y-8">
                        {/* Table of Contents */}
                        {allHeadings.length > 0 && (
                            <TableOfContents headings={allHeadings} />
                        )}

                        {/* More Articles */}
                        <MoreArticles currentSlug={slug} />
                    </div>
                </aside>
            </div>

            {/* Mobile More Articles */}
            <div className="lg:hidden mt-12 pt-12 border-t border-gray-100 dark:border-neutral-900">
                <MoreArticles currentSlug={slug} />
            </div>
        </PageLayout>
    );
}

function BlockRenderer({ block }: { block: ContentBlock }) {
    switch (block.__component) {
        case 'blocks.rich-text':
            return <RichTextContent content={block.content} />;

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
            if (block.language === 'mermaid') {
                return (
                    <div className="my-6">
                        <Mermaid chart={block.code} />
                    </div>
                );
            }
            if (block.language === 'plantuml' || block.language === 'puml') {
                return (
                    <div className="my-6">
                        <PlantUML puml={block.code} />
                    </div>
                );
            }

            return (
                <div className="my-6">
                    <pre className="bg-gray-100 dark:bg-neutral-900 p-4 overflow-x-auto border border-gray-200 dark:border-neutral-800 rounded-lg">
                        <code className="text-sm font-mono text-gray-800 dark:text-neutral-200">
                            {block.code}
                        </code>
                    </pre>
                    {block.language && (
                        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">{block.language}</p>
                    )}
                </div>
            );

        default:
            return null;
    }
}
