# Build
FROM node:trixie@sha256:c41bbd71d4f71cc65ac836fae7ab69ad1b6ebc3bbfdac94d0ababa7fc1554b39 AS build
WORKDIR /frontend
COPY frontend/package*.json .
RUN npm ci
COPY frontend .
RUN npm run build

# Runtime
FROM nginx:alpine
COPY --from=build /frontend/dist /usr/share/nginx/html
