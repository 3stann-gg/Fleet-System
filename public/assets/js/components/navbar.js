/* ==========================================
   Navbar interactions: search, notifications, messages
   Shared across all pages (no visual redesign)
========================================== */

let navbarInteractionsInitialized = false;

const FLEET_NAV_ROUTES = {
  vehicles: "/fleet/index.html",
  reservations: "../reservation/index.html",
  dispatch: "../dispatch/index.html",
  drivers: "../driver/index.html",
  maintenance: "../maintenance/index.html",
  fuel: "../fuel/index.html",
  routes: "../route-planning/index.html",
  cost: "../cost-analysis/index.html",
  reports: "../reports/index.html",
  settings: "../settings/index.html",
  dashboard: "../dashboard/index.html",
};

function ensureToastHost() {
  if (document.getElementById("toastContainer")) return;
  let host = document.getElementById("toast");
  if (!host) {
    host = document.createElement("div");
    host.id = "toast";
    document.body.appendChild(host);
  }
  if (!document.getElementById("toastContainer")) {
    const box = document.createElement("div");
    box.id = "toastContainer";
    box.className = "toast-container";
    host.appendChild(box);
  }
  if (typeof initToast === "function" && typeof window.showToast !== "function") {
    initToast();
  }
  if (typeof window.showToast !== "function") {
    window.showToast = function (message) {
      console.info(message);
    };
  }
}

function fleetNavNotify(message, type) {
  ensureToastHost();
  if (typeof showToast === "function") {
    showToast(message, type || "info");
  }
}

function readJsonStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildGlobalSearchIndex() {
  const results = [];
  readJsonStorage("himsFleetVehicles").forEach((v) => {
    const name = v.name || v.vehicleName || "";
    const plate = v.plateNumber || v.plate || "";
    results.push({
      type: "Vehicle",
      label: name || plate || "Vehicle",
      detail: plate,
      href: FLEET_NAV_ROUTES.vehicles,
      q: (name + " " + plate).toLowerCase(),
    });
  });
  readJsonStorage("himsFleetDrivers").forEach((d) => {
    const name = d.name || d.fullName || "";
    results.push({
      type: "Driver",
      label: name || "Driver",
      detail: d.status || "",
      href: FLEET_NAV_ROUTES.drivers,
      q: name.toLowerCase(),
    });
  });
  readJsonStorage("himsFleetReservations").forEach((r) => {
    const ref = r.reservationNumber || r.reference || r.id || "";
    results.push({
      type: "Reservation",
      label: String(ref),
      detail: r.status || "",
      href: FLEET_NAV_ROUTES.reservations,
      q: String(ref).toLowerCase(),
    });
  });
  readJsonStorage("himsFleetDispatches").forEach((d) => {
    const ref = d.tripNumber || d.dispatchNumber || d.id || "";
    results.push({
      type: "Dispatch",
      label: String(ref),
      detail: d.status || "",
      href: FLEET_NAV_ROUTES.dispatch,
      q: String(ref).toLowerCase(),
    });
  });
  return results;
}

function closeAllNavbarPanels(except) {
  document.querySelectorAll(".navbar-panel.is-open").forEach((panel) => {
    if (except && panel === except) return;
    panel.classList.remove("is-open");
    panel.hidden = true;
  });
  document.querySelectorAll(".navbar-right .icon-btn[aria-expanded='true']").forEach(
    (btn) => {
      if (except && btn.getAttribute("aria-controls") === except.id) return;
      btn.setAttribute("aria-expanded", "false");
    },
  );
  const searchResults = document.getElementById("navbarSearchResults");
  if (searchResults && searchResults !== except) {
    searchResults.hidden = true;
    searchResults.innerHTML = "";
  }
}

function createNavbarPanel(id, title, items) {
  let panel = document.getElementById(id);
  if (panel) return panel;
  panel = document.createElement("div");
  panel.id = id;
  panel.className = "navbar-panel";
  panel.hidden = true;
  panel.setAttribute("role", "menu");
  panel.setAttribute("aria-label", title);

  const header = document.createElement("div");
  header.className = "navbar-panel-header";
  header.textContent = title;
  panel.appendChild(header);

  const list = document.createElement("div");
  list.className = "navbar-panel-list";
  items.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "navbar-panel-item";
    btn.setAttribute("role", "menuitem");
    btn.innerHTML =
      "<strong></strong><span></span>";
    btn.querySelector("strong").textContent = item.label;
    btn.querySelector("span").textContent = item.detail || "";
    btn.addEventListener("click", () => {
      closeAllNavbarPanels();
      if (item.href) {
        window.location.href = item.href;
      } else if (item.message) {
        fleetNavNotify(item.message, item.type || "info");
      }
    });
    list.appendChild(btn);
  });
  panel.appendChild(list);
  return panel;
}

function initNavbarNotifications() {
  const btn = document.querySelector(
    '.navbar-right .icon-btn[aria-label="Notifications"]',
  );
  if (!btn || btn.dataset.navInit === "true") return;
  btn.dataset.navInit = "true";
  btn.setAttribute("aria-haspopup", "menu");
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-controls", "navbarNotificationsPanel");

  const panel = createNavbarPanel("navbarNotificationsPanel", "Notifications", [
    {
      label: "Maintenance due soon",
      detail: "Open Maintenance",
      href: FLEET_NAV_ROUTES.maintenance,
    },
    {
      label: "Active dispatches in progress",
      detail: "Open Dispatch",
      href: FLEET_NAV_ROUTES.dispatch,
    },
    {
      label: "Pending reservations",
      detail: "Open Reservations",
      href: FLEET_NAV_ROUTES.reservations,
    },
    {
      label: "View reports",
      detail: "Open Reports & Analytics",
      href: FLEET_NAV_ROUTES.reports,
    },
  ]);
  btn.parentElement?.classList.add("navbar-control");
  btn.parentElement?.appendChild(panel);

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const open = panel.classList.contains("is-open");
    closeAllNavbarPanels();
    if (!open) {
      panel.hidden = false;
      panel.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
    }
  });
}

function initNavbarMessages() {
  const btn = document.querySelector(
    '.navbar-right .icon-btn[aria-label="Messages"]',
  );
  if (!btn || btn.dataset.navInit === "true") return;
  btn.dataset.navInit = "true";
  btn.setAttribute("aria-haspopup", "menu");
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-controls", "navbarMessagesPanel");

  const panel = createNavbarPanel("navbarMessagesPanel", "Messages", [
    {
      label: "No messaging module",
      detail: "Internal messages are not enabled in this frontend build.",
      message: "Messaging is not available in this frontend release.",
      type: "info",
    },
    {
      label: "Open Settings",
      detail: "Configure fleet preferences",
      href: FLEET_NAV_ROUTES.settings,
    },
  ]);
  btn.parentElement?.classList.add("navbar-control");
  btn.parentElement?.appendChild(panel);

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const open = panel.classList.contains("is-open");
    closeAllNavbarPanels();
    if (!open) {
      panel.hidden = false;
      panel.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
    }
  });
}

function initNavbarSearch() {
  const box = document.querySelector(".navbar-center .search-box");
  const input = box?.querySelector("input");
  if (!box || !input || input.dataset.navSearchInit === "true") return;
  input.dataset.navSearchInit = "true";

  let results = document.getElementById("navbarSearchResults");
  if (!results) {
    results = document.createElement("div");
    results.id = "navbarSearchResults";
    results.className = "navbar-search-results";
    results.hidden = true;
    results.setAttribute("role", "listbox");
    results.setAttribute("aria-label", "Search results");
    box.classList.add("navbar-search-wrap");
    box.appendChild(results);
  }

  let timer = null;
  const index = buildGlobalSearchIndex();

  const render = (query) => {
    const q = String(query || "").trim().toLowerCase();
    results.innerHTML = "";
    if (!q) {
      results.hidden = true;
      return;
    }
    const matches = index.filter((item) => item.q.includes(q)).slice(0, 8);
    if (!matches.length) {
      const empty = document.createElement("div");
      empty.className = "navbar-search-empty";
      empty.textContent = "No matching fleet records.";
      results.appendChild(empty);
      results.hidden = false;
      return;
    }
    matches.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "navbar-search-item";
      btn.setAttribute("role", "option");
      btn.innerHTML = "<strong></strong><span></span>";
      btn.querySelector("strong").textContent = item.label;
      btn.querySelector("span").textContent = item.type + (item.detail ? " · " + item.detail : "");
      btn.addEventListener("click", () => {
        window.location.href = item.href;
      });
      results.appendChild(btn);
    });
    results.hidden = false;
  };

  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => render(input.value), 200);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      input.value = "";
      results.hidden = true;
      results.innerHTML = "";
      input.blur();
    }
  });

  input.addEventListener("focus", () => {
    if (input.value.trim()) render(input.value);
  });
}

function initNavbarInteractions() {
  if (navbarInteractionsInitialized) return;
  if (!document.querySelector(".navbar-custom")) return;
  navbarInteractionsInitialized = true;

  ensureToastHost();
  initNavbarSearch();
  initNavbarNotifications();
  initNavbarMessages();

  document.addEventListener("click", (e) => {
    if (e.target.closest(".navbar-control") || e.target.closest(".navbar-search-wrap")) {
      return;
    }
    closeAllNavbarPanels();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllNavbarPanels();
  });
}
