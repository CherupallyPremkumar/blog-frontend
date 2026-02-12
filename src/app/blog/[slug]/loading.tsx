/**
 * Loading skeleton for blog article pages
 */
export default function Loading() {
    return (
        <div className="min-h-screen bg-white dark:bg-black">
            {/* Header Skeleton */}
            <header className="border-b border-gray-200 dark:border-neutral-800">
                <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="h-8 w-24 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                </div>
            </header>

            {/* Two Column Layout */}
            <div className="max-w-6xl mx-auto px-6 py-10 flex gap-8">
                {/* Article Skeleton */}
                <article className="flex-1 min-w-0">
                    {/* Meta */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-3 w-20 bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                    </div>

                    {/* Title */}
                    <div className="h-10 w-3/4 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse mb-6" />

                    {/* Author */}
                    <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-200 dark:border-neutral-800">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-neutral-800 rounded-full animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse" />
                            <div className="h-3 w-40 bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                        </div>
                    </div>

                    {/* Cover Image Skeleton */}
                    <div className="w-full aspect-video bg-gray-200 dark:bg-neutral-800 rounded animate-pulse mb-8" />

                    {/* Content Skeleton */}
                    <div className="space-y-4">
                        <div className="h-4 w-full bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                        <div className="h-4 w-full bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                        <div className="h-4 w-3/4 bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                        <div className="h-4 w-full bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                        <div className="h-4 w-5/6 bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                        <div className="h-6 w-1/3 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse mt-6" />
                        <div className="h-4 w-full bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                        <div className="h-4 w-full bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                    </div>
                </article>

                {/* Sidebar Skeleton */}
                <aside className="hidden lg:block w-72 flex-shrink-0">
                    <div className="p-4 bg-gray-50 dark:bg-neutral-900 rounded-lg border border-gray-100 dark:border-neutral-800">
                        <div className="h-5 w-32 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse mb-4" />
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="space-y-1">
                                    <div className="h-3 w-16 bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                                    <div className="h-4 w-full bg-gray-200 dark:bg-neutral-800 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                        <div className="h-4 w-28 bg-gray-100 dark:bg-neutral-900 rounded animate-pulse mt-4" />
                    </div>
                </aside>
            </div>
        </div>
    );
}
