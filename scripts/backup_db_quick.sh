#!/bin/bash

BACKUP_DIR="/tmp/backup/db"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/urls_$TIMESTAMP.db"

echo "Backing up database to: $BACKUP_FILE"

docker cp url-shortener-backend:/app/data/urls.db "$BACKUP_FILE"

if [ -f "$BACKUP_FILE" ]; then
  SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "✅ Backup successful ($SIZE)"
else
  echo "❌ Backup failed!"
  exit 1
fi