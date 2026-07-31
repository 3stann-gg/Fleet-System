/* ==========================================
   Route Planning centralized table pipeline
========================================== */

const ROUTE_TABLE_COLUMN_COUNT = 12;
const ROUTE_ROWS_PER_PAGE = 5;

let isRefreshingRoutes = false;
let routeNextOriginalOrder = 0;
let routeSortState = {
  field: null,
  direction: null,
};
let routePaginationState = {
  page: 1,
  pageSize: ROUTE_ROWS_PER_PAGE,
};

function formatRouteDistance(km) {
  const n = Number(km) || 0;
  return (
    n.toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + " km"
  );
}

function priorityRank(priority) {
  const map = { Low: 1, Medium: 2, High: 3, Emergency: 4 };
  return map[priority] || 0;
}

function statusBadgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("ready") || s.includes("completed")) return "completed";
  if (s.includes("planned")) return "trip";
  if (s.includes("draft")) return "scheduled";
  if (s.includes("archiv")) return "cancelled";
  return "cancelled";
}

function updateRouteStatistics(records) {
  /* Stats use non-archived routes by default */
  const list =
    records ||
    getAllRouteRecords({ includeArchived: false });
  const total = list.length;
  const ready = list.filter((r) => r.status === "Ready For Dispatch").length;
  const high = list.filter(
    (r) => r.priority === "High" || r.priority === "Emergency",
  ).length;
  const avgDist =
    total === 0
      ? 0
      : list.reduce((s, r) => s + (Number(r.estimatedDistance) || 0), 0) /
        total;
  const avgMin =
    total === 0
      ? 0
      : list.reduce(
          (s, r) => s + (Number(r.estimatedTravelTimeMinutes) || 0),
          0,
        ) / total;
  const vehicles = new Set(
    list.map((r) => r.vehicle).filter((v) => v && String(v).trim()),
  );

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("routeStatTotal", String(total));
  setText("routeStatReady", String(ready));
  setText("routeStatHighPriority", String(high));
  setText("routeStatAvgDistance", formatRouteDistance(avgDist));
  setText(
    "routeStatAvgTime",
    avgMin >= 60
      ? Math.floor(avgMin / 60) +
          "h " +
          String(Math.round(avgMin % 60)).padStart(2, "0") +
          "m"
      : Math.round(avgMin) + " min",
  );
  setText("routeStatVehicles", String(vehicles.size));
}

function getRouteFilterValues() {
  return {
    search: (document.getElementById("routeSearch")?.value || "")
      .trim()
      .toLowerCase(),
    priority: document.getElementById("routePriorityFilter")?.value || "all",
    status: document.getElementById("routeStatusFilter")?.value || "all",
    vehicle: document.getElementById("routeVehicleFilter")?.value || "all",
    driver: document.getElementById("routeDriverFilter")?.value || "all",
    department:
      document.getElementById("routeDepartmentFilter")?.value || "all",
    date: document.getElementById("routeDateFilter")?.value || "",
    showArchived:
      document.getElementById("routeShowArchived")?.checked === true,
  };
}

/**
 * Processed routes for Print/PDF/Excel (search + filters + sort, no pagination).
 */
function getProcessedRouteRecords() {
  const filters = getRouteFilterValues();
  const all = getAllRouteRecords({ includeArchived: true });
  let matched = all.filter((r) => routeMatchesFilters(r, filters));
  matched = sortRouteRecords(
    matched.map((r) => {
      const live = routePlanningRecords.find((x) => x.id === r.id);
      return { ...r, _order: live?._order ?? 0 };
    }),
  );
  return matched;
}

function getRouteFilterSummaryLines() {
  const filters = getRouteFilterValues();
  const parts = [];
  if (filters.priority !== "all") parts.push("Priority: " + filters.priority);
  if (filters.status !== "all") parts.push("Status: " + filters.status);
  if (filters.vehicle !== "all") parts.push("Vehicle: " + filters.vehicle);
  if (filters.driver !== "all") parts.push("Driver: " + filters.driver);
  if (filters.department !== "all") {
    parts.push("Department: " + filters.department);
  }
  if (filters.date) parts.push("Departure Date: " + filters.date);
  if (filters.search) parts.push("Search: " + filters.search);
  if (filters.showArchived) parts.push("Including Archived");
  return parts;
}

function routeMatchesFilters(record, filters) {
  if (!filters.showArchived && record.status === "Archived") {
    return false;
  }

  if (filters.priority !== "all" && record.priority !== filters.priority) {
    return false;
  }
  if (filters.status !== "all" && record.status !== filters.status) {
    return false;
  }
  if (filters.vehicle !== "all" && record.vehicle !== filters.vehicle) {
    return false;
  }
  if (filters.driver !== "all" && record.driver !== filters.driver) {
    return false;
  }
  if (
    filters.department !== "all" &&
    record.department !== filters.department
  ) {
    return false;
  }
  if (filters.date && record.departureDate !== filters.date) {
    return false;
  }

  if (filters.search) {
    const hay = [
      record.routeNumber,
      record.origin,
      record.destination,
      record.vehicle,
      record.driver,
      record.department,
      record.status,
      record.purpose,
      ...(record.stops || []),
    ]
      .join(" ")
      .toLowerCase();
    if (!hay.includes(filters.search)) return false;
  }

  return true;
}

function sortRouteRecords(list) {
  const field = routeSortState.field;
  const dir = routeSortState.direction === "desc" ? -1 : 1;
  if (!field || !routeSortState.direction) {
    return list.slice().sort((a, b) => {
      return (a._order || 0) - (b._order || 0);
    });
  }

  return list.slice().sort((a, b) => {
    let av = a[field];
    let bv = b[field];

    if (field === "priority") {
      av = priorityRank(a.priority);
      bv = priorityRank(b.priority);
    } else if (field === "estimatedDistance") {
      av = Number(a.estimatedDistance) || 0;
      bv = Number(b.estimatedDistance) || 0;
    } else if (field === "departureDate") {
      av = Date.parse(a.departureDate + "T" + (a.departureTime || "00:00"));
      bv = Date.parse(b.departureDate + "T" + (b.departureTime || "00:00"));
      if (Number.isNaN(av)) av = 0;
      if (Number.isNaN(bv)) bv = 0;
    } else {
      av = String(av || "").toLowerCase();
      bv = String(bv || "").toLowerCase();
      return av.localeCompare(bv, undefined, { numeric: true }) * dir;
    }

    if (av === bv) return 0;
    return av < bv ? -dir : dir;
  });
}

function updateRouteEmptyState(show) {
  const empty = document.getElementById("routeEmptyState");
  const tableWrap = document.getElementById("routeTableWrap");
  if (empty) empty.hidden = !show;
  if (tableWrap) tableWrap.hidden = show;
}

function buildRouteTableRow(record) {
  const tr = document.createElement("tr");
  tr.dataset.routeId = record.id;
  tr.innerHTML = `
    <td><span class="route-number">${escapeRouteHtml(record.routeNumber)}</span></td>
    <td><span class="route-origin">${escapeRouteHtml(record.origin)}</span></td>
    <td><span class="route-destination">${escapeRouteHtml(record.destination)}</span></td>
    <td><span class="route-vehicle">${escapeRouteHtml(record.vehicle || "—")}</span></td>
    <td><span class="route-driver">${escapeRouteHtml(record.driver || "—")}</span></td>
    <td><span class="route-priority">${escapeRouteHtml(record.priority)}</span></td>
    <td><span class="route-distance">${escapeRouteHtml(formatRouteDistance(record.estimatedDistance))}</span></td>
    <td><span class="route-time">${escapeRouteHtml(record.estimatedTravelTime || "—")}</span></td>
    <td><span class="status-badge ${statusBadgeClass(record.status)}">${escapeRouteHtml(record.status)}</span></td>
    <td><span class="route-departure">${escapeRouteHtml(
      formatRouteDeparture(record.departureDate, record.departureTime),
    )}</span></td>
    <td><span class="route-created">${escapeRouteHtml(formatRouteCreated(record.createdAt))}</span></td>
    <td>
      <div class="action-buttons">
        <button type="button" class="action-btn view-route" aria-label="View ${escapeRouteHtml(record.routeNumber)}">
          <i class="ph ph-eye"></i>
        </button>
        <button type="button" class="action-btn edit-route" aria-label="Edit ${escapeRouteHtml(record.routeNumber)}">
          <i class="ph ph-pencil-simple"></i>
        </button>
        <button type="button" class="action-btn delete-route" aria-label="Delete ${escapeRouteHtml(record.routeNumber)}">
          <i class="ph ph-trash"></i>
        </button>
      </div>
    </td>
  `;
  return tr;
}

function escapeRouteHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatRouteDeparture(date, time) {
  if (!date) return "—";
  const d = new Date(date + "T00:00:00");
  const dateLabel = Number.isNaN(d.getTime())
    ? date
    : d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
  return time ? dateLabel + " " + time : dateLabel;
}

function formatRouteCreated(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function renderRoutePagination(total) {
  const info = document.getElementById("routePaginationInfo");
  const pagination = document.getElementById("routePagination");
  if (!info || !pagination) return;

  const pageSize = routePaginationState.pageSize;
  const totalPages = Math.ceil(total / pageSize) || 0;
  if (totalPages === 0) {
    routePaginationState.page = 1;
  } else {
    routePaginationState.page = Math.min(
      Math.max(routePaginationState.page, 1),
      totalPages,
    );
  }

  const page = routePaginationState.page;
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const range = document.createElement("strong");
  const totalEl = document.createElement("strong");
  range.textContent = start + "–" + end;
  totalEl.textContent = String(total);
  info.replaceChildren(
    document.createTextNode("Showing "),
    range,
    document.createTextNode(" of "),
    totalEl,
    document.createTextNode(" routes"),
  );

  const frag = document.createDocumentFragment();
  const btn = (label, aria, disabled, active, action, pageNumber) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", aria);
    b.disabled = disabled;
    if (action) b.dataset.routePage = action;
    if (pageNumber != null) b.dataset.pageNumber = String(pageNumber);
    if (active) {
      b.classList.add("active");
      b.setAttribute("aria-current", "page");
    }
    b.textContent = label;
    return b;
  };

  frag.appendChild(
    btn("‹", "Previous page", page <= 1 || totalPages === 0, false, "prev"),
  );
  for (let p = 1; p <= totalPages; p += 1) {
    frag.appendChild(
      btn(String(p), "Page " + p, false, p === page, "page", p),
    );
  }
  frag.appendChild(
    btn(
      "›",
      "Next page",
      totalPages === 0 || page >= totalPages,
      false,
      "next",
    ),
  );
  pagination.replaceChildren(frag);
}

function updateRouteMapPanel(record) {
  const originEl = document.getElementById("mapOriginLabel");
  const destEl = document.getElementById("mapDestinationLabel");
  const stopsEl = document.getElementById("mapStopsLabel");
  const distEl = document.getElementById("mapDistanceLabel");
  const etaEl = document.getElementById("mapEtaLabel");
  const statusEl = document.getElementById("mapStatusLabel");
  const strategyEl = document.getElementById("mapStrategyLabel");

  if (!record) {
    if (originEl) originEl.textContent = "—";
    if (destEl) destEl.textContent = "—";
    if (stopsEl) stopsEl.textContent = "No stops";
    if (distEl) distEl.textContent = "—";
    if (etaEl) etaEl.textContent = "—";
    if (statusEl) statusEl.textContent = "—";
    if (strategyEl) strategyEl.textContent = "—";
    return;
  }

  if (originEl) originEl.textContent = record.origin || "—";
  if (destEl) destEl.textContent = record.destination || "—";
  if (stopsEl) {
    const stops = (record.stops || []).filter(Boolean);
    stopsEl.textContent =
      stops.length === 0 ? "No intermediate stops" : stops.join(" → ");
  }
  if (distEl) distEl.textContent = formatRouteDistance(record.estimatedDistance);
  if (etaEl) etaEl.textContent = record.estimatedTravelTime || "—";
  if (statusEl) statusEl.textContent = record.status || "—";
  if (strategyEl) {
    strategyEl.textContent =
      (record.optimizationStrategy || "—") +
      (record.optimizationScore
        ? " · Score " + record.optimizationScore
        : "");
  }
}

function updateOptimizationSummaryPanel(record) {
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  if (!record) {
    set("optSummaryDistance", "—");
    set("optSummaryTime", "—");
    set("optSummaryStrategy", "—");
    set("optSummaryVehicle", "—");
    set("optSummaryDriver", "—");
    set("optSummaryScore", "—");
    return;
  }

  set("optSummaryDistance", formatRouteDistance(record.estimatedDistance));
  set("optSummaryTime", record.estimatedTravelTime || "—");
  set("optSummaryStrategy", record.optimizationStrategy || "—");
  set("optSummaryVehicle", record.vehicle || "—");
  set("optSummaryDriver", record.driver || "—");
  set(
    "optSummaryScore",
    record.optimizationScore != null
      ? String(record.optimizationScore)
      : "—",
  );
}

/**
 * Single Route Planning refresh pipeline.
 */
function refreshRoutePlanningTable(options = {}) {
  if (isRefreshingRoutes) return [];
  isRefreshingRoutes = true;

  try {
    const resetPage = options.resetPage === true;
    if (resetPage) routePaginationState.page = 1;

    /* Ensure stable original order on live store once */
    routePlanningRecords.forEach((live) => {
      if (live._order == null) {
        live._order = routeNextOriginalOrder++;
      }
    });

    const filters = getRouteFilterValues();
    const allForStats = getAllRouteRecords({ includeArchived: false });
    const all = getAllRouteRecords({ includeArchived: true });
    let matched = all.filter((r) => routeMatchesFilters(r, filters));
    matched = sortRouteRecords(matched);

    updateRouteStatistics(allForStats);

    const tbody = document.getElementById("routeTableBody");
    if (!tbody) return matched;

    if (all.length === 0) {
      updateRouteEmptyState(true);
      tbody.replaceChildren();
      renderRoutePagination(0);
      updateRouteMapPanel(null);
      updateOptimizationSummaryPanel(null);
      return [];
    }

    updateRouteEmptyState(false);

    const pageSize = routePaginationState.pageSize;
    const total = matched.length;
    const totalPages = Math.ceil(total / pageSize) || 0;
    if (totalPages > 0) {
      routePaginationState.page = Math.min(
        routePaginationState.page,
        totalPages,
      );
    }
    const start = (routePaginationState.page - 1) * pageSize;
    const pageRows = matched.slice(start, start + pageSize);

    const frag = document.createDocumentFragment();
    if (pageRows.length === 0) {
      const tr = document.createElement("tr");
      tr.className = "route-no-results";
      tr.dataset.helperRow = "true";
      tr.innerHTML =
        '<td colspan="' +
        ROUTE_TABLE_COLUMN_COUNT +
        '">No routes found.</td>';
      frag.appendChild(tr);
    } else {
      pageRows.forEach((record) => frag.appendChild(buildRouteTableRow(record)));
    }
    tbody.replaceChildren(frag);
    renderRoutePagination(total);

    const focusId = options.focusId;
    const panelRecord =
      (focusId && matched.find((r) => r.id === focusId)) ||
      matched[0] ||
      all[0] ||
      null;
    updateRouteMapPanel(panelRecord);
    updateOptimizationSummaryPanel(panelRecord);

    return matched;
  } catch (error) {
    console.error("refreshRoutePlanningTable failed:", error);
    return [];
  } finally {
    queueMicrotask(() => {
      isRefreshingRoutes = false;
    });
  }
}

function initRoutePlanningPipeline() {
  const tableBody = document.getElementById("routeTableBody");
  if (!tableBody || tableBody.dataset.routePipelineInit === "true") return;
  tableBody.dataset.routePipelineInit = "true";

  const onFilter = () =>
    refreshRoutePlanningTable({ resetPage: true, reason: "filter" });

  document.getElementById("routeSearch")?.addEventListener("input", onFilter);
  [
    "routePriorityFilter",
    "routeStatusFilter",
    "routeVehicleFilter",
    "routeDriverFilter",
    "routeDepartmentFilter",
    "routeDateFilter",
  ].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", onFilter);
  });

  document
    .getElementById("routeShowArchived")
    ?.addEventListener("change", onFilter);

  document.getElementById("refreshRoutes")?.addEventListener("click", () => {
    document.getElementById("routeSearch").value = "";
    document.getElementById("routePriorityFilter").value = "all";
    document.getElementById("routeStatusFilter").value = "all";
    document.getElementById("routeVehicleFilter").value = "all";
    document.getElementById("routeDriverFilter").value = "all";
    document.getElementById("routeDepartmentFilter").value = "all";
    document.getElementById("routeDateFilter").value = "";
    const archived = document.getElementById("routeShowArchived");
    if (archived) archived.checked = false;
    routeSortState.field = null;
    routeSortState.direction = null;
    refreshRoutePlanningTable({ resetPage: true, reason: "refresh" });
    if (typeof showToast === "function") {
      showToast("Route planning refreshed.", "success");
    }
  });

  document.getElementById("routePagination")?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-route-page]");
    if (!button || button.disabled) return;
    const action = button.dataset.routePage;
    if (action === "prev") {
      routePaginationState.page = Math.max(1, routePaginationState.page - 1);
    } else if (action === "next") {
      routePaginationState.page += 1;
    } else if (action === "page") {
      const p = Number(button.dataset.pageNumber);
      if (p) routePaginationState.page = p;
    }
    refreshRoutePlanningTable({ resetPage: false, reason: "page" });
  });

  document
    .querySelectorAll("#routeTable thead th.sortable[data-sort]")
    .forEach((th) => {
      th.style.cursor = "pointer";
      th.addEventListener("click", () => {
        const field = th.dataset.sort;
        if (!field) return;
        if (routeSortState.field === field) {
          if (routeSortState.direction === "asc") {
            routeSortState.direction = "desc";
          } else if (routeSortState.direction === "desc") {
            routeSortState.field = null;
            routeSortState.direction = null;
          } else {
            routeSortState.direction = "asc";
          }
        } else {
          routeSortState.field = field;
          routeSortState.direction = "asc";
        }
        refreshRoutePlanningTable({ resetPage: false, reason: "sort" });
      });
    });
}
