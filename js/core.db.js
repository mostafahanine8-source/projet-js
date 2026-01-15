(() => {
  "use strict";
  const { LS_KEYS } = EO.config;

  function nowISO() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  }

  function loadDB() {
    const raw = localStorage.getItem(LS_KEYS.db);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  function saveDB(db) {
    localStorage.setItem(LS_KEYS.db, JSON.stringify(db));
  }

  function ensureSeed() {
    let db = loadDB();
    if (db) return db;
    db = { events: [], participants: [], tickets: [], payments: [], stats: [] };
    saveDB(db);
    return db;
  }

  function dbGetAll(entity) {
    const db = ensureSeed();
    return db[entity] ? [...db[entity]] : [];
  }

  function dbWriteAll(entity, rows) {
    const db = ensureSeed();
    db[entity] = rows;
    saveDB(db);
  }

  function dbInsert(entity, row) {
    const rows = dbGetAll(entity);
    rows.unshift(row);
    dbWriteAll(entity, rows);
  }

  function dbUpdate(entity, id, patch) {
    const rows = dbGetAll(entity);
    const idx = rows.findIndex(r => r.id === id);
    if (idx === -1) return false;
    rows[idx] = { ...rows[idx], ...patch };
    dbWriteAll(entity, rows);
    return true;
  }

  function dbDelete(entity, id) {
    const rows = dbGetAll(entity);
    const next = rows.filter(r => r.id !== id);
    dbWriteAll(entity, next);
    return next.length !== rows.length;
  }

  function dbDeleteAll(entity) {
    const rows = dbGetAll(entity);
    if (rows.length === 0) return 0;
    dbWriteAll(entity, []);
    return rows.length;
  }

  function dbFind(entity, id) {
    const rows = dbGetAll(entity);
    return rows.find(r => r.id === id) || null;
  }

  function logAction(type, entity, message) {
    const entry = { id: uid("st"), type, entity, message, createdAt: nowISO() };
    dbInsert("stats", entry);
  }

  function clearDatabase() { localStorage.removeItem(LS_KEYS.db); }

  EO.db = {
    nowISO, uid,
    ensureSeed, dbGetAll, dbWriteAll, dbInsert, dbUpdate, dbDelete, dbDeleteAll, dbFind,
    logAction, clearDatabase
  };
})();
