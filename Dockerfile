FROM oven/bun:1.2.14 AS build

WORKDIR /app

# รับ ARG เข้ามาจาก docker-compose
ARG VITE_BACKEND_API_URL
ARG VITE_ENV_MODE

# ตั้งเป็น ENV เพื่อให้ Vite อ่านได้ตอน build
ENV VITE_BACKEND_API_URL=$VITE_BACKEND_API_URL
ENV VITE_ENV_MODE=$VITE_ENV_MODE

COPY . .
RUN bun install
RUN bun run build

# Production build with security headers
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Use production nginx config with full security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

