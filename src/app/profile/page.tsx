'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile, getMyLikedArticles, getImageUrl } from '@/lib/api';
import { getRecentlyViewed, type RecentArticle } from '@/lib/recentlyViewed';
import type { Article } from '@/types';
import { PageLayout } from '@/components/Layout';

type Tab = 'profile' | 'liked' | 'recent';

export default function ProfilePage() {
    const { user, isLoading, openAuthModal, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('profile');

    // Profile edit state
    const [bio, setBio] = useState('');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Liked articles
    const [likedArticles, setLikedArticles] = useState<Article[]>([]);
    const [likedLoading, setLikedLoading] = useState(false);

    // Recently viewed
    const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);

    // Init bio from user
    useEffect(() => {
        if (user) {
            setBio(user.bio || '');
        }
    }, [user]);

    // Load liked articles when tab switches
    useEffect(() => {
        if (activeTab === 'liked' && user) {
            setLikedLoading(true);
            getMyLikedArticles()
                .then((articles) => setLikedArticles(articles || []))
                .catch(console.error)
                .finally(() => setLikedLoading(false));
        }
    }, [activeTab, user]);

    // Load recently viewed
    useEffect(() => {
        if (activeTab === 'recent') {
            setRecentArticles(getRecentlyViewed());
        }
    }, [activeTab]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate: max 2MB, must be image
        if (file.size > 2 * 1024 * 1024) {
            alert('Image must be under 2MB.');
            return;
        }

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSaveProfile = async () => {
        if (saving) return;
        setSaving(true);
        setSaveMsg(null);

        try {
            await updateProfile(bio, avatarFile || undefined);
            await refreshUser();
            setAvatarFile(null);
            setSaveMsg('Profile updated!');
            setTimeout(() => setSaveMsg(null), 3000);
        } catch (error) {
            console.error('Failed to save profile', error);
            setSaveMsg('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Auth guard
    if (isLoading) {
        return (
            <PageLayout>
                <div className="flex justify-center py-20">
                    <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
                </div>
            </PageLayout>
        );
    }

    if (!user) {
        return (
            <PageLayout>
                <div className="max-w-lg mx-auto text-center py-20">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold mb-2">Sign in to view your profile</h1>
                    <p className="text-gray-600 mb-6">Create an account or sign in to access your profile, liked articles, and more.</p>
                    <button
                        onClick={() => openAuthModal('login')}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        Sign In
                    </button>
                </div>
            </PageLayout>
        );
    }

    const avatarUrl = avatarPreview || (user.avatar ? getImageUrl(user.avatar, 'small') : null);

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: 'profile', label: 'Profile', icon: '👤' },
        { key: 'liked', label: 'Liked Articles', icon: '❤️' },
        { key: 'recent', label: 'Recently Viewed', icon: '🕐' },
    ];

    return (
        <PageLayout>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-5 mb-8">
                    <div
                        className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 cursor-pointer group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt={user.username}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-medium">Change</span>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                        <p className="text-gray-500 text-sm">{user.email}</p>
                        <p className="text-gray-400 text-xs mt-1">
                            Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                            <textarea
                                rows={4}
                                maxLength={500}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell others about yourself..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                            <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/500</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                            >
                                {saving ? 'Saving...' : 'Save Profile'}
                            </button>
                            {saveMsg && (
                                <span className={`text-sm ${saveMsg.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                                    {saveMsg}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'liked' && (
                    <div>
                        {likedLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
                            </div>
                        ) : likedArticles.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-4xl mb-3">❤️</div>
                                <p className="font-medium">No liked articles yet</p>
                                <p className="text-sm mt-1">Articles you like will appear here.</p>
                                <Link href="/" className="text-blue-600 hover:underline text-sm mt-3 inline-block">
                                    Browse articles →
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {likedArticles.map((article) => (
                                    <ArticleCard key={article.id} article={article} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'recent' && (
                    <div>
                        {recentArticles.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-4xl mb-3">🕐</div>
                                <p className="font-medium">No recently viewed articles</p>
                                <p className="text-sm mt-1">Articles you visit will appear here.</p>
                                <Link href="/" className="text-blue-600 hover:underline text-sm mt-3 inline-block">
                                    Browse articles →
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentArticles.map((article) => (
                                    <Link
                                        key={article.id}
                                        href={`/blog/${article.slug}`}
                                        className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition group"
                                    >
                                        {article.coverUrl && (
                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                <Image
                                                    src={article.coverUrl}
                                                    alt={article.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition truncate">
                                                {article.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                {article.categoryName && (
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded">{article.categoryName}</span>
                                                )}
                                                <span>Viewed {new Date(article.viewedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PageLayout>
    );
}

// Article card for liked articles
function ArticleCard({ article }: { article: Article }) {
    const coverUrl = article.coverImage ? getImageUrl(article.coverImage, 'small') : null;

    return (
        <Link
            href={`/blog/${article.slug}`}
            className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition group"
        >
            {coverUrl && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <Image
                        src={coverUrl}
                        alt={article.title}
                        fill
                        className="object-cover"
                    />
                </div>
            )}
            <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition truncate">
                    {article.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    {article.category && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded">{article.category.name}</span>
                    )}
                    {article.publishedAt && (
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
