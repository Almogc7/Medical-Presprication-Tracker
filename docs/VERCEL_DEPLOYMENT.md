# Vercel Deployment Runbook (Private and Safe)

This guide deploys the app to Vercel without exposing account credentials or environment secrets in source control.

## 1. Security Rules

- Never commit `.env` files.
- Keep `.env.example` as placeholders only.
- Set real secrets only in Vercel Project Settings -> Environment Variables.
- Rotate any secret immediately if you think it was exposed.

## 2. Current Architecture Gap

Local development uses:

- SQLite (`file:./dev.db`)
- Local filesystem uploads (`public/uploads`)

On Vercel, both are ephemeral and not suitable for persistent production data.

Before production use, migrate to:

- Managed Postgres (for Prisma data)
- Managed object storage (for PDF files), such as Vercel Blob, Cloudflare R2, or AWS S3

## 3. Prepare Vercel Environment Variables

Set these in Vercel for `Production` (and optionally `Preview`):

- `DATABASE_URL` = your managed Postgres connection string
- `SESSION_SECRET` = long random secret (at least 32 bytes)
- `ADMIN_EMAIL` = owner email
- `ADMIN_PASSWORD` = owner password

Optional when moving uploads to cloud storage:

- `BLOB_READ_WRITE_TOKEN` (or your provider equivalent)

## 4. Prisma Migration for Production DB

From your local machine:

1. Point `DATABASE_URL` to Postgres in a local temporary `.env`.
2. Apply schema:

```bash
npx prisma migrate deploy
```

3. Seed initial owner data if needed:

```bash
npm run prisma:seed
```

If your Postgres database is empty and you only need schema+seed, this is enough.

## 5. Move Existing SQLite Data

Pick one method:

- Method A (recommended): one-time TypeScript migration script that reads from SQLite and writes to Postgres with Prisma clients.
- Method B: export/import tooling (CSV or DB-level converter) per table.

For this project, Method A is safest because IDs and relations must remain consistent.

Suggested migration order:

1. User
2. Person
3. Prescription
4. Notification
5. AuditLog

After migration, run sanity checks:

- Row counts per table
- Spot-check recent prescriptions
- Spot-check notification unread count

## 6. Move Existing PDF Files

Current files are under `public/uploads/prescriptions` and `public/uploads/tmp`.

Migration approach:

1. Upload files to your cloud storage bucket/container.
2. Store stable file key/path in DB (for example: `prescriptions/abc123.pdf`).
3. Update API read/write logic to use the storage SDK instead of `public/uploads` paths.

Important: local filesystem should be treated as temporary only on Vercel.

## 7. Deploy Steps

1. Push code to GitHub.
2. Import project in Vercel.
3. Add environment variables in Vercel UI.
4. Deploy.
5. Verify login, list pages, PDF open/download flow, and prescription create/delete actions.

## 8. Post-Deploy Checklist

- Confirm no secrets in git history.
- Confirm `.env` is ignored.
- Confirm uploads are no longer written to local disk in production.
- Confirm Prisma points to Postgres in production.
- Rotate `SESSION_SECRET` and admin password if they were ever shared.

## 9. Quick Rollback Plan

- Keep old deployment active until verification passes.
- If issues appear, rollback in Vercel to previous deployment.
- Do not run destructive DB cleanup until rollback window closes.
