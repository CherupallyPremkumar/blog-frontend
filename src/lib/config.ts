// Centralized configuration
// IMPORTANT: Next.js can only inline NEXT_PUBLIC_ vars when accessed
// directly (e.g., process.env.NEXT_PUBLIC_FOO), NOT via dynamic access
// (e.g., process.env[key]). All NEXT_PUBLIC_ vars must use direct access.

// ============================================================
// Configuration Object
// ============================================================

export const config = {
    // API Configuration
    api: {
        strapiUrl: process.env.NEXT_PUBLIC_STRAPI_API_URL || '',
        timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
        retryAttempts: parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '5', 10),
    },

    // Site Configuration
    site: {
        name: process.env.NEXT_PUBLIC_SITE_NAME || 'IOClick',
        description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Documenting my journey in system design & engineering',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ioclick.me',
        author: process.env.NEXT_PUBLIC_SITE_AUTHOR || 'Prem Kumar',
    },

    // Feature Flags
    features: {
        analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
        darkMode: (process.env.NEXT_PUBLIC_ENABLE_DARK_MODE || 'true') === 'true',
        search: (process.env.NEXT_PUBLIC_ENABLE_SEARCH || 'true') === 'true',
    },

    // Analytics Configuration (optional)
    analytics: {
        gaId: process.env.NEXT_PUBLIC_GA_ID || '',
        plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || '',
    },

    // Cache Configuration
    cache: {
        revalidateSeconds: parseInt(process.env.NEXT_PUBLIC_REVALIDATE_SECONDS || '60', 10),
    },

    // Development flags
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
} as const;

// ============================================================
// Type Exports
// ============================================================

export type Config = typeof config;

// ============================================================
// Validation Helper (call at app startup, server-side only)
// ============================================================

export function validateConfig(): void {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Config] Environment: ${process.env.NODE_ENV}`);
        console.log(`[Config] Strapi URL: ${config.api.strapiUrl}`);
    }

    if (!config.api.strapiUrl) {
        console.error(
            '[Config] ERROR: NEXT_PUBLIC_STRAPI_API_URL is not set. ' +
            'Please check your .env.local file or Render environment variables.'
        );
    }
}
