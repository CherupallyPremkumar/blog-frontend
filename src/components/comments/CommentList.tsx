'use client';

import { useState } from 'react';
import type { Comment } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { updateComment, deleteComment } from '@/lib/api';

interface CommentListProps {
    comments: Comment[];
    onCommentUpdated: (updated: Comment) => void;
    onCommentDeleted: (commentId: number) => void;
}

export default function CommentList({ comments, onCommentUpdated, onCommentDeleted }: CommentListProps) {
    const { user } = useAuth();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [loading, setLoading] = useState(false);

    if (comments.length === 0) {
        return <div className="text-gray-500 italic">No comments yet. Be the first to share your thoughts!</div>;
    }

    const startEdit = (comment: Comment) => {
        setEditingId(comment.id);
        setEditContent(comment.content);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditContent('');
    };

    const saveEdit = async (comment: Comment) => {
        if (!editContent.trim() || loading) return;
        setLoading(true);
        try {
            const updated = await updateComment(comment.documentId, editContent.trim());
            onCommentUpdated({ ...updated, author: comment.author });
            cancelEdit();
        } catch (error) {
            console.error('Failed to update comment', error);
            alert('Failed to update comment.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (comment: Comment) => {
        if (!confirm('Delete this comment?')) return;
        setLoading(true);
        try {
            await deleteComment(comment.documentId);
            onCommentDeleted(comment.id);
        } catch (error) {
            console.error('Failed to delete comment', error);
            alert('Failed to delete comment.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {comments.map((comment) => {
                const isOwner = user && comment.author?.id === user.id;
                const isEditing = editingId === comment.id;

                return (
                    <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold text-gray-800">
                                {comment.author?.username || 'Anonymous'}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 dark:text-neutral-400">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                                {isOwner && !isEditing && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => startEdit(comment)}
                                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                            disabled={loading}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(comment)}
                                            className="text-sm text-red-500 hover:text-red-700 hover:underline"
                                            disabled={loading}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="space-y-2">
                                <textarea
                                    rows={3}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => saveEdit(comment)}
                                        disabled={loading || !editContent.trim()}
                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-700 whitespace-pre-wrap">
                                {comment.content}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
