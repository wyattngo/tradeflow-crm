# TradeFlow CRM Deployment Pipeline

## Overview
This deployment pipeline provides automated CI/CD for your Next.js + Node.js + PostgreSQL + Redis application.

## Components

### 1. GitHub Actions Workflows

#### `deploy.yml` - Main CI/CD Pipeline
- **Build**: Multi-stage Docker builds for app and worker images
- **Test**: ESLint validation on every push
- **Push**: Publishes images to GitHub Container Registry (GHCR)
- **Deploy**: SSH-based deployment to production server

**Triggers**: Push to `main` branch, PRs to `main`

#### `security.yml` - Vulnerability Scanning
- Runs Trivy security scanner on codebase
- Scheduled daily + on push to main
- Results uploaded to GitHub Security tab

### 2. Production Deployment Files

#### `docker-compose.prod.yml`
- Uses pre-built images from registry
- Configured for zero-downtime deployments
- Includes health checks and logging
- Supports SSL/TLS via nginx

#### `.env.prod.example`
- Template for production environment variables
- Copy to `.env.prod` and update with real values

### 3. Deployment Scripts

#### `scripts/deploy.sh`
Automated deployment with:
- Image pulls from registry
- Database migrations
- Health checks
- Status reporting

**Usage:**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

#### `scripts/rollback.sh`
Quick rollback to previous deployment.

**Usage:**
```bash
chmod +x scripts/rollback.sh
./scripts/rollback.sh
```

## Setup Instructions

### Step 1: Configure GitHub Secrets

In your GitHub repo, add these secrets under Settings → Secrets and variables → Actions:

```
DEPLOY_KEY        # SSH private key for deployment server
DEPLOY_HOST       # IP/domain of production server
DEPLOY_USER       # SSH user on production server
```

Generate SSH key:
```bash
ssh-keygen -t ed25519 -f deploy_key -C "github-actions"
```

Add the public key to your server's `~/.ssh/authorized_keys`:
```bash
cat deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Step 2: Production Server Setup

```bash
# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Clone repository
git clone <your-repo> /app
cd /app

# Copy and configure environment file
cp .env.prod.example .env.prod
# Edit .env.prod with real values
nano .env.prod

# Make scripts executable
chmod +x scripts/*.sh
```

### Step 3: Configure nginx

Update `nginx.conf` with your domain:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 4: SSL/TLS Setup

Place SSL certificates in `ssl/` directory:
```bash
mkdir -p ssl
# Copy cert.pem and key.pem to ssl/
```

Update nginx.conf for HTTPS:
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of config
}
```

## Pipeline Flow

```
Push to main
    ↓
[Build] Docker images
    ↓
[Test] Run linter
    ↓
[Push] Images to GHCR
    ↓
[Deploy] SSH to server + docker compose pull/up
    ↓
[Verify] Health checks
```

## Monitoring & Logs

View logs from deployed services:
```bash
# App logs
docker compose -f docker-compose.prod.yml logs app

# Worker logs
docker compose -f docker-compose.prod.yml logs worker

# Nginx logs
docker compose -f docker-compose.prod.yml logs nginx

# Follow in real-time
docker compose -f docker-compose.prod.yml logs -f app
```

## Troubleshooting

### Deployment fails at SSH step
- Verify DEPLOY_KEY, DEPLOY_HOST, DEPLOY_USER are set correctly
- Check server SSH access: `ssh -i deploy_key user@host`

### App not healthy after deployment
- Check logs: `docker compose -f docker-compose.prod.yml logs app`
- Verify DATABASE_URL and REDIS_URL are correct
- Ensure migrations ran: `docker compose -f docker-compose.prod.yml logs app | grep -i migration`

### Database migration errors
- SSH into server and run manually:
  ```bash
  docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy
  ```

### Container won't start
- Check image exists: `docker images | grep tradeflow`
- Verify environment variables: `docker compose config`
- Check container logs: `docker compose logs app`

## Best Practices

1. **Always test locally first**
   ```bash
   docker compose -f docker-compose.yml up
   ```

2. **Use semantic versioning for tags**
   - GitHub Actions auto-tags: `main`, `sha-xxxxx`, `v1.0.0`

3. **Monitor health checks**
   - App has HTTP health check
   - Postgres and Redis have built-in checks

4. **Keep backups**
   - Database volumes persist in `postgres_data`
   - Consider external backups for production

5. **Secrets management**
   - Never commit `.env.prod`
   - Use GitHub Secrets for sensitive values
   - Rotate passwords periodically
