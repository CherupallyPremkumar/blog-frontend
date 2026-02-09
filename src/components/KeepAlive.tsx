'use client';

import { useEffect } from 'react';

/**
 * KeepAlive Component
 * 
 * This component pings the internal /api/keep-alive endpoint every 5 minutes
 * to ensure that the server (and subsequently the backend) stays awake
 * while a user is actively browsing the application.
 */
export function KeepAlive() {
    useEffect(() => {
        // Ping immediately on mount
        const ping = () => {
            fetch('/api/keep-alive')
                .catch(err => console.error('Keep-alive ping failed:', err));
        };

        ping();

        // Ping every 5 minutes (300,000 ms)
        const intervalId = setInterval(ping, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    return null;
}
