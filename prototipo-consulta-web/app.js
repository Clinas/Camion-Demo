const data = window.PROTOTYPE_DATA;
const truckList = document.querySelector("#truckList");
const detail = document.querySelector("#detail");
const searchInput = document.querySelector("#searchInput");
const clearSearch = document.querySelector("#clearSearch");
const truckCount = document.querySelector("#truckCount");

let selectedTruckId = data.trucks[0]?.id ?? null;
let expandedOrders = new Set();

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const orderWarnings = (truck, orderId) =>
  truck.control?.warnings.filter(
    (warning) => warning.expectedOrder === orderId || warning.readOrder === orderId,
  ) ?? [];

const truckSummary = (truck) => {
  const remitted = truck.orders.filter((order) => order.currentRemito).length;
  return {
    remitted,
    allRemitted: truck.orders.length > 0 && remitted === truck.orders.length,
    warningCount: truck.control?.warnings.length ?? 0,
  };
};

const badge = (text, tone = "neutral") =>
  `<span class="badge badge--${tone}">${escapeHtml(text)}</span>`;

function renderTruckList() {
  const query = searchInput.value.trim().toLocaleLowerCase("es");
  const filtered = data.trucks.filter((truck) =>
    [truck.id, truck.plate, truck.driver].some((value) =>
      value.toLocaleLowerCase("es").includes(query),
    ),
  );

  truckCount.textContent = `${filtered.length} de ${data.trucks.length}`;
  truckList.innerHTML = filtered
    .map((truck) => {
      const summary = truckSummary(truck);
      const controlStatus = !truck.control
        ? badge("Sin control", "neutral")
        : summary.warningCount
          ? badge(`${summary.warningCount} advertencias`, "warning")
          : badge("Control sin problemas", "success");
      const remitoStatus = badge(
        `Remitos ${summary.remitted}/${truck.orders.length}`,
        summary.allRemitted ? "success" : "warning",
      );
      return `
        <button class="truck-card ${truck.id === selectedTruckId ? "is-selected" : ""}"
          type="button" data-truck-id="${truck.id}">
          <span class="truck-icon" aria-hidden="true">▰</span>
          <span class="truck-card__body">
            <strong>${escapeHtml(truck.plate)}</strong>
            <small>${escapeHtml(truck.id)} · ${escapeHtml(truck.driver)}</small>
            <span class="badge-row">${controlStatus}${remitoStatus}</span>
          </span>
          <span class="chevron" aria-hidden="true">›</span>
        </button>`;
    })
    .join("");
}

function warningCard(warning) {
  return `
    <article class="warning-card">
      <div class="warning-card__heading">
        <span class="warning-symbol">!</span>
        <div>
          <strong>${escapeHtml(warning.type)}</strong>
          <p>${escapeHtml(warning.product)} · Código ${escapeHtml(warning.barcode)}</p>
        </div>
        <small>${escapeHtml(warning.id)}</small>
      </div>
      <div class="trace">
        <div>
          <span>SE ESPERABA</span>
          <strong>${escapeHtml(warning.expectedOrder)}</strong>
          <small>${escapeHtml(warning.expectedDocument)}</small>
        </div>
        <b aria-hidden="true">→</b>
        <div>
          <span>SE LEYÓ DE</span>
          <strong class="${warning.readOrder ? "" : "danger"}">${escapeHtml(warning.readOrder || "No se leyó")}</strong>
          <small>${escapeHtml(warning.readDocument || "Sin comprobante leído")}</small>
        </div>
      </div>
      <p class="reason"><b>Motivo:</b> ${escapeHtml(warning.reason)}</p>
    </article>`;
}

function productResult(result) {
  const labels = {
    read: ["Leído", "success"],
    missing: ["Faltante", "warning"],
    "out-of-order": ["Fuera de orden", "warning"],
  };
  return badge(...labels[result]);
}

function expandedOrder(truck, order) {
  const document = order.controlledDocument;
  const warnings = orderWarnings(truck, order.id);
  if (!document) {
    return `<div class="order-detail"><p class="muted">No existe una lista original guardada para este pedido.</p></div>`;
  }
  return `
    <div class="order-detail">
      <div class="snapshot-heading">
        <div>
          <strong>${escapeHtml(document.type)} ${escapeHtml(document.id)}</strong>
          <small>Snapshot tomado el ${escapeHtml(document.snapshotDate)}</small>
        </div>
        ${badge("LISTA ORIGINAL", "info")}
      </div>
      <div class="order-detail__columns">
        <section>
          <h4>PRODUCTOS DEL DOCUMENTO</h4>
          ${document.products
            .map(
              (product) => `
                <div class="product-row">
                  <span><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.barcode)}</small></span>
                  ${productResult(product.result)}
                </div>`,
            )
            .join("")}
        </section>
        <section>
          <h4>ADVERTENCIAS RELACIONADAS</h4>
          ${
            warnings.length
              ? warnings
                  .map(
                    (warning) => `
                      <div class="inline-warning">
                        <strong>${escapeHtml(warning.type)}</strong>
                        <span>${escapeHtml(warning.product)} (${escapeHtml(warning.barcode)})</span>
                        <small>Esperado: ${escapeHtml(warning.expectedOrder)} · Leído: ${escapeHtml(warning.readOrder || "No se leyó")}</small>
                        <em>${escapeHtml(warning.reason)}</em>
                      </div>`,
                  )
                  .join("")
              : `<div class="order-ok"><span>✓</span> El pedido fue controlado sin problemas.</div>`
          }
        </section>
      </div>
    </div>`;
}

function orderRow(truck, order) {
  const warnings = orderWarnings(truck, order.id);
  const expanded = expandedOrders.has(order.id);
  const result = !truck.control
    ? badge("Sin control", "neutral")
    : warnings.length
      ? badge(`${warnings.length} advertencia${warnings.length === 1 ? "" : "s"}`, "warning")
      : badge("Sin problemas", "success");
  return `
    <article class="order">
      <button class="order-row" type="button" data-order-id="${order.id}" aria-expanded="${expanded}">
        <span><strong>${escapeHtml(order.id)}</strong><small>Entrega #${order.deliveryOrder}</small></span>
        <span><strong>${escapeHtml(order.client)}</strong></span>
        <span>${
          order.currentRemito
            ? `<strong class="success-text">▤ ${escapeHtml(order.currentRemito.id)}</strong><small>${escapeHtml(order.currentRemito.date)}</small>`
            : `<strong class="danger">Sin remito</strong>`
        }</span>
        <span>${
          order.controlledDocument
            ? `<strong>${escapeHtml(order.controlledDocument.type)} ${escapeHtml(order.controlledDocument.id)}</strong>`
            : `<span class="muted">No fue controlado</span>`
        }</span>
        <span>${result}</span>
        <span class="row-toggle">${expanded ? "⌃" : "⌄"}</span>
      </button>
      ${expanded ? expandedOrder(truck, order) : ""}
    </article>`;
}

function renderDetail() {
  const truck = data.trucks.find((item) => item.id === selectedTruckId);
  if (!truck) {
    detail.innerHTML = document.querySelector("#emptyTemplate").innerHTML;
    return;
  }
  const summary = truckSummary(truck);
  const controlBlock = !truck.control
    ? `
      <section class="empty-control">
        <span>○</span>
        <div><h3>El camión no tiene control de carga</h3>
        <p>Se muestran los pedidos y sus remitos para facilitar el seguimiento.</p></div>
      </section>`
    : `
      <section class="control-card">
        <div class="control-title">
          <span class="control-icon">✓</span>
          <div><h3>Control ${escapeHtml(truck.control.id)}</h3>
          <p>${escapeHtml(truck.control.date)} · Operador: ${escapeHtml(truck.control.operator)}</p></div>
        </div>
        <div class="notice-section notice-section--warning">
          <h4>ADVERTENCIAS</h4>
          ${
            truck.control.warnings.length
              ? truck.control.warnings.map(
                  (warning) => `<p><span>!</span>${escapeHtml(warning.type)}: ${escapeHtml(warning.product)} (${escapeHtml(warning.barcode)})</p>`,
                ).join("")
              : `<p class="notice-ok"><span>✓</span>No se detectaron advertencias de lectura.</p>`
          }
        </div>
        <div class="notice-section notice-section--manual">
          <h4>OBSERVACIÓN MANUAL AL FINALIZAR ETAPA</h4>
          ${truck.control.stages
            .map(
              (stage) => `
                <p><span>i</span><b>${escapeHtml(stage.name)}:</b>
                ${escapeHtml(stage.manualObservation || "Sin observación manual.")}</p>`,
            )
            .join("")}
        </div>
      </section>`;

  detail.innerHTML = `
    <div class="detail-heading">
      <div><p class="eyebrow">${escapeHtml(truck.id)}</p>
      <h2>${escapeHtml(truck.plate)}</h2>
      <p>${escapeHtml(truck.driver)} · ${escapeHtml(truck.date)}</p></div>
      ${badge(
        summary.allRemitted
          ? "Todos los pedidos tienen remito"
          : `Faltan remitos (${summary.remitted}/${truck.orders.length})`,
        summary.allRemitted ? "success" : "warning",
      )}
    </div>
    ${controlBlock}
    ${
      truck.control?.warnings.length
        ? `<section class="section-block"><h3>Detalle de advertencias</h3>
           <p class="section-help">Trazabilidad registrada al momento del control.</p>
           <div class="warning-grid">${truck.control.warnings.map(warningCard).join("")}</div></section>`
        : ""
    }
    <section class="section-block">
      <h3>Detalle por pedido</h3>
      <p class="section-help">Cada fila despliega la lista original del comprobante usado en el control.</p>
      <div class="order-table">
        <div class="order-header">
          <span>Pedido</span><span>Cliente</span><span>Remito actual</span>
          <span>Control realizado sobre</span><span>Resultado</span><span></span>
        </div>
        ${truck.orders.map((order) => orderRow(truck, order)).join("")}
      </div>
    </section>`;
}

truckList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-truck-id]");
  if (!button) return;
  selectedTruckId = button.dataset.truckId;
  expandedOrders.clear();
  renderTruckList();
  renderDetail();
});

detail.addEventListener("click", (event) => {
  const button = event.target.closest("[data-order-id]");
  if (!button) return;
  const orderId = button.dataset.orderId;
  expandedOrders.has(orderId) ? expandedOrders.delete(orderId) : expandedOrders.add(orderId);
  renderDetail();
});

searchInput.addEventListener("input", renderTruckList);
clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  searchInput.focus();
  renderTruckList();
});

renderTruckList();
renderDetail();
