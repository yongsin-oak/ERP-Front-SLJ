FROM oven/bun:1.2.14 as build

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

EXPOSE 8080

# serve แบบ static
CMD ["serve", "-s", "dist", "-l", "8080"]
