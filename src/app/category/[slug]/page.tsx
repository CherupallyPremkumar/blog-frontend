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
            <div className="max-w-4xl mx-auto w-full px-6 py-8 md:py-12">
                <div className="mb-8 border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                            {category.name}
                        </h1>
                        <span className="text-xs font-medium px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                            {articles.length} article{articles.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {articles.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No articles found in this category yet.</p>
                    </div>
                ) : (
                    <Timeline articles={articles} />
                )}
            </div>
        </PageLayout>
    );
}
