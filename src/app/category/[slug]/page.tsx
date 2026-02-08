import { getArticlesByCategory, getCategories, Category, Article } from "@/lib/api";
import Link from "next/link";
import { PageLayout } from "@/components/Layout";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface CategoryPageProps {
    params: {
        slug: string;
    };
}

export async function generateStaticParams() {
    const categories = await getCategories();
    return categories.map((category) => ({
        slug: category.slug,
    }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { slug } = params;
    const categories = await getCategories();
    const category = categories.find((c) => c.slug === slug);

    if (!category) {
        return {
            title: "Category Not Found",
        };
    }

    return {
        title: `${category.name} Articles`,
        description: `Read all articles about ${category.name}`,
    };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { slug } = params;
    const [articles, categories] = await Promise.all([
        getArticlesByCategory(slug),
        getCategories(),
    ]);

    const category = categories.find((c) => c.slug === slug);

    if (!category) {
        notFound();
    }

    return (
        <PageLayout showBackLink>
            <div className="mb-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {category.name}
                </h1>
                <p className="text-gray-600">
                    {articles.length} article{articles.length !== 1 ? 's' : ''} in this category
                </p>
            </div>

            {articles.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No articles found in this category yet.</p>
                </div>
            ) : (
                <div className="grid gap-8 md:grid-cols-2">
                    {articles.map((article) => (
                        <Link key={article.documentId} href={`/blog/${article.slug}`} className="group block">
                            <article className="h-full bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-100">
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                    {article.publishedAt && (
                                        <time dateTime={article.publishedAt} className="font-mono text-blue-600/80 font-medium">
                                            {new Date(article.publishedAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric"
                                            })}
                                        </time>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                    {article.title}
                                </h2>
                                {article.excerpt && (
                                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                                        {article.excerpt}
                                    </p>
                                )}
                            </article>
                        </Link>
                    ))}
                </div>
            )}
        </PageLayout>
    );
}
