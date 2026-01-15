// ./js/core.i18n.js
(() => {
  "use strict";

  // 1) Récupère I18N depuis une variable globale si tu l’as (recommandé)
  //    Sinon fallback minimal pour ne plus crasher.
  const I18N =
    window.I18N ||
    window.i18n ||
    {
      fr: {},
      en: {},
      ar: {}
    };

  function t(key) {
    const lang = EO?.state?.lang || "fr";
    const pack = I18N[lang] || I18N.fr || {};
    return pack[key] ?? (I18N.fr ? I18N.fr[key] : undefined) ?? key;
  }

  function applyDir(lang) {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }

  function applyI18n(root = document) {
    if (!EO?.dom?.$$) return;
    EO.dom.$$("[data-i18n]", root).forEach((el) => {
      const k = el.getAttribute("data-i18n");
      el.textContent = t(k);
    });
  }

  function setLang(lang) {
    EO.state.lang = lang;
    localStorage.setItem(EO.config.LS_KEYS.lang, lang);
    applyDir(lang);
    applyI18n();
    EO.router?.render?.();
  }
  window.I18N = {
  fr: { /* ... */ },
  en: { /* ... */ },
  ar: { /* ... */ }
};


  EO.i18n = { I18N, t, applyDir, applyI18n, setLang };
})();
/* ===============================
   I18N – EventOps Backoffice
   Langues : FR / EN / AR
   =============================== */

window.I18N = {
  /* ===============================
     🇫🇷 FRANÇAIS
     =============================== */
  fr: {
    /* APP */
    app_name: "EventOps",
    app_subtitle: "Backoffice",

    /* NAVIGATION */
    nav_dashboard: "Dashboard",
    nav_events: "Événements",
    nav_participants: "Participants",
    nav_tickets: "Billetterie",
    nav_payments: "Paiements",
    nav_stats: "Statistiques (logs)",

    /* AUTH */
    login_title: "Connexion",
    login_hint: "Utilise admin / admin",
    login_user: "Utilisateur",
    login_pass: "Mot de passe",
    login_btn: "Se connecter",
    logout: "Déconnexion",
    msg_login_failed: "Identifiants invalides.",

    /* DASHBOARD */
    dashboard_title: "Tableau de bord",
    dashboard_filter_event: "Filtrer par événement",
    all_events: "Tous les événements",
    charts_title: "Statistiques",
    chart1: "Participants par événement",
    chart2: "Statut des paiements",
    chart3: "Revenus par mois",
    chart4: "Billets vendus / stock",
    chart5: "Capacité vs prix",

    /* KPI */
    kpi_events: "Événements",
    kpi_participants: "Participants",
    kpi_revenue: "Revenus",
    kpi_capacity: "Capacité",
    kpi_pending: "En attente",

    /* LIST / CRUD */
    list_title: "Liste",
    details_title: "Détails",
    back: "Retour",

    /* BUTTONS */
    btn_add: "Ajouter",
    btn_export_csv: "Exporter CSV",
    btn_export_pdf: "Exporter PDF",
    btn_delete_all: "Tout supprimer",
    see_details: "Voir",
    edit: "Modifier",
    del: "Supprimer",

    /* FIELDS – COMMON */
    f_name: "Nom",
    f_city: "Ville",
    f_venue: "Lieu",
    f_date: "Date",
    f_capacity: "Capacité",
    f_status: "Statut",
    f_price: "Prix",

    /* PARTICIPANTS */
    f_firstName: "Prénom",
    f_lastName: "Nom",
    f_email: "Email",
    f_phone: "Téléphone",
    f_registeredAt: "Date d’inscription",
    f_ticketType: "Type de billet",

    /* TICKETS */
    f_stock: "Stock",
    f_sold: "Vendus",
    f_unitPrice: "Prix unitaire",

    /* PAYMENTS */
    f_participant: "Participant",
    f_event: "Événement",
    f_amount: "Montant",
    f_method: "Méthode",
    f_paymentStatus: "Statut",
    f_paidAt: "Date de paiement",

    /* SEARCH / FILTER */
    search_placeholder: "Rechercher…",
    filter: "Filtrer",
    sort: "Trier",

    /* PAGER */
    pager_prev: "Précédent",
    pager_next: "Suivant",

    /* CONFIRM */
    msg_delete_confirm: "Confirmer la suppression ?",
    msg_delete_all_confirm: "Confirmer la suppression de tous les éléments ?"
  },

  /* ===============================
     🇬🇧 ENGLISH
     =============================== */
  en: {
    app_name: "EventOps",
    app_subtitle: "Backoffice",

    nav_dashboard: "Dashboard",
    nav_events: "Events",
    nav_participants: "Participants",
    nav_tickets: "Tickets",
    nav_payments: "Payments",
    nav_stats: "Statistics (logs)",

    login_title: "Login",
    login_hint: "Use admin / admin",
    login_user: "Username",
    login_pass: "Password",
    login_btn: "Sign in",
    logout: "Logout",
    msg_login_failed: "Invalid credentials.",

    dashboard_title: "Dashboard",
    dashboard_filter_event: "Filter by event",
    all_events: "All events",
    charts_title: "Analytics",
    chart1: "Participants per event",
    chart2: "Payment status",
    chart3: "Revenue by month",
    chart4: "Tickets sold / stock",
    chart5: "Capacity vs price",

    kpi_events: "Events",
    kpi_participants: "Participants",
    kpi_revenue: "Revenue",
    kpi_capacity: "Capacity",
    kpi_pending: "Pending",

    list_title: "List",
    details_title: "Details",
    back: "Back",

    btn_add: "Add",
    btn_export_csv: "Export CSV",
    btn_export_pdf: "Export PDF",
    btn_delete_all: "Delete all",
    see_details: "View",
    edit: "Edit",
    del: "Delete",

    f_name: "Name",
    f_city: "City",
    f_venue: "Venue",
    f_date: "Date",
    f_capacity: "Capacity",
    f_status: "Status",
    f_price: "Price",

    f_firstName: "First name",
    f_lastName: "Last name",
    f_email: "Email",
    f_phone: "Phone",
    f_registeredAt: "Registered at",
    f_ticketType: "Ticket type",

    f_stock: "Stock",
    f_sold: "Sold",
    f_unitPrice: "Unit price",

    f_participant: "Participant",
    f_event: "Event",
    f_amount: "Amount",
    f_method: "Method",
    f_paymentStatus: "Status",
    f_paidAt: "Paid at",

    search_placeholder: "Search…",
    filter: "Filter",
    sort: "Sort",

    pager_prev: "Previous",
    pager_next: "Next",

    msg_delete_confirm: "Confirm deletion?",
    msg_delete_all_confirm: "Confirm delete all items?"
  },

  /* ===============================
     🇲🇦 العربية (AR)
     =============================== */
  ar: {
    app_name: "إيفنت أوبس",
    app_subtitle: "لوحة الإدارة",

    nav_dashboard: "لوحة التحكم",
    nav_events: "الأحداث",
    nav_participants: "المشاركون",
    nav_tickets: "التذاكر",
    nav_payments: "المدفوعات",
    nav_stats: "الإحصائيات",

    login_title: "تسجيل الدخول",
    login_hint: "استعمل admin / admin",
    login_user: "اسم المستخدم",
    login_pass: "كلمة المرور",
    login_btn: "دخول",
    logout: "تسجيل الخروج",
    msg_login_failed: "بيانات الدخول غير صحيحة",

    dashboard_title: "لوحة التحكم",
    dashboard_filter_event: "تصفية حسب الحدث",
    all_events: "كل الأحداث",
    charts_title: "الإحصائيات",
    chart1: "المشاركون حسب الحدث",
    chart2: "حالة الدفع",
    chart3: "الإيرادات حسب الشهر",
    chart4: "التذاكر المباعة / المتوفرة",
    chart5: "السعة مقابل السعر",

    kpi_events: "الأحداث",
    kpi_participants: "المشاركون",
    kpi_revenue: "الإيرادات",
    kpi_capacity: "السعة",
    kpi_pending: "قيد الانتظار",

    list_title: "القائمة",
    details_title: "التفاصيل",
    back: "رجوع",

    btn_add: "إضافة",
    btn_export_csv: "تصدير CSV",
    btn_export_pdf: "تصدير PDF",
    btn_delete_all: "حذف الكل",
    see_details: "عرض",
    edit: "تعديل",
    del: "حذف",

    f_name: "الاسم",
    f_city: "المدينة",
    f_venue: "المكان",
    f_date: "التاريخ",
    f_capacity: "السعة",
    f_status: "الحالة",
    f_price: "السعر",

    f_firstName: "الاسم الأول",
    f_lastName: "اسم العائلة",
    f_email: "البريد الإلكتروني",
    f_phone: "الهاتف",
    f_registeredAt: "تاريخ التسجيل",
    f_ticketType: "نوع التذكرة",

    f_stock: "المخزون",
    f_sold: "المباع",
    f_unitPrice: "سعر الوحدة",

    f_participant: "المشارك",
    f_event: "الحدث",
    f_amount: "المبلغ",
    f_method: "طريقة الدفع",
    f_paymentStatus: "الحالة",
    f_paidAt: "تاريخ الدفع",

    search_placeholder: "بحث…",
    filter: "تصفية",
    sort: "ترتيب",

    pager_prev: "السابق",
    pager_next: "التالي",

    msg_delete_confirm: "هل تريد تأكيد الحذف؟",
    msg_delete_all_confirm: "هل تريد حذف جميع العناصر؟"
  }
};

