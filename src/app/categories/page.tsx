import { Metadata } from 'next';
import Link from 'next/link';
import { getCategories, getArticlesByCategory } from '@/lib/api';
import { PageLayout } from '@/components/Layout';

export const revalidate = 60;

export const metadata: Metadata = {
    title: 'Categories | IOClick',
    description: 'Explore articles by topic and technology.',
};

export default async function CategoriesPage() {
    const categories = await getCategories();

    // Fetch article counts for each category
    const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
            const articles = await getArticlesByCategory(category.slug);
            return {
                ...category,
                articleCount: articles.length
            };
        })
    );

    return (
        <PageLayout>
            <div className="mb-12 border-b border-gray-100 pb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
                    Categories
                </h1>
                <p className="text-lg text-gray-500 max-w-2xl">
                    Explore all the topics, technologies, and engineering journeys documented here.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoriesWithCounts.map((category) => (
                    <Link
                        key={category.documentId}
                        href={`/category/${category.slug}`}
                        className="group block p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                {category.name}
                            </h2>
                            <span className="text-xs font-medium px-2.5 py-1 bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {category.articleCount} {category.articleCount === 1 ? 'article' : 'articles'}
                            </span>
                        </div>

                        {category.description ? (
                            <p className="text-sm text-gray-500 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                                {category.description}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-400 dark:text-neutral-600 italic">
                                No description available for this category yet.
                            </p>
                        )}

                        <div className="mt-6 flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            Explore articles
                            <span className="ml-1.5 whitespace-nowrap">→</span>
                        </div>
                    </Link>
                ))}
            </div>
        </PageLayout>
    );
}
