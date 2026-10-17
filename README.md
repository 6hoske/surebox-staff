# SureBox Staff Panel — Cloudflare Workers + D1

This package uses the provided SureBox Staff 4.3 Cloudflare-adapted HTML as the UI baseline.

## Before deploying
1. Review `public/index.html`: the original file includes an initial demo account/password and several feature functions are currently empty stubs. Remove demo credentials and implement/verify login before public use.
2. The Worker `/api/sync` endpoint is not authenticated yet. Do not expose it publicly until authentication/authorization is added.
3. Verify the D1 database ID in `wrangler.toml` is your intended database.

## Setup
```bash
npm install
npx wrangler d1 execute surebox-staff-db --remote --file=migrations/0001_init.sql
npm run deploy
```

For local development:
```bash
npm run dev
```

The migration creates tables only if they do not exist and inserts default norms/salary settings. It does not delete existing tables or records.
