
(() => {
  "use strict";

  const FILES = [
    "./js/erreur.js",
    "./js/core.namespace.js",
    "./js/core.config.js",
    "./js/core.state.js",
    "./js/core.dom.js",
    "./js/core.db.js",
    "./js/core.session.js",
    "./js/core.i18n.js",
    "./js/ui.modal.js",
    "./js/ui.exports.js",
    "./js/ui.dashboard.js",
    "./js/ui.list-details.js",
    "./js/ui.router-render.js",
    "./main.init.js"
  ];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = false; // IMPORTANT: respecter l’ordre
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load " + src));
      document.head.appendChild(s);
    });
  }

  (async () => {
    for (const f of FILES) await loadScript(f);
    for (const f of FILES) {
  console.log("Loading:", f);
  await loadScript(f);
  console.log("Loaded:", f);
}


    if (!window.EO || !EO.main || typeof EO.main.init !== "function") {
      throw new Error("EO.main.init() introuvable. Vérifie les fichiers.");
    }
    EO.main.init();
  })().catch((err) => {
    console.error(err);
    alert("Erreur de chargement JS : " + err.message);
  });
})();
