# 🐳 Docker Setup Guide

This guide will help you run the Premium Expense Tracker application using Docker containers.

## 📋 Prerequisites

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)

## 🚀 Quick Start

### 1. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 3. Stop the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (this will delete all data)
docker-compose down -v
```

## 🛠 Development Commands

### View Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

### Rebuild Services

```bash
# Rebuild a specific service
docker-compose build backend
docker-compose build frontend

# Rebuild and restart
docker-compose up --build backend
```

### Access Container Shell

```bash
# Access backend container
docker-compose exec backend bash

# Access frontend container
docker-compose exec frontend sh
```

## 📁 Project Structure

```
├── docker-compose.yml          # Main orchestration file
├── backend/
│   ├── Dockerfile             # Backend container configuration
│   ├── .dockerignore          # Files to exclude from build
│   └── ...                    # Backend source code
├── frontend/
│   ├── Dockerfile             # Frontend container configuration
│   ├── nginx.conf             # Nginx configuration
│   ├── .dockerignore          # Files to exclude from build
│   └── ...                    # Frontend source code
└── DOCKER.md                  # This file
```

## 🔧 Configuration

### Environment Variables

You can customize the application by creating a `.env` file in the root directory:

```env
# Backend Configuration
PYTHONUNBUFFERED=1

# Frontend Configuration
NODE_ENV=production
```

### Port Configuration

Default ports:
- **Frontend**: 3000
- **Backend**: 8000

To change ports, modify the `docker-compose.yml` file:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Change 3000 to 8080
  backend:
    ports:
      - "9000:8000"  # Change 8000 to 9000
```

## 🗄 Data Persistence

The application uses Docker volumes to persist data:

- **Database**: Stored in `expense_data` volume
- **Application Data**: Persisted across container restarts

### Backup Data

```bash
# Create a backup
docker run --rm -v expense-tracker_expense_data:/data -v $(pwd):/backup alpine tar czf /backup/expense-data-backup.tar.gz -C /data .

# Restore from backup
docker run --rm -v expense-tracker_expense_data:/data -v $(pwd):/backup alpine tar xzf /backup/expense-data-backup.tar.gz -C /data
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :8000
   
   # Kill the process or change ports in docker-compose.yml
   ```

2. **Container Won't Start**
   ```bash
   # Check container logs
   docker-compose logs backend
   docker-compose logs frontend
   
   # Check container status
   docker-compose ps
   ```

3. **Build Failures**
   ```bash
   # Clean up and rebuild
   docker-compose down
   docker system prune -f
   docker-compose up --build
   ```

4. **Database Issues**
   ```bash
   # Reset database (WARNING: This will delete all data)
   docker-compose down -v
   docker-compose up --build
   ```

### Health Checks

The application includes health checks to ensure services are running properly:

```bash
# Check health status
docker-compose ps

# Manual health check
curl http://localhost:8000/
curl http://localhost:3000/
```

## 🚀 Production Deployment

For production deployment, consider:

1. **Use Production Images**
   ```bash
   # Build production images
   docker-compose -f docker-compose.prod.yml up --build
   ```

2. **Add SSL/TLS**
   - Use a reverse proxy (nginx, traefik)
   - Configure SSL certificates

3. **Environment Variables**
   - Use Docker secrets for sensitive data
   - Configure proper environment variables

4. **Monitoring**
   - Add logging aggregation
   - Set up monitoring and alerting

## 📝 Development vs Production

### Development
- Uses volume mounts for live code reloading
- Includes development dependencies
- Debug logging enabled

### Production
- Uses built images
- Optimized for performance
- Minimal dependencies
- Production logging

## 🎯 Next Steps

1. **Start the application**: `docker-compose up --build`
2. **Access the frontend**: http://localhost:3000
3. **Add payment modes** and start tracking expenses
4. **Explore the dashboard** and insights

---

**Happy expense tracking with Docker! 🐳💰**
