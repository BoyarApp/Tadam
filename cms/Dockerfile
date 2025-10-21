FROM node:22-alpine AS base

WORKDIR /app

# Enable corepack and install pnpm
ENV PNPM_HOME="/usr/local/share/pnpm" \
    PATH="/usr/local/share/pnpm:$PATH" \
    CI=true \
    STRAPI_TELEMETRY_DISABLED=true
RUN corepack enable

COPY package.json pnpm-lock.yaml tsconfig.json ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 1337

CMD ["pnpm", "develop"]
