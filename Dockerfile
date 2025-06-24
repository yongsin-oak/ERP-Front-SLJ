FROM oven/bun:1.2.14 AS build

WORKDIR /app
COPY . .
RUN bun install
RUN bun run build

FROM node:18-alpine

RUN npm install -g serve

COPY --from=build /app/dist /app/dist

EXPOSE 8080

CMD ["serve", "-s", "/app/dist", "-l", "8080"]
