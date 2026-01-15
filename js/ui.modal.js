(() => {
  "use strict";
  const { $, $$ } = EO.dom;
  const { t, applyI18n } = EO.i18n;
  const { dbGetAll } = EO.db;

  const modal = $("#modal");
  const modalTitle = $("#modalTitle");
  const modalForm = $("#modalForm");
  const modalClose = $("#modalClose");
  const modalCancel = $("#modalCancel");

  let modalOnSave = null;

  function openModal(title, fields, initial, onSave) {
    modalTitle.textContent = title;
    modalForm.innerHTML = "";

    fields.forEach(f => {
      const value = initial?.[f.key] ?? "";
      const id = `f_${f.key}`;

      const wrap = document.createElement("label");
      wrap.className = "field";

      const label = document.createElement("span");
      label.textContent = t(f.labelKey);
      wrap.appendChild(label);

      let input;
      if (f.type === "select") {
        input = document.createElement("select");
        input.id = id;
        input.name = f.key;

        const opts = (f.optionsFrom)
          ? dbGetAll(f.optionsFrom).map(r => ({ value: r.id, label: f.optionLabel ? f.optionLabel(r) : r.id }))
          : (f.options || []).map(o => ({ value: o, label: o }));

        const blank = document.createElement("option");
        blank.value = "";
        blank.textContent = "—";
        input.appendChild(blank);

        opts.forEach(o => {
          const opt = document.createElement("option");
          opt.value = o.value;
          opt.textContent = o.label;
          input.appendChild(opt);
        });

        input.value = value;
      } else {
        input = document.createElement("input");
        input.id = id;
        input.name = f.key;
        input.type = f.type || "text";
        input.value = value;
        if (f.min != null) input.min = String(f.min);
      }

      if (f.required) input.required = true;

      wrap.appendChild(input);
      modalForm.appendChild(wrap);
    });

    modalOnSave = onSave;
    modal.classList.remove("hidden");
    applyI18n(modal);
  }

  function closeModal() {
    modal.classList.add("hidden");
    modalForm.reset?.();
    modalOnSave = null;
  }

  modalClose.addEventListener("click", closeModal);
  modalCancel.addEventListener("click", closeModal);

  modalForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!modalOnSave) return;
    const fd = new FormData(modalForm);
    const obj = {};
    for (const [k, v] of fd.entries()) obj[k] = v;
    modalOnSave(obj);
    closeModal();
  });

  // Confirm modal
  const confirmM = $("#confirm");
  const confirmText = $("#confirmText");
  const confirmYes = $("#confirmYes");
  const confirmNo = $("#confirmNo");
  const confirmClose = $("#confirmClose");
  let confirmOnYes = null;

  function openConfirm(text, onYes) {
    confirmText.textContent = text;
    confirmOnYes = onYes;
    confirmM.classList.remove("hidden");
    applyI18n(confirmM);
  }

  function closeConfirm() {
    confirmM.classList.add("hidden");
    confirmOnYes = null;
  }
  if (vendus > stock) {
    e.preventDefault();
    alert("Erreur : stock insuffisant");
}


  confirmNo.addEventListener("click", closeConfirm);
  confirmClose.addEventListener("click", closeConfirm);
  confirmYes.addEventListener("click", () => {
    if (confirmOnYes) confirmOnYes();
    closeConfirm();
  });

  EO.ui = EO.ui || {};
  EO.ui.modal = { openModal, closeModal, openConfirm, closeConfirm };
})();
