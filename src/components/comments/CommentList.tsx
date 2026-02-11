import type { Comment } from '@/types';

interface CommentListProps {
    comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
    if (comments.length === 0) {
        return <div className="text-gray-500 italic">No comments yet. Be the first to share your thoughts!</div>;
    }

    return (
        <div className="space-y-6">
            {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-gray-800">
                            {comment.author?.username || 'Anonymous'}
                        </div>
                        <div className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                    </div>
                </div>
            ))}
        </div>
    );
}
