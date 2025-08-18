# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml* ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy built application and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./
COPY --from=builder /app/LICENSE ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0
ENV DATABASE_PATH=/app/data/env-manager.db

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Expose port
EXPOSE 3001

# Volume for data persistence
VOLUME ["/app/data"]

# Attribution notice
LABEL maintainer="BuildAppolis <dev@buildappolis.com>"
LABEL org.opencontainers.image.source="https://github.com/buildappolis/env-manager"
LABEL org.opencontainers.image.vendor="BuildAppolis"
LABEL org.opencontainers.image.title="BuildAppolis Env-Manager"
LABEL org.opencontainers.image.description="Enterprise-grade environment variable management system"
LABEL org.opencontainers.image.url="https://www.buildappolis.com"
LABEL org.opencontainers.image.licenses="BuildAppolis-License"

# Start the application
CMD ["node", "dist/server/entry.mjs"]