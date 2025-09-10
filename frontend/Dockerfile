# =============================================
# SHARED MELODY FRONTEND - DOCKERFILE (PROD)
# React 18 + TypeScript + Material-UI
# =============================================

# ---------- Etapa de build ----------
FROM node:18-alpine as build

WORKDIR /app

# Copiar archivos de dependencias primero (aprovecha la caché)
COPY package*.json ./

# Instalar dependencias
RUN npm ci --silent

# Copiar el resto del proyecto (incluye src/ y public/)
COPY . .

# Ejecutar build de producción
RUN npm run build

# ---------- Etapa final ----------
FROM nginx:alpine

# Copiar build al directorio por defecto de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Opcional: reemplazar la config de Nginx si necesitas SPA routing
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Mantener Nginx corriendo
CMD ["nginx", "-g", "daemon off;"]