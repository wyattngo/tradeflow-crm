#!/bin/bash
set -e

# Rollback script - reverts to previous deployment

COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups"
LATEST_BACKUP=$(ls -td $BACKUP_DIR/*/ 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backup found"
    exit 1
fi

echo "🔄 Rolling back to: $LATEST_BACKUP"

# Stop current deployment
echo "⏹️  Stopping current deployment..."
docker compose -f "$COMPOSE_FILE" down

# Restore from backup
echo "📦 Restoring from backup..."
cp -r "$LATEST_BACKUP"/* .

# Start services
echo "▶️  Starting services..."
docker compose -f "$COMPOSE_FILE" up -d

echo "✅ Rollback complete!"
docker compose -f "$COMPOSE_FILE" ps
