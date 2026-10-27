const STORAGE_KEY = "youtube-subscriber-tracker-v1";

function loadChannels() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
function saveChannels(channels) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(channels));
}
function formatNumber(value) {
  return new Intl.NumberFormat("es-ES").format(Number(value) || 0);
}
function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
}
function latestDelta(channel) {
  const history = Array.isArray(channel.history) ? channel.history : [];
  if (history.length < 2) return null;
  return Number(history[history.length - 1].subscribers) - Number(history[history.length - 2].subscribers);
}
function deltaMarkup(delta) {
  if (delta === null) return '<span class="delta neutral">Sin historial</span>';
  if (delta > 0) return `<span class="delta positive">▲ +${formatNumber(delta)}</span>`;
  if (delta < 0) return `<span class="delta negative">▼ −${formatNumber(Math.abs(delta))}</span>`;
  return '<span class="delta neutral">● 0</span>';
}
function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
function renderMain() {
  const body = document.getElementById("channels-body");
  if (!body) return;
  const channels = loadChannels();
  body.innerHTML = channels.map(channel => {
    const delta = latestDelta(channel);
    return `<tr>
      <td><span class="channel-name">${safeText(channel.name)}</span>${channel.url ? `<a class="channel-link" href="${safeText(channel.url)}" target="_blank" rel="noopener noreferrer">${safeText(channel.url)}</a>` : ""}</td>
      <td><strong>${formatNumber(channel.subscribers)}</strong></td>
      <td>${deltaMarkup(delta)}</td>
      <td>${formatDate(channel.updatedAt)}</td>
      <td><button class="small-button" data-action="update" data-id="${safeText(channel.id)}">Actualizar cifra</button><button class="small-button" data-action="delete" data-id="${safeText(channel.id)}">Eliminar</button></td>
    </tr>`;
  }).join("");
  document.getElementById("empty-state").hidden = channels.length > 0;
  document.getElementById("channel-count").textContent = formatNumber(channels.length);
  document.getElementById("subscriber-total").textContent = formatNumber(channels.reduce((sum, c) => sum + Number(c.subscribers || 0), 0));
  const latest = channels.map(c => c.updatedAt).filter(Boolean).sort().at(-1);
  document.getElementById("last-updated").textContent = latest ? formatDate(latest) : "Sin datos";
}
function renderRanking() {
  const body = document.getElementById("ranking-body");
  if (!body) return;
  const channels = loadChannels().sort((a, b) => Number(b.subscribers) - Number(a.subscribers));
  body.innerHTML = channels.map((channel, index) => {
    const delta = latestDelta(channel);
    const rank = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`;
    return `<tr class="${index < 3 ? "rank-top" : ""}">
      <td><span class="rank-medal">${rank}</span></td>
      <td><span class="channel-name">${safeText(channel.name)}</span>${channel.url ? `<a class="channel-link" href="${safeText(channel.url)}" target="_blank" rel="noopener noreferrer">${safeText(channel.url)}</a>` : ""}</td>
      <td><strong>${formatNumber(channel.subscribers)}</strong></td>
      <td>${deltaMarkup(delta)}</td>
    </tr>`;
  }).join("");
  document.getElementById("rank-empty").hidden = channels.length > 0;
  document.getElementById("rank-count").textContent = formatNumber(channels.length);
  document.getElementById("rank-total").textContent = formatNumber(channels.reduce((sum, c) => sum + Number(c.subscribers || 0), 0));
  const growth = channels.map(c => ({ name: c.name, delta: latestDelta(c) })).filter(c => c.delta !== null).sort((a,b) => b.delta-a.delta)[0];
  document.getElementById("top-growth").textContent = growth && growth.delta > 0 ? `${growth.name} (+${formatNumber(growth.delta)})` : "—";
}
const addForm = document.getElementById("add-form");
if (addForm) {
  addForm.addEventListener("submit", event => {
    event.preventDefault();
    const name = document.getElementById("channel-name").value.trim();
    const url = document.getElementById("channel-url").value.trim();
    const subscribers = Number(document.getElementById("channel-subs").value);
    if (!name || !Number.isFinite(subscribers) || subscribers < 0) return;
    const now = new Date().toISOString();
    const channels = loadChannels();
    channels.push({
      id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
      name, url, subscribers, updatedAt: now,
      history: [{ subscribers, date: now }]
    });
    saveChannels(channels);
    addForm.reset();
    renderMain();
  });
}
document.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const channels = loadChannels();
  const index = channels.findIndex(c => c.id === button.dataset.id);
  if (index < 0) return;
  if (button.dataset.action === "delete") {
    if (!confirm(`¿Eliminar el canal "${channels[index].name}" y su historial?`)) return;
    channels.splice(index, 1);
    saveChannels(channels);
    renderMain();
  }
  if (button.dataset.action === "update") {
    const channel = channels[index];
    const input = prompt(`Introduce el número actual de suscriptores para "${channel.name}":`, String(channel.subscribers));
    if (input === null || input.trim() === "") return;
    const subscribers = Number(input);
    if (!Number.isFinite(subscribers) || subscribers < 0 || !Number.isInteger(subscribers)) {
      alert("Introduce un número entero igual o mayor que cero.");
      return;
    }
    const now = new Date().toISOString();
    channel.subscribers = subscribers;
    channel.updatedAt = now;
    channel.history = Array.isArray(channel.history) ? channel.history : [];
    channel.history.push({ subscribers, date: now });
    channels[index] = channel;
    saveChannels(channels);
    renderMain();
  }
});
renderMain();
renderRanking();
