FROM node:24-bookworm-slim AS build-web
WORKDIR /projeto/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/index.html frontend/vite.config.js ./
COPY frontend/src ./src
COPY liga-api/src/liga_api/assets /projeto/liga-api/src/liga_api/assets

ARG VITE_MESA_API_PORTA=8000
ARG VITE_MESA_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build-web /projeto/frontend/dist /usr/share/nginx/html
