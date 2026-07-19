/**
 * lib/apiUrl.ts
 *
 * Single source of truth for the API base URL.
 *
 * All API routes are now Next.js API Route handlers located at app/api/**
 * and served from the same Vercel deployment as the frontend.
 *
 * API_BASE uses a relative path so it works in both development (localhost:3000)
 * and production (your-app.vercel.app) without any environment variables.
 *
 * Import from here instead of inlining the path across every page.
 */

export const API_BASE = "/api";
