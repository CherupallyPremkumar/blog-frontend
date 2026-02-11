'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HeaderContent() {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const { user, isLoading, openAuthModal, logout } = useAuth();

    return (
        <div className="flex items-center gap-3">
            {!isHome && (
                <Link
                    href="/"
                    className="group flex items-center gap-1.5 rounded-full bg-gray-100/50 px-4 py-1.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900"
                >
                    <span className="transition-transform group-hover:-translate-x-0.5">←</span>
                    Back to Timeline
                </Link>
            )}

            {!isLoading && (
                <>
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 hidden sm:block">
                                {user.username || user.email}
                            </span>
                            <button
                                onClick={logout}
                                className="rounded-full bg-gray-100/50 px-4 py-1.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => openAuthModal('login')}
                            className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-blue-700 shadow-sm"
                        >
                            Sign In
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
