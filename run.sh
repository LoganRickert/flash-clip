#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="flash-clip"
CONTAINER_NAME="flash-clip"
HOST_PORT=4089
CONTAINER_PORT=3000

if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  docker start "$CONTAINER_NAME" >/dev/null
  echo "Started existing container $CONTAINER_NAME on http://localhost:$HOST_PORT"
  exit 0
fi

docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  "$IMAGE_NAME"

echo "Running $CONTAINER_NAME on http://localhost:$HOST_PORT"
