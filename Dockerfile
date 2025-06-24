FROM oven/bun:1.2.14 as build

WORKDIR /app
COPY . .
RUN bun install
RUN bun run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
