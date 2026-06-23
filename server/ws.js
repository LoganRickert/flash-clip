/** @type {Set<import('ws').WebSocket>} */
const clients = new Set();

export function addClient(socket) {
  clients.add(socket);

  socket.on('close', () => {
    clients.delete(socket);
  });
}

export function broadcast(message) {
  const payload = JSON.stringify(message);

  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  }
}
