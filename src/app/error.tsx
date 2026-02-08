"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

/**
 * Root error page for handling uncaught errors in the app
 * This is a Next.js App Router error boundary
 */
export default function Error({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        // Log error to console (replace with error tracking service in production)
        console.error("Unhandled error:", error);

        // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
        // if (typeof window !== 'undefined' && window.Sentry) {
        //   window.Sentry.captureException(error);
        // }
    }, [error]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                {/* Error Icon */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                    <svg
                        className="w-10 h-10 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    Oops! Something went wrong
                </h1>

                <p className="text-gray-600 mb-6">
                    We apologize for the inconvenience. An unexpected error has occurred.
                </p>

                {/* Error details in development */}
                {process.env.NODE_ENV === "development" && (
                    <div className="mb-6 text-left">
                        <details className="bg-gray-100 rounded-lg p-4">
                            <summary className="cursor-pointer text-sm font-medium text-gray-700">
                                Error Details (Development Only)
                            </summary>
                            <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-40 whitespace-pre-wrap">
                                {error.message}
                                {error.stack && `\n\n${error.stack}`}
                            </pre>
                            {error.digest && (
                                <p className="mt-2 text-xs text-gray-500">
                                    Digest: {error.digest}
                                </p>
                            )}
                        </details>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                    >
                        Try Again
                    </button>

                    <Link
                        href="/"
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
                    >
                        Go Home
                    </Link>
                </div>

                {/* Help text */}
                <p className="mt-8 text-sm text-gray-500">
                    If the problem persists, please try refreshing the page or{" "}
                    <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
                        contact support
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}
