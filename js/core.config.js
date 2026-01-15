(() => {
  "use strict";

  const LS_KEYS = {
    session: "eo_session",
    db: "eo_db_v1",
    lang: "eo_lang"
  };

  const ENTITIES = {
    events: {
      labelKey: "nav_events",
      pk: "id",
      fields: [
        { key: "name", labelKey: "f_name", type: "text", required: true },
        { key: "city", labelKey: "f_city", type: "text", required: true },
        { key: "venue", labelKey: "f_venue", type: "text", required: true },
        { key: "date", labelKey: "f_date", type: "date", required: true },
        { key: "capacity", labelKey: "f_capacity", type: "number", required: true, min: 1 },
        { key: "status", labelKey: "f_status", type: "select", required: true, options: ["draft", "published", "closed"] },
        { key: "price", labelKey: "f_price", type: "number", required: true, min: 0 }
      ]
    },

    participants: {
      labelKey: "nav_participants",
      pk: "id",
      fields: [
        { key: "firstName", labelKey: "f_firstName", type: "text", required: true },
        { key: "lastName", labelKey: "f_lastName", type: "text", required: true },
        { key: "email", labelKey: "f_email", type: "email", required: true },
        { key: "phone", labelKey: "f_phone", type: "text", required: true },
        { key: "eventId", labelKey: "f_event", type: "select", required: true, optionsFrom: "events", optionLabel: (e) => `${e.name} • ${e.city}` },
        { key: "registeredAt", labelKey: "f_registeredAt", type: "date", required: true },
        { key: "ticketType", labelKey: "f_ticketType", type: "select", required: true, options: ["standard", "vip", "student"] }
      ]
    },

    tickets: {
      labelKey: "nav_tickets",
      pk: "id",
      fields: [
        { key: "eventId", labelKey: "f_event", type: "select", required: true, optionsFrom: "events", optionLabel: (e) => `${e.name} • ${e.date}` },
        { key: "type", labelKey: "f_ticketType", type: "select", required: true, options: ["standard", "vip", "student"] },
        { key: "stock", labelKey: "f_stock", type: "number", required: true, min: 0 },
        { key: "sold", labelKey: "f_sold", type: "number", required: true, min: 0 },
        { key: "unitPrice", labelKey: "f_unitPrice", type: "number", required: true, min: 0 }
      ]
    },

    payments: {
      labelKey: "nav_payments",
      pk: "id",
      fields: [
        { key: "participantId", labelKey: "f_participant", type: "select", required: true, optionsFrom: "participants", optionLabel: (p) => `${p.firstName} ${p.lastName} • ${p.email}` },
        { key: "eventId", labelKey: "f_event", type: "select", required: true, optionsFrom: "events", optionLabel: (e) => `${e.name} • ${e.city}` },
        { key: "amount", labelKey: "f_amount", type: "number", required: true, min: 0 },
        { key: "method", labelKey: "f_method", type: "select", required: true, options: ["card", "cash", "transfer"] },
        { key: "status", labelKey: "f_paymentStatus", type: "select", required: true, options: ["pending", "paid", "failed", "refunded"] },
        { key: "paidAt", labelKey: "f_paidAt", type: "date", required: true }
      ]
    },

    stats: {
      labelKey: "nav_stats",
      pk: "id",
      fields: [
        { key: "type", labelKey: "Type", type: "select", required: true, options: ["create", "update", "delete", "login", "logout", "bulk_delete"] },
        { key: "entity", labelKey: "Entity", type: "select", required: true, options: ["events", "participants", "tickets", "payments", "stats", "system"] },
        { key: "message", labelKey: "Message", type: "text", required: true },
        { key: "createdAt", labelKey: "CreatedAt", type: "date", required: true }
      ]
    }
  };

  const PAGE_SIZE = 8;

  window.EO.config = { LS_KEYS, ENTITIES, PAGE_SIZE };
})();
