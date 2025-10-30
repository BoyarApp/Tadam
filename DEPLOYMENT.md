# Tadam Production Deployment Guide

## Quick Start

### Prerequisites
- Node.js 22.x
- PostgreSQL 15+
- Redis 7+
- Meilisearch 1.7+
- S3-compatible storage (MinIO/Cloudflare R2/AWS S3)

## 1. Environment Configuration

```bash
# Copy and configure environment variables
cp infra/env/.env.example infra/env/.env
# Edit .env with production values
```

**Critical secrets to generate:**
```bash
# Generate random secrets (run multiple times for different values)
openssl rand -base64 32
```

Required secrets:
- `ADMIN_JWT_SECRET`
- `JWT_SECRET`
- `API_TOKEN_SALT`
- `ENCRYPTION_KEY`
- `TRANSFER_TOKEN_SALT`
- `APP_KEYS` (4 comma-separated values)
- `MEILISEARCH_MASTER_KEY`

## 2. Docker Deployment (Recommended)

### Production Stack
```bash
# Build and start all services
docker-compose -f infra/docker-compose.prod.yml up -d

# View logs
docker-compose -f infra/docker-compose.prod.yml logs -f

# Health checks
curl http://localhost:1337/_health
curl http://localhost:3000/api/health
```

### Individual Service Builds
```bash
# Frontend
docker build -t tadam-frontend:latest ./frontend

# CMS
docker build -t tadam-cms:latest ./cms
```

## 3. Managed Service Deployments

### Frontend (Vercel/Netlify)

**Vercel:**
```bash
cd frontend
vercel --prod
```

Environment variables required:
- `NUXT_PUBLIC_API_URL` → Your CMS URL
- `NUXT_PUBLIC_MEILISEARCH_URL` → Search endpoint
- `NUXT_PUBLIC_MEDIA_URL` → CDN URL
- `NUXT_PUBLIC_SENTRY_DSN` → Error tracking
- `NUXT_PUBLIC_PLAUSIBLE_DOMAIN` → Analytics

### CMS (Fly.io/Render/Railway)

**Fly.io:**
```bash
cd cms
fly launch
fly secrets set ADMIN_JWT_SECRET=xxx APP_KEYS=xxx,...
fly deploy
```

**Render:**
- New Web Service → Docker
- Point to `cms/Dockerfile`
- Add all environment variables from `.env.example`
- Add persistent disk at `/app/public/uploads` (optional if using S3)

### Database (Supabase/AWS RDS)

**Supabase:**
1. Create project at supabase.com
2. Get connection string from Settings → Database
3. Set in CMS: `DATABASE_URL=postgresql://...`

**Connection pooling (recommended):**
- Enable PgBouncer in Supabase
- Use transaction mode for connection string

### Redis (Upstash/AWS ElastiCache)

**Upstash:**
1. Create database at upstash.com
2. Copy Redis URL
3. Set: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

### Search (Meilisearch Cloud)

**Meilisearch Cloud:**
1. Create project at cloud.meilisearch.com
2. Get host and API key
3. Set: `MEILISEARCH_HOST`, `MEILISEARCH_MASTER_KEY`

### Storage (Cloudflare R2/AWS S3)

**Cloudflare R2:**
1. Create R2 bucket
2. Generate API tokens
3. Configure in CMS:
```env
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_ENDPOINT=https://xxx.r2.cloudflarestorage.com
AWS_BUCKET=tadam-media
AWS_REGION=auto
```

## 4. Production Checklist

### Security
- [ ] All secrets randomized and secure
- [ ] HTTPS enabled (TLS certificates)
- [ ] CORS configured for your domain
- [ ] Rate limiting active (check `RATE_LIMIT_MAX`)
- [ ] Database SSL enabled
- [ ] Security headers active

### Monitoring
- [ ] Sentry DSN configured
- [ ] Plausible domain set
- [ ] Health check endpoints responding
- [ ] Log aggregation configured
- [ ] Alerting rules set up

### Performance
- [ ] CDN configured for media files
- [ ] Redis cache active
- [ ] Database connection pooling enabled
- [ ] PWA service worker active
- [ ] Image optimization enabled

### Backups
- [ ] Database daily backups
- [ ] Media storage versioning enabled
- [ ] Configuration backed up
- [ ] Disaster recovery plan documented

## 5. Scaling Considerations

### Horizontal Scaling
```yaml
# docker-compose.prod.yml
services:
  cms:
    deploy:
      replicas: 3  # Multiple CMS instances

  frontend:
    deploy:
      replicas: 2  # Multiple frontend instances
```

### Load Balancing
- Use Nginx/Caddy for reverse proxy
- Configure sticky sessions for CMS
- Use shared Redis for session storage

### Database
- Read replicas for scaling reads
- Connection pooler (PgBouncer)
- Regular VACUUM and ANALYZE

## 6. Monitoring & Maintenance

### Health Checks
```bash
# CMS health
curl https://api.yourdomain.com/_health

# Frontend health
curl https://yourdomain.com/api/health

# Database
curl https://api.yourdomain.com/api/feed/latest
```

### Logs
```bash
# Docker logs
docker-compose logs -f cms
docker-compose logs -f frontend

# Fly.io logs
fly logs

# Render logs
Available in dashboard
```

### Updates
```bash
# Pull latest code
git pull origin main

# Rebuild containers
docker-compose -f infra/docker-compose.prod.yml build

# Rolling restart
docker-compose -f infra/docker-compose.prod.yml up -d
```

## 7. Troubleshooting

### CMS not starting
- Check database connectivity: `pg_isready -h $DB_HOST`
- Verify all secrets are set
- Check logs: `docker logs tadam-cms`

### Frontend build fails
- Ensure all `NUXT_PUBLIC_*` vars are set
- Check API URL is accessible
- Verify Node.js version (22.x required)

### Rate limit errors
- Verify Redis connection
- Check `REDIS_HOST` and `REDIS_PORT`
- Adjust `RATE_LIMIT_MAX` if needed

### Performance issues
- Enable Redis caching
- Check database query performance
- Monitor Sentry for slow operations
- Verify CDN is serving media

## 8. Infrastructure as Code (Document Only)

### Terraform/Pulumi Setup Required
- **VPC and Networking:** Private subnets, security groups, NAT gateway
- **Container Orchestration:** ECS/EKS cluster, task definitions, auto-scaling
- **Database:** RDS PostgreSQL with automated backups, read replicas
- **Cache:** ElastiCache Redis cluster with failover
- **Storage:** S3 buckets with CloudFront CDN, lifecycle policies
- **Load Balancer:** ALB with SSL certificates, health checks
- **DNS:** Route53 zones, records for api/cdn/www
- **Monitoring:** CloudWatch dashboards, alarms, log groups
- **Secrets:** AWS Secrets Manager integration
- **CI/CD:** GitHub Actions with AWS credentials

**Example structure (implement separately):**
```
terraform/
  ├── modules/
  │   ├── vpc/
  │   ├── ecs/
  │   ├── rds/
  │   ├── elasticache/
  │   └── s3/
  ├── environments/
  │   ├── staging/
  │   └── production/
  └── main.tf
```

## Support
- Health checks: `/_health` (CMS), `/api/health` (Frontend)
- GitHub Issues: Report deployment problems
- Sentry: Monitor production errors
