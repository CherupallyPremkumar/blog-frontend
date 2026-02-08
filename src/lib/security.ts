/**
 * Security utilities for HTML sanitization and content validation
 * Used to prevent XSS attacks and ensure safe content rendering
 */

// Basic HTML entity encoding for user-generated content
const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
};

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHtml(str: string): string {
    return str.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Allowed HTML tags for rich content
 * These tags are considered safe for rendering
 */
const ALLOWED_TAGS = new Set([
    'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'img', 'figure', 'figcaption',
    'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span',
]);

/**
 * Allowed attributes for specific tags
 */
const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
    'a': new Set(['href', 'target', 'rel', 'class']),
    'img': new Set(['src', 'alt', 'width', 'height', 'class', 'loading']),
    'div': new Set(['class', 'id']),
    'span': new Set(['class', 'id']),
    'pre': new Set(['class']),
    'code': new Set(['class']),
    'p': new Set(['class']),
    'h1': new Set(['class', 'id']),
    'h2': new Set(['class', 'id']),
    'h3': new Set(['class', 'id']),
    'h4': new Set(['class', 'id']),
    'h5': new Set(['class', 'id']),
    'h6': new Set(['class', 'id']),
    'ul': new Set(['class']),
    'ol': new Set(['class']),
    'li': new Set(['class']),
    'figure': new Set(['class']),
    'figcaption': new Set(['class']),
    'table': new Set(['class']),
    'blockquote': new Set(['class']),
};

/**
 * Dangerous URL protocols that should not be allowed in links
 */
const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:'];

/**
 * Check if a URL is safe
 */
export function isSafeUrl(url: string): boolean {
    const normalizedUrl = url.toLowerCase().trim();
    return !DANGEROUS_PROTOCOLS.some((protocol) => normalizedUrl.startsWith(protocol));
}

/**
 * Sanitize an attribute value
 */
function sanitizeAttributeValue(tagName: string, attrName: string, value: string): string | null {
    // Special handling for href and src attributes
    if (attrName === 'href' || attrName === 'src') {
        if (!isSafeUrl(value)) {
            return null;
        }
    }

    // Add rel="noopener noreferrer" for external links
    if (attrName === 'target' && value === '_blank') {
        return value;
    }

    return value;
}

/**
 * Simple HTML sanitizer
 * Note: For production, consider using DOMPurify library
 * This is a basic implementation for demonstration
 */
export function sanitizeHtml(html: string): string {
    if (!html) return '';

    // Remove script tags and their content
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handlers
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*(['"])[^'"]*\1/gi, '');
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '');

    // Remove style tags
    sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Remove iframe, object, embed tags
    sanitized = sanitized.replace(/<(iframe|object|embed|form|input|button)[^>]*>[\s\S]*?<\/\1>/gi, '');
    sanitized = sanitized.replace(/<(iframe|object|embed|form|input|button)[^>]*\/?>/gi, '');

    // Remove javascript: URLs
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Ensure external links have proper attributes
    sanitized = sanitized.replace(
        /<a\s+([^>]*href=["'][^"']*["'][^>]*)>/gi,
        (match, attrs) => {
            if (!attrs.includes('rel=')) {
                return `<a ${attrs} rel="noopener noreferrer">`;
            }
            return match;
        }
    );

    return sanitized;
}

/**
 * Validate and sanitize content from CMS
 */
export function sanitizeCmsContent(content: string): string {
    if (!content) return '';

    // First pass: basic sanitization
    let sanitized = sanitizeHtml(content);

    // Ensure all images have alt text
    sanitized = sanitized.replace(
        /<img\s+([^>]*?)>/gi,
        (match, attrs) => {
            if (!attrs.includes('alt=')) {
                return `<img ${attrs} alt="Image">`;
            }
            return match;
        }
    );

    // Add loading="lazy" to images for performance
    sanitized = sanitized.replace(
        /<img\s+([^>]*?)>/gi,
        (match, attrs) => {
            if (!attrs.includes('loading=')) {
                return `<img ${attrs} loading="lazy">`;
            }
            return match;
        }
    );

    return sanitized;
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
 * Sanitize user input for display
 */
export function sanitizeUserInput(input: string): string {
    return escapeHtml(input.trim());
}
