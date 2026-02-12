/**
 * Security utilities for HTML sanitization and content validation
 * Uses DOMPurify for production-grade XSS protection
 */
import DOMPurify from 'isomorphic-dompurify';

// Configure DOMPurify defaults
const SANITIZE_CONFIG = {
    ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'ul', 'ol', 'li',
        'a', 'strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins',
        'code', 'pre', 'blockquote',
        'img', 'figure', 'figcaption',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'span', 'div', 'section',
        'sup', 'sub', 'mark', 'abbr',
    ],
    ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id',
        'target', 'rel', 'width', 'height', 'loading',
        'colspan', 'rowspan', 'scope',
    ],
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover'],
};

/**
 * Sanitize HTML content using DOMPurify
 */
export function sanitizeHtml(html: string): string {
    if (!html) return '';
    return DOMPurify.sanitize(html, SANITIZE_CONFIG) as string;
}

/**
 * Sanitize CMS content with additional processing
 */
export function sanitizeCmsContent(content: string): string {
    if (!content) return '';

    // DOMPurify sanitization
    let sanitized = DOMPurify.sanitize(content, SANITIZE_CONFIG) as string;

    // Post-process: add rel="noopener noreferrer" to external links
    sanitized = sanitized.replace(
        /<a\s+([^>]*href=["'][^"']*["'][^>]*)>/gi,
        (match: string, attrs: string) => {
            if (!attrs.includes('rel=')) {
                return `<a ${attrs} rel="noopener noreferrer">`;
            }
            return match;
        }
    );

    return sanitized;
}

/**
 * Escape HTML entities to prevent XSS in plain text contexts
 */
export function escapeHtml(str: string): string {
    const htmlEntities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };
    return str.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

/**
 * Generate a nonce for CSP
 */
export function generateNonce(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID().replace(/-/g, '');
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Sanitize user input for display in plain text contexts
 */
export function sanitizeUserInput(input: string): string {
    return escapeHtml(input.trim());
}
