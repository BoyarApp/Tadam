FROM node:22-alpine AS base

WORKDIR /usr/src/app

# Enable corepack and install pnpm
ENV PNPM_HOME="/usr/local/share/pnpm" \
    PATH="/usr/local/share/pnpm:$PATH"

RUN corepack enable

COPY package.json ./
COPY pnpm-lock.yaml* ./

RUN pnpm install

COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
