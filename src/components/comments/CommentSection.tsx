'use client';

import { useState } from 'react';
import { createComment } from '@/lib/api';
import type { Comment } from '@/types';
import CommentList from './CommentList';
import { useAuth } from '@/contexts/AuthContext';

interface CommentSectionProps {
    articleId: number;
    initialComments: Comment[];
}

export default function CommentSection({ articleId, initialComments }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user, openAuthModal } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const createdComment = await createComment(articleId, newComment);
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

    const handleCommentUpdated = (updated: Comment) => {
        setComments(comments.map(c => c.id === updated.id ? updated : c));
    };

    const handleCommentDeleted = (commentId: number) => {
        setComments(comments.filter(c => c.id !== commentId));
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
                                className="w-full p-3 border border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Add to the discussion..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
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
                    <div className="bg-gray-50 dark:bg-neutral-900 p-6 rounded-lg text-center border border-gray-100 dark:border-neutral-800">
                        <p className="text-gray-600 dark:text-neutral-400 mb-4">
                            Join the discussion! Please sign in to leave a comment.
                        </p>
                        <div className="space-x-4">
                            <button
                                onClick={() => openAuthModal('login')}
                                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                            >
                                Sign In
                            </button>
                            <span className="text-gray-400 dark:text-neutral-500">|</span>
                            <button
                                onClick={() => openAuthModal('register')}
                                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                            >
                                Create Account
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <CommentList
                comments={comments}
                onCommentUpdated={handleCommentUpdated}
                onCommentDeleted={handleCommentDeleted}
            />
        </section>
    );
}
