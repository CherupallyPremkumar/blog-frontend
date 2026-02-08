import Link from "next/link";

/**
 * Custom 404 Not Found page
 */
export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                {/* 404 Illustration */}
                <div className="text-8xl font-bold text-gray-200 mb-4" aria-hidden="true">
                    404
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    Page Not Found
                </h1>

                <p className="text-gray-600 mb-8">
                    Sorry, we couldn&apos;t find the page you&apos;re looking for.
                    It might have been moved or doesn&apos;t exist.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                    >
                        Go to Homepage
                    </Link>
                </div>

                <p className="mt-8 text-sm text-gray-500">
                    If you believe this is an error, please try again later.
                </p>
            </div>
        </div>
    );
}
