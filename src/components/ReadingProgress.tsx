'use client';

import { useState, useEffect } from 'react';

export default function ReadingProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const article = document.getElementById('main-content');
            if (!article) return;

            const rect = article.getBoundingClientRect();
            const articleTop = rect.top + window.scrollY;
            const articleHeight = article.scrollHeight;
            const windowHeight = window.innerHeight;

            // Calculate how far we've scrolled through the article
            const scrolled = window.scrollY - articleTop;
            const total = articleHeight - windowHeight;

            if (total <= 0) {
                setProgress(0);
                return;
            }

            const pct = Math.min(Math.max((scrolled / total) * 100, 0), 100);
            setProgress(pct);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // initial

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (progress <= 0) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-transparent"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Reading progress"
        >
            <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
