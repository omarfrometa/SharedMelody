# =============================================
# SHARED MELODY - PRODUCTION DOCKERFILE
# Full-stack music collaboration platform
# =============================================

# Use Node.js 18 LTS (matches server requirements)
FROM node:18-alpine as base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client \
    curl \
    git

# Set working directory
WORKDIR /app

# =============================================
# DEPENDENCIES STAGE
# Install all dependencies for both frontend and backend
# =============================================
FROM base as deps

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install root dependencies
RUN npm ci --only=production --silent

# Install server dependencies
WORKDIR /app/server
RUN npm ci --only=production --silent

# =============================================
# BUILD STAGE
# Build both frontend and backend
# =============================================
FROM base as builder

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install all dependencies (including dev dependencies for build)
RUN npm ci --silent
WORKDIR /app/server
RUN npm ci --silent

# Go back to root
WORKDIR /app

# Copy source code
COPY . .

# Build TypeScript server
WORKDIR /app/server
RUN npm run build

# Build React frontend
WORKDIR /app
RUN npm run build:frontend

# =============================================
# PRODUCTION STAGE
# Create final production image
# =============================================
FROM node:18-alpine as production

# Install runtime dependencies only
RUN apk add --no-cache \
    postgresql-client \
    curl \
    dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy production dependencies from deps stage
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nodejs:nodejs /app/server/node_modules ./server/node_modules

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/build ./build
COPY --from=builder --chown=nodejs:nodejs /app/server/dist ./server/dist
COPY --from=builder --chown=nodejs:nodejs /app/server/package*.json ./server/

# Copy database files for migrations/initialization
COPY --from=builder --chown=nodejs:nodejs /app/database ./database

# Copy configuration files
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Create necessary directories
RUN mkdir -p /app/server/uploads && \
    mkdir -p /app/server/logs && \
    mkdir -p /app/server/keys && \
    chown -R nodejs:nodejs /app

# Create a startup script
COPY --chown=nodejs:nodejs <<EOF /app/start.sh
#!/bin/sh
set -e

echo "🚀 Starting SharedMelody Application..."

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
echo "🎵 Starting SharedMelody server on port \${PORT:-3001}..."
cd /app/server
exec node dist/server.js
EOF

RUN chmod +x /app/start.sh

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["/app/start.sh"]

# =============================================
# LABELS & METADATA
# =============================================
LABEL maintainer="SharedMelody Team"
LABEL description="SharedMelody - Music Collaboration Platform"
LABEL version="1.0.0"
LABEL org.opencontainers.image.title="SharedMelody"
LABEL org.opencontainers.image.description="Full-stack music collaboration platform with React frontend and Node.js backend"
LABEL org.opencontainers.image.vendor="SharedMelody"
LABEL org.opencontainers.image.licenses="MIT"

# Environment defaults
ENV NODE_ENV=production
ENV PORT=3001
ENV FRONTEND_URL=http://localhost:3000