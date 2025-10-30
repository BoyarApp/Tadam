# Stage 1: Dependencies
FROM node:22-alpine AS deps

WORKDIR /usr/src/app

# Enable corepack and install pnpm
ENV PNPM_HOME="/usr/local/share/pnpm" \
    PATH="/usr/local/share/pnpm:$PATH"

RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

ENV PNPM_HOME="/usr/local/share/pnpm" \
    PATH="/usr/local/share/pnpm:$PATH"

RUN corepack enable

# Copy dependencies from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Stage 3: Production runtime
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production \
    PNPM_HOME="/usr/local/share/pnpm" \
    PATH="/usr/local/share/pnpm:$PATH"

RUN corepack enable && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxtjs

# Copy necessary files from builder
COPY --from=builder --chown=nuxtjs:nodejs /usr/src/app/.output ./.output
COPY --from=builder /usr/src/app/package.json ./package.json

USER nuxtjs

EXPOSE 3000

ENV HOST=0.0.0.0 \
    PORT=3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", ".output/server/index.mjs"]
