#!/bin/bash
set -e

BACKUP_DIR="/tmp/backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "=== Starting Full Backup ==="
echo "Backup location: $BACKUP_DIR"

# Backup database
echo "1. Backing up SQLite database..."
docker cp url-shortener-backend:/app/data/urls.db "$BACKUP_DIR/urls.db"
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

echo ""
echo "=== Backup Complete ==="
echo "Location: $BACKUP_DIR"