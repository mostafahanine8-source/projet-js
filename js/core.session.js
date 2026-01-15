(() => {
  "use strict";
  const { LS_KEYS } = EO.config;

  function loadSession() {
    const raw = localStorage.getItem(LS_KEYS.session);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }
  function saveSession(sess) { localStorage.setItem(LS_KEYS.session, JSON.stringify(sess)); }
  function clearSession() { localStorage.removeItem(LS_KEYS.session); }

  function isAuthed() {
    const s = loadSession();
    return !!(s && s.user === "admin");
  }

  EO.session = { loadSession, saveSession, clearSession, isAuthed };
})();
