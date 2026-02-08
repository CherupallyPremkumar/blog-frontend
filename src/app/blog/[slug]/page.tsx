import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticleBySlug, getArticles, getImageUrl, ContentBlock } from "@/lib/api";
import { config } from "@/lib/config";
import ImageLightbox from "@/components/ImageLightbox";
import RichTextContent from "@/components/RichTextContent";
import MoreArticles from "@/components/MoreArticles";
import { PageLayout } from "@/components/Layout";
import Mermaid from "@/components/Mermaid";
import PlantUML from "@/components/PlantUML";

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
                    <div className="border border-amber-200 bg-amber-50 p-8 text-center rounded-2xl shadow-sm">
                        <h2 className="text-xl font-bold text-amber-900 mb-2">Server Error</h2>
                        <p className="text-amber-800 mb-6">
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
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Two Column Layout */}
            <div className="flex gap-8 flex-1">
                {/* Article - Scrollable */}
                <article id="main-content" className="flex-1 min-w-0">
                    {/* Breadcrumbs */}
                    <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <span className="opacity-30">/</span>
                        <Link href="/categories" className="hover:text-blue-600 transition-colors">Categories</Link>
                        {article.category?.parent && (
                            <>
                                <span className="opacity-30">/</span>
                                <Link
                                    href={`/category/${article.category.parent.slug}`}
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    {article.category.parent.name}
                                </Link>
                            </>
                        )}
                        {article.category && (
                            <>
                                <span className="opacity-30">/</span>
                                <Link
                                    href={`/category/${article.category.slug}`}
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    {article.category.name}
                                </Link>
                            </>
                        )}
                        <span className="opacity-30">/</span>
                        <span className="text-gray-900 font-medium truncate">{article.title}</span>
                    </nav>

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
                    <div className="sticky top-32">
                        <MoreArticles currentSlug={slug} />
                    </div>
                </aside>
            </div>

            {/* Mobile More Articles */}
            <div className="lg:hidden mt-12 pt-12 border-t border-gray-100">
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
            // Check if it's mermaid or plantuml, otherwise render standard code block
            // Actually, code-block component in Strapi might be separate from rich text code blocks.
            // If the user wants mermaid/plantuml in code blocks, they should use rich text or we handle it here.
            // For now, render standard code block, but if language is mermaid/plantuml, maybe render diagram?
            // The request was "mention in blog that anything it should pick up automatically".
            // If they use standard markdown code blocks, they are inside rich-text.
            // If they use the dedicated "Code Block" component in Strapi, we handle it here.

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
