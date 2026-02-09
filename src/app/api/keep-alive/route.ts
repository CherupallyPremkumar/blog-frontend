import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET() {
    const backendUrl = config.api.strapiUrl;

    try {
        // We just need to hit the backend; we don't strictly care about the response content
        // as long as the request reaches the server to wake it up.
        // Usually /_health or just the root /api is enough.
        // We'll use a timeout to avoid hanging if the backend is cold-starting.
        // We'll use a timeout to avoid hanging if the backend is cold-starting.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        // Hit the specific public keep-alive endpoint we created on the backend
        await fetch(`${backendUrl}/api/keep-alive`, {
            method: 'GET',
            signal: controller.signal
        }).catch(err => {
            // Ignore abort errors or network errors, we just wanted to poke it
            console.log('Backend ping dispatched:', err.message);
        }).finally(() => {
            clearTimeout(timeoutId);
        });

        return NextResponse.json({
            status: 'ok',
            message: 'Keep-alive ping received',
            backend_target: backendUrl,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Keep-alive error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to ping backend' },
            { status: 500 }
        );
    }
}
