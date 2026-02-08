'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HeaderContent() {
    const pathname = usePathname();
    const isHome = pathname === '/';

    return (
        <>
            {!isHome && (
                <Link
                    href="/"
                    className="group flex items-center gap-1.5 rounded-full bg-gray-100/50 px-4 py-1.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900"
                >
                    <span className="transition-transform group-hover:-translate-x-0.5">←</span>
                    Back to Timeline
                </Link>
            )}
        </>
    );
}
