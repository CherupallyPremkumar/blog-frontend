'use client';

import { useRouter } from 'next/navigation';

interface RetryButtonProps {
    className?: string;
    children: React.ReactNode;
}

export default function RetryButton({ className, children }: RetryButtonProps) {
    const router = useRouter();

    const handleRetry = (e: React.MouseEvent) => {
        e.preventDefault();
        window.location.reload();
    };

    return (
        <button
            onClick={handleRetry}
            className={className}
        >
            {children}
        </button>
    );
}
