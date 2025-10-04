import {onCommandSendTo} from "./onCommandSendTo.mjs";
import {onCommandArp} from "./arp.mjs";
import { broadcast, sendTo } from "./wsUtils.mjs";

// handleMessage.js
function handleMessage(cliente, data, clientes) {
  try {
    const parsed = JSON.parse(data.toString());
    const msg = parsed.text || "";

    switch (parsed.type) {
      case "setName":
        const newName = parsed.name || cliente.name;
        broadcast(clientes,`WSChat [RENAME] Cliente ${cliente.name} agora é ${newName}`);
        console.log(`WSChat [RENAME] Cliente agora é ${cliente.name}`);
        cliente.name = newName;
        break;

      case "direct":
        const fullMessage = `[DM from ${cliente.name} to ${destino}]: ${msg}`;
        const sent = sendTo(clientes, destino, fullMessage); // ✅ CORRIGIDO

        if (!sent) {
          cliente.send(`[SERVER] Could not deliver message to ${destino}.`);
        }
        break;

      default:
        onMessage(cliente, clientes, msg);
        break;
    }
  } catch (e) {
    console.log("WSChat [ERROR] Mensagem inválida recebida:", data.toString() + e);
    cliente.send("WSCHAT SERVER: PLEASE SEND {type: 'message', text: '...'}");
  }
}

function onMessage(cliente, clientes, msg) {
  const fullMessage = `[${cliente.name}]: ${msg}`;

  if (msg === "/arp") {
    onCommandArp(cliente, clientes); // ✅ passa o Set de clientes corretamente
  } else if (msg.startsWith("/to ")) {
    const sent = onCommandSendTo(cliente, msg, clientes);
    if (!sent) {
      cliente.send("[SERVER] Failed to send direct message.");
    }
  } else {
    broadcast(clientes, fullMessage);
  }
}

export default handleMessage;