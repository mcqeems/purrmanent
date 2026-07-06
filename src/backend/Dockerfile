FROM node:22-slim AS deps
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-slim AS build
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:22-slim AS runner
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/data ./data
COPY --from=build /app/package.json ./
EXPOSE 3001
CMD ["sh", "-c", "npx typeorm migration:run -d dist/database/data-source.js && node dist/scripts/seed-demo-data.js && node dist/scripts/ingest-corpus.js && node dist/main.js"]
