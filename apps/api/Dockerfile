FROM node:20-alpine AS build
WORKDIR /app

COPY package.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm install

COPY . .
RUN npm run build --workspace @aih/api

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm install --omit=dev

COPY --from=build /app/apps/api/dist apps/api/dist

EXPOSE 8787
CMD ["node", "apps/api/dist/index.js"]
