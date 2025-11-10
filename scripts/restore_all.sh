#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 /path/to/backup/directory"
  exit 1
fi

BACKUP_DIR="$1"

echo "=== Starting System Restore ==="
echo "Restoring from: $BACKUP_DIR"

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
  alpine sh -c "cp /backup/urls.db /app/data/urls.db"
echo "✅ Database restored"

# Restore Prometheus
echo "3. Restoring Prometheus data..."
docker run --rm -v url-shortener-prometheus:/prometheus -v "$BACKUP_DIR":/backup \
  alpine sh -c "rm -rf /prometheus/* && tar xzf /backup/prometheus.tar.gz -C /prometheus"
echo "✅ Prometheus restored"

# Restore Grafana
echo "4. Restoring Grafana data..."
docker run --rm -v url-shortener-grafana:/grafana -v "$BACKUP_DIR":/backup \
  alpine sh -c "rm -rf /grafana/* && tar xzf /backup/grafana.tar.gz -C /grafana"
echo "✅ Grafana restored"

# Start services
echo "5. Starting services..."
docker compose up -d
sleep 30

echo ""
echo "=== Restore Complete ==="