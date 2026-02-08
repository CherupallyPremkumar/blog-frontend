import { getArticlesByCategory, getCategories, Category, Article } from "@/lib/api";
import Link from "next/link";
import { PageLayout } from "@/components/Layout";
import { Timeline } from "@/components/Timeline";
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
                <Timeline articles={articles} />
            )}
        </PageLayout>
    );
}
