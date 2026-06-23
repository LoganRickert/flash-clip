import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPreview, hasText, setText, takeText } from './store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const STATIC_DIR = process.env.STATIC_DIR || path.join(__dirname, '..', 'client', 'dist');

const app = Fastify({ logger: true });

app.post('/api/paste', async (request, reply) => {
  const { text } = request.body ?? {};

  if (typeof text !== 'string' || text.length === 0) {
    return reply.code(400).send({ error: 'text is required' });
  }

  setText(text);
  return { preview: getPreview() };
});

app.get('/api/preview', async () => {
  return { preview: getPreview(), hasContent: hasText() };
});

app.post('/api/copy', async (_request, reply) => {
  const text = takeText();

  if (text === null) {
    return reply.code(404).send({ error: 'nothing to copy' });
  }

  return { text };
});

await app.register(fastifyStatic, {
  root: STATIC_DIR,
  wildcard: false,
});

app.setNotFoundHandler((request, reply) => {
  if (request.url.startsWith('/api/')) {
    return reply.code(404).send({ error: 'not found' });
  }
  return reply.sendFile('index.html');
});

await app.listen({ port: PORT, host: '0.0.0.0' });
