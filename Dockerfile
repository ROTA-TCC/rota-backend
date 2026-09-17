FROM node:22-alpine AS build

WORKDIR /usr/src/app

ARG NODE_AUTH_TOKEN

COPY package.json pnpm-lock.yaml ./

RUN if [ -n "$NODE_AUTH_TOKEN" ]; then \
      echo "//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}" > .npmrc; \
    fi && \
    npm install -g pnpm && \
    pnpm install --frozen-lockfile --ignore-scripts && \
    rm -f .npmrc

COPY . .

ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/db"
RUN pnpm prisma generate
RUN pnpm run build

RUN pnpm prune --prod

FROM node:22-alpine AS production

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/node_modules ./node_modules

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/src/main"]