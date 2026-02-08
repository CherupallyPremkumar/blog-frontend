import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SkipToContent, Header, HeaderSkeleton } from "@/components/Layout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Default metadata for the site
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "IOClick",
    template: "%s | IOClick",
  },
  description: "Documenting my journey in system design & engineering",
  keywords: ["blog", "system design", "engineering", "software development", "architecture"],
  authors: [{ name: "Prem Kumar" }],
  creator: "Prem Kumar",
  publisher: "IOClick",

  // Favicon and icons
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  // Open Graph metadata for social sharing
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    siteName: "IOClick",
    title: "IOClick",
    description: "Documenting my journey in system design & engineering",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "IOClick - System Design & Engineering Blog",
      },
    ],
  },

  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "IOClick",
    description: "Documenting my journey in system design & engineering",
    images: ["/og-image.png"],
    creator: "@premkumar",
  },

  // Robots configuration
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification for search engines (add your own if needed)
  // verification: {
  //   google: "your-google-verification-code",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Strapi for faster image loading */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SkipToContent />
        <Header />
        {children}
      </body>
    </html>
  );
}
