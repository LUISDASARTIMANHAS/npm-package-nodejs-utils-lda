const UPDATE_INTERVAL = 15000;

/**
 * Converte bytes para MB
 * @param {number} bytes
 * @return {string}
 */
function toMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

/**
 * Converte uptime em formato legível
 * @param {number} seconds
 * @return {string}
 */
function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

/**
 * Cria um card padrão
 * @param {string} title
 * @param {string} value
 * @return {HTMLElement}
 */
function createCard(title, value) {
  const col = document.createElement("div");
  col.className = "col-md-3";

  col.innerHTML = `
    <div class="neon-card">
      <h6>${title}</h6>
      <span>${value}</span>
    </div>
  `;

  return col;
}

/**
 * Limpa e renderiza cards em um container
 * @param {string} containerId
 * @param {HTMLElement[]} cards
 * @return {void}
 */
function renderCards(containerId, cards) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  cards.forEach((card) => container.appendChild(card));
}

/**
 * Atualiza dashboard
 * @return {Promise<void>}
 */
async function loadStatus() {
  try {
    const res = await fetch("/status");
    const data = await res.json();

    // SISTEMA
    renderCards("systemCards", [
      createCard("Uptime", formatUptime(data.uptime)),
      createCard("Plataforma", data.platform),
      createCard("CPU Cores", data.cpuCores),
      createCard("Timestamp", new Date(data.timestamp).toLocaleTimeString()),
    ]);

    // CPU
    renderCards("cpuCards", [
      createCard("Load AVG", data.cpuUsage.join(" | ")),
    ]);

    // MEMÓRIA
    renderCards("memoryCards", [
      createCard("Heap Used", toMB(data.memoryUsage.heapUsed)),
      createCard("Heap Total", toMB(data.memoryUsage.heapTotal)),
      createCard("RSS", toMB(data.memoryUsage.rss)),
      createCard("Livre", toMB(data.freeMemory)),
    ]);

    // REDE (interfaces)
    renderCards("networkCards", [
      createCard("Interfaces", data.network.interfaces),
      createCard("IPv4", data.network.ipv4 ? "Ativo" : "Inativo"),
      createCard("IPv6", data.network.ipv6 ? "Ativo" : "Inativo"),
    ]);
  } catch (e) {
    console.error("Erro ao carregar status:", e);
  }
}

setInterval(loadStatus, UPDATE_INTERVAL);
loadStatus();
