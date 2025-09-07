# 🐳 Docker Setup for SharedMelody

This guide explains how to run SharedMelody using Docker containers for both development and production environments.

## 📋 Prerequisites

- Docker Engine 20.10+ 
- Docker Compose 2.0+
- At least 4GB RAM available for containers
- Ports 80, 3000, 3001, 5432, 6379 available

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   PostgreSQL    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Database      │
│   Port: 80      │    │   Port: 3001    │    │   Port: 5432    │
│   Nginx         │    │   Express API   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐
                    │     Redis       │
                    │   (Sessions)    │
                    │   Port: 6379    │
                    └─────────────────┘
```

## 🚀 Quick Start

### 1. Clone and Setup Environment

```bash
# Clone the repository
git clone <repository-url>
cd SharedMelody

# Copy environment file
cp .env.example .env
```

### 2. Configure Environment Variables

Edit the `.env` file with your specific configuration:

```bash
# Database Configuration
DB_PASSWORD=your_secure_postgres_password
REDIS_PASSWORD=your_secure_redis_password

# JWT Secrets (Change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@sharedmelody.com
```

### 3. Start the Application

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 4. Access the Application

- **Frontend (Web App)**: http://localhost (port 80)
- **Alternative Frontend Port**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🛠️ Individual Container Management

### Backend Container

```bash
# Build backend only
docker-compose build backend

# Start backend with dependencies
docker-compose up postgres redis backend

# View backend logs
docker-compose logs -f backend

# Execute commands in backend container
docker-compose exec backend npm run build
docker-compose exec backend npm test
```

### Frontend Container

```bash
# Build frontend only
docker-compose build frontend

# Start frontend
docker-compose up frontend

# View frontend logs
docker-compose logs -f frontend
```

### Database Management

```bash
# Access PostgreSQL database
docker-compose exec postgres psql -U postgres -d sharedmelody_db

# Backup database
docker-compose exec postgres pg_dump -U postgres sharedmelody_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres -d sharedmelody_db < backup.sql
```

## 🔧 Development Mode

For development with hot reloading:

```bash
# Create docker-compose.dev.yml
cat > docker-compose.dev.yml << EOF
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      target: build  # Use build stage for development
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      NODE_ENV: development
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      target: build  # Use build stage for development
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - CHOKIDAR_USEPOLLING=true
    command: npm start
EOF

# Run in development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## 📊 Monitoring and Health Checks

All containers include health checks:

```bash
# Check health status
docker-compose ps

# Manual health check
curl http://localhost:3001/health
curl http://localhost/health
```

Health check endpoints:
- **Backend**: `GET /health`
- **Frontend**: `GET /` (nginx status)
- **PostgreSQL**: `pg_isready`
- **Redis**: `redis-cli ping`

## 🗂️ Data Persistence

Persistent volumes are configured for:

- `postgres_data`: PostgreSQL database files
- `redis_data`: Redis persistence files  
- `backend_uploads`: Uploaded files (songs, images)
- `backend_logs`: Application logs

```bash
# View volume usage
docker volume ls
docker volume inspect sharedmelody_postgres_data

# Backup volumes
docker run --rm -v sharedmelody_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

## 🔐 Security Considerations

### Production Deployment

1. **Change Default Passwords**: Update all default passwords in `.env`
2. **Use HTTPS**: Configure SSL certificates
3. **Network Security**: Use Docker networks and firewalls
4. **Resource Limits**: Set memory and CPU limits
5. **User Permissions**: Containers run as non-root users

### Environment Variables

Required for production:
```bash
NODE_ENV=production
DB_PASSWORD=<strong-password>
REDIS_PASSWORD=<strong-password>
JWT_SECRET=<long-random-string>
JWT_REFRESH_SECRET=<different-long-random-string>
```

## 🐛 Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
docker-compose logs <service-name>

# Check container status
docker-compose ps

# Restart service
docker-compose restart <service-name>
```

#### Database Connection Issues
```bash
# Verify database is running
docker-compose exec postgres pg_isready -U postgres

# Check database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up --build
```

#### Port Conflicts
```bash
# Find process using port
lsof -i :80
lsof -i :3001

# Kill process or change port in docker-compose.yml
```

#### Memory Issues
```bash
# Check resource usage
docker stats

# Add resource limits to docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### Useful Commands

```bash
# Clean up all containers and volumes
docker-compose down -v --remove-orphans

# Remove all unused Docker objects
docker system prune -a --volumes

# View real-time logs from all services
docker-compose logs -f

# Scale services (if needed)
docker-compose up --scale backend=2

# Execute bash in running container
docker-compose exec backend sh
docker-compose exec frontend sh
```

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
- [Nginx Docker Hub](https://hub.docker.com/_/nginx)

## 🆘 Support

For issues related to Docker setup:

1. Check this documentation first
2. Review Docker logs: `docker-compose logs`
3. Check service health: `docker-compose ps`
4. Create an issue in the repository with:
   - Your environment details
   - Docker version (`docker --version`)
   - Error logs
   - Steps to reproduce

---

**Note**: This setup is optimized for both development and production use. The multi-stage builds ensure minimal production image sizes while maintaining development flexibility.