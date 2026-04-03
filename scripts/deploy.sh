#!/bin/bash
set -e

# Production deployment script for TradeFlow CRM

ENV_FILE=".env.prod"
COMPOSE_FILE="docker-compose.prod.yml"

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found"
    exit 1
fi

# Load environment variables
set -a
source "$ENV_FILE"
set +a

echo "🚀 Deploying TradeFlow CRM..."
echo "Image: ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

# Pull latest images
echo "📦 Pulling latest images..."
docker compose -f "$COMPOSE_FILE" pull

# Run migrations
echo "🗄️  Running database migrations..."
docker compose -f "$COMPOSE_FILE" run --rm app npx prisma migrate deploy

# Start services
echo "▶️  Starting services..."
docker compose -f "$COMPOSE_FILE" up -d

# Wait for app to be healthy
echo "⏳ Waiting for app to be healthy..."
for i in {1..30}; do
    if docker compose -f "$COMPOSE_FILE" exec -T app curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ App is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ App failed to become healthy"
        exit 1
    fi
    echo "  Attempt $i/30..."
    sleep 2
done

# Show status
echo ""
echo "✅ Deployment complete!"
echo ""
docker compose -f "$COMPOSE_FILE" ps
