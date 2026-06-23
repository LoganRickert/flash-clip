#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="flash-clip"

docker build \
  -t "${IMAGE_NAME}:latest" \
  .

echo "Built ${IMAGE_NAME}:latest"
