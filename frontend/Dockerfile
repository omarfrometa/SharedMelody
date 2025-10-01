# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copiar package.json y package-lock.json primero (para aprovechar cache de dependencias)
COPY package*.json ./

RUN npm ci --silent

# Copiar carpeta public (importante para react-scripts build)
COPY public ./public

# Copiar el resto del código fuente
COPY src ./src

# Ejecutar build
RUN npm run build


# Production stage - Servir los archivos estáticos con 'serve'
FROM node:18-alpine AS production

WORKDIR /app
RUN npm install -g serve

# Copiar el build desde la primera etapa
COPY --from=build /app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
