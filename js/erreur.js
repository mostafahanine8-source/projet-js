(function () {
  function findField(modal, keys) {
    // Cherche par id/name
    for (const k of keys) {
      let el = modal.querySelector(`#${CSS.escape(k)}`);
      if (el) return el;
      el = modal.querySelector(`[name="${CSS.escape(k)}"]`);
      if (el) return el;
    }

    // Cherche par placeholder
    for (const k of keys) {
      const el = modal.querySelector(`input[placeholder*="${k}" i]`);
      if (el) return el;
    }

    // Cherche par label visible (Stock / Vendus)
    for (const labelText of keys) {
      const labels = Array.from(modal.querySelectorAll("label"));
      for (const lab of labels) {
        if ((lab.textContent || "").trim().toLowerCase().includes(labelText.toLowerCase())) {
          // input dans le label
          const inp = lab.querySelector("input");
          if (inp) return inp;
          // input juste après le label
          const next = lab.parentElement?.querySelector("input");
          if (next) return next;
        }
      }
    }

    return null;
  }

  function ensureErrorBox(modal) {
    let box = modal.querySelector(".stock-error-box");
    if (!box) {
      box = document.createElement("div");
      box.className = "stock-error-box";
      box.style.display = "none";
      box.style.color = "red";
      box.style.marginTop = "10px";
      box.style.fontSize = "14px";
      // On l’insère près des boutons (en bas de la modale)
      const footer = modal.querySelector("button")?.closest("div") || modal;
      footer.appendChild(box);
    }
    return box;
  }

  function validate(modal) {
    const stockEl = findField(modal, ["stock", "Stock"]);
    const vendusEl = findField(modal, ["vendus", "Vendus", "vendu"]);

    // Si on ne trouve pas les champs, on ne peut pas valider correctement
    if (!stockEl || !vendusEl) {
      console.warn("Validation stock/vendus: champs introuvables", { stockEl, vendusEl });
      return { ok: true, reason: "fields_not_found" };
    }

    const stock = Number(stockEl.value);
    const vendus = Number(vendusEl.value);

    // Si valeurs vides/non numériques, on laisse la validation HTML gérer (required)
    if (Number.isNaN(stock) || Number.isNaN(vendus)) {
      return { ok: true, reason: "nan" };
    }

    if (vendus > stock) {
      return { ok: false, message: "Erreur : le nombre de billets vendus dépasse le stock." };
    }

    return { ok: true };
  }

  function handle(modal, e) {
    const box = ensureErrorBox(modal);
    box.style.display = "none";
    box.textContent = "";

    const res = validate(modal);
    if (!res.ok) {
      e.preventDefault?.();
      e.stopPropagation?.();
      box.textContent = res.message;
      box.style.display = "block";
      return false;
    }
    return true;
  }

  function getActiveModalFromTarget(target) {
    // On remonte jusqu’à un conteneur de modale
    return target.closest?.('[role="dialog"], .modal, .dialog, .popup') || document;
  }

  // 1) Intercepte tous les submit (même si le form existe)
  document.addEventListener(
    "submit",
    function (e) {
      const modal = getActiveModalFromTarget(e.target);
      handle(modal, e);
    },
    true
  );

  // 2) Intercepte le clic sur un bouton "save"
  document.addEventListener(
    "click",
    function (e) {
      const btn = e.target.closest?.("button, input[type='button'], input[type='submit']");
      if (!btn) return;

      const txt = (btn.textContent || btn.value || "").trim().toLowerCase();
      if (txt !== "save") return;

      const modal = getActiveModalFromTarget(btn);

      // Si c’est un submit, l’event submit sera aussi capturé, mais ici on bloque déjà.
      handle(modal, e);
    },
    true
  );
})();
