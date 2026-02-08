import { getArticlesByCategory, getCategories, Category, Article } from "@/lib/api";
import Link from "next/link";
import { PageLayout } from "@/components/Layout";
import { Timeline } from "@/components/Timeline";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface CategoryPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateStaticParams() {
    const categories = await getCategories();
    return categories.map((category) => ({
        slug: category.slug,
    }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { slug } = await params;
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
    const { slug } = await params;

    let category;
    let articles = [];

    try {
        const categories = await getCategories();
        category = categories.find((c) => c.slug === slug);

        if (!category) {
            notFound();
        }

        articles = await getArticlesByCategory(slug);

        // Get other categories for "Related" section
        const otherCategories = categories
            .filter(c => c.slug !== slug)
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);

        return (
            <PageLayout showBackLink>
                <div className="mb-10 border-b border-gray-100 pb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            {category.name}
                        </h1>
                        <span className="text-sm font-medium px-3 py-1 bg-gray-100 text-blue-600 rounded-full">
                            {articles.length} {articles.length === 1 ? 'article' : 'articles'}
                        </span>
                    </div>
                    {category.description && (
                        <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
                            {category.description}
                        </p>
                    )}
                </div>

                {articles.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">No articles found in this category yet.</p>
                        <Link
                            href="/categories"
                            className="mt-4 inline-block text-blue-600 font-bold hover:underline"
                        >
                            Explore other categories →
                        </Link>
                    </div>
                ) : (
                    <>
                        <Timeline articles={articles} />

                        {/* Other Categories Section */}
                        {otherCategories.length > 0 && (
                            <div className="mt-20 pt-12 border-t border-gray-100">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">
                                    Explore More Topics
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {otherCategories.map((other) => (
                                        <Link
                                            key={other.documentId}
                                            href={`/category/${other.slug}`}
                                            className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                                        >
                                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {other.name}
                                            </div>
                                            {other.description && (
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                    {other.description}
                                                </p>
                                            )}
                                        </Link>
                                    ))}
                                    <Link
                                        href="/categories"
                                        className="p-4 rounded-xl border border-dashed border-gray-200 hover:border-blue-200 hover:bg-gray-50 flex items-center justify-center font-bold text-blue-600 text-sm"
                                    >
                                        View All Categories →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </PageLayout>
        );
    } catch (error) {
        console.error("Error loading category page:", error);
        notFound();
    }
}
