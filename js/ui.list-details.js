// ./js/ui.list-details.js
(() => {
  "use strict";

  // ---------- helpers internes ----------
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

  function safeGetEO() {
    if (!window.EO) throw new Error("EO undefined (namespace non chargé).");
    if (!EO.dom?.content) throw new Error("EO.dom.content missing.");
    if (!EO.config?.ENTITIES) throw new Error("EO.config.ENTITIES missing.");
    if (!EO.db) throw new Error("EO.db missing.");
    if (!EO.i18n?.t) throw new Error("EO.i18n.t missing.");
    if (!EO.ui?.modal) throw new Error("EO.ui.modal missing.");
    if (!EO.ui?.exports) throw new Error("EO.ui.exports missing.");
    if (!EO.router?.go) throw new Error("EO.router.go missing.");
  }

  function applyListOps(entity, rows) {
    const st = EO.state.list;
    let out = [...rows];

    // search (q)
    const q = (st.q || "").trim().toLowerCase();
    if (q) {
      out = out.filter(r => JSON.stringify(r).toLowerCase().includes(q));
    }

    // filter
    if (st.filterKey && st.filterValue) {
      const fk = st.filterKey;
      const fv = String(st.filterValue).toLowerCase();
      out = out.filter(r => String(r[fk] ?? "").toLowerCase().includes(fv));
    }

    // sort
    if (st.sortKey) {
      const k = st.sortKey;
      const dir = st.sortDir === "desc" ? -1 : 1;
      out.sort((a, b) => {
        const va = a[k], vb = b[k];
        if (va == null && vb == null) return 0;
        if (va == null) return -1 * dir;
        if (vb == null) return 1 * dir;
        return String(va).localeCompare(String(vb), undefined, { numeric: true }) * dir;
      });
    }

    // pagination
    const pageSize = EO.config.PAGE_SIZE || 8;
    const total = out.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    st.page = Math.min(Math.max(1, st.page || 1), pages);

    const start = (st.page - 1) * pageSize;
    const pageRows = out.slice(start, start + pageSize);

    return { allRows: out, pageRows, total, pages };
  }

  function formatCell(entity, field, value) {
    // resolve selects from other entities
    if (field.type === "select" && field.optionsFrom) {
      const rows = EO.db.dbGetAll(field.optionsFrom);
      const found = rows.find(r => r.id === value);
      if (!found) return value ?? "";
      return field.optionLabel ? field.optionLabel(found) : (found.id ?? "");
    }
    return value ?? "";
  }

  function normalizeRow(entity, obj, isCreate) {
    // minimal normalization, respects id/date defaults
    const def = EO.config.ENTITIES[entity];
    const out = {};
    def.fields.forEach(f => {
      out[f.key] = obj[f.key] ?? "";
    });

    if (isCreate) {
      out.id = EO.db.uid(entity.slice(0, 2));
    }
    // keep existing id on update handled elsewhere
    return out;
  }
  function validateTicketStockSold(obj) {
  const stock = Number(obj.stock ?? 0);
  const sold  = Number(obj.sold ?? 0);

  // valeurs invalides
  if (Number.isNaN(stock) || Number.isNaN(sold)) {
    return "Stock et Vendus doivent être des nombres.";
  }
  if (stock < 0 || sold < 0) {
    return "Stock et Vendus ne peuvent pas être négatifs.";
  }
  if (sold > stock) {
    return "Vendus ne peut pas être supérieur au stock.";
  }
  return null; // OK
}


  // ---------- UI helpers (si tu n’as pas encore un fichier helpers dédié) ----------
  EO.ui = EO.ui || {};
  EO.ui.helpers = EO.ui.helpers || {};
  EO.ui.helpers.setActiveNav = EO.ui.helpers.setActiveNav || (() => {});
  EO.ui.helpers.setCrumbs = EO.ui.helpers.setCrumbs || (() => {});
  EO.ui.helpers.money = EO.ui.helpers.money || ((n) => String(n ?? "0"));

  // ---------- pages ----------
  function renderEntityList(entity) {
    safeGetEO();

    const { t, applyI18n } = EO.i18n;
    const { content, $ } = EO.dom;
    const def = EO.config.ENTITIES[entity];
    if (!def) {
      content.innerHTML = `<div class="card"><h2>List</h2><p class="muted">Unknown entity: ${esc(entity)}</p></div>`;
      return;
    }

    EO.ui.helpers.setActiveNav(entity);
    EO.ui.helpers.setCrumbs(def.labelKey);

    EO.state.list.entity = entity;

    const rows = EO.db.dbGetAll(entity);
    const { allRows, pageRows, total, pages } = applyListOps(entity, rows);

    const ths = def.fields.map(f => `<th>${esc(t(f.labelKey))}</th>`).join("");

    const trs = pageRows.map(r => {
      const tds = def.fields.map(f => `<td>${esc(formatCell(entity, f, r[f.key]))}</td>`).join("");
      return `
        <tr>
          ${tds}
          <td>
            <div class="actions">
              <button class="btn small-btn primary" data-act="details" data-id="${esc(r.id)}">${esc(t("see_details"))}</button>
              <button class="btn small-btn" data-act="edit" data-id="${esc(r.id)}">${esc(t("edit"))}</button>
              <button class="btn small-btn danger" data-act="delete" data-id="${esc(r.id)}">${esc(t("del"))}</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    content.innerHTML = `
      <div class="card">
        <div class="card-title">
          <h2>${esc(t(def.labelKey))}</h2>
          <div class="right" style="display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn primary" id="addBtn">${esc(t("btn_add"))}</button>
            <button class="btn" id="csvBtn">${esc(t("btn_export_csv"))}</button>
            <button class="btn danger" id="deleteAllBtn" ${allRows.length === 0 ? "disabled" : ""}>${esc(t("btn_delete_all"))}</button>
          </div>
        </div>

        <div class="toolbar" style="margin-top:12px;">
          <div class="left">
            <div class="tool">
              <label>${esc(t("filter"))}</label>
              <input id="filterKey" placeholder="field key" value="${esc(EO.state.list.filterKey || "")}">
            </div>
            <div class="tool">
              <label>&nbsp;</label>
              <input id="filterValue" placeholder="value" value="${esc(EO.state.list.filterValue || "")}">
            </div>
            <div class="tool">
              <label>${esc(t("sort"))}</label>
              <input id="sortKey" placeholder="filtrer " value="${esc(EO.state.list.sortKey || "")}">
            </div>
            <div class="tool">
              <label>&nbsp;</label>
              <select id="sortDir">
                <option value="asc" ${EO.state.list.sortDir === "asc" ? "selected" : ""}>ASC</option>
                <option value="desc" ${EO.state.list.sortDir === "desc" ? "selected" : ""}>DESC</option>
              </select>
            </div>
          </div>

          <div class="right">
            <div class="tool">
              <label>${esc(t("search_placeholder"))}</label>
              <input id="q" value="${esc(EO.state.list.q || "")}" placeholder="${esc(t("search_placeholder"))}">
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr>${ths}<th>Actions</th></tr></thead>
            <tbody>
              ${trs || `<tr><td colspan="${def.fields.length + 1}" class="muted">—</td></tr>`}
            </tbody>
          </table>
        </div>

        <div class="pager">
          <button class="btn small-btn" id="prevBtn" ${EO.state.list.page <= 1 ? "disabled" : ""}>${esc(t("pager_prev"))}</button>
          <span class="muted">${EO.state.list.page} / ${pages} • ${total}</span>
          <button class="btn small-btn" id="nextBtn" ${EO.state.list.page >= pages ? "disabled" : ""}>${esc(t("pager_next"))}</button>
        </div>
      </div>
    `;

    applyI18n?.(content);

    // Toolbar listeners
    $("#filterKey").addEventListener("input", (e) => { EO.state.list.filterKey = e.target.value.trim(); EO.state.list.page = 1; renderEntityList(entity); });
    $("#filterValue").addEventListener("input", (e) => { EO.state.list.filterValue = e.target.value.trim(); EO.state.list.page = 1; renderEntityList(entity); });
    $("#sortKey").addEventListener("input", (e) => { EO.state.list.sortKey = e.target.value.trim(); EO.state.list.page = 1; renderEntityList(entity); });
    $("#sortDir").addEventListener("change", (e) => { EO.state.list.sortDir = e.target.value; EO.state.list.page = 1; renderEntityList(entity); });
    $("#q").addEventListener("input", (e) => { EO.state.list.q = e.target.value; EO.state.list.page = 1; renderEntityList(entity); });

    $("#prevBtn").addEventListener("click", () => { EO.state.list.page = Math.max(1, (EO.state.list.page || 1) - 1); renderEntityList(entity); });
    $("#nextBtn").addEventListener("click", () => { EO.state.list.page = (EO.state.list.page || 1) + 1; renderEntityList(entity); });

    // Add
    $("#addBtn").addEventListener("click", () => {
      EO.ui.modal.openModal(`${t(def.labelKey)} • ${t("btn_add")}`, def.fields, {}, (obj) => {
        const row = normalizeRow(entity, obj, true);
        EO.db.dbInsert(entity, row);
        EO.db.logAction?.("create", entity, `Created ${entity} ${row.id}`);
        renderEntityList(entity);
      });
    });

    // Export CSV
    $("#csvBtn").addEventListener("click", () => {
      EO.ui.exports.exportCSV(`${entity}.csv`, allRows);
    });

    // Delete all
    $("#deleteAllBtn").addEventListener("click", () => {
      EO.ui.modal.openConfirm(t("msg_delete_all_confirm"), () => {
        const n = EO.db.dbDeleteAll(entity);
        EO.db.logAction?.("bulk_delete", entity, `Deleted ALL ${entity} (${n})`);
        EO.state.list.page = 1;
        renderEntityList(entity);
      });
    });

    // Table actions (event delegation)
    content.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-act]");
      if (!btn) return;
      const act = btn.dataset.act;
      const id = btn.dataset.id;

      if (act === "details") EO.router.go(`details/${entity}/${id}`);

      if (act === "edit") {
        const existing = EO.db.dbFind(entity, id);
        if (!existing) return;
        EO.ui.modal.openModal(`${t(def.labelKey)} • ${t("edit")}`, def.fields, existing, (obj) => {
          const patch = normalizeRow(entity, obj, false);
          delete patch.id;
          EO.db.dbUpdate(entity, id, patch);
          EO.db.logAction?.("update", entity, `Updated ${entity} ${id}`);
          renderEntityList(entity);
        });
      }

      if (act === "delete") {
        EO.ui.modal.openConfirm(t("msg_delete_confirm"), () => {
          EO.db.dbDelete(entity, id);
          EO.db.logAction?.("delete", entity, `Deleted ${entity} ${id}`);
          renderEntityList(entity);
        });
      }
    }, { once: true });
  }

  function renderDetails(entity, id) {
    safeGetEO();

    const { t } = EO.i18n;
    const { content, $ } = EO.dom;
    const def = EO.config.ENTITIES[entity];
    const row = EO.db.dbFind(entity, id);

    if (!def || !row) {
      content.innerHTML = `<div class="card"><h2>${esc(t("details_title"))}</h2><p class="muted">Not found.</p></div>`;
      return;
    }

    const kv = def.fields.map(f => [t(f.labelKey), formatCell(entity, f, row[f.key])]);

    content.innerHTML = `
      <div class="card">
        <div class="card-title">
          <h2>${esc(t("details_title"))} • ${esc(t(def.labelKey))}</h2>
          <div class="right" style="display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn ghost" id="backBtn">${esc(t("back"))}</button>
            <button class="btn" id="pdfBtn">${esc(t("btn_export_pdf"))}</button>
            <button class="btn" id="editBtn">${esc(t("edit"))}</button>
            <button class="btn danger" id="delBtn">${esc(t("del"))}</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="table-wrap">
          <table style="min-width:520px;">
            <thead><tr><th>Field</th><th>Value</th></tr></thead>
            <tbody>
              ${kv.map(([k, v]) => `<tr><td class="muted">${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    $("#backBtn").addEventListener("click", () => EO.router.go(entity));
    $("#pdfBtn").addEventListener("click", () => EO.ui.exports.exportPDF(`${t(def.labelKey)}_${id}`, kv));

    $("#editBtn").addEventListener("click", () => {
      EO.ui.modal.openModal(`${t(def.labelKey)} • ${t("edit")}`, def.fields, row, (obj) => {
        const patch = normalizeRow(entity, obj, false);
        delete patch.id;
        EO.db.dbUpdate(entity, id, patch);
        EO.db.logAction?.("update", entity, `Updated ${entity} ${id}`);
        renderDetails(entity, id);
      });
    });
    

    $("#delBtn").addEventListener("click", () => {
      EO.ui.modal.openConfirm(t("msg_delete_confirm"), () => {
        EO.db.dbDelete(entity, id);
        EO.db.logAction?.("delete", entity, `Deleted ${entity} ${id}`);
        EO.router.go(entity);
      });
    });
  }

  // ---------- exports robustes ----------
  EO.ui = EO.ui || {};
  EO.ui.list = { renderEntityList, renderDetails };

  window.UI = window.UI || {};
  UI.renderEntityList = renderEntityList;
  UI.renderDetails = renderDetails;

  window.renderEntityList = renderEntityList;
  window.renderDetails = renderDetails;

  console.log("[ui.list-details] loaded & exported", {
    EO: typeof EO.ui.list?.renderEntityList,
    UI: typeof UI.renderEntityList,
    global: typeof window.renderEntityList
  });
})();
