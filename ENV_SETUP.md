# 🔧 Configuración de Variables de Entorno - SharedMelody

## 📋 Descripción

Este proyecto utiliza archivos `.env` separados para **backend** y **frontend**, con configuraciones específicas para **desarrollo** y **producción**. Esto permite cambiar fácilmente entre ambientes sin modificar constantemente las configuraciones.

## 📁 Estructura de Archivos

```
SharedMelody/
├── backend/
│   ├── .env.development     # Variables para desarrollo
│   ├── .env.production      # Variables para producción
│   └── .env.example         # Template/ejemplo
├── frontend/
│   ├── .env.development     # Variables para desarrollo
│   ├── .env.production      # Variables para producción
│   └── .env.example         # Template/ejemplo
├── setup-env.sh            # Script para configurar ambiente
├── docker-compose.yml      # Docker compose para producción
└── docker-compose.dev.yml  # Docker compose para desarrollo
```

## 🚀 Configuración Rápida

### Usando el Script Automático

```bash
# Para desarrollo
./setup-env.sh development

# Para producción
./setup-env.sh production
```

### Configuración Manual

#### Para Desarrollo:
```bash
# Copiar archivos de desarrollo
cp backend/.env.development backend/.env
cp frontend/.env.development frontend/.env
```

#### Para Producción:
```bash
# Copiar archivos de producción
cp backend/.env.production backend/.env
cp frontend/.env.production frontend/.env
```

## 🐳 Ejecución con Docker

### Ambiente de Desarrollo
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Ambiente de Producción
```bash
docker-compose up --build
```

## ⚙️ Variables de Entorno por Componente

### Backend Variables

#### Desarrollo (`backend/.env.development`)
- `NODE_ENV=development`
- `DB_NAME=sharedmelody_dev`
- `REDIS_PASSWORD=` (sin contraseña)
- `RATE_LIMIT_MAX_REQUESTS=1000` (más permisivo)
- URLs locales para OAuth

#### Producción (`backend/.env.production`)
- `NODE_ENV=production`
- `DB_NAME=sharedmelody_db`
- `REDIS_PASSWORD=redis_secure_password`
- `RATE_LIMIT_MAX_REQUESTS=100` (más restrictivo)
- URLs de producción para OAuth

### Frontend Variables

#### Desarrollo (`frontend/.env.development`)
- `REACT_APP_API_URL=http://localhost:3001/api`
- `REACT_APP_ENABLE_DEBUG=true`
- `REACT_APP_ENABLE_ANALYTICS=false`
- `REACT_APP_LOG_LEVEL=debug`

#### Producción (`frontend/.env.production`)
- `REACT_APP_API_URL=https://api.sharedmelody.com/api`
- `REACT_APP_ENABLE_DEBUG=false`
- `REACT_APP_ENABLE_ANALYTICS=true`
- `REACT_APP_LOG_LEVEL=error`

## 📝 Configuración Inicial

### 1. Configurar Backend
1. Revisar `backend/.env.development` y ajustar valores locales
2. Configurar `backend/.env.production` con valores reales de producción
3. Asegurar que las credenciales de base de datos sean correctas

### 2. Configurar Frontend
1. Verificar URLs de API en ambos archivos
2. Ajustar configuraciones de OAuth según el ambiente
3. Configurar analytics y debugging según necesidades

### 3. Configurar OAuth
- **Desarrollo**: Configurar URLs de callback para `http://localhost:3001`
- **Producción**: Configurar URLs de callback para `https://api.sharedmelody.com`

## 🔒 Seguridad

### Archivos Versionados (Git)
- ✅ `.env.example` (templates)
- ✅ `.env.development` (configuración de desarrollo)
- ✅ `.env.production` (configuración de producción)

### Archivos NO Versionados (Git)
- ❌ `.env` (archivos activos, ignorados en `.gitignore`)

## 🛠️ Comandos Útiles

### Verificar Configuración Actual
```bash
# Backend
cat backend/.env

# Frontend  
cat frontend/.env
```

### Cambiar de Ambiente
```bash
# Cambiar a desarrollo
./setup-env.sh development

# Cambiar a producción
./setup-env.sh production
```

### Reiniciar Contenedores después del cambio
```bash
# Para desarrollo
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Para producción
docker-compose down
docker-compose up --build
```

## 🔧 Troubleshooting

### Error: "archivo .env no encontrado"
- Ejecutar `./setup-env.sh [ambiente]` para generar archivos `.env`

### Error: OAuth no funciona
- Verificar URLs de callback en configuración OAuth de proveedores
- Asegurar que las URLs coincidan con el ambiente actual

### Error de conexión a base de datos
- Verificar configuración en archivo `.env.development` o `.env.production`
- Confirmar que la base de datos esté accesible desde el contenedor

### Variables de frontend no se actualizan
- Las variables `REACT_APP_*` requieren reiniciar el servidor de desarrollo
- En Docker, hacer `docker-compose restart frontend`

## 📞 Soporte

Si tienes problemas con la configuración, verifica:
1. Que hayas ejecutado el script `setup-env.sh`
2. Que los archivos `.env` estén presentes en `backend/` y `frontend/`
3. Que Docker esté usando los archivos correctos (revisar `docker-compose.yml`)