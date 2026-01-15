(() => {
  "use strict";

  function loadLang() {
    const v = localStorage.getItem(EO.config.LS_KEYS.lang);
    return v || "fr";
  }

  const state = {
    lang: loadLang(),
    route: "dashboard",
    details: null,
    charts: {},
    sidebarOpen: false,
    list: { entity: null, q: "", filterKey: "", filterValue: "", sortKey: "", sortDir: "asc", page: 1 }
  };

  EO.state = state;
})();
