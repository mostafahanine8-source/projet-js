// ./js/ui.router-render.js
(() => {
  "use strict";

  // Dépendances attendues (déjà chargées avant)
  const { state } = EO;
  const { $, $$, loginView, appView, content } = EO.dom;
  const { applyDir } = EO.i18n;
  const { isAuthed } = EO.session;

  // Pages UI (déjà dans ton découpage)
  // - EO.ui.dashboard.renderDashboard()
  // - UI.renderEntityList(entity)  (ou EO.ui.list.renderEntityList)
  // - UI.renderDetails(entity,id)  (ou EO.ui.list.renderDetails)
  const renderDashboard = EO.ui?.dashboard?.renderDashboard || window.renderDashboard;

  const renderEntityList = window.UI?.renderEntityList || EO.ui?.list?.renderEntityList;
  const renderDetails = window.UI?.renderDetails || EO.ui?.list?.renderDetails;

  function parseHash() {
    // Identique à ton app.js :contentReference[oaicite:3]{index=3}
    const h = location.hash.replace(/^#\/?/, "");
    const parts = h.split("/").filter(Boolean);
    if (parts.length === 0) return { route: "dashboard" };
    if (parts[0] === "details" && parts.length >= 3) {
      return { route: "details", entity: parts[1], id: parts[2] };
    }
    return { route: parts[0] };
  }

  function go(route) {
    // Identique à ton app.js :contentReference[oaicite:4]{index=4}
    location.hash = `#/${route}`;
  }

  function render() {
    // Début identique à ton app.js : dir + year + auth view toggle :contentReference[oaicite:5]{index=5}
    applyDir(state.lang);
    $("#year").textContent = String(new Date().getFullYear());

    if (!isAuthed()) {
      appView.classList.add("hidden");
      loginView.classList.remove("hidden");
      $("#loginError").classList.add("hidden");
      // i18n login view était fait dans app.js, donc on laisse à ton module i18n si tu l'as
      EO.i18n.applyI18n?.(loginView);
      return;
    }
    const listFn =
  window.UI?.renderEntityList ||
  EO.ui?.list?.renderEntityList ||
  window.renderEntityList;

if (["events", "participants", "tickets", "payments", "stats"].includes(state.route)) {
  if (typeof listFn !== "function") {
    content.innerHTML = `
      <div class="card">
        <h2>List</h2>
        <p class="muted">renderEntityList() manquant.</p>
        <p class="muted">Cause probable : ui.list-details.js non chargé ou erreur JS dedans.</p>
      </div>`;
    return;
  }
  listFn(state.route);
  return;
}


    loginView.classList.add("hidden");
    appView.classList.remove("hidden");

    // Dispatch route : identique à ton app.js :contentReference[oaicite:6]{index=6}
    const parsed = parseHash();
    if (parsed.route === "details") {
      state.route = "details";
      state.details = { entity: parsed.entity, id: parsed.id };
    } else {
      state.route = parsed.route || "dashboard";
      state.details = null;
    }

    if (state.route === "dashboard") {
      if (typeof renderDashboard !== "function") {
        content.innerHTML = `<div class="card"><h2>Dashboard</h2><p class="muted">renderDashboard() manquant.</p></div>`;
        return;
      }
      renderDashboard();
      return;
    }

    if (["events", "participants", "tickets", "payments", "stats"].includes(state.route)) {
      if (state.list.entity !== state.route) {
        state.list = { entity: state.route, q: "", filterKey: "", filterValue: "", sortKey: "", sortDir: "asc", page: 1 };
      }
      if (typeof renderEntityList !== "function") {
        content.innerHTML = `<div class="card"><h2>List</h2><p class="muted">renderEntityList() manquant.</p></div>`;
        return;
      }
      renderEntityList(state.route);
      return;
    }

    if (state.route === "details" && state.details) {
      if (typeof renderDetails !== "function") {
        content.innerHTML = `<div class="card"><h2>Details</h2><p class="muted">renderDetails() manquant.</p></div>`;
        return;
      }
      renderDetails(state.details.entity, state.details.id);
      return;
    }

    go("dashboard");
  }

  function onHashChange() {
    // Identique à ton app.js (reset details + route + render) :contentReference[oaicite:7]{index=7}
    const p = parseHash();
    state.details = null;
    state.route = p.route || "dashboard";
    if (state.route === "details") state.details = { entity: p.entity, id: p.id };
    render();
  }

  function startRouter() {
    window.addEventListener("hashchange", onHashChange);
  }

  // Expose (noms simples)
  EO.router = { parseHash, go, render, startRouter };
  window.go = go; // si ton code appelait go() directement :contentReference[oaicite:8]{index=8}
})();
