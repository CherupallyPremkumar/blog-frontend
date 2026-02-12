'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getImageUrl } from '@/lib/api';

export default function HeaderContent() {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const { user, isLoading, openAuthModal, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
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
                    className="group flex items-center gap-1.5 rounded-full bg-gray-100/50 dark:bg-neutral-900/50 px-4 py-1.5 text-sm font-medium text-gray-600 dark:text-neutral-300 transition-all hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:text-white dark:hover:text-white"
                >
                    <span className="transition-transform group-hover:-translate-x-0.5">←</span>
                    Back to Timeline
                </Link>
            )}

            {/* Dark Mode Toggle */}
            <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100/50 dark:bg-neutral-900/50 text-gray-600 dark:text-neutral-300 transition-all hover:bg-gray-200 dark:hover:bg-neutral-800 hover:text-gray-900 dark:text-white dark:hover:text-white"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
                {theme === 'dark' ? (
                    // Sun icon
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                ) : (
                    // Moon icon
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                )}
            </button>

            {!isLoading && (
                <>
                    {user ? (
                        <div className="relative" ref={menuRef}>
                            {/* Avatar button */}
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-blue-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-black"
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
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-200 dark:border-neutral-800 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                    {/* User info */}
                                    <div className="px-4 py-2 border-b border-gray-100 dark:border-neutral-800">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {user.username}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">
                                            {user.email}
                                        </p>
                                    </div>

                                    {/* Menu items */}
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                                    >
                                        <span className="text-base">👤</span>
                                        My Profile
                                    </Link>

                                    <div className="border-t border-gray-100 dark:border-neutral-800 mt-1 pt-1">
                                        <button
                                            onClick={() => {
                                                setMenuOpen(false);
                                                logout();
                                            }}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
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
