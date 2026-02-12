import { getArticles, Article } from "@/lib/api";
import RetryButton from "@/components/RetryButton";
import { PageLayout } from "@/components/Layout";
import { Timeline } from "@/components/Timeline";

export const revalidate = 60;

export default async function Home() {
  let articles: Article[] = [];
  let error: string | null = null;

  try {
    articles = await getArticles();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch articles";
  }

  return (
    <PageLayout>
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
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
              <RetryButton
                className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Retry
              </RetryButton>
            </>
          ) : (
            <>
              <p className="font-medium text-red-700">Unable to load articles</p>
              <p className="text-sm mt-1 text-red-600">{error}</p>
              <RetryButton
                className="mt-3 inline-block text-sm text-red-600 underline hover:text-red-800"
              >
                Try again
              </RetryButton>
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
        <Timeline articles={articles} />
      )}
    </PageLayout>
  );
}
