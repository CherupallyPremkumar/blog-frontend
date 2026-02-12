/**
 * Table of Contents heading types and server-side utilities.
 * This module is server-safe (no 'use client' directive).
 */

export interface TOCHeading {
    id: string;
    text: string;
    level: number;
}

/**
 * Extract headings from markdown content (server-side utility)
 */
export function extractHeadings(content: string): TOCHeading[] {
    const headings: TOCHeading[] = [];
    const regex = /^(#{2,3})\s+(.+)$/gm;
    let match;

    while ((match = regex.exec(content)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        headings.push({ id, text, level });
    }

    return headings;
}
