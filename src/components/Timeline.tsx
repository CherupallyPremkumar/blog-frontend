import Link from "next/link";
import { Article } from "@/lib/api";

interface TimelineProps {
    articles: Article[];
}

// Group articles by year-month
function groupArticlesByMonth(articles: Article[]) {
    const groups: { [key: string]: Article[] } = {};

    articles.forEach(article => {
        const date = article.publishedAt ? new Date(article.publishedAt) : new Date();
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(article);
    });

    return Object.entries(groups)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([key, items]) => ({
            date: new Date(key + '-01'),
            articles: items
        }));
}

export function Timeline({ articles }: TimelineProps) {
    const groupedArticles = groupArticlesByMonth(articles);

    if (articles.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No articles found.</p>
                <p className="text-sm text-gray-400">
                    Articles will appear here once published.
                </p>
            </div>
        );
    }

    return (
        <div className="relative" role="feed" aria-label="Blog articles timeline">
            {/* Vertical timeline line */}
            <div className="absolute left-0 md:left-24 top-0 bottom-0 w-px bg-blue-100" aria-hidden="true" />

            {/* Timeline items */}
            <div className="space-y-8">
                {groupedArticles.map(({ date, articles: monthArticles }) => (
                    <section key={date.toISOString()} className="relative" aria-label={`Articles from ${date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`}>
                        {/* Month/Year label */}
                        <div className="flex items-center mb-4">
                            <div className="hidden md:block w-24 pr-6 text-right">
                                <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                    {date.toLocaleDateString("en-US", { month: "short" })}
                                </span>
                                <div className="text-xs text-gray-400 font-mono mt-0.5">
                                    {date.getFullYear()}
                                </div>
                            </div>
                            {/* Timeline dot for month */}
                            <div className="absolute left-0 md:left-24 w-3 h-3 -ml-1.5 bg-blue-600 rounded-full border-2 border-white shadow-sm z-10" aria-hidden="true" />
                            <div className="md:hidden ml-6 text-lg font-bold text-gray-900 flex items-baseline gap-2">
                                <span>{date.toLocaleDateString("en-US", { month: "long" })}</span>
                                <span className="text-gray-400 text-sm font-normal">{date.getFullYear()}</span>
                            </div>
                        </div>

                        {/* Articles for this month */}
                        <div className="ml-6 md:ml-32 space-y-3">
                            {monthArticles.map((article) => (
                                <article key={article.documentId} className="relative group">
                                    {/* Small dot on timeline */}
                                    <div className="absolute -left-6 md:-left-[2.1rem] top-2.5 w-1.5 h-1.5 bg-blue-200 rounded-full group-hover:bg-blue-600 group-hover:scale-125 transition-all duration-300" aria-hidden="true" />

                                    <Link href={`/blog/${article.slug}`} className="block">
                                        <div className="p-4 -ml-4 rounded-xl border border-transparent hover:border-blue-100 hover:bg-blue-50/50 transition-all duration-300 group-hover:shadow-sm">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                                                {article.publishedAt && (
                                                    <time dateTime={article.publishedAt} className="font-mono text-blue-600/80 font-medium">
                                                        {new Date(article.publishedAt).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </time>
                                                )}
                                                {article.category && (
                                                    <>
                                                        <span aria-hidden="true" className="text-gray-300">•</span>
                                                        <span className="uppercase tracking-wider font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
                                                            {article.category.name}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
                                                {article.title}
                                            </h2>
                                            {article.excerpt && (
                                                <p className="text-gray-600 text-sm mt-1.5 line-clamp-2 leading-relaxed group-hover:text-gray-700">
                                                    {article.excerpt}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {/* End of timeline marker */}
            <div className="relative mt-12 pb-12">
                <div className="absolute left-0 md:left-24 w-2 h-2 -ml-1 bg-blue-200 rounded-full" aria-hidden="true" />
                <p className="ml-6 md:ml-32 text-gray-400 text-xs uppercase tracking-widest font-medium">
                    The beginning
                </p>
            </div>
        </div>
    );
}
