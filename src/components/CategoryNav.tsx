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
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 mask-linear-fade">
                {categories.map((category) => {
                    const hasChildren = category.children && category.children.length > 0;

                    return (
                        <div key={category.documentId} className="group relative flex-shrink-0">
                            <Link
                                href={`/category/${category.slug}`}
                                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors whitespace-nowrap flex items-center gap-1"
                            >
                                {category.name}
                                {hasChildren && (
                                    <svg className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-all group-hover:rotate-180 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                )}
                            </Link>

                            {/* Dropdown - Desktop Only */}
                            {hasChildren && (
                                <div className="hidden md:block absolute top-full left-0 pt-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50 min-w-[200px]">
                                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden">
                                        {category.children!.map((child) => (
                                            <Link
                                                key={child.documentId}
                                                href={`/category/${child.slug}`}
                                                className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
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
        </div>
    );
}

