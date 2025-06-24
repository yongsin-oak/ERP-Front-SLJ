# Base image with Bun installed
FROM oven/bun:1.2.14 as build

# Set working directory
WORKDIR /app

# Copy project files and install dependencies with Bun
COPY . .

# Install dependencies
RUN bun install

# Set environment variable (if needed)
ENV NODE_ENV=production

# Build with Vite (ensure your vite.config uses VITE_ prefix for envs)
RUN bun run build

# Nginx stage to serve static files
FROM nginx:stable-alpine as production

# Copy build files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config if available
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
