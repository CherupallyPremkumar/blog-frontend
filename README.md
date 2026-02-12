# 🎨 Personal Blog Frontend

A modern, high-performance blog frontend built with **Next.js 14**, **Tailwind CSS v4**, and **TypeScript**. Designed for speed, aesthetics, and a seamless reading experience.

## ✨ Features

- **⚡️ Next.js 14 App Router**: Server Components, streaming, and optimized rendering.
- **🌗 Dark Mode**: System-aware theme switching with persistent user preference (localStorage).
- **📝 Rich Content**: Renders Markdown/Blocks from Strapi, including code blocks, images, and nested lists.
- **📑 Table of Contents**: Auto-generated sticky sidebar with active scroll highlighting.
- **📊 Reading Progress**: Visual progress bar for long articles.
- **🖼️ Image Optimization**: Supports Strapi & Cloudinary with Next.js Image component (AVIF/WebP).
- **🔐 User Authentication**: Login/Register modal, JWT storage, profile management.
- **👤 User Profiles**: Edit bio, upload avatar, view liked/recent articles.
- **💬 Comments & Likes**: Interactive features for logged-in users.
- **📱 Responsive**: Fully mobile-optimized layout with collapsible navigation.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, CSS Variables
- **Icons**: Lucide React
- **State**: React Context (Auth, Theme)
- **Data Fetching**: Native `fetch` with caching/revalidation
- **Backend**: Strapi v5 (Headless CMS)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env.local` and update values:
   ```bash
   cp .env.example .env.local
   ```
   
   **Required Variables:**
   ```env
   NEXT_PUBLIC_STRAPI_API_URL=https://api.yourdomain.com
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Scripts

- `npm run dev`: Start development server (Turbopack enabled)
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run lint`: Run ESLint

## 📂 Project Structure

```
src/
├── app/              # App Router pages & layouts
├── components/       # Reusable UI components
│   ├── auth/         # Auth forms & modals
│   ├── blog/         # Blog-specific components
│   ├── comments/     # Comment section logic
│   ├── header/       # Header & Navigation
│   └── ...
├── contexts/         # React Context providers (Auth, Theme)
├── lib/              # Utilities (API, Config, Security)
└── types/            # TypeScript definitions
```

## 🎨 Theme Configuration

Themes are handled via `src/contexts/ThemeContext.tsx` and `src/app/globals.css`.
- **Light**: Uses `bg-white`, `text-gray-900`
- **Dark**: Uses custom CSS variables `--background: #000000`, `--foreground: #ffffff`

## 🔒 Authentication

Authentication is handled via JWT tokens stored in `localStorage` (via `src/lib/api.ts`).
- `AuthProvider` manages user session state.
- `AuthModal` handles login/register flows without page redirects.

---

Built with ❤️ by Prem Kumar
