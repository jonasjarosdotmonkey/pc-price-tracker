# PC Price Tracker

A modern, production-ready web app for tracking PC component prices across major retailers.

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, Recharts
- **Backend:** Next.js API routes
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js (credentials + JWT)
- **Email:** Nodemailer
- **Deployment:** Vercel (with cron jobs)

## Features

- Live price tracking for CPUs, GPUs, motherboards, RAM, SSDs, PSUs, cases, and coolers
- Price comparison across Amazon, Newegg, Best Buy, B&H, Micro Center, Walmart
- Interactive price history charts (7, 30, 90 day, all-time)
- Price drop email alerts
- User authentication and favorites
- PC Build Planner
- Admin dashboard
- Hourly price updates via Vercel Cron

## Quick Start

### 1. Clone and install dependencies

```bash
cd "PC BUILD WEBSITE"
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — Random secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` — `http://localhost:3000` for local dev
- Email credentials for price alert emails

### 3. Set up the database

```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Create tables
npm run db:seed        # Seed with sample data
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

After seeding:
- **Admin:** `admin@pcpricetracker.com` / `admin123`
- **User:** `user@pcpricetracker.com` / `user123`

## Deployment to Vercel

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Set `DATABASE_URL` to a PostgreSQL service (e.g., Neon, Supabase, PlanetScale)
5. After deploy, run `npm run db:seed` pointing at your production DB

The `vercel.json` configures a cron job to update prices every hour.

## Adding Real Price Providers

The architecture uses a `PriceProvider` interface (`src/services/providers/base.ts`). To add a real provider:

1. Create a new file in `src/services/providers/`
2. Extend `BaseProvider` 
3. Implement `getProducts()` and `getPrice()`
4. Add it to the provider list in `src/services/price-collector.ts`

**Amazon:** Use the [Amazon Product Advertising API](https://webservices.amazon.com/paapi5/documentation/) — requires associate account approval.

**Newegg:** Apply for the [Newegg Affiliate Program](https://sell.newegg.com/affiliate).

**Others:** Check each retailer's terms of service and available APIs.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/               # REST API endpoints
│   ├── admin/             # Admin dashboard
│   ├── products/          # Product listing & detail
│   ├── builds/            # PC build planner
│   ├── alerts/            # Price alerts management
│   └── favorites/         # Saved products
├── components/            # React components
│   ├── layout/           # Navbar, Footer
│   ├── products/         # Product cards, charts, filters
│   └── ui/               # Base UI components
├── lib/                   # Utilities (db, auth, cache, email)
├── services/              # Price collection & providers
│   └── providers/        # Pluggable data providers
└── types/                 # TypeScript types
```

## License

MIT
