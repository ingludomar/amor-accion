#!/bin/bash
# Script to generate initial migration

echo "Generating initial Alembic migration..."

cd "$(dirname "$0")/.."

# Start database
docker compose up -d db
echo "Waiting for database to be ready..."
sleep 10

# Generate migration
docker compose run --rm backend alembic revision --autogenerate -m "Initial migration"

echo "Migration generated successfully!"
echo "To apply migration run: docker compose exec backend alembic upgrade head"
