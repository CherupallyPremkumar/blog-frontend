import Link from "next/link";
import { ReactNode } from "react";
import { config } from "@/lib/config";

interface HeaderProps {
    showBackLink?: boolean;
}

/**
 * Shared header component for consistent navigation
 */
export function Header({ showBackLink = false }: HeaderProps) {
    return (
        <header className="border-b border-gray-200 fixed top-0 left-0 right-0 bg-white z-50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
                <div>
                    <Link
                        href="/"
                        className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
                    >
                        {config.site.name}
                    </Link>
                    {!showBackLink && (
                        <p className="text-gray-500 mt-1">
                            {config.site.description}
                        </p>
                    )}
                </div>
                {showBackLink && (
                    <Link
                        href="/"
                        className="text-gray-600 hover:text-gray-900 text-sm flex items-center gap-1 transition-colors"
                    >
                        ← Back to Timeline
                    </Link>
                )}
            </div>
        </header>
    );
}

/**
 * Shared footer component
 */
export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-gray-200 mt-20">
            <div className="max-w-4xl mx-auto px-6 py-8 text-center text-gray-500 text-sm">
                © {currentYear} {config.site.author}. All rights reserved.
            </div>
        </footer>
    );
}

interface PageLayoutProps {
    children: ReactNode;
    showBackLink?: boolean;
    maxWidth?: 'default' | 'wide';
}

/**
 * Shared page layout with header and footer
 */
export function PageLayout({
    children,
    showBackLink = false,
    maxWidth = 'default'
}: PageLayoutProps) {
    const maxWidthClass = maxWidth === 'wide' ? 'max-w-6xl' : 'max-w-4xl';

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header showBackLink={showBackLink} />
            <main className={`${maxWidthClass} mx-auto px-6 py-10 pt-32 flex-1 w-full`}>
                {children}
            </main>
            <Footer />
        </div>
    );
}

/**
 * Skip to content link for accessibility
 */
export function SkipToContent() {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
        >
            Skip to content
        </a>
    );
}
