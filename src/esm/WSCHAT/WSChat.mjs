// WSChat.js
import { createServer } from "http";
import { resolve, join } from "path";
import { readFile } from "fs";
import { Server } from "ws";
import handleMessage from "./handlemessages.mjs";
import { broadcast } from "./wsUtils.mjs";

const WSChatFilePath = resolve(
  join(
    "node_modules",
    "npm-package-nodejs-utils-lda",
    "src",
    "public",
    "pages",
    "WSChat.html"
  )
);
function WSChat(appOrNull, options = {}) {
  let server;

  if (appOrNull && typeof appOrNull.listen === "function") {
    if (appOrNull.set) {
      // app express → adiciona rota /chat
      appOrNull.get("/chat", (req, res) => {
        res.sendFile(WSChatFilePath);
      });

      server = createServer(appOrNull);
    } else {
      server = appOrNull;
    }
  } else {
    server = createServer((req, res) => {
      if (req.url === "/chat") {
        readFile(WSChatFilePath, (err, data) => {
          if (err) {
            res.writeHead(500);
            return res.end("Error loading chat page");
          }
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data);
        });
      } else {
        res.writeHead(404);
        res.end("Not Found");
      }
    });
  }

  WSServer(server, options);

  if (!appOrNull || !appOrNull.listen) {
    const porta = options.port || 0;
    server.listen(porta || 0, () => {
      const addr = server.address();
      const port = addr.port;
      console.log(`🟢 WSChat running at http://localhost:${port}/chat`);
      console.log(`WSChat Connections Mode: ws://localhost:${port}/`);
    });
  }

  return server;
}

function WSServer(server, options) {
  const wss = new Server({ server });
  const clientes = new Set();

  startInactivityChecker(wss, clientes);

  wss.on("connection", (cliente) =>
    handleConnection(cliente, wss, clientes, options)
  );
}

function startInactivityChecker(wss, clientes) {
  setInterval(() => {
    for (const cliente of clientes) {
      if (!cliente.isAlive) {
        console.log(
          `WSChat [TIMEOUT] Desconectando ${cliente.name} por inatividade...`
        );
        cliente.terminate();
      } else {
        cliente.isAlive = false;
        cliente.ping();
      }
    }
  }, 30000);
}

function handleConnection(cliente, wss, clientes, options) {
  cliente.name = `User${Math.floor(Math.random() * 9000 + 1000)}`;
  cliente.isAlive = true;
  clientes.add(cliente);

  broadcast(clientes,options.welcomeMessage || `${cliente.name} Welcome to WSChat!`);

  cliente.on("pong", () => {
    cliente.isAlive = true;
    cliente.send("WSCHAT SERVER: PING!");
  });

  cliente.on("message", (data) => handleMessage(cliente, data, clientes));

  cliente.on("close", (code, reason) => {
    console.log(`WSChat [CLOSE] ${cliente.name} disconnected. Code: ${code}`);
    clientes.delete(cliente);
  });
}



export default WSChat;
