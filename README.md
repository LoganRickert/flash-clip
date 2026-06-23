# FlashClip

FlashClip is a one-time clipboard relay for browsers and devices. Paste text on one machine, then copy it on another. Nothing is written to disk.

## Quick start

Build and run with Docker:

```bash
docker build -t flash-clip .
./run.sh
```

Open http://localhost:4089

To run in the foreground on port 3000 instead:

```bash
docker build -t flash-clip .
docker run --rm -p 3000:3000 flash-clip
```

Open http://localhost:3000

## How it works

1. **Paste**: reads your clipboard and sends the text to the server. The string is stored encrypted in memory.
2. **Preview**: the page shows the first 3 characters followed by 10 asterisks, for example `use**********`.
3. **Copy**: fetches the full string, writes it to your clipboard, and deletes it from the server.

Each paste can only be copied once. If the server or container stops, anything waiting to be copied is lost.

## Local development

Install dependencies:

```bash
pnpm install
```

Start the backend:

```bash
pnpm dev:server
```

In a second terminal, start the frontend:

```bash
pnpm dev:client
```

The Vite dev server proxies `/api` requests to the backend on port 3000.

Build the client for production:

```bash
pnpm build
```

## Project layout

```text
client/   React frontend (Vite)
server/   Fastify API and static file serving
run.sh    Starts the Docker container on port 4089
```

## API

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/api/paste` | Store clipboard text. Body: `{ "text": "..." }` |
| GET | `/api/preview` | Return the masked preview if text is stored |
| POST | `/api/copy` | Return the full text once, then delete it |

## CI

GitHub Actions runs on push and pull requests. It builds the client, builds the Docker image, and runs a smoke test against the API.
