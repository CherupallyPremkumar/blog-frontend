'use client';

import { useState, useEffect, useRef } from 'react';
import type { TOCHeading } from '@/lib/toc-utils';

interface TableOfContentsProps {
    headings: TOCHeading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>('');
    const [isOpen, setIsOpen] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (headings.length === 0) return;

        // Small delay to ensure headings are rendered in DOM
        const timer = setTimeout(() => {
            observerRef.current = new IntersectionObserver(
                (entries) => {
                    // Find the first visible heading
                    const visibleEntries = entries.filter(e => e.isIntersecting);
                    if (visibleEntries.length > 0) {
                        setActiveId(visibleEntries[0].target.id);
                    }
                },
                {
                    rootMargin: '-80px 0px -70% 0px',
                    threshold: 0.1,
                }
            );

            headings.forEach(({ id }) => {
                const el = document.getElementById(id);
                if (el) observerRef.current?.observe(el);
            });
        }, 300);

        return () => {
            clearTimeout(timer);
            observerRef.current?.disconnect();
        };
    }, [headings]);

    if (headings.length === 0) return null;

    const scrollToHeading = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
            setActiveId(id);
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Desktop: Vertical list */}
            <nav className="hidden lg:block" aria-label="Table of contents">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3">
                    On this page
                </h3>
                <ul className="space-y-1 border-l-2 border-gray-100 dark:border-slate-700">
                    {headings.map(({ id, text, level }) => (
                        <li key={id}>
                            <button
                                onClick={() => scrollToHeading(id)}
                                className={`block w-full text-left text-sm py-1 transition-all duration-150 border-l-2 -ml-[2px] ${level === 3 ? 'pl-6' : 'pl-3'
                                    } ${activeId === id
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-medium'
                                        : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-500'
                                    }`}
                            >
                                {text}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Mobile: Collapsible dropdown */}
            <div className="lg:hidden mb-6">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700"
                >
                    <span>📑 Table of Contents</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    >
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                </button>
                {isOpen && (
                    <ul className="mt-2 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-2 space-y-1">
                        {headings.map(({ id, text, level }) => (
                            <li key={id}>
                                <button
                                    onClick={() => scrollToHeading(id)}
                                    className={`block w-full text-left text-sm py-1.5 text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${level === 3 ? 'pl-4' : ''
                                        } ${activeId === id ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}`}
                                >
                                    {text}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
