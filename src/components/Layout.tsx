import Link from "next/link";
import { config } from "@/lib/config";
import { getCategories } from "@/lib/api";
import CategoryNav from "./CategoryNav";

// Shared header component
import HeaderContent from "./header/HeaderContent";

export async function Header() {
    const rootCategories = await getCategories(true);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-200/50 dark:border-neutral-800/50 bg-white/80 dark:bg-black/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                <div className="flex items-center gap-8">
                    <Link
                        href="/"
                        className="group flex items-center gap-2.5 font-sans"
                        aria-label="IOClick Home"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold font-mono text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-700">
                            IO
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            IOClick
                        </span>
                    </Link>

                    <p className="hidden text-sm font-medium text-gray-500 dark:text-neutral-400 sm:block border-l border-gray-200 dark:border-neutral-800 pl-4 py-1">
                        {config.site.description}
                    </p>
                </div>

                <HeaderContent />
            </div>

            {/* Category Navigation - Showing Parent Categories with Dropdowns */}
            {rootCategories.length > 0 && (
                <div className="border-t border-gray-200 dark:border-neutral-800">
                    <div className="mx-auto max-w-6xl px-6">
                        <CategoryNav categories={rootCategories} />
                    </div>
                </div>
            )}
        </header>
    );
}

/**
 * Header Skeleton for loading states
 */
export function HeaderSkeleton() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-200/50 dark:border-neutral-800/50 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-neutral-800 animate-pulse" />
                        <div className="h-6 w-24 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse" />
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-100 dark:border-neutral-800">
                <div className="mx-auto max-w-6xl px-6 h-[44px] flex items-center gap-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-4 w-16 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        </header>
    );
}

export function Footer() {
    return (
        <footer className="mt-20 border-t border-gray-100 dark:border-neutral-900 py-12">
            <div className="mx-auto max-w-6xl px-6 text-center text-sm text-gray-500 dark:text-neutral-400">
                <p>© {new Date().getFullYear()} {config.site.author}. All rights reserved.</p>
                <div className="mt-4 flex justify-center gap-6">
                    <a href="https://x.com/premkumar" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:text-white dark:hover:text-white transition-colors">Twitter</a>
                    <a href="https://github.com/premkumar" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:text-white dark:hover:text-white transition-colors">GitHub</a>
                    <a href="https://linkedin.com/in/premkumar" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:text-white dark:hover:text-white transition-colors">LinkedIn</a>
                </div>
            </div>
        </footer>
    );
}

interface PageLayoutProps {
    children: React.ReactNode;
    maxWidth?: 'default' | 'wide';
}

export function PageLayout({
    children,
    maxWidth = 'default'
}: PageLayoutProps) {
    const maxWidthClass = maxWidth === 'wide' ? 'max-w-6xl' : 'max-w-4xl';

    return (
        <div className="min-h-screen bg-white dark:bg-black flex flex-col font-sans selection:bg-blue-100 dark:selection:bg-blue-950 selection:text-blue-900 dark:selection:text-blue-100">
            <main id="main-content" className={`${maxWidthClass} mx-auto w-full flex-1 px-4 md:px-6 pt-24 md:pt-28 pb-8`}>
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
