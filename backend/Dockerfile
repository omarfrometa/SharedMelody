# =============================================
# SHARED MELODY BACKEND - DOCKERFILE
# Node.js + Express + TypeScript
# =============================================

# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Install system dependencies for building
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine as production

# Install runtime dependencies
RUN apk add --no-cache \
    postgresql-client \
    curl \
    dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --silent && \
    npm cache clean --force

# Copy built application from build stage
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist

# Create necessary directories
RUN mkdir -p /app/uploads /app/logs /app/keys && \
    chown -R nodejs:nodejs /app

# Create startup script
COPY --chown=nodejs:nodejs <<EOF /app/start.sh
#!/bin/sh
set -e

echo "🚀 Starting SharedMelody Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
until pg_isready -h \${DB_HOST:-localhost} -p \${DB_PORT:-5432} -U \${DB_USER:-postgres} -q; do
  echo "Waiting for database..."
  sleep 2
done
echo "✅ Database is ready!"

# Wait for Redis to be ready (if configured)
if [ ! -z "\${REDIS_HOST}" ]; then
  echo "⏳ Waiting for Redis connection..."
  until nc -z \${REDIS_HOST} \${REDIS_PORT:-6379}; do
    echo "Waiting for Redis..."
    sleep 2
  done
  echo "✅ Redis is ready!"
fi

# Start the server
echo "🎵 Starting server on port \${PORT:-3001}..."
exec node dist/server.js
EOF

RUN chmod +x /app/start.sh

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f https://sharedmelody:3001/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["/app/start.sh"]

# Labels
LABEL maintainer="SharedMelody Team"
LABEL description="SharedMelody Backend - Node.js API"
LABEL version="1.0.0"

# Environment defaults
ENV NODE_ENV=production
ENV PORT=3001