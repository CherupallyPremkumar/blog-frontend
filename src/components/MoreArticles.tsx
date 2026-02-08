import Link from "next/link";
import { getArticles, Article } from "@/lib/api";

interface MoreArticlesProps {
    currentSlug: string;
}

export default async function MoreArticles({ currentSlug }: MoreArticlesProps) {
    let articles: Article[] = [];

    try {
        articles = await getArticles();
    } catch {
        return null;
    }

    const suggestions = articles
        .filter(a => a.slug !== currentSlug)
        .slice(0, 5);

    if (suggestions.length === 0) return null;

    return (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
                More from Timeline
            </h2>

            <div className="relative">
                {/* Mini timeline line */}
                <div className="absolute left-1 top-2 bottom-2 w-0.5 bg-gray-200" />

                <div className="space-y-3">
                    {suggestions.map((article) => (
                        <Link
                            key={article.documentId}
                            href={`/blog/${article.slug}`}
                            className="block group relative pl-5"
                        >
                            {/* Dot */}
                            <div className="absolute left-0 top-1.5 w-2 h-2 bg-gray-300 rounded-full group-hover:bg-blue-500 transition-colors" />

                            <div className="text-xs text-gray-400 font-mono mb-0.5">
                                {article.publishedAt && new Date(article.publishedAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })}
                            </div>
                            <h3 className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors leading-snug">
                                {article.title}
                            </h3>
                        </Link>
                    ))}
                </div>
            </div>

            <Link
                href="/"
                className="block mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
                View all articles →
            </Link>
        </div>
    );
}
