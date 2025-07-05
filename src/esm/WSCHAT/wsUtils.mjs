export function broadcast(clientes, msg) {
  console.log(`WSChat [broadcast] Send message!`);
  for (const cliente of clientes) {
    if (cliente.readyState === 1) {
      // WebSocket.OPEN === 1
      cliente.send(msg);
    }
  }
}

export function arp(clientes) {
  const nomes = [];
  for (const c of clientes) {
    if (c.name) nomes.push(c.name);
  }
  return nomes;
}

export function sendTo(clientes, targetName, msg) {
  for (const cliente of clientes) {
    if (cliente.name === targetName && cliente.readyState === WebSocket.OPEN) {
      cliente.send(msg);
      console.log(`WSChat [direct] Sent to ${targetName}!}`);
      return true;
    }
  }
  console.log(`WSChat [direct] Client ${targetName} not found or disconnected`);
  return false;
}