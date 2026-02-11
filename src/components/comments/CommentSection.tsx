'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createComment, getAuthToken, getMe } from '@/lib/api';
import type { Comment, User } from '@/types';
import CommentList from './CommentList';

interface CommentSectionProps {
    articleId: number;
    initialComments: Comment[];
}

export default function CommentSection({ articleId, initialComments }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const token = getAuthToken();
            if (token) {
                try {
                    const userData = await getMe();
                    setUser(userData);
                } catch {
                    // Token invalid
                }
            }
        };
        checkUser();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const createdComment = await createComment(articleId, newComment);
            // Optimistically add author if missing in response (some Strapi configs don't populate 'author' on create response)
            const commentWithAuthor = {
                ...createdComment,
                author: createdComment.author || user || undefined
            };
            setComments([commentWithAuthor, ...comments]);
            setNewComment('');
        } catch (err) {
            console.error('Failed to post comment', err);
            setError('Failed to post comment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>

            <div className="mb-8">
                {user ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="comment" className="sr-only">Your comment</label>
                            <textarea
                                id="comment"
                                rows={3}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Add to the discussion..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-red-600 text-sm">{error}</p>}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || !newComment.trim()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Posting...' : 'Post Comment'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                        <p className="text-gray-600 mb-4">
                            Join the discussion! Please log in to leave a comment.
                        </p>
                        <div className="space-x-4">
                            <Link
                                href="/auth/login"
                                className="text-blue-600 font-medium hover:underline"
                            >
                                Login
                            </Link>
                            <span className="text-gray-400">|</span>
                            <Link
                                href="/auth/register"
                                className="text-blue-600 font-medium hover:underline"
                            >
                                Register
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <CommentList comments={comments} />
        </section>
    );
}
