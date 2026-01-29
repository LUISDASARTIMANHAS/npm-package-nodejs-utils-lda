
const updateIntervalSeconds = 15
/**
 * Converte segundos em formato legível
 * @param {number} seconds
 * @return {string}
 */
function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

/**
 * Atualiza campo com animação sutil
 * @param {string} id
 * @param {string} value
 * @return {void}
 */
function updateField(id, value) {
  const el = document.getElementById(id);
  el.style.transform = "scale(0.96)";
  el.style.opacity = "0.7";

  requestAnimationFrame(() => {
    el.textContent = value;
    el.style.transform = "scale(1)";
    el.style.opacity = "1";
  });
}

/**
 * Atualiza o dashboard com dados do servidor
 * @return {Promise<void>}
 */
async function loadStatus() {
  try {
    const res = await fetch("/status");
    const data = await res.json();

    updateField("uptime", formatUptime(data.uptime));
    updateField("cpu", data.cpuUsage.map((v) => v.toFixed(2)).join(" | "));
    updateField(
      "heap",
      (data.memoryUsage.heapUsed / 1024 / 1024).toFixed(1) + " MB",
    );
    updateField("rss", (data.memoryUsage.rss / 1024 / 1024).toFixed(1) + " MB");
  } catch (err) {
    console.error("Erro ao carregar status:", err);
  }
}

/**
 * Loop de atualização
 */
setInterval(loadStatus, 1000*updateIntervalSeconds);
loadStatus();
