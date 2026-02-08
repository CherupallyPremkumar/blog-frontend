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
    const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                let currentHidden = 0;
                entries.forEach((entry) => {
                    // entry.isIntersecting is true if the element is visible in the container
                    if (!entry.isIntersecting) {
                        currentHidden++;
                    }
                });

                // This approach is a bit naive because IntersectionObserver 
                // tells us what's visible, but we need to know exactly how many 
                // fit before we hide them.
                // Let's use a simpler resizing strategy.
            },
            {
                root: containerRef.current,
                threshold: 1.0,
            }
        );

        // Actually, for "Show what fits", a manual width check is more reliable in React.
        const checkOverflow = () => {
            if (!containerRef.current) return;

            const container = containerRef.current;
            const containerWidth = container.offsetWidth;
            const moreButtonWidth = 80; // Approximate width of "More →" button

            let totalWidth = 0;
            let count = 0;
            let needsMore = false;

            const items = Array.from(itemRefs.current.values());

            // First, check if everything fits WITHOUT the more button
            let totalItemsWidth = 0;
            items.forEach(item => {
                totalItemsWidth += item.offsetWidth + 24; // text + gap-6
            });

            if (totalItemsWidth <= containerWidth) {
                setHiddenCount(0);
                return;
            }

            // If not, find how many fit WITH the more button
            for (let i = 0; i < items.length; i++) {
                const itemWidth = items[i].offsetWidth + 24;
                if (totalWidth + itemWidth + moreButtonWidth > containerWidth) {
                    needsMore = true;
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

        resizeObserver.observe(containerRef.current);

        // Initial check
        setTimeout(checkOverflow, 0);

        return () => {
            resizeObserver.disconnect();
        };
    }, [categories]);

    return (
        <div ref={containerRef} className="flex items-center w-full min-h-[44px]">
            <nav className="flex items-center gap-6 overflow-hidden flex-1">
                {categories.map((category) => (
                    <Link
                        key={category.documentId}
                        ref={(el) => {
                            if (el) itemRefs.current.set(category.documentId, el);
                            else itemRefs.current.delete(category.documentId);
                        }}
                        href={`/category/${category.slug}`}
                        className={`text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap ${hiddenCount > 0 && categories.indexOf(category) >= (categories.length - hiddenCount)
                                ? 'invisible absolute pointer-events-none'
                                : 'visible'
                            }`}
                    >
                        {category.name}
                    </Link>
                ))}
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
