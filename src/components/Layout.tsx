import Link from "next/link";
import { ReactNode } from "react";
import { config } from "@/lib/config";
import { getCategories } from "@/lib/api";

// Shared header component
interface HeaderProps {
    showBackLink?: boolean;
}

export async function Header({ showBackLink = false }: HeaderProps) {
    const categories = await getCategories();

    return (
        <header className="w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
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
                        <span className="text-xl font-bold tracking-tight text-gray-900">
                            IOClick
                        </span>
                    </Link>

                    {!showBackLink && (
                        <p className="hidden text-sm font-medium text-gray-500 sm:block border-l border-gray-200 pl-4 py-1">
                            {config.site.description}
                        </p>
                    )}
                </div>

                {showBackLink && (
                    <Link
                        href="/"
                        className="group flex items-center gap-1.5 rounded-full bg-gray-100/50 px-4 py-1.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900"
                    >
                        <span className="transition-transform group-hover:-translate-x-0.5">←</span>
                        Back to Timeline
                    </Link>
                )}
            </div>

            {/* Category Navigation */}
            {categories.length > 0 && (
                <div className="border-t border-gray-100/50">
                    <div className="mx-auto max-w-6xl px-6">
                        <nav className="flex items-center gap-6 overflow-x-auto py-3 no-scrollbar">
                            {categories.map((category) => (
                                <Link
                                    key={category.documentId}
                                    href={`/category/${category.slug}`}
                                    className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap"
                                >
                                    {category.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
}

interface FooterProps { }

export function Footer({ }: FooterProps) {
    return (
        <footer className="mt-20 border-t border-gray-100 py-12">
            <div className="mx-auto max-w-6xl px-6 text-center text-sm text-gray-500">
                <p>© {new Date().getFullYear()} {config.site.author}. All rights reserved.</p>
                <div className="mt-4 flex justify-center gap-6">
                    <a href="#" className="hover:text-gray-900 transition-colors">Twitter</a>
                    <a href="#" className="hover:text-gray-900 transition-colors">GitHub</a>
                    <a href="#" className="hover:text-gray-900 transition-colors">LinkedIn</a>
                </div>
            </div>
        </footer>
    );
}

interface PageLayoutProps {
    children: React.ReactNode;
    showBackLink?: boolean;
    maxWidth?: 'default' | 'wide';
}

export function PageLayout({
    children,
    showBackLink = false,
    maxWidth = 'default'
}: PageLayoutProps) {
    const maxWidthClass = maxWidth === 'wide' ? 'max-w-6xl' : 'max-w-4xl';

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
            <Header showBackLink={showBackLink} />
            <main className={`${maxWidthClass} mx-auto w-full flex-1 px-6 py-4 md:py-8`}>
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
