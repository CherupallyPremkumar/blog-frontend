import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting configuration (in-memory - use Redis in production for scaling)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // requests per window

/**
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIp) {
        return realIp;
    }

    return '127.0.0.1';
}

/**
 * Check rate limit for client
 */
function checkRateLimit(clientIp: string): boolean {
    const now = Date.now();
    const clientData = rateLimitMap.get(clientIp);

    if (!clientData) {
        rateLimitMap.set(clientIp, { count: 1, lastReset: now });
        return true;
    }

    // Reset if window has passed
    if (now - clientData.lastReset > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(clientIp, { count: 1, lastReset: now });
        return true;
    }

    // Increment and check
    clientData.count++;
    return clientData.count <= MAX_REQUESTS;
}

/**
 * Clean up old entries periodically (memory management)
 */
function cleanupRateLimitMap(): void {
    const now = Date.now();
    for (const [ip, data] of rateLimitMap.entries()) {
        if (now - data.lastReset > RATE_LIMIT_WINDOW * 2) {
            rateLimitMap.delete(ip);
        }
    }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupRateLimitMap, 5 * 60 * 1000);
}

/**
 * Next.js Middleware
 * Handles rate limiting, security, and request logging
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const clientIp = getClientIp(request);

    // Skip middleware for static assets and Next.js internals
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.includes('.') // Static files
    ) {
        return NextResponse.next();
    }

    // Rate limiting check
    if (!checkRateLimit(clientIp)) {
        return new NextResponse('Too Many Requests', {
            status: 429,
            headers: {
                'Retry-After': '60',
                'Content-Type': 'text/plain',
            },
        });
    }

    // Create response with additional headers
    const response = NextResponse.next();

    // Add request ID for tracing (useful for debugging)
    const requestId = crypto.randomUUID();
    response.headers.set('X-Request-Id', requestId);

    // Add timing header for performance monitoring
    response.headers.set('X-Response-Time', Date.now().toString());

    // Log request (in development or when logging is enabled)
    if (process.env.NODE_ENV === 'development') {
        console.log(`[${new Date().toISOString()}] ${request.method} ${pathname} - IP: ${clientIp} - Request ID: ${requestId}`);
    }

    return response;
}

/**
 * Configure which paths the middleware runs on
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
