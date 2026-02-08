import type { NextConfig } from "next";

// Get Strapi URL from environment
const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const strapiHostname = new URL(strapiUrl).hostname;
const strapiPort = new URL(strapiUrl).port || '';
const strapiProtocol = new URL(strapiUrl).protocol.replace(':', '') as 'http' | 'https';

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: strapiProtocol,
        hostname: strapiHostname,
        port: strapiPort,
        pathname: '/uploads/**',
      },
      // Allow any HTTPS domain for production flexibility
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/uploads/**',
      },
    ],
    // Enable modern image formats
    formats: ['image/avif', 'image/webp'],
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Turbopack configuration
  turbopack: {
    root: process.cwd(), // Explicitly set workspace root to current directory
  },

  // Security headers
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Block MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // XSS Protection (legacy browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions policy (restrict browser features)
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Content Security Policy - dynamically include Strapi URL
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              `img-src 'self' data: blob: ${strapiUrl} https:`,
              "font-src 'self' data:",
              `connect-src 'self' ${strapiUrl} https:`,
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Redirects (example - add yours as needed)
  async redirects() {
    return [];
  },

  // Enable strict mode for better React debugging
  reactStrictMode: true,

  // Performance optimizations
  poweredByHeader: false, // Remove X-Powered-By header

  // Compression (handled by hosting platform typically)
  compress: true,

  // Output configuration for different deployment targets
  // output: 'standalone', // Uncomment for Docker/self-hosted deployments
};

export default nextConfig;
