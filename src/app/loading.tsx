/**
 * Root loading page for the application
 * Displays a skeleton UI while page content is loading
 */
export default function Loading() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header Skeleton */}
            <header className="border-b border-gray-200 fixed top-0 left-0 right-0 bg-white z-50">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-64 bg-gray-100 rounded mt-2 animate-pulse" />
                </div>
            </header>

            {/* Main Content Skeleton */}
            <main className="max-w-4xl mx-auto px-6 py-12 pt-32">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-12" />

                {/* Timeline Skeleton */}
                <div className="relative">
                    <div className="absolute left-0 md:left-32 top-0 bottom-0 w-0.5 bg-gray-200" />

                    <div className="space-y-12">
                        {[1, 2, 3].map((group) => (
                            <div key={group} className="relative">
                                {/* Month label skeleton */}
                                <div className="flex items-center mb-6">
                                    <div className="hidden md:block w-32 pr-8 text-right">
                                        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse ml-auto" />
                                    </div>
                                    <div className="absolute left-0 md:left-32 w-4 h-4 -ml-2 bg-gray-300 rounded-full" />
                                </div>

                                {/* Article skeletons */}
                                <div className="ml-8 md:ml-40 space-y-4">
                                    {[1, 2].map((article) => (
                                        <div key={article} className="relative p-4">
                                            <div className="absolute -left-8 md:-left-8 top-2 w-2 h-2 bg-gray-200 rounded-full" />
                                            <div className="space-y-2">
                                                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                                                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                                                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                                                <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
