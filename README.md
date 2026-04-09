# RoomAI - AI-Powered Interior Design

A full-stack application that uses AI to generate personalized interior design suggestions with furniture recommendations.

## Features

- **AI Design Pipeline**: 9-stage pipeline for room analysis, furniture placement, product selection, and image compositing
- **Inngest Workflow**: Async job orchestration for design generation
- **Supabase Integration**: PostgreSQL database with Row Level Security
- **Stripe Billing**: Free tier (1 variation) and Pro tier (3 variations)
- **Product Database**: 12+ furniture items with search and filtering
- **Real-time Job Polling**: Live status updates during design generation

## Tech Stack

- **Frontend**: Next.js 16 with App Router, React, TailwindCSS
- **Backend**: Next.js API Routes, Supabase
- **Jobs**: Inngest for async workflows
- **Storage**: Vercel Blob for image storage
- **Payment**: Stripe
- **Database**: Supabase PostgreSQL with RLS

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account (connected)
- Inngest account (optional for local dev)
- Stripe account (optional for payments)

### Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Environment variables**
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Optional
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

3. **Run migrations**
   The database schema is created automatically. To seed products:
   ```bash
   pnpm run db:seed
   ```

4. **Start dev server**
   ```bash
   pnpm dev
   ```

5. **Visit app**
   Open http://localhost:3000

## Project Structure

```
app/
├── api/
│   ├── upload/              # Image upload to Vercel Blob + job creation
│   ├── jobs/[jobId]/        # Job status polling
│   ├── products/search/     # Product search and filtering
│   ├── billing/             # Stripe checkout & webhooks
│   └── inngest/             # 9-stage AI pipeline functions
├── dashboard/
│   ├── layout.tsx           # Protected dashboard layout
│   ├── page.tsx             # Upload form
│   ├── results/[jobId]/     # Live job status + design results
│   └── design/[designId]/   # Design detail with products
├── login/page.tsx           # Authentication
├── signup/page.tsx
└── pricing/page.tsx         # Pricing plans

components/
├── upload-form.tsx          # Room upload interface

lib/
├── auth-context.tsx         # Supabase auth provider
├── supabase.ts              # Supabase client
└── product-seed-data.ts    # Furniture database

middleware.ts               # Route protection

scripts/
└── 001_create_schema.sql   # Database schema migration
```

## 9-Stage AI Pipeline

1. **Room Analysis**: Detect room dimensions, existing furniture, lighting
2. **Budget Breakdown**: Allocate budget across categories
3. **Furniture Placement**: Optimize furniture positioning
4. **Product Search**: Find matching products from database
5. **Product Ranking**: Score products by style/price/fit
6. **Product Selection**: Pick final furniture set
7. **Background Removal**: Clean product images
8. **Image Compositing**: Blend furniture into room photo (Normal + Soft Light blend modes, depth scaling)
9. **Upscaling**: Optional 4K enhancement

## Database Schema

### Tables
- **profiles**: User data with subscription tier
- **uploads**: Room photos and preferences
- **jobs**: Inngest workflow tracking (stages 0-9)
- **designs**: Final composited images (variations 1-3)
- **design_products**: Link between designs and products
- **products**: Furniture database (12+ items)

## Pricing

- **Free**: 1 design variation per upload
- **Pro** ($9.99/month): 3 variations, upscaling, priority support

## API Endpoints

- `POST /api/upload` - Upload room image + create job
- `GET /api/jobs/[jobId]` - Poll job status
- `GET /api/products/search` - Search furniture by category/style/price
- `POST /api/billing/checkout` - Stripe checkout session
- `POST /api/billing/webhook` - Stripe subscription updates

## Next Steps

1. Connect real Replicate API for background removal
2. Implement canvas compositing on backend
3. Add email notifications for completed designs
4. Build admin dashboard for product management
5. Add image upscaling integration
6. Implement user favorites/history

## Support

For questions or issues, contact support@roomai.com
