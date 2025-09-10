# =============================================
# SHARED MELODY FRONTEND - DOCKERFILE
# React 18 + TypeScript + Material-UI
# =============================================

# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . .

# React build -> /build
RUN npm run build

# Production stage
FROM nginx:alpine
RUN apk add --no-cache curl

# Copy React build output
COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx

RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx/conf.d

USER nginx
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f https://sharedmelody.com || exit 1

CMD ["nginx", "-g", "daemon off;"]

LABEL maintainer="SharedMelody Team"
LABEL description="SharedMelody Frontend - React Application"
LABEL version="1.0.0"
