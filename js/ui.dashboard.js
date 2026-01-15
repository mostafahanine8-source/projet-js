// ./js/ui.dashboard.js (ROBUSTE: ne dépend pas de EO.ui.helpers)
(() => {
  "use strict";

  // Debug: confirme que le fichier est bien chargé
  console.log("[ui.dashboard] loaded");

  // Sécurise EO
  window.EO = window.EO || {};
  EO.ui = EO.ui || {};

  // Dépendances minimales
  const state = EO.state || (EO.state = { charts: {}, list: {} });
  const dom = EO.dom || {};
  const db = EO.db || {};
  const i18n = EO.i18n || {};

  const $ = dom.$ || ((sel, root = document) => root.querySelector(sel));
  const content = dom.content || document.querySelector("#content");

  const t = i18n.t || ((k) => k);
  const applyI18n = i18n.applyI18n || (() => {});

  // Helpers fallback (pour éviter crash si EO.ui.helpers absent)
  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function money(x) {
    const n = Number(x || 0);
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: "MAD" }).format(n);
    } catch {
      return `${n.toFixed(2)} MAD`;
    }
  }

  function setActiveNav(route) {
    const items = document.querySelectorAll(".nav-item");
    items.forEach((el) => el.classList.toggle("active", el.dataset.route === route));
  }

  function setCrumbs() {
    // Si ton HTML a un élément de breadcrumb, adapte ici.
    // On ne casse rien si absent.
  }

  function destroyCharts() {
    const charts = state.charts || {};
    Object.values(charts).forEach((ch) => {
      try { ch.destroy(); } catch {}
    });
    state.charts = {};
  }

  function renderCharts(events, participants, tickets, payments) {
    destroyCharts();

    // Si Chart.js n’est pas chargé, on ne bloque pas le dashboard
    if (typeof window.Chart !== "function") {
      console.warn("[ui.dashboard] Chart.js introuvable -> charts désactivés");
      return;
    }

    const c1 = $("#c1"), c2 = $("#c2"), c3 = $("#c3"), c4 = $("#c4"), c5 = $("#c5");
    if (!c1 || !c2 || !c3 || !c4 || !c5) return;

    // Chart 1
    const labels1 = events.map((e) => e.name);
    const data1 = events.map((e) => participants.filter((p) => p.eventId === e.id).length);
    state.charts.c1 = new Chart(c1, {
      type: "bar",
      data: { labels: labels1, datasets: [{ label: t("kpi_participants"), data: data1 }] },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });

    // Chart 2
    const statuses = ["paid", "pending", "failed", "refunded"];
    const data2 = statuses.map((s) => payments.filter((p) => p.status === s).length);
    state.charts.c2 = new Chart(c2, {
      type: "doughnut",
      data: { labels: statuses, datasets: [{ data: data2 }] },
      options: { responsive: true }
    });

    // Chart 3
    const paid = payments.filter((p) => p.status === "paid");
    const monthMap = new Map();
    paid.forEach((p) => {
      const m = String(p.paidAt || "").slice(0, 7) || "—";
      monthMap.set(m, (monthMap.get(m) || 0) + Number(p.amount || 0));
    });
    const labels3 = Array.from(monthMap.keys()).sort();
    const data3 = labels3.map((k) => monthMap.get(k));
    state.charts.c3 = new Chart(c3, {
      type: "line",
      data: { labels: labels3, datasets: [{ label: t("kpi_revenue"), data: data3 }] },
      options: { responsive: true }
    });

    // Chart 4
    const types = ["standard", "vip", "student"];
    const soldByType = types.map((tp) =>
      tickets.filter((tk) => tk.type === tp).reduce((s, x) => s + Number(x.sold || 0), 0)
    );
    const stockByType = types.map((tp) =>
      tickets.filter((tk) => tk.type === tp).reduce((s, x) => s + Number(x.stock || 0), 0)
    );
    state.charts.c4 = new Chart(c4, {
      type: "bar",
      data: {
        labels: types,
        datasets: [
          { label: t("f_sold"), data: soldByType },
          { label: t("f_stock"), data: stockByType }
        ]
      },
      options: { responsive: true }
    });

    // Chart 5
    const points = events.map((e) => ({ x: Number(e.capacity || 0), y: Number(e.price || 0) }));
    state.charts.c5 = new Chart(c5, {
      type: "scatter",
      data: { datasets: [{ label: "events", data: points }] },
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: t("f_capacity") } },
          y: { title: { display: true, text: t("f_price") } }
        }
      }
    });
  }

  function renderDashboard() {
    if (!content) throw new Error("Dashboard: #content introuvable dans le DOM.");

    setActiveNav("dashboard");
    setCrumbs("nav_dashboard");

    // DB
    if (typeof db.ensureSeed !== "function") {
      content.innerHTML = `<div class="card"><h2>Dashboard</h2><p class="muted">DB non initialisée (EO.db.ensureSeed manquant).</p></div>`;
      return;
    }
    const data = db.ensureSeed();
    const events = data.events || [];
    const participants = data.participants || [];
    const tickets = data.tickets || [];
    const payments = data.payments || [];

    const eventFilterId = state.list?.filterValue || "";

    const eventsFiltered = eventFilterId ? events.filter((e) => e.id === eventFilterId) : events;
    const participantsFiltered = eventFilterId ? participants.filter((p) => p.eventId === eventFilterId) : participants;
    const ticketsFiltered = eventFilterId ? tickets.filter((tk) => tk.eventId === eventFilterId) : tickets;
    const paymentsFiltered = eventFilterId ? payments.filter((py) => py.eventId === eventFilterId) : payments;

    const revenue = paymentsFiltered
      .filter((p) => p.status === "paid")
      .reduce((s, p) => s + Number(p.amount || 0), 0);

    const pending = paymentsFiltered.filter((p) => p.status === "pending").length;
    const capacity = eventsFiltered.reduce((s, e) => s + Number(e.capacity || 0), 0);

    const eventOptions = events
      .map((e) =>
        `<option value="${e.id}" ${e.id === eventFilterId ? "selected" : ""}>${escapeHtml(e.name)} • ${escapeHtml(e.city)}</option>`
      )
      .join("");

    content.innerHTML = `
      <div class="card">
        <div class="card-title">
          <h2>${t("dashboard_title")}</h2>
          <div class="tool">
            <label>${t("dashboard_filter_event")}</label>
            <select id="dashEventFilter">
              <option value="">${t("all_events")}</option>
              ${eventOptions}
            </select>
          </div>
        </div>
      </div>

      <div class="grid-4">
        <div class="card kpi">
          <div class="label">${t("kpi_events")}</div>
          <div class="value">${eventsFiltered.length}</div>
          <div class="delta">${t("all_events")}: ${events.length}</div>
        </div>
        <div class="card kpi">
          <div class="label">${t("kpi_participants")}</div>
          <div class="value">${participantsFiltered.length}</div>
          <div class="delta">${eventFilterId ? "Filter ON" : "—"}</div>
        </div>
        <div class="card kpi">
          <div class="label">${t("kpi_revenue")}</div>
          <div class="value">${money(revenue)}</div>
          <div class="delta">${t("kpi_pending")}: ${pending}</div>
        </div>
        <div class="card kpi">
          <div class="label">${t("kpi_capacity")}</div>
          <div class="value">${capacity}</div>
          <div class="delta">${t("kpi_pending")}: ${pending}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <h2>${t("charts_title")}</h2>
          <span class="badge">Chart.js</span>
        </div>

        <div class="grid-2" style="margin-top:12px;">
          <div class="card">
            <div class="card-title"><h2>${t("chart1")}</h2></div>
            <canvas id="c1" height="160"></canvas>
          </div>
          <div class="card">
            <div class="card-title"><h2>${t("chart2")}</h2></div>
            <canvas id="c2" height="160"></canvas>
          </div>
        </div>

        <div class="grid-3" style="margin-top:14px;">
          <div class="card">
            <div class="card-title"><h2>${t("chart3")}</h2></div>
            <canvas id="c3" height="170"></canvas>
          </div>
          <div class="card">
            <div class="card-title"><h2>${t("chart4")}</h2></div>
            <canvas id="c4" height="170"></canvas>
          </div>
          <div class="card">
            <div class="card-title"><h2>${t("chart5")}</h2></div>
            <canvas id="c5" height="170"></canvas>
          </div>
        </div>
      </div>
    `;

    applyI18n(content);

    const sel = $("#dashEventFilter");
    if (sel) {
      sel.addEventListener("change", (e) => {
        state.list = state.list || {};
        state.list.filterKey = "eventId";
        state.list.filterValue = e.target.value;
        renderDashboard();
      });
    }

    renderCharts(eventsFiltered, participantsFiltered, ticketsFiltered, paymentsFiltered);
  }

  // Expose TOUJOURS (même si charts indispo)
  EO.ui.dashboard = { renderDashboard, renderCharts, destroyCharts };
  window.renderDashboard = renderDashboard; // compat routeur

})();
