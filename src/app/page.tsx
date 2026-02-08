import Link from "next/link";
import { getArticles, Article } from "@/lib/api";
import { config } from "@/lib/config";
import { Header, Footer } from "@/components/Layout";

export const revalidate = 60;

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

export default async function Home() {
  let articles: Article[] = [];
  let error: string | null = null;

  try {
    articles = await getArticles();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch articles";
  }

  const groupedArticles = groupArticlesByMonth(articles);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main id="main-content" className="max-w-4xl mx-auto w-full flex-1 px-6 py-12 md:py-20">
        {/* Hero Section */}
        <div className="mb-20 pt-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
            Engineering <br className="hidden md:block" />
            <span className="text-blue-600">&</span> System Design.
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
            Documenting my journey building scalable systems, exploring backend architecture, and solving complex engineering challenges.
          </p>
        </div>

        {/* Timeline Header */}
        <div className="flex items-center justify-between mb-16 border-b border-gray-100 pb-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Timeline
          </h2>
          <span className="text-xs font-medium px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
            {articles.length} article{articles.length !== 1 ? 's' : ''}
          </span>
        </div>

        {error ? (
          <div
            className="border border-amber-200 bg-amber-50 p-6 text-center rounded-lg"
            role="alert"
            aria-live="polite"
          >
            {error.includes('spinning') || error.includes('503') || error.includes('502') ? (
              <>
                <div className="mb-4">
                  <svg
                    className="animate-spin h-10 w-10 text-amber-600 mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <p className="font-medium text-amber-800">Waking up the server...</p>
                <p className="text-sm mt-2 text-amber-700">Our backend is spinning up. This usually takes 30-60 seconds on the free tier.</p>
                <a
                  href="/"
                  className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Retry
                </a>
              </>
            ) : (
              <>
                <p className="font-medium text-red-700">Unable to load articles</p>
                <p className="text-sm mt-1 text-red-600">{error}</p>
                <a
                  href="/"
                  className="mt-3 inline-block text-sm text-red-600 underline hover:text-red-800"
                >
                  Try again
                </a>
              </>
            )}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No articles yet.</p>
            <p className="text-sm text-gray-400">
              Articles will appear here once published.
            </p>
          </div>
        ) : (
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
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
