import { sendTo } from "./wsUtils.cjs";

export function onCommandSendTo(cliente, msg, clientes) {
  const withoutCommand = msg.slice(4).trim();
  const commaIndex = withoutCommand.indexOf(",");

  if (commaIndex === -1) {
    cliente.send("[SERVER] Invalid /to command. Use: /to username, message");
    return false;
  }

  const destino = withoutCommand.slice(0, commaIndex).trim();
  const mensagem = withoutCommand.slice(commaIndex + 1).trim();

  if (!destino || !mensagem) {
    cliente.send("[SERVER] Invalid format. Usage: /to username, message");
    return false;
  }

  const fullMessage = `[DM from ${cliente.name} to ${destino}]: ${mensagem}`;
  const sent = sendTo(clientes, destino, fullMessage); // ✅ CORRIGIDO

  if (!sent) {
    cliente.send(`[SERVER] Could not deliver message to ${destino}.`);
  }

  return sent;
}