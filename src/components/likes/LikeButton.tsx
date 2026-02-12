'use client';

import { useState, useEffect } from 'react';
import { createLike, deleteLike, getLikes } from '@/lib/api';
import type { Like } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface LikeButtonProps {
    articleId: number;
    initialLikes: Like[];
}

export default function LikeButton({ articleId, initialLikes }: LikeButtonProps) {
    const [likes, setLikes] = useState<Like[]>(initialLikes);
    const [loading, setLoading] = useState(false);
    const { user, openAuthModal } = useAuth();

    // Re-fetch likes when user logs in (server-side fetch may lack user relations)
    useEffect(() => {
        if (user) {
            getLikes(articleId)
                .then(freshLikes => setLikes(freshLikes))
                .catch(() => { /* keep initialLikes on error */ });
        }
    }, [user, articleId]);

    const userLikedLike = user ? likes.find(l => l.user?.id === user.id) : undefined;
    const isLiked = !!userLikedLike;

    const handleToggle = async () => {
        if (!user) {
            openAuthModal('login');
            return;
        }

        if (loading) return;
        setLoading(true);

        try {
            if (userLikedLike) {
                await deleteLike(userLikedLike.documentId);
                const newLikes = likes.filter(l => l.id !== userLikedLike.id);
                setLikes(newLikes);
            } else {
                const newLike = await createLike(articleId);
                const likeWithUser = { ...newLike, user: user };
                setLikes([...likes, likeWithUser]);
            }
        } catch (error: unknown) {
            // Handle "already liked" error by re-fetching to sync state
            const apiErr = error as { status?: number; message?: string };
            if (apiErr.status === 400 || apiErr.message?.includes('already liked')) {
                const freshLikes = await getLikes(articleId).catch(() => likes);
                setLikes(freshLikes);
            } else {
                console.error('Failed to toggle like', error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${isLiked
                ? 'bg-pink-100 text-pink-600 border border-pink-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
            aria-label={isLiked ? "Unlike article" : "Like article"}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                className={`w-5 h-5 ${loading ? 'animate-pulse' : ''}`}
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
            <span className="font-medium">{likes.length}</span>
        </button>
    );
}
