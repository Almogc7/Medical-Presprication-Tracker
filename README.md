# Prescription Tracker

Prescription Tracker is a secure MVP web app for tracking medical cannabis prescription PDFs for exactly four people. It helps prevent losing prescriptions by highlighting expirations early, supporting mark-as-issued workflows, and keeping full history.

## Who It Is For

- Single-user household workflow with up to 4 tracked people
- Non-technical users who need clear reminders and simple actions
- Local-first usage with SQLite and local PDF storage

## Core Capabilities

- Basic authentication and protected routes
- Dashboard with summary cards, urgent alerts, upcoming expirations, recent activity
- People view with per-person prescription summaries
- Person detail page with filters and prescription table
- Upload and parse prescription PDFs (with review and manual correction)
- Status management: active, issued, expired
- In-app notifications with unread badge and read/unread state
- English and Hebrew localization with RTL support

## Tech Stack

- Next.js (App Router) + TypeScript + React
- Tailwind CSS
- Prisma ORM + SQLite
- Local file storage under public/uploads
- pdf-parse for server-side PDF text extraction
- Vitest for unit tests

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment file:

```bash
cp .env.example .env
```

If you are on Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Run database migration:

```bash
npm run prisma:migrate -- --name init
```

4. Seed sample data (4 people + prescriptions + notifications):

```bash
npm run prisma:seed
```

5. Start the app:

```bash
npm run dev
```

6. Login with:

- Email: value from ADMIN_EMAIL in .env
- Password: value from ADMIN_PASSWORD in .env

## Environment Variables

- DATABASE_URL: Prisma SQLite connection string
- SESSION_SECRET: secret for signed cookie session token
- ADMIN_EMAIL: login email
- ADMIN_PASSWORD: login password

## Deploying to Vercel

This project runs locally with SQLite and local file storage by default.

For production on Vercel, move to:

- Managed Postgres for `DATABASE_URL`
- Managed object storage for PDF files

Use the full deployment and migration checklist in:

- `docs/VERCEL_DEPLOYMENT.md`

## PDF Upload Flow

1. Select a person
2. Upload PDF
3. Server validates file type and size
4. Server extracts text and detects likely dates
5. User reviews detected start/expiration dates
6. User edits if needed and saves
7. Prescription is stored with PDF path and optional extracted text

## Localization and RTL

- Dictionaries:
	- locales/en.ts
	- locales/he.ts
- Language switcher in top navbar
- Locale persisted in cookie
- Root layout sets lang and dir dynamically
- Hebrew mode uses RTL layout automatically

## Running Tests

```bash
npm run test
```

Current tests cover:

- Expiration calculations
- Status transitions
- Issued logic behavior
- Threshold matching
- Date extraction helper behavior

## Project Structure

- app: routes, pages, API handlers, server actions
- components: reusable UI and feature components
- lib: auth, i18n, constants, prisma client
- services: dashboard, notification, prescription business logic
- utils: date, PDF parsing, file sanitization, class helpers
- prisma: schema and seed script
- locales: translation dictionaries
- tests: Vitest unit tests
- public/uploads: persisted prescription files

## Security Baseline in MVP

- Signed session cookie
- Route protection via middleware
- PDF-only upload validation
- Upload size limit
- Sanitized stored filenames
- Controlled path usage for file handling

## Future Improvements

- Password hashing and user model
- Encryption at rest for PDFs and sensitive fields
- Scheduled background job for notifications
- Email/SMS notification channels
- Cloud storage and multi-user support
