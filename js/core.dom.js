(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const loginView = $("#loginView");
  const appView = $("#appView");
  const content = $("#content");

  EO.dom = { $, $$, loginView, appView, content };
})();
