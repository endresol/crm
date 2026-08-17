#!/bin/sh
# Vercel build entrypoint (see package.json's "vercel-build" script — Vercel
# runs that in place of the framework default when present). Only production
# deploys (pushes to main) apply pending migrations against the real
# database; preview deploys build against whatever schema is already there
# without touching it, so an unmerged branch can never migrate prod ahead of
# main. Migrations run over DIRECT_URL (a non-pooled Neon connection) rather
# than the pooled DATABASE_URL the app uses at runtime — Prisma's advisory
# locks and multi-statement DDL aren't reliable over PgBouncer's transaction
# pooling mode.
set -e

if [ "$VERCEL_ENV" = "production" ]; then
  echo "Production build — applying pending migrations..."
  DATABASE_URL="$DIRECT_URL" npx prisma migrate deploy
fi

next build
