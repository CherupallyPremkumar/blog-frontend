'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Category } from '@/types';

interface CategoryNavProps {
    categories: Category[];
}

export default function CategoryNav({ categories }: CategoryNavProps) {
    return (
        <div className="flex items-center w-full min-h-[44px]">
            <nav className="flex items-center gap-4 overflow-x-auto scrollbar-none py-1 mask-linear-fade">
                {categories.map((category) => (
                    <Link
                        key={category.documentId}
                        href={`/category/${category.slug}`}
                        className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap flex-shrink-0"
                    >
                        {category.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
}

