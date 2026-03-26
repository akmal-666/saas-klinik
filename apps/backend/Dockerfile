# ─── Stage 1: Builder ─────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install turbo globally
RUN npm install -g turbo

# Copy workspace files
COPY package.json package-lock.json turbo.json ./
COPY packages/ ./packages/

# Copy backend only (prune to reduce image size)
COPY apps/backend/ ./apps/backend/

# Install dependencies
RUN npm ci --workspace=@klinik/backend --workspace=@klinik/shared-types --workspace=@klinik/shared-constants

# Build
WORKDIR /app/apps/backend
RUN npm run build

# ─── Stage 2: Production ──────────────────────────────────
FROM node:20-alpine AS production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

WORKDIR /app

# Copy built output
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/package.json ./

# Install production deps only
RUN npm ci --omit=dev

USER nestjs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/v1/health || exit 1

CMD ["node", "dist/main"]
