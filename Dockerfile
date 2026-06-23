FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY client/package.json client/
COPY server/package.json server/
RUN pnpm install --frozen-lockfile
COPY client client/
COPY server server/
RUN pnpm --filter flash-clip-client build

FROM base AS production
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY server/package.json server/
RUN pnpm install --frozen-lockfile --filter flash-clip-server --prod
COPY server server/
COPY --from=build /app/client/dist /app/client/dist

ENV STATIC_DIR=/app/client/dist
ENV PORT=3000
EXPOSE 3000

WORKDIR /app/server
CMD ["node", "index.js"]
