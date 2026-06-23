#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="flash-clip"
CONTAINER_NAME="flash-clip-test-$$"
HOST_PORT="${TEST_PORT:-3099}"
CONTAINER_PORT=3000
BASE_URL="http://localhost:${HOST_PORT}"

cleanup() {
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
}

trap cleanup EXIT

pass() {
  echo "PASS: $1"
}

fail() {
  echo "FAIL: $1" >&2
  exit 1
}

assert_contains() {
  local haystack="$1"
  local needle="$2"
  local label="$3"

  if [[ "$haystack" == *"$needle"* ]]; then
    pass "$label"
  else
    echo "Expected to contain: $needle" >&2
    echo "Got: $haystack" >&2
    fail "$label"
  fi
}

assert_status() {
  local status="$1"
  local expected="$2"
  local label="$3"

  if [[ "$status" == "$expected" ]]; then
    pass "$label"
  else
    echo "Expected status $expected, got $status" >&2
    fail "$label"
  fi
}

wait_for_server() {
  for _ in $(seq 1 30); do
    if curl -sf "${BASE_URL}/api/preview" >/dev/null; then
      return 0
    fi
    sleep 1
  done

  fail "server did not become ready"
}

echo "Building ${IMAGE_NAME}:latest..."
docker build -t "${IMAGE_NAME}:latest" .

echo "Starting throwaway container ${CONTAINER_NAME} on port ${HOST_PORT}..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  "${IMAGE_NAME}:latest" >/dev/null

wait_for_server
pass "server is ready"

preview="$(curl -sf "${BASE_URL}/api/preview")"
assert_contains "$preview" '"hasContent":false' "preview is empty on startup"

empty_paste_status="$(
  curl -s -o /dev/null -w '%{http_code}' \
    -X POST "${BASE_URL}/api/paste" \
    -H 'Content-Type: application/json' \
    -d '{"text":""}'
)"
assert_status "$empty_paste_status" "400" "empty paste is rejected"

oversized_paste_status="$(
  node -e "
    const text = 'x'.repeat(2 * 1024 * 1024 + 1);
    fetch('${BASE_URL}/api/paste', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }).then((response) => {
      process.stdout.write(String(response.status));
    });
  "
)"
assert_status "$oversized_paste_status" "413" "oversized paste is rejected"

paste_response="$(
  curl -sf -X POST "${BASE_URL}/api/paste" \
    -H 'Content-Type: application/json' \
    -d '{"text":"test123456"}'
)"
assert_contains "$paste_response" 'tes**********' "paste returns masked preview"

preview="$(
  curl -sf "${BASE_URL}/api/preview"
)"
assert_contains "$preview" '"hasContent":true' "preview shows stored content"

copy_response="$(
  curl -sf -X POST "${BASE_URL}/api/copy"
)"
assert_contains "$copy_response" 'test123456' "copy returns full text"

second_copy_response="$(
  curl -s -X POST "${BASE_URL}/api/copy"
)"
assert_contains "$second_copy_response" 'nothing to copy' "second copy is empty"

second_copy_status="$(
  curl -s -o /dev/null -w '%{http_code}' -X POST "${BASE_URL}/api/copy"
)"
assert_status "$second_copy_status" "404" "second copy returns 404"

home="$(curl -sf "${BASE_URL}/")"
assert_contains "$home" 'FlashClip' "home page loads"
assert_contains "$home" 'name="description"' "home page has meta description"

favicon="$(curl -sf "${BASE_URL}/favicon.svg")"
assert_contains "$favicon" '<svg' "favicon is served"

robots="$(curl -sf "${BASE_URL}/robots.txt")"
assert_contains "$robots" 'User-agent:' "robots.txt is served"
assert_contains "$robots" 'Disallow: /api/' "robots.txt blocks api paths"

echo
echo "All tests passed."
