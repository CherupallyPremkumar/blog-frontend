'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/lib/api';

export default function HeaderContent() {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const { user, isLoading, openAuthModal, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) {
            document.addEventListener('mousedown', handleClick);
            return () => document.removeEventListener('mousedown', handleClick);
        }
    }, [menuOpen]);

    // Close on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    const avatarUrl = user?.avatar ? getImageUrl(user.avatar, 'thumbnail') : null;

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
                        <div className="relative" ref={menuRef}>
                            {/* Avatar button */}
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-blue-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                aria-label="Profile menu"
                            >
                                {avatarUrl ? (
                                    <Image
                                        src={avatarUrl}
                                        alt={user.username}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </button>

                            {/* Dropdown menu */}
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                    {/* User info */}
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {user.username}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {user.email}
                                        </p>
                                    </div>

                                    {/* Menu items */}
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-base">👤</span>
                                        My Profile
                                    </Link>

                                    <div className="border-t border-gray-100 mt-1 pt-1">
                                        <button
                                            onClick={() => {
                                                setMenuOpen(false);
                                                logout();
                                            }}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <span className="text-base">🚪</span>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
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
