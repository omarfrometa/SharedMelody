# SharedMelody - Guía de Despliegue con Docker

Esta guía proporciona instrucciones completas para desplegar SharedMelody usando contenedores Docker.

## 🏗️ Descripción de la Arquitectura

SharedMelody es una plataforma full-stack de colaboración musical que consiste en:

- **Frontend**: React 18 con TypeScript, Material-UI
- **Backend**: Node.js/Express con TypeScript
- **Base de Datos**: PostgreSQL 15 con extensiones UUID
- **Store de Sesión**: Redis 7
- **Subida de Archivos**: Almacenamiento local (configurable)
- **Autenticación**: Auth local + OAuth (Google, Facebook, Microsoft, Apple)

## 📋 Prerrequisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- Al menos 4GB RAM disponible
- 10GB espacio libre en disco

## 🚀 Inicio Rápido (Desarrollo)

1. **Clonar el repositorio**:
```bash
git clone <url-del-repositorio>
cd SharedMelody
```

2. **Crear archivo de entorno**:
```bash
cp .env.example .env
# Editar .env con tu configuración
```

3. **Iniciar la aplicación**:
```bash
docker-compose up -d
```

4. **Acceder a la aplicación**:
- API Backend: http://localhost:3001
- Health Check: http://localhost:3001/health
- Base de Datos: localhost:5432
- Redis: localhost:6379

## 🏭 Despliegue en Producción

### 1. Configuración del Entorno

Crear un archivo `.env.production` con valores de producción:

```bash
# Configuración del Servidor
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://tu-dominio.com

# Configuración de Base de Datos
DB_HOST=postgres
DB_PORT=5432
DB_NAME=sharedmelody_db
DB_USER=tu_usuario_seguro_db
DB_PASSWORD=tu_password_muy_seguro_db

# Configuración de Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=tu_password_seguro_redis

# Configuración JWT (¡DEBE CAMBIARSE!)
JWT_SECRET=tu-clave-de-256-bits-segura-aleatoria-aqui
JWT_REFRESH_SECRET=tu-clave-diferente-de-256-bits-segura-aqui

# Configuración de Email
EMAIL_HOST=smtp.tu-proveedor.com
EMAIL_PORT=587
EMAIL_USER=tu-email@dominio.com
EMAIL_PASSWORD=tu-app-password
EMAIL_FROM=noreply@tu-dominio.com

# Proveedores OAuth (configura según necesites)
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
# Agregar otros proveedores OAuth...
```

### 2. Certificados SSL

Coloca tus certificados SSL en el directorio `ssl/`:
```bash
mkdir -p ssl
cp tu-certificado.crt ssl/
cp tu-clave-privada.key ssl/
```

### 3. Desplegar a Producción

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Configuración de Base de Datos

La aplicación automáticamente:
1. Crea el esquema de base de datos desde `database/schema.sql`
2. Carga datos iniciales desde `database/initial_data.sql`
3. Crea índices necesarios para rendimiento

### Operaciones Manuales de Base de Datos

Conectar al contenedor de base de datos:
```bash
docker exec -it sharedmelody_postgres psql -U postgres -d sharedmelody_db
```

## 🔧 Opciones de Configuración

### Variables de Entorno

| Variable | Descripción | Por Defecto | Requerido |
|----------|-------------|-------------|-----------|
| `NODE_ENV` | Modo de entorno | development | Sí |
| `PORT` | Puerto del servidor | 3001 | Sí |
| `DB_HOST` | Host PostgreSQL | localhost | Sí |
| `DB_PASSWORD` | Password de base de datos | - | Sí |
| `JWT_SECRET` | Secreto para firmar JWT | - | Sí |
| `REDIS_HOST` | Host Redis | localhost | Sí |
| `EMAIL_HOST` | Servidor SMTP | - | Para emails |

### Subida de Archivos

Configurar opciones de subida de archivos:
```bash
UPLOAD_MAX_SIZE=10485760  # 10MB
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,audio/mpeg
UPLOAD_DEST=./uploads
```

## 📈 Monitoreo y Logging

### Health Checks

La aplicación incluye health checks completos:
- `/health` - Estado de salud de la aplicación
- Verificación de conectividad de base de datos
- Verificación de conectividad de Redis

### Ver Logs

```bash
# Logs de aplicación
docker logs sharedmelody_app -f

# Logs de base de datos
docker logs sharedmelody_postgres -f

# Logs de todos los servicios
docker-compose logs -f
```

### Archivos de Log

Los logs se persisten en volúmenes Docker:
- Logs de aplicación: volumen `app_logs` → `/app/server/logs`
- Logs de base de datos: volumen `postgres_data`
- Logs de Redis: volumen `redis_data`

## 🔐 Mejores Prácticas de Seguridad

### 1. Secretos de Entorno
- Nunca commits archivos `.env` al control de versión
- Usar passwords fuertes y únicos para todos los servicios
- Generar secretos JWT criptográficamente seguros
- Rotar secretos regularmente

### 2. Seguridad de Red
- Usar redes Docker para aislar servicios
- Exponer solo puertos necesarios
- Configurar reglas de firewall para producción

### 3. Seguridad de Base de Datos
- Usar credenciales de base de datos no por defecto
- Habilitar encriptación de conexión
- Hacer backups regulares de base de datos
- Monitorear consultas sospechosas

### 4. Seguridad de Aplicación
- Configurar limitación de tasa
- Habilitar CORS solo para orígenes confiables
- Usar HTTPS en producción
- Actualizaciones regulares de dependencias

## 🔄 Backup y Recuperación

### Backup de Base de Datos
```bash
# Crear backup
docker exec sharedmelody_postgres pg_dump -U postgres sharedmelody_db > backup.sql

# Restaurar backup
docker exec -i sharedmelody_postgres psql -U postgres sharedmelody_db < backup.sql
```

### Backup de Volúmenes
```bash
# Backup de uploads
docker run --rm -v sharedmelody_app_uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads.tar.gz -C /data .

# Restaurar uploads
docker run --rm -v sharedmelody_app_uploads:/data -v $(pwd):/backup alpine tar xzf /backup/uploads.tar.gz -C /data
```

## 🚀 Escalado y Rendimiento

### Escalado Horizontal
- Usar Docker Swarm o Kubernetes para orquestación
- Escalar instancias de aplicación detrás de un balanceador de carga
- Usar servicios externos de base de datos y Redis

### Optimización de Rendimiento
- Configurar pooling de conexiones PostgreSQL
- Habilitar persistencia Redis
- Implementar CDN para assets estáticos
- Monitorear uso de recursos con herramientas como Prometheus

## 🛠️ Solución de Problemas

### Problemas Comunes

1. **Error de Conexión de Base de Datos**:
```bash
# Verificar si PostgreSQL está ejecutándose
docker ps | grep postgres
# Verificar logs
docker logs sharedmelody_postgres
```

2. **Error de Conexión Redis**:
```bash
# Probar conectividad Redis
docker exec sharedmelody_redis redis-cli ping
```

3. **La Aplicación No Inicia**:
```bash
# Verificar logs de aplicación
docker logs sharedmelody_app
# Verificar variables de entorno
docker exec sharedmelody_app env | grep DB_
```

### Modo Debug

Ejecutar con logging debug:
```bash
docker-compose up -d
docker logs sharedmelody_app -f
```

## 📚 Recursos Adicionales

- [Documentación Docker PostgreSQL](https://hub.docker.com/_/postgres)
- [Documentación Docker Redis](https://hub.docker.com/_/redis)
- [Mejores Prácticas Node.js Docker](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Documentación Docker Compose](https://docs.docker.com/compose/)

## 🆘 Soporte

Para problemas relacionados con el despliegue Docker:
1. Verificar esta documentación
2. Revisar logs Docker
3. Verificar issues GitHub
4. Contactar al equipo de desarrollo

---

**Nota**: Siempre probar configuraciones Docker en un ambiente de staging antes de desplegar a producción.

## 📝 Comandos Útiles

### Gestión Diaria
```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f app

# Reiniciar aplicación
docker-compose restart app

# Parar todo
docker-compose down

# Actualizar aplicación
git pull
docker-compose build
docker-compose up -d

# Limpiar imágenes no utilizadas
docker system prune -a
```

### Comandos de Producción
```bash
# Desplegar producción
docker-compose -f docker-compose.prod.yml up -d

# Ver métricas
docker stats

# Backup automático
docker exec sharedmelody_postgres_prod pg_dump -U postgres sharedmelody_db > backup-$(date +%Y%m%d).sql