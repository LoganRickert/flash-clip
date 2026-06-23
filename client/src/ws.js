export function createWebSocket(onPreview) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'preview') {
      onPreview(data);
    }
  };

  return ws;
}
