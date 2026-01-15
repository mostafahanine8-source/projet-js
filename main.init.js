// ./js/main.init.js
(() => {
  "use strict";

  function init() {
    const { state } = EO;
    const { $, $$ } = EO.dom;
    const { ensureSeed, clearDatabase, logAction } = EO.db;      // ✅ ici
    const { applyDir, setLang } = EO.i18n;
    const { saveSession, clearSession } = EO.session;
    const { go, render, startRouter } = EO.router;

    ensureSeed();
    applyDir(state.lang);

    // Router
    startRouter();

    // Login
    $("#loginForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const u = $("#loginUser").value.trim();
      const p = $("#loginPass").value.trim();

      if (u === "admin" && p === "admin") {
        saveSession({ user: "admin", at: Date.now() });
        logAction("login", "system", "Admin logged in");
        go("dashboard");
        render();
      } else {
        $("#loginError").textContent = EO.i18n.t?.("msg_login_failed") || "Identifiants invalides.";
        $("#loginError").classList.remove("hidden");
      }
    });

    // Sidebar nav
    $$(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const r = btn.dataset.route;
        if (!r) return;
        $(".sidebar").classList.remove("open");
        state.sidebarOpen = false;
        go(r === "dashboard" ? "dashboard" : r);
      });
    });

    // Burger
    $("#burger").addEventListener("click", () => {
      state.sidebarOpen = !state.sidebarOpen;
      $(".sidebar").classList.toggle("open", state.sidebarOpen);
    });

    // Logout
    $("#logoutBtn").addEventListener("click", () => {
      clearSession();
      try { logAction("logout", "system", "Admin logged out"); } catch {}
      EO.ui?.dashboard?.destroyCharts?.();
      render();
    });

    // Lang
    $("#langSelect").addEventListener("change", (e) => setLang(e.target.value));

    // Default route + first render
    if (!location.hash) go("dashboard");
    render();

    // Helper console
    window.clearDatabase = clearDatabase;
  }

  // Expose ONLY (le loader appelle init)
  EO.main = { init };// setActiveNav: met en bleu l'item actif du menu
(function () {
  "use strict";

  EO.ui = EO.ui || {};
  EO.ui.helpers = EO.ui.helpers || {};

  EO.ui.helpers.setActiveNav = function setActiveNav(route) {
    // Tous les boutons du menu
    const items = document.querySelectorAll(".nav-item");

    items.forEach((el) => {
      const r = el.dataset.route;
      const isActive =
        r === route ||
        (route === "dashboard" && r === "dashboard");

      el.classList.toggle("active", isActive);
    });
  };
})();

})();
