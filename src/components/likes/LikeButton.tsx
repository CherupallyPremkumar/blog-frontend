'use client';

import { useState, useEffect } from 'react';
import { createLike, deleteLike, getAuthToken, getMe } from '@/lib/api';
import type { Like, User } from '@/types';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
    articleId: number;
    initialLikes: Like[];
}

export default function LikeButton({ articleId, initialLikes }: LikeButtonProps) {
    const [likes, setLikes] = useState<Like[]>(initialLikes);
    const [userLikedLike, setUserLikedLike] = useState<Like | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in and if they already liked the article
        const checkUser = async () => {
            const token = getAuthToken();
            if (token) {
                try {
                    const user = await getMe();
                    setCurrentUser(user);
                    // Find if current user has a like in the list
                    // Note: This relies on initialLikes having populated users. 
                    // If initialLikes list is huge, we shouldn't load all. 
                    // But for now assuming modest blog traffic.
                    // Better approach: filter likes by user ID if available, or rely on backend to tell us.
                    // Since we have the list, let's look.
                    // Strapi user object has 'id'.
                    const existingLike = initialLikes.find(l => l.user?.id === user.id);
                    setUserLikedLike(existingLike);
                } catch (e) {
                    // Token might be invalid
                }
            }
        };
        checkUser();
    }, [initialLikes]);

    const handleToggle = async () => {
        if (!currentUser) {
            router.push('/auth/login');
            return;
        }

        if (loading) return;
        setLoading(true);

        try {
            if (userLikedLike) {
                // Unlike
                await deleteLike(userLikedLike.documentId);
                const newLikes = likes.filter(l => l.id !== userLikedLike.id);
                setLikes(newLikes);
                setUserLikedLike(undefined);
            } else {
                // Like
                const newLike = await createLike(articleId);
                // The returned like might not have user populated fully immediately, 
                // but we know it's the current user.
                const likeWithUser = { ...newLike, user: currentUser };
                setLikes([...likes, likeWithUser]);
                setUserLikedLike(likeWithUser);
            }
            router.refresh();
        } catch (error) {
            console.error('Failed to toggle like', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isLiked = !!userLikedLike;

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
