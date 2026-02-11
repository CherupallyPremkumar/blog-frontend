// Centralized configuration with environment variable validation

// ============================================================
// Environment Variable Validation
// ============================================================

function getEnvVar(key: string, required: boolean = true): string {
    const value = process.env[key];

    if (required && !value) {
        throw new Error(
            `Missing required environment variable: ${key}. ` +
            `Please check your .env.local file.`
        );
    }

    return value ?? '';
}

function getOptionalEnvVar(key: string, defaultValue: string): string {
    return process.env[key] ?? defaultValue;
}

// ============================================================
// Configuration Object
// ============================================================

export const config = {
    // API Configuration
    api: {
        strapiUrl: getOptionalEnvVar('NEXT_PUBLIC_STRAPI_API_URL', 'http://localhost:1337'),
        timeout: parseInt(getOptionalEnvVar('NEXT_PUBLIC_API_TIMEOUT', '30000'), 10),
        retryAttempts: parseInt(getOptionalEnvVar('NEXT_PUBLIC_API_RETRY_ATTEMPTS', '5'), 10),
    },

    // Site Configuration
    site: {
        name: getOptionalEnvVar('NEXT_PUBLIC_SITE_NAME', 'IOClick'),
        description: getOptionalEnvVar(
            'NEXT_PUBLIC_SITE_DESCRIPTION',
            'Documenting my journey in system design & engineering'
        ),
        url: getOptionalEnvVar('NEXT_PUBLIC_SITE_URL', 'https://ioclick.me'),
        author: getOptionalEnvVar('NEXT_PUBLIC_SITE_AUTHOR', 'Prem Kumar'),
    },

    // Feature Flags
    features: {
        analytics: getOptionalEnvVar('NEXT_PUBLIC_ENABLE_ANALYTICS', 'false') === 'true',
        darkMode: getOptionalEnvVar('NEXT_PUBLIC_ENABLE_DARK_MODE', 'true') === 'true',
        search: getOptionalEnvVar('NEXT_PUBLIC_ENABLE_SEARCH', 'true') === 'true',
    },

    // Analytics Configuration (optional)
    analytics: {
        gaId: getOptionalEnvVar('NEXT_PUBLIC_GA_ID', ''),
        plausibleDomain: getOptionalEnvVar('NEXT_PUBLIC_PLAUSIBLE_DOMAIN', ''),
    },

    // Cache Configuration
    cache: {
        revalidateSeconds: parseInt(getOptionalEnvVar('NEXT_PUBLIC_REVALIDATE_SECONDS', '60'), 10),
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
// Validation Helper (call at app startup)
// ============================================================

export function validateConfig(): void {
    // This will throw if required env vars are missing
    // Called implicitly when config is imported
    // Log only in development
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Config] Environment: ${process.env.NODE_ENV}`);
        console.log(`[Config] Strapi URL: ${config.api.strapiUrl}`);
    }

    // Warn about security issues in production
    if (config.isProd && config.api.strapiUrl.includes('localhost')) {
        console.warn(
            '[Config] WARNING: Using localhost Strapi URL in production. ' +
            'Please update NEXT_PUBLIC_STRAPI_API_URL.'
        );
    }
}
