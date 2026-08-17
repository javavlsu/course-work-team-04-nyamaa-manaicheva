#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

echo "Старт приложения заметок..."
docker compose up --build