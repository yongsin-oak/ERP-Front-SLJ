# Deployment Setup

## Overview
This project has two deployment environments:

### Production (main branch)
- **Branch**: `main`
- **Port**: `8080`
- **Container**: `frontend-production`
- **Compose file**: `docker-compose.yml`
- **Image tag**: `frontend:${github.sha}`

### UAT (uat branch)
- **Branch**: `uat`
- **Port**: `8081`
- **Container**: `frontend-uat`
- **Compose file**: `docker-compose-uat.yml`
- **Image tag**: `frontend-uat:${github.sha}`

## Access URLs
- **Production**: `http://your-vm-ip:8080`
- **UAT**: `http://your-vm-ip:8081`

## Deployment Process

### For Production
1. Push to `main` branch
2. GitHub Actions will trigger `deploy-frontend.yml`
3. Application will be deployed to port 8080

### For UAT
1. Push to `uat` branch
2. GitHub Actions will trigger `deploy-frontend-uat.yml`
3. Application will be deployed to port 8081

## Manual Commands

### Check running containers
```bash
docker ps
```

### View logs
```bash
# Production
docker logs frontend-production

# UAT
docker logs frontend-uat
```

### Stop services
```bash
# Production
cd /home/$USER/frontend
docker-compose down

# UAT
cd /home/$USER/frontend-uat
docker-compose -f docker-compose-uat.yml down
```

### Clean up images
```bash
docker image prune -af
```
