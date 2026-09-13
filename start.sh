#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

# Временно MinIO-сервис отключён (в docker-compose.yml закомментирован).
# Файл не изменён — start.sh запускает весь compose, minio просто отсутствует.

echo "Старт приложения заметок..."
docker compose up --build