export async function fetchPreview() {
  const response = await fetch('/api/preview');
  if (!response.ok) throw new Error('Failed to load preview');
  return response.json();
}

export async function pasteText(text) {
  const response = await fetch('/api/paste', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to paste');
  }

  return response.json();
}

export async function copyText() {
  const response = await fetch('/api/copy', { method: 'POST' });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to copy');
  }

  return response.json();
}
