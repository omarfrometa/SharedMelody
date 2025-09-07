# SharedMelody - Docker Deployment Guide

Esta aplicación ha sido dividida en dos proyectos separados para mejor gestión y despliegue.

## 🏗️ Estructura del Proyecto

```
SharedMelody/
├── frontend/                    # Frontend (React + TypeScript)
│   ├── src/                    # Código fuente React
│   ├── public/                 # Archivos públicos
│   ├── package.json           # Dependencias Frontend
│   ├── tsconfig.json          # Configuración TypeScript
│   ├── Dockerfile             # Docker para Frontend
│   ├── nginx.conf             # Configuración Nginx
│   └── .dockerignore          # Exclusiones Docker Frontend
├── backend/                     # Backend (Node.js + Express)
│   ├── src/                   # Código fuente del servidor
│   ├── package.json           # Dependencias Backend
│   ├── tsconfig.json          # Configuración TypeScript
│   ├── Dockerfile             # Docker para Backend
│   └── .dockerignore          # Exclusiones Docker Backend
├── database/                    # Esquemas y datos de PostgreSQL
│   ├── schema.sql             # Esquema de base de datos
│   └── initial_data.sql       # Datos iniciales
├── docker-compose.yml          # Orquestador principal
├── .env.example               # Configuración de ejemplo
└── DOCKER_README.md           # Esta guía
```

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
cp .env.example .env
# Edita .env con tus valores reales, especialmente:
# - DB_PASSWORD
# - REDIS_PASSWORD
# - JWT_SECRET
# - EMAIL_* (para notificaciones)
```

### 2. Iniciar Todos los Servicios

```bash
docker-compose up -d
```

### 3. Verificar el Despliegue

- **Frontend**: http://localhost:80 o http://localhost:3000
- **Backend API**: http://localhost/health (a través del proxy)
- **Base de Datos**: localhost:5432
- **Redis**: localhost:6379

## 📦 Servicios Incluidos

### Frontend (React)
- **Puerto**: 80, 3000
- **Tecnologías**: React 18, TypeScript, Material-UI
- **Servidor**: Nginx con proxy reverso al backend
- **Build**: Multi-stage con optimización

### Backend (Node.js)
- **Puerto**: 3001 (interno)
- **Tecnologías**: Node.js, Express, TypeScript
- **Base de Datos**: PostgreSQL
- **Sesiones**: Redis
- **Autenticación**: Local + OAuth

### Base de Datos (PostgreSQL)
- **Puerto**: 5432
- **Versión**: 15-alpine
- **Inicialización**: Automática con esquema y datos iniciales

### Cache/Sesiones (Redis)
- **Puerto**: 6379
- **Versión**: 7-alpine
- **Persistencia**: Habilitada

## ⚙️ Comandos Útiles

### Gestión de Servicios
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs del frontend
docker-compose logs -f frontend

# Ver logs del backend
docker-compose logs -f backend

# Reiniciar un servicio específico
docker-compose restart backend

# Parar todos los servicios
docker-compose down
```

### Desarrollo
```bash
# Reconstruir imágenes
docker-compose build

# Reconstruir sin cache
docker-compose build --no-cache

# Iniciar solo backend y base de datos
docker-compose up -d postgres redis backend
```

### Producción
```bash
# Construir imágenes de producción
docker-compose build --build-arg NODE_ENV=production

# Iniciar en modo producción
NODE_ENV=production docker-compose up -d
```

## 🔧 Configuración Detallada

### Variables de Entorno Principales

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `DB_PASSWORD` | Contraseña PostgreSQL | postgres_secure_password_change_me |
| `REDIS_PASSWORD` | Contraseña Redis | redis_secure_password_change_me |
| `JWT_SECRET` | Secreto para JWT | (debe cambiarse) |
| `EMAIL_USER` | Usuario email SMTP | your-email@gmail.com |

### Puertos Expuestos

- **80**: Frontend (Nginx)
- **3000**: Frontend (alternativo)
- **5432**: PostgreSQL
- **6379**: Redis

## 📊 Monitoreo

### Health Checks
Todos los servicios tienen health checks configurados:

```bash
# Verificar estado de contenedores
docker-compose ps

# Verificar salud específica
curl http://localhost/health
```

### Logs
Los logs se almacenan en volúmenes Docker:
- Frontend: Logs de Nginx
- Backend: `/app/logs` 
- Base de Datos: Logs de PostgreSQL
- Redis: Logs de Redis

### Métricas
```bash
# Ver uso de recursos
docker stats

# Ver volúmenes
docker volume ls

# Ver redes
docker network ls
```

## 🔐 Seguridad

### Mejores Prácticas Implementadas
- ✅ Usuarios no-root en contenedores
- ✅ Health checks para todos los servicios
- ✅ Variables de entorno para secretos
- ✅ Volúmenes separados para datos persistentes
- ✅ Redes Docker aisladas
- ✅ Build multi-stage para optimización

### Configuración de Producción
1. **Cambiar todas las contraseñas por defecto**
2. **Generar JWT secrets seguros**:
   ```bash
   openssl rand -base64 32
   ```
3. **Configurar SSL/HTTPS**
4. **Configurar backups regulares**
5. **Monitorear logs y métricas**

## 🔄 Backup y Restore

### Base de Datos
```bash
# Crear backup
docker exec sharedmelody_postgres pg_dump -U postgres sharedmelody_db > backup.sql

# Restaurar backup
docker exec -i sharedmelody_postgres psql -U postgres sharedmelody_db < backup.sql
```

### Volúmenes
```bash
# Backup uploads
docker run --rm -v sharedmelody_backend_uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads.tar.gz -C /data .

# Restaurar uploads
docker run --rm -v sharedmelody_backend_uploads:/data -v $(pwd):/backup alpine tar xzf /backup/uploads.tar.gz -C /data
```

## 🛠️ Desarrollo Local

Para desarrollo local, puedes ejecutar solo los servicios necesarios:

```bash
# Solo base de datos y Redis para desarrollo local
docker-compose up -d postgres redis

# Luego ejecutar frontend y backend manualmente:
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm start
```

## 🚨 Solución de Problemas

### Problemas Comunes

1. **Puerto ocupado**:
   ```bash
   # Cambiar puertos en docker-compose.yml
   ports:
     - "8080:80"  # En lugar de "80:80"
   ```

2. **Error de base de datos**:
   ```bash
   # Verificar logs
   docker-compose logs postgres
   
   # Reiniciar servicio
   docker-compose restart postgres
   ```

3. **Frontend no se conecta al backend**:
   - Verificar que el backend esté corriendo
   - Revisar configuración de proxy en nginx.conf

### Logs de Debug
```bash
# Todos los logs en tiempo real
docker-compose logs -f

# Solo errores
docker-compose logs | grep ERROR
```

## 📚 Recursos Adicionales

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
- [Nginx Docker Hub](https://hub.docker.com/_/nginx)

## 🎯 Estructura de Archivos Principales

### Frontend
- `src/components/` - Componentes React
- `src/pages/` - Páginas de la aplicación
- `src/services/` - Servicios API
- `src/contexts/` - Contextos React
- `public/index.html` - Plantilla HTML principal

### Backend
- `src/server.ts` - Servidor principal
- `src/controllers/` - Controladores de rutas
- `src/routes/` - Definición de rutas
- `src/services/` - Lógica de negocio
- `src/middleware/` - Middleware personalizado

---

**¡Tu aplicación SharedMelody está lista para funcionar!** 🎵

## 🚀 Comandos de Inicio Rápido

```bash
# 1. Configurar entorno
cp .env.example .env

# 2. Editar variables importantes
nano .env

# 3. Iniciar aplicación
docker-compose up -d

# 4. Ver logs
docker-compose logs -f

# 5. Acceder a la aplicación
# Frontend: http://localhost
# API: http://localhost/health