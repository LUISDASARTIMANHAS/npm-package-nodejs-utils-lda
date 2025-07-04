const http = require("http");
const WebSocket = require("ws");

function WSChat(appOrNull, options = {}) {
  let server;

  if (appOrNull && typeof appOrNull.listen === "function") {
    // Se receber um Express (ou algo que tem listen), cria HTTP server a partir dele
    if (appOrNull.set) {
      // pode ser express, cria server http a partir do app
      server = http.createServer(appOrNull);
    } else {
      // se appOrNull já é um http.Server, usa direto
      server = appOrNull;
    }
  } else if (appOrNull === null || appOrNull === undefined) {
    // Cria um servidor http puro, que escuta em porta default 8080
    server = http.createServer();
  } else {
    throw new Error("Parâmetro inválido: passe app Express ou null");
  }

  const wss = new WebSocket.Server({ server });

  const clientes = new Set();

  wss.on("connection", (ws) => {
    clientes.add(ws);
    ws.send(options.welcomeMessage || "Bem-vindo ao WSChat!");

    ws.on("message", (msg) => {
      // broadcast simples para todos os clientes
			broadcast(clientes,msg);
    });

    ws.on("close", () => {
      clientes.delete(ws);
    });
  });

  // Se criou servidor http, inicia ele na porta padrão 8080 (ou passada em options)
  if (!appOrNull || !appOrNull.listen) {
    const porta = options.port || 8080;
    server.listen(porta, () => {
      console.log(`WSChat HTTP server rodando na porta ${porta}`);
    });
  }

  return server;
}

function broadcast(clientes,msg) {
  for (const cliente of clientes) {
    if (cliente.readyState === WebSocket.OPEN) {
      cliente.send(msg);
    }
  }
}

module.exports = WSChat;
