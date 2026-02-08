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

    try {
        // Find this category and its parent/children
        const allCategories = await getCategories(true);

        // Recursive find to handle nesting
        const findCategory = (cats: Category[], slug: string): Category | undefined => {
            for (const cat of cats) {
                if (cat.slug === slug) return cat;
                if (cat.children && cat.children.length > 0) {
                    const found = findCategory(cat.children, slug);
                    if (found) return found;
                }
            }
        };

        const category = findCategory(allCategories, slug);

        if (!category) {
            notFound();
        }

        const articles = await getArticlesByCategory(slug);

        return (
            <PageLayout maxWidth="wide">
                <div className="pt-2 pb-12">
                    {/* Header Section */}
                    <div className="mb-10">
                        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                            <span className="opacity-30">/</span>
                            <Link href="/categories" className="hover:text-blue-600 transition-colors">Categories</Link>
                            {category.parent && (
                                <>
                                    <span className="opacity-30">/</span>
                                    <Link
                                        href={`/category/${category.parent.slug}`}
                                        className="hover:text-blue-600 transition-colors"
                                    >
                                        {category.parent.name}
                                    </Link>
                                </>
                            )}
                            <span className="opacity-30">/</span>
                            <span className="text-gray-900 font-medium">{category.name}</span>
                        </nav>

                        <div className="relative">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                                {category.name}
                            </h1>
                            {category.description && (
                                <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                                    {category.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-8">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8 border-b border-gray-100 pb-2">Articles</h2>

                            {articles.length > 0 ? (
                                <div className="pb-20">
                                    <Timeline articles={articles} />
                                </div>
                            ) : (
                                <div className="py-20 text-center rounded-3xl bg-gray-50/50 border border-dashed border-gray-200">
                                    <p className="text-gray-500">No articles found in this category yet.</p>
                                    <Link href="/" className="inline-block mt-4 text-blue-600 font-medium hover:underline">
                                        Back to Home
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-12 sticky top-24 h-fit">
                            {/* Sub-categories (Explorer) */}
                            {category.children && category.children.length > 0 && (
                                <section>
                                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">
                                        Explorer
                                    </h2>
                                    <div className="flex flex-col gap-3">
                                        {category.children.map((child: Category) => (
                                            <Link
                                                key={child.documentId}
                                                href={`/category/${child.slug}`}
                                                className="group flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-sm transition-all duration-200"
                                            >
                                                <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                                    {child.name}
                                                </span>
                                                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* View All Categories Link */}
                            <Link
                                href="/categories"
                                className="inline-block text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                View All Categories →
                            </Link>
                        </div>
                    </div>
                </div>
            </PageLayout>
        );
    } catch (error) {
        console.error("Error loading category page:", error);
        notFound();
    }
}
