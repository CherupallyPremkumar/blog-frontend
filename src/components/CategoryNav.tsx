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

                    return (
                        <div
                            key={category.documentId}
                            ref={(el) => {
                                if (el) itemRefs.current.set(category.documentId, el);
                                else itemRefs.current.delete(category.documentId);
                            }}
                            className={`flex items-center h-full py-3 ${isHidden ? 'invisible absolute pointer-events-none' : 'visible'
                                }`}
                        >
                            <Link
                                href={`/category/${category.slug}`}
                                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap"
                            >
                                {category.name}
                            </Link>
                        </div>
                    );
                })}
            </nav>
            {hiddenCount > 0 && (
                <Link
                    href="/categories"
                    className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap flex items-center gap-1 ml-4 bg-white/80 backdrop-blur-sm pl-2 py-3 z-10"
                >
                    View All
                    <span className="text-xs">→</span>
                </Link>
            )}
        </div>
    );
}

