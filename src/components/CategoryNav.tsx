'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Category } from '@/types';

interface CategoryNavProps {
    categories: Category[];
}

export default function CategoryNav({ categories }: CategoryNavProps) {
    const [hiddenCount, setHiddenCount] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    useEffect(() => {
        const checkOverflow = () => {
            if (!containerRef.current) return;

            const container = containerRef.current;
            const containerWidth = container.offsetWidth;
            const moreButtonWidth = 80;

            let totalWidth = 0;
            let count = 0;

            const items = Array.from(itemRefs.current.values());
            let totalItemsWidth = 0;
            items.forEach(item => {
                totalItemsWidth += item.offsetWidth + 24; // text + gap-6
            });

            if (totalItemsWidth <= containerWidth) {
                setHiddenCount(0);
                return;
            }

            for (let i = 0; i < items.length; i++) {
                const itemWidth = items[i].offsetWidth + 24;
                if (totalWidth + itemWidth + moreButtonWidth > containerWidth) {
                    break;
                }
                totalWidth += itemWidth;
                count++;
            }

            setHiddenCount(categories.length - count);
        };

        const resizeObserver = new ResizeObserver(() => {
            checkOverflow();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // Initial check after a short delay for refs to populate
        const timer = setTimeout(checkOverflow, 100);

        return () => {
            resizeObserver.disconnect();
            clearTimeout(timer);
        };
    }, [categories]);

    return (
        <div ref={containerRef} className="flex items-center w-full min-h-[44px]">
            <nav className="flex items-center gap-6 overflow-hidden flex-1">
                {categories.map((category, index) => {
                    const isHidden = hiddenCount > 0 && index >= (categories.length - hiddenCount);
                    const hasChildren = category.children && category.children.length > 0;

                    return (
                        <div
                            key={category.documentId}
                            ref={(el) => {
                                if (el) itemRefs.current.set(category.documentId, el);
                                else itemRefs.current.delete(category.documentId);
                            }}
                            className={`group relative flex items-center h-full py-3 ${isHidden ? 'invisible absolute pointer-events-none' : 'visible'
                                }`}
                        >
                            <Link
                                href={`/category/${category.slug}`}
                                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap flex items-center gap-1"
                            >
                                {category.name}
                                {hasChildren && (
                                    <svg
                                        className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-all group-hover:rotate-180"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                )}
                            </Link>

                            {/* Dropdown Menu */}
                            {hasChildren && (
                                <div className="absolute top-full left-0 mt-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-[60]">
                                    <div className="w-48 bg-white/95 backdrop-blur-xl rounded-xl border border-gray-100 shadow-xl overflow-hidden py-1">
                                        {category.children!.map((child) => (
                                            <Link
                                                key={child.documentId}
                                                href={`/category/${child.slug}`}
                                                className="block px-4 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50/50 transition-colors font-medium"
                                            >
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
            {hiddenCount > 0 && (
                <Link
                    href="/categories"
                    className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap flex items-center gap-1 ml-4 bg-white/80 backdrop-blur-sm pl-2 py-3 z-10"
                >
                    More
                    <span className="text-xs">→</span>
                </Link>
            )}
        </div>
    );
}

