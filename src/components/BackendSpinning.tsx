'use client';

import { useState, useEffect } from 'react';

interface BackendSpinningProps {
    onRetry: () => void;
}

export function BackendSpinning({ onRetry }: BackendSpinningProps) {
    const [countdown, setCountdown] = useState(30);

    useEffect(() => {
        if (countdown <= 0) {
            onRetry();
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(countdown - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, onRetry]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
                <div className="mb-6">
                    <svg
                        className="animate-spin h-12 w-12 text-gray-900 mx-auto"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Waking up the server...
                </h2>

                <p className="text-gray-600 mb-4">
                    Our backend is spinning up. This usually takes a few seconds on the free tier.
                </p>

                <div className="text-sm text-gray-500">
                    Auto-retry in <span className="font-mono font-bold text-gray-900">{countdown}</span> seconds
                </div>

                <button
                    onClick={onRetry}
                    className="mt-6 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    Retry Now
                </button>
            </div>
        </div>
    );
}

export default BackendSpinning;
