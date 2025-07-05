const {arp} = require("./wsUtils.cjs");

function onCommandArp(cliente, clientes) {
	const nomes = arp(clientes); // ✅ agora recebe corretamente o conjunto de clientes
	const lista = `[SERVER] Connected users: ${nomes.join(", ")}`;
	cliente.send(lista);
}

module.exports = onCommandArp;