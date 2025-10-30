# Infrastructure Requirements

## Production Architecture

### Service Dependencies
```
┌─────────────┐
│   CDN/CF    │ → Media & Static Assets
└─────────────┘
       ↓
┌─────────────┐
│     LB      │ → Load Balancer (Optional)
└─────────────┘
       ↓
┌─────────────────────────────────┐
│  Frontend (Nuxt)                │
│  - Node.js 22                   │
│  - 512MB RAM min                │
│  - 1 CPU min                    │
└─────────────────────────────────┘
       ↓
┌─────────────────────────────────┐
│  CMS (Strapi)                   │
│  - Node.js 22                   │
│  - 1GB RAM min (2GB+ prod)      │
│  - 2 CPU min                    │
└─────────────────────────────────┘
       ↓
┌───────────┬───────────┬────────────┐
│ PostgreSQL│   Redis   │ Meilisearch│
│ 15+       │   7+      │   1.7+     │
│ 2GB RAM   │ 512MB RAM │  1GB RAM   │
└───────────┴───────────┴────────────┘
```

## Resource Requirements

### Minimum (Dev/Staging)
- **CPU:** 4 cores total
- **RAM:** 6GB total
- **Storage:** 20GB SSD
- **Network:** 100 Mbps

### Recommended (Production)
- **CPU:** 8+ cores (auto-scaling)
- **RAM:** 16GB total
- **Storage:** 100GB SSD (database), 500GB+ (media)
- **Network:** 1 Gbps
- **Bandwidth:** 5TB/month minimum

## Service Specifications

### Frontend
- **Platform:** Vercel (recommended) / Netlify / Docker
- **Instance:** Serverless or 1 CPU / 512MB RAM
- **Scaling:** Auto-scale based on traffic
- **CDN:** Built-in (Vercel) or CloudFront

### CMS
- **Platform:** Fly.io / Render / Railway / Docker
- **Instance:** 2 CPU / 2GB RAM minimum
- **Scaling:** Horizontal (2-4 instances)
- **Storage:** Ephemeral (use S3 for uploads)

### PostgreSQL
- **Version:** 15+
- **Instance:** 2 CPU / 4GB RAM
- **Storage:** 100GB SSD (expandable)
- **Connections:** 100 max (with pooling)
- **Backup:** Daily automated, 7-day retention
- **Replication:** 1 read replica (optional)

### Redis
- **Version:** 7+
- **Instance:** 1 CPU / 512MB RAM
- **Persistence:** AOF enabled
- **Eviction:** allkeys-lru
- **Backup:** Optional (cache data)

### Meilisearch
- **Version:** 1.7+
- **Instance:** 2 CPU / 1GB RAM
- **Storage:** 10GB SSD
- **Backup:** Optional (rebuildable from DB)

### Storage (S3/R2)
- **Capacity:** 500GB initial
- **Requests:** 1M/month minimum
- **Transfer:** 500GB/month out
- **CDN:** CloudFront or R2 Public URL

## Cost Estimates (Monthly)

### Small Scale (< 10K users)
- **Vercel:** $0-20 (Pro for features)
- **Fly.io CMS:** $10-30 (2 instances)
- **Supabase DB:** $25 (Pro tier)
- **Upstash Redis:** $10 (Pay-as-you-go)
- **Meilisearch Cloud:** $15-30 (Basic)
- **Cloudflare R2:** $5-15 (Storage + bandwidth)
- **Monitoring:** $0 (Sentry free tier)
- **Total:** ~$65-130/month

### Medium Scale (10K-100K users)
- **Vercel:** $20-50
- **Fly.io CMS:** $60-100 (4+ instances)
- **AWS RDS:** $100-200 (db.t3.large)
- **ElastiCache:** $50-80 (cache.t3.medium)
- **Meilisearch Cloud:** $50-100 (Standard)
- **S3 + CloudFront:** $50-100
- **Monitoring:** $29+ (Sentry Team)
- **Total:** ~$359-680/month

### Large Scale (100K+ users)
- Use dedicated infrastructure with Kubernetes/ECS
- Budget: $2000-5000+/month
- Requires custom scaling strategy

## Networking

### Ports
- Frontend: 3000 (internal), 443 (public)
- CMS: 1337 (internal), 443 (public via /api)
- PostgreSQL: 5432 (private)
- Redis: 6379 (private)
- Meilisearch: 7700 (private or API key protected)

### Security Groups / Firewall
```
Frontend:
  Inbound: 443 (HTTPS), 80 (HTTP redirect)
  Outbound: 1337 (CMS), 7700 (Search)

CMS:
  Inbound: 1337 (from Frontend/LB)
  Outbound: 5432 (DB), 6379 (Redis), 7700 (Search), 443 (External APIs)

Database/Cache/Search:
  Inbound: Only from CMS security group
  Outbound: None required
```

### DNS Records
- `yourdomain.com` → Frontend (Vercel/A record)
- `api.yourdomain.com` → CMS (Fly.io/A record)
- `cdn.yourdomain.com` → S3/CloudFront (CNAME)
- `search.yourdomain.com` → Meilisearch (CNAME, optional)

## Backup Strategy

### Critical Data
- **Database:** Daily full + continuous WAL archiving (PITR)
- **Media Files:** S3 versioning enabled, lifecycle rules
- **Configuration:** Git repository, environment vars in secrets manager

### Retention Policy
- **Database:** 30 days production, 7 days staging
- **Media:** Indefinite with versioning (lifecycle to Glacier after 90 days)
- **Logs:** 30 days CloudWatch, 90 days in S3

### Disaster Recovery
- **RTO:** 4 hours (Recovery Time Objective)
- **RPO:** 5 minutes (Recovery Point Objective)
- **Runbook:** Database restore from backup, redeploy containers, update DNS

## Monitoring & Alerts

### Health Checks
- Uptime monitoring: Every 1 minute
- Response time: < 500ms p95
- Error rate: < 1%

### Alerts (Critical)
- Service down (> 5 minutes)
- Error rate > 5%
- Response time > 2s p95
- Database connections > 80%
- Disk space > 85%
- Memory usage > 90%

### Dashboards
- Request rate, latency, errors
- Database queries, connections, cache hit rate
- Resource utilization (CPU, RAM, disk)
- Business metrics (articles published, users active)

## Security Hardening

### Required
- [x] HTTPS only (TLS 1.2+)
- [x] Security headers (HSTS, CSP, X-Frame-Options)
- [x] Rate limiting (100 req/min default)
- [x] Secrets in environment variables
- [x] Database encryption at rest
- [x] VPC private subnets for backend services

### Recommended
- [ ] WAF (Cloudflare/AWS WAF)
- [ ] DDoS protection (Cloudflare Pro)
- [ ] Intrusion detection (AWS GuardDuty)
- [ ] Secrets rotation (monthly)
- [ ] Vulnerability scanning (Snyk/Dependabot)
- [ ] Security audit logs (AWS CloudTrail)

## Scaling Triggers

### Horizontal Scaling (Add instances)
- CPU > 70% for 5 minutes
- Request queue depth > 50
- Response time > 1s p95

### Vertical Scaling (Upgrade instance)
- Memory > 85% consistently
- Database connections exhausted
- Search index > 50% of RAM

### When to Split Services
- CMS traffic > 1000 req/min → Separate API and Admin
- Database > 100GB → Sharding or read replicas
- Search index > 10GB → Dedicated Meilisearch cluster

## Compliance (If Applicable)

### GDPR (EU Users)
- [ ] Data processing agreement with providers
- [ ] User data export functionality
- [ ] Right to deletion implemented
- [ ] Data retention policies documented

### PCI DSS (Payment Processing)
- PhonePe handles card data (PCI DSS compliant)
- Store only transaction IDs, not card details
- Secure webhook signature verification

### Data Residency
- Database location: Choose region per compliance
- Backup location: Same region as primary
- CDN: Global with regional restrictions if needed
