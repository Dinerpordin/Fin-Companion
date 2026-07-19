# Bangladesh Financial Companion (Monorepo)

A privacy-first, serverless financial information and guidance platform for Bangladesh. 

This repository is structured as a monorepo containing the Next.js web application (with integrated API routes), scrapers, and data pipelines.

## Repository Structure

```
├── apps/
│   ├── web/               # Next.js 16 Web Application + API Routes (Vercel)
│   └── api/               # FastAPI Python Backend (Archived, migrated to Next.js routes)
├── packages/
│   ├── calculators/       # Shared TypeScript math functions (APR, scenario calculations)
│   └── shared/            # Shared TypeScript types and configurations
├── scrapers/              # Scrapy spiders for gathering rate data
├── pipelines/             # Airflow DAGs for scheduled updates
└── infra/                 # Docker Compose for local PostgreSQL + Redis
```

## Deployed Architecture ($0/month Serverless)

The application has been migrated from a separate container-based backend to a fully serverless stack hosted on Vercel and Supabase:

*   **Frontend & API routes**: Next.js hosted on **Vercel** ($0/month).
*   **Database & Vector search**: PostgreSQL with pgvector hosted on **Supabase** (Free Tier).
*   **Audio Speech-to-Text**: Serverless audio transcription powered by the **Gemini API** ($0/month).
*   **Scheduled Scrapers**: Executed daily via **GitHub Actions** cron job ($0/month).

## Development Setup

To run the Next.js frontend and serverless API endpoints locally:

1.  Configure environment variables in `apps/web/.env.local`.
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Run the development server:
    ```bash
    pnpm --filter @fc/web dev
    ```
4.  Open `http://localhost:3000` in your browser.
