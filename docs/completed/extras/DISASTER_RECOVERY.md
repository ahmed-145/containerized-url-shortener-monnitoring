# Disaster Recovery Plan - URL Shortener System

**Document Version:** 1.0  
**Last Updated:** November 8, 2025  
**Owner:** DevOps Team  
**Review Frequency:** Monthly

---

## Table of Contents
1. [Overview](#overview)
2. [Backup Strategy](#backup-strategy)
3. [Recovery Procedures](#recovery-procedures)
4. [Automated Backup Scripts](#automated-backup-scripts)
5. [Testing & Validation](#testing--validation)
6. [Incident Response](#incident-response)

---

## 1. Overview

### Purpose
This document outlines procedures for backing up, restoring, and recovering the URL Shortener system in case of data loss, system failure, or disaster scenarios.

### Scope
- SQLite database backups
- Prometheus metrics data backups
- Grafana dashboard configurations
- Docker volume management
- Configuration file backups

### Recovery Time Objective (RTO)
- **Target RTO:** 15 minutes
- **Maximum tolerable downtime:** 1 hour

### Recovery Point Objective (RPO)
- **Target RPO:** 1 hour (max 1 hour of data loss)
- **Backup frequency:** Hourly automated + daily full backup

---

## 2. Backup Strategy

### 2.1 What to Backup

| Component | Data Location | Backup Frequency | Retention |
|-----------|---------------|------------------|-----------|
| **SQLite Database** | `/app/data/urls.db` | Hourly | 7 days |
| **Prometheus Data** | `/prometheus` volume | Daily | 30 days |
| **Grafana Dashboards** | `/var/lib/grafana` volume | Daily | 30 days |
| **Configuration Files** | Git repository | On commit | Forever (Git) |
| **Docker Volumes** | Docker named volumes | Daily | 7 days |

### 2.2 Backup Storage

**Primary Backup Location:** `/backup` directory on host  
**Secondary Location:** External storage (S3, NAS, etc.) - recommended for production

### 2.3 Backup Types

1. **Hot Backup** (System running)
   - SQLite: Use `.backup` command
   - Prometheus: Copy TSDB files
   - Grafana: Export dashboards via API

2. **Cold Backup** (System stopped)
   - Full Docker volume backup
   - System snapshot
   - Configuration clone

---

## 3. Recovery Procedures

### 3.1 Database Recovery

**Scenario:** SQLite database corrupted or deleted

**Steps:**
```bash
# 1. Stop backend service
docker compose stop backend

# 2. Restore database from backup
docker run --rm -v url-shortener-db:/app/data -v $(pwd)/backup:/backup \
  alpine sh -c "cp /backup/urls.db /app/data/urls.db"

# 3. Verify database integrity
docker compose run --rm backend sqlite3 /app/data/urls.db "PRAGMA integrity_check;"

# 4. Start backend service
docker compose start backend

# 5. Verify service health
curl http://localhost:3000/health
```

**Expected Recovery Time:** 5 minutes

### 3.2 Complete System Recovery

**Scenario:** Complete system failure, need full restore

**Steps:**
```bash
# 1. Clone repository
git clone https://github.com/your-repo/url-shortener.git
cd url-shortener

# 2. Restore Docker volumes
./scripts/restore_all.sh /path/to/backup

# 3. Start all services
docker compose up -d

# 4. Wait for health checks
sleep 30

# 5. Verify all services
docker compose ps
curl http://localhost:3000/health
curl http://localhost:9090/-/healthy
curl http://localhost:3001/api/health

# 6. Verify data integrity
curl http://localhost:3000/api/urls | jq '.pagination.total'
```

**Expected Recovery Time:** 15 minutes

### 3.3 Grafana Dashboard Recovery

**Scenario:** Dashboards deleted or corrupted

**Steps:**
```bash
# 1. Restore dashboard JSON files
cp backup/grafana/dashboards/*.json grafana/dashboards/

# 2. Restart Grafana to reload
docker compose restart grafana

# 3. Verify dashboards loaded
curl -u admin:admin http://localhost:3001/api/dashboards/home
```

**Expected Recovery Time:** 2 minutes

### 3.4 Prometheus Data Recovery

**Scenario:** Metrics data lost

**Steps:**
```bash
# 1. Stop Prometheus
docker compose stop prometheus

# 2. Restore TSDB data
docker run --rm -v url-shortener-prometheus:/prometheus -v $(pwd)/backup:/backup \
  alpine sh -c "rm -rf /prometheus/* && cp -r /backup/prometheus/* /prometheus/"

# 3. Start Prometheus
docker compose start prometheus

# 4. Verify data restored
curl http://localhost:9090/api/v1/query?query=up
```

**Expected Recovery Time:** 10 minutes

---

## 4. Automated Backup Scripts

### 4.1 Full Backup Script

```bash
#!/bin/bash
# File: scripts/backup_all.sh
# Description: Backup all system components

set -e

BACKUP_DIR="/backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "=== Starting Full Backup ==="
echo "Backup location: $BACKUP_DIR"

# Backup database
echo "1. Backing up SQLite database..."
docker exec url-shortener-backend sqlite3 /app/data/urls.db ".backup /app/data/urls.db.bak"
docker cp url-shortener-backend:/app/data/urls.db.bak "$BACKUP_DIR/urls.db"
echo "✅ Database backed up"

# Backup Prometheus data
echo "2. Backing up Prometheus data..."
docker run --rm -v url-shortener-prometheus:/prometheus -v "$BACKUP_DIR":/backup \
  alpine tar czf /backup/prometheus.tar.gz -C /prometheus .
echo "✅ Prometheus data backed up"

# Backup Grafana data
echo "3. Backing up Grafana data..."
docker run --rm -v url-shortener-grafana:/grafana -v "$BACKUP_DIR":/backup \
  alpine tar czf /backup/grafana.tar.gz -C /grafana .
echo "✅ Grafana data backed up"

# Backup configuration files
echo "4. Backing up configuration files..."
tar czf "$BACKUP_DIR/config.tar.gz" \
  docker-compose.yml \
  prometheus/prometheus.yml \
  grafana/provisioning/ \
  grafana/dashboards/
echo "✅ Configuration files backed up"

# Create backup manifest
cat > "$BACKUP_DIR/manifest.txt" << EOF
Backup Date: $(date)
Backup Type: Full System Backup

Components:
- SQLite Database: urls.db
- Prometheus Data: prometheus.tar.gz
- Grafana Data: grafana.tar.gz
- Configuration: config.tar.gz

Database Stats:
$(docker exec url-shortener-backend sqlite3 /app/data/urls.db "SELECT COUNT(*) as total_urls FROM urls;")

File Sizes:
$(du -sh $BACKUP_DIR/*)

Docker Version: $(docker --version)
Docker Compose Version: $(docker compose version)
EOF

echo ""
echo "=== Backup Complete ==="
echo "Backup size: $(du -sh $BACKUP_DIR | cut -f1)"
echo "Location: $BACKUP_DIR"
echo ""

# Cleanup old backups (keep last 7 days)
find /backup -type d -mtime +7 -name "20*" -exec rm -rf {} +
echo "✅ Old backups cleaned up (kept last 7 days)"
```

### 4.2 Quick Database Backup

```bash
#!/bin/bash
# File: scripts/backup_db_quick.sh
# Description: Quick database-only backup

BACKUP_DIR="/backup/db"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/urls_$TIMESTAMP.db"

echo "Backing up database to: $BACKUP_FILE"

# Hot backup using SQLite backup command
docker exec url-shortener-backend sqlite3 /app/data/urls.db ".backup '$BACKUP_FILE'"

# Verify backup
if [ -f "$BACKUP_FILE" ]; then
  SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "✅ Backup successful ($SIZE)"
  
  # Keep only last 24 hourly backups
  ls -t $BACKUP_DIR/urls_*.db | tail -n +25 | xargs -r rm
  echo "✅ Old backups cleaned up"
else
  echo "❌ Backup failed!"
  exit 1
fi
```

### 4.3 Restore Script

```bash
#!/bin/bash
# File: scripts/restore_all.sh
# Description: Restore from full backup

if [ -z "$1" ]; then
  echo "Usage: $0 /path/to/backup/directory"
  exit 1
fi

BACKUP_DIR="$1"

if [ ! -d "$BACKUP_DIR" ]; then
  echo "Error: Backup directory not found: $BACKUP_DIR"
  exit 1
fi

echo "=== Starting System Restore ==="
echo "Restoring from: $BACKUP_DIR"
echo ""

read -p "This will OVERWRITE existing data. Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "Restore cancelled."
  exit 0
fi

# Stop all services
echo "1. Stopping services..."
docker compose down
echo "✅ Services stopped"

# Restore database
echo "2. Restoring SQLite database..."
docker run --rm -v url-shortener-db:/app/data -v "$BACKUP_DIR":/backup \
  alpine sh -c "cp /backup/urls.db /app/data/urls.db && chown 1000:1000 /app/data/urls.db"
echo "✅ Database restored"

# Restore Prometheus data
echo "3. Restoring Prometheus data..."
docker run --rm -v url-shortener-prometheus:/prometheus -v "$BACKUP_DIR":/backup \
  alpine sh -c "rm -rf /prometheus/* && tar xzf /backup/prometheus.tar.gz -C /prometheus"
echo "✅ Prometheus data restored"

# Restore Grafana data
echo "4. Restoring Grafana data..."
docker run --rm -v url-shortener-grafana:/grafana -v "$BACKUP_DIR":/backup \
  alpine sh -c "rm -rf /grafana/* && tar xzf /backup/grafana.tar.gz -C /grafana"
echo "✅ Grafana data restored"

# Restore configuration files
echo "5. Restoring configuration files..."
tar xzf "$BACKUP_DIR/config.tar.gz"
echo "✅ Configuration files restored"

# Start all services
echo "6. Starting services..."
docker compose up -d

# Wait for health checks
echo "7. Waiting for services to be healthy..."
sleep 30

# Verify services
echo ""
echo "=== Verifying Restore ==="

# Check backend
if curl -s http://localhost:3000/health | grep -q "healthy"; then
  echo "✅ Backend: Healthy"
else
  echo "❌ Backend: Not responding"
fi

# Check Prometheus
if curl -s http://localhost:9090/-/healthy > /dev/null 2>&1; then
  echo "✅ Prometheus: Healthy"
else
  echo "❌ Prometheus: Not responding"
fi

# Check Grafana
if curl -s http://localhost:3001/api/health | grep -q "ok"; then
  echo "✅ Grafana: Healthy"
else
  echo "❌ Grafana: Not responding"
fi

# Check data
TOTAL_URLS=$(curl -s http://localhost:3000/api/urls | jq -r '.pagination.total')
echo "📊 Total URLs in database: $TOTAL_URLS"

echo ""
echo "=== Restore Complete ==="
```

### 4.4 Cron Automation

```bash
# File: /etc/cron.d/url-shortener-backup
# Description: Automated backup schedule

# Hourly database backup
0 * * * * /path/to/scripts/backup_db_quick.sh >> /var/log/backup_db.log 2>&1

# Daily full backup at 2 AM
0 2 * * * /path/to/scripts/backup_all.sh >> /var/log/backup_full.log 2>&1

# Weekly backup verification (Sundays at 3 AM)
0 3 * * 0 /path/to/scripts/verify_backups.sh >> /var/log/backup_verify.log 2>&1
```

### 4.5 Backup Verification Script

```bash
#!/bin/bash
# File: scripts/verify_backups.sh
# Description: Verify backup integrity

BACKUP_DIR="/backup"
LATEST_BACKUP=$(ls -td $BACKUP_DIR/*/ | head -1)

echo "=== Backup Verification ==="
echo "Verifying: $LATEST_BACKUP"

# Check if backup exists
if [ ! -d "$LATEST_BACKUP" ]; then
  echo "❌ No backup found!"
  exit 1
fi

# Check database file
if [ -f "$LATEST_BACKUP/urls.db" ]; then
  echo "✅ Database file exists"
  
  # Verify database integrity
  sqlite3 "$LATEST_BACKUP/urls.db" "PRAGMA integrity_check;" | grep -q "ok"
  if [ $? -eq 0 ]; then
    echo "✅ Database integrity OK"
  else
    echo "❌ Database corrupted!"
    exit 1
  fi
else
  echo "❌ Database file missing!"
  exit 1
fi

# Check other backup files
for file in prometheus.tar.gz grafana.tar.gz config.tar.gz; do
  if [ -f "$LATEST_BACKUP/$file" ]; then
    echo "✅ $file exists"
  else
    echo "❌ $file missing!"
  fi
done

# Check backup age
BACKUP_AGE=$(find "$LATEST_BACKUP" -mtime +1 | wc -l)
if [ $BACKUP_AGE -gt 0 ]; then
  echo "⚠️  WARNING: Backup is older than 24 hours!"
else
  echo "✅ Backup is recent"
fi

echo ""
echo "Verification complete."
```

---

## 5. Testing & Validation

### 5.1 Quarterly Restore Test

**Schedule:** Every 3 months  
**Duration:** 1 hour  
**Participants:** DevOps team

**Test Procedure:**
```bash
# 1. Create test backup
./scripts/backup_all.sh

# 2. Simulate disaster (stop and remove volumes)
docker compose down -v

# 3. Restore from backup
./scripts/restore_all.sh /backup/latest

# 4. Validate data integrity
curl http://localhost:3000/api/urls | jq '.pagination.total'

# 5. Test functionality
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://test.com"}'

# 6. Check dashboards
open http://localhost:3001

# 7. Document results
```

### 5.2 Backup Monitoring

**Metrics to Track:**
- Backup success rate
- Backup duration
- Backup file size
- Last successful backup timestamp
- Restore test success rate

**Alert on:**
- Backup failure
- Backup older than 24 hours
- Backup size anomaly (too small/large)

---

## 6. Incident Response

### 6.1 Data Loss Incident

**Severity:** Critical  
**Response Time:** Immediate

**Steps:**
1. **Assess Impact**
   - Determine data loss scope
   - Identify affected time period
   - Check backup availability

2. **Initiate Recovery**
   - Follow appropriate recovery procedure
   - Notify team members
   - Document actions taken

3. **Post-Incident**
   - Verify data integrity
   - Analyze root cause
   - Update procedures if needed
   - Conduct post-mortem

### 6.2 System Failure

**Severity:** High  
**Response Time:** < 15 minutes

**Steps:**
1. Check system health
2. Review logs for errors
3. Attempt service restart
4. If restart fails, initiate full restore
5. Document incident

### 6.3 Escalation Contacts

| Role | Contact | Escalation Time |
|------|---------|-----------------|
| Primary: DevOps Lead | ahmed@example.com | Immediate |
| Secondary: System Admin | mohamed@example.com | +15 minutes |
| Management | team-lead@example.com | +30 minutes |

---

## 7. Checklist

### Daily:
- [ ] Verify automated backups completed
- [ ] Check backup logs for errors
- [ ] Monitor disk space

### Weekly:
- [ ] Run backup verification script
- [ ] Review backup retention
- [ ] Test random restore

### Monthly:
- [ ] Review disaster recovery plan
- [ ] Update documentation
- [ ] Verify contact information

### Quarterly:
- [ ] Full restore test
- [ ] Update recovery procedures
- [ ] Team training session

---

## 8. Appendix

### Backup File Structure
```
/backup/
├── 20251108_120000/
│   ├── urls.db
│   ├── prometheus.tar.gz
│   ├── grafana.tar.gz
│   ├── config.tar.gz
│   └── manifest.txt
├── 20251108_130000/
└── db/
    ├── urls_20251108_120000.db
    └── urls_20251108_130000.db
```

### Useful Commands
```bash
# Check Docker volumes
docker volume ls

# Inspect volume
docker volume inspect url-shortener-db

# Export volume to tar
docker run --rm -v url-shortener-db:/data -v $(pwd):/backup \
  alpine tar czf /backup/db_backup.tar.gz -C /data .

# Import volume from tar
docker run --rm -v url-shortener-db:/data -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/db_backup.tar.gz"

# Database size
docker exec url-shortener-backend du -h /app/data/urls.db
```

---

**Document Prepared By:** DevOps Team  
**Last Reviewed:** November 8, 2025  
**Next Review Due:** December 8, 2025