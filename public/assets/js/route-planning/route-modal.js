/* ==========================================
   Route Planning modals: New / View / Edit / Delete
========================================== */

let routeModalsInitialized = false;
let routeFormMode = "add"; /* add | edit */
let routeEditingId = null;
let routeDeleteTargetId = null;
let routeLastOptimization = null;

function fillRouteSelect(select, options, placeholder) {
  if (!select) return;
  const current = select.value;
  select.innerHTML =
    `<option value="">${placeholder}</option>` +
    options.map((o) => `<option value="${o}">${o}</option>`).join("");
  if (current && [...select.options].some((o) => o.value === current)) {
    select.value = current;
  }
}

function populateRouteFormOptions() {
  fillRouteSelect(
    document.getElementById("routeVehicle"),
    ROUTE_VEHICLES,
    "Select vehicle",
  );
  fillRouteSelect(
    document.getElementById("routeDriver"),
    ROUTE_DRIVERS,
    "Select driver",
  );
  fillRouteSelect(
    document.getElementById("routeDepartment"),
    ROUTE_DEPARTMENTS,
    "Select department",
  );
}

function clearRouteFieldErrors(form) {
  form?.querySelectorAll(".is-invalid").forEach((el) => {
    el.classList.remove("is-invalid");
  });
  form?.querySelectorAll(".field-error").forEach((el) => {
    el.textContent = "";
    el.style.display = "none";
  });
}

function showRouteFieldError(field, message) {
  if (!field) return;
  field.classList.add("is-invalid");
  let error = field.parentElement?.querySelector(
    ".field-error[data-field='" + field.id + "']",
  );
  if (!error) {
    error = document.createElement("div");
    error.className = "field-error";
    error.setAttribute("data-field", field.id);
    field.parentElement?.appendChild(error);
  }
  error.textContent = message;
  error.style.display = "block";
}

function getRouteStopsFromForm() {
  const list = document.getElementById("routeStopsList");
  if (!list) return [];
  return Array.from(list.querySelectorAll("input.route-stop-input"))
    .map((input) => input.value.trim())
    .filter(Boolean);
}

function renderRouteStops(stops) {
  const list = document.getElementById("routeStopsList");
  if (!list) return;
  list.innerHTML = "";
  const items = stops && stops.length ? stops : [""];
  items.forEach((stop, index) => {
    const row = document.createElement("div");
    row.className = "route-stop-row";
    row.innerHTML = `
      <input
        type="text"
        class="route-stop-input"
        id="routeStop_${index}"
        placeholder="Stop ${index + 1}"
        value="${String(stop).replace(/"/g, "&quot;")}"
        aria-label="Route stop ${index + 1}"
      />
      <button type="button" class="btn-outline route-remove-stop" aria-label="Remove stop ${index + 1}">
        <i class="ph ph-x" aria-hidden="true"></i>
      </button>
    `;
    list.appendChild(row);
  });
}

function collectRouteFormData() {
  const get = (id) => document.getElementById(id)?.value?.trim() || "";
  return {
    routeNumber: get("routeNumber"),
    origin: get("routeOrigin"),
    destination: get("routeDestination"),
    stops: getRouteStopsFromForm(),
    vehicle: get("routeVehicle"),
    driver: get("routeDriver"),
    priority: get("routePriority"),
    department: get("routeDepartment"),
    purpose: get("routePurpose"),
    departureDate: get("routeDepartureDate"),
    departureTime: get("routeDepartureTime"),
    status: get("routeStatus"),
    notes: get("routeNotes"),
    estimatedDistance: Number(document.getElementById("routeEstimatedDistance")?.dataset.raw || 0),
    estimatedTravelTime: get("routeEstimatedTime"),
    estimatedTravelTimeMinutes: Number(
      document.getElementById("routeEstimatedTime")?.dataset.minutes || 0,
    ),
    optimizationStrategy: get("routeOptStrategy"),
    optimizationScore: Number(
      document.getElementById("routeOptScore")?.dataset.raw || 0,
    ),
  };
}

function applyOptimizationToForm(result) {
  routeLastOptimization = result;
  const dist = document.getElementById("routeEstimatedDistance");
  const time = document.getElementById("routeEstimatedTime");
  const strategy = document.getElementById("routeOptStrategy");
  const score = document.getElementById("routeOptScore");
  const summary = document.getElementById("routeOptimizeSummary");

  if (dist) {
    dist.value = formatRouteDistance(result.estimatedDistance);
    dist.dataset.raw = String(result.estimatedDistance);
  }
  if (time) {
    time.value = result.estimatedTravelTime;
    time.dataset.minutes = String(result.estimatedTravelTimeMinutes);
  }
  if (strategy) strategy.value = result.optimizationStrategy;
  if (score) {
    score.value = String(result.optimizationScore);
    score.dataset.raw = String(result.optimizationScore);
  }
  if (summary) {
    summary.hidden = false;
    summary.innerHTML = `
      <strong>Simulated Route Optimization</strong>
      <p>Strategy: ${result.optimizationStrategy} · Score: ${result.optimizationScore}</p>
      <p>Distance: ${formatRouteDistance(result.estimatedDistance)} · Time: ${result.estimatedTravelTime}</p>
      <p>Recommended vehicle: ${result.recommendedVehicle} · Driver: ${result.recommendedDriver}</p>
    `;
  }

  const vehicle = document.getElementById("routeVehicle");
  const driver = document.getElementById("routeDriver");
  if (vehicle && !vehicle.value) vehicle.value = result.recommendedVehicle;
  if (driver && !driver.value) driver.value = result.recommendedDriver;
}

function validateRouteForm() {
  const form = document.getElementById("routeForm");
  if (!form) return false;
  clearRouteFieldErrors(form);

  let first = null;
  const fail = (id, message) => {
    const field = document.getElementById(id);
    showRouteFieldError(field, message);
    if (!first && field) first = field;
  };

  const data = collectRouteFormData();
  if (!data.origin) fail("routeOrigin", "Origin is required.");
  if (!data.destination) fail("routeDestination", "Destination is required.");
  if (data.origin && data.destination && data.origin === data.destination) {
    fail("routeDestination", "Destination must differ from origin.");
  }
  if (!data.vehicle) fail("routeVehicle", "Vehicle is required.");
  if (!data.driver) fail("routeDriver", "Driver is required.");
  if (!data.priority) fail("routePriority", "Priority is required.");
  if (!data.department) fail("routeDepartment", "Department is required.");
  if (!data.departureDate) fail("routeDepartureDate", "Departure date is required.");
  if (!data.departureTime) fail("routeDepartureTime", "Departure time is required.");
  if (!data.status) fail("routeStatus", "Status is required.");

  if (!data.estimatedDistance || !data.estimatedTravelTime) {
    fail(
      "routeEstimatedDistance",
      "Run Optimize Route before saving.",
    );
  }

  if (first) first.focus();
  return !first;
}

function openRouteFormModal(mode, record) {
  const modal = document.getElementById("routeFormModal");
  const title = document.getElementById("routeFormModalTitle");
  const form = document.getElementById("routeForm");
  if (!modal || !form) return;

  routeFormMode = mode;
  routeEditingId = mode === "edit" && record ? record.id : null;
  routeLastOptimization = null;
  clearRouteFieldErrors(form);
  populateRouteFormOptions();

  const summary = document.getElementById("routeOptimizeSummary");
  if (summary) {
    summary.hidden = true;
    summary.innerHTML = "";
  }

  if (mode === "edit" && record) {
    if (title) title.textContent = "Edit Route";
    document.getElementById("routeNumber").value = record.routeNumber;
    document.getElementById("routeOrigin").value = record.origin;
    document.getElementById("routeDestination").value = record.destination;
    renderRouteStops(record.stops || []);
    document.getElementById("routeVehicle").value = record.vehicle || "";
    document.getElementById("routeDriver").value = record.driver || "";
    document.getElementById("routePriority").value = record.priority || "Medium";
    document.getElementById("routeDepartment").value = record.department || "";
    document.getElementById("routePurpose").value = record.purpose || "";
    document.getElementById("routeDepartureDate").value =
      record.departureDate || "";
    document.getElementById("routeDepartureTime").value =
      record.departureTime || "";
    document.getElementById("routeStatus").value = record.status || "Draft";
    document.getElementById("routeNotes").value = record.notes || "";

    const dist = document.getElementById("routeEstimatedDistance");
    const time = document.getElementById("routeEstimatedTime");
    const strategy = document.getElementById("routeOptStrategy");
    const score = document.getElementById("routeOptScore");
    if (dist) {
      dist.value = formatRouteDistance(record.estimatedDistance);
      dist.dataset.raw = String(record.estimatedDistance || 0);
    }
    if (time) {
      time.value = record.estimatedTravelTime || "";
      time.dataset.minutes = String(record.estimatedTravelTimeMinutes || 0);
    }
    if (strategy) strategy.value = record.optimizationStrategy || "";
    if (score) {
      score.value = record.optimizationScore != null
        ? String(record.optimizationScore)
        : "";
      score.dataset.raw = String(record.optimizationScore || 0);
    }
  } else {
    if (title) title.textContent = "New Route";
    form.reset();
    document.getElementById("routeNumber").value = generateRouteNumber();
    document.getElementById("routePriority").value = "Medium";
    document.getElementById("routeStatus").value = "Draft";
    renderRouteStops([""]);
    const dist = document.getElementById("routeEstimatedDistance");
    const time = document.getElementById("routeEstimatedTime");
    if (dist) {
      dist.value = "";
      dist.dataset.raw = "";
    }
    if (time) {
      time.value = "";
      time.dataset.minutes = "";
    }
    document.getElementById("routeOptStrategy").value = "";
    document.getElementById("routeOptScore").value = "";
  }

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => {
    document.getElementById("routeOrigin")?.focus();
  });
}

function closeRouteFormModal() {
  const modal = document.getElementById("routeFormModal");
  if (!modal) return;
  modal.classList.remove("show");
  document.body.style.overflow = "";
  routeEditingId = null;
  routeFormMode = "add";
}

function openViewRouteModal(record) {
  const modal = document.getElementById("viewRouteModal");
  if (!modal || !record) return;

  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value == null || value === "" ? "—" : value;
  };

  set("viewRouteNumber", record.routeNumber);
  set("viewRouteStatus", record.status);
  set("viewRoutePriority", record.priority);
  set("viewRouteOrigin", record.origin);
  set("viewRouteDestination", record.destination);
  set(
    "viewRouteStops",
    (record.stops || []).filter(Boolean).join(" → ") || "None",
  );
  set("viewRouteVehicle", record.vehicle);
  set("viewRouteDriver", record.driver);
  set("viewRouteDepartment", record.department);
  set("viewRoutePurpose", record.purpose);
  set(
    "viewRouteDeparture",
    formatRouteDeparture(record.departureDate, record.departureTime),
  );
  set("viewRouteDistance", formatRouteDistance(record.estimatedDistance));
  set("viewRouteTime", record.estimatedTravelTime);
  set("viewRouteStrategy", record.optimizationStrategy);
  set("viewRouteScore", record.optimizationScore);
  set("viewRouteNotes", record.notes);
  set("viewRouteCreated", formatRouteCreated(record.createdAt));
  set("viewRouteUpdated", formatRouteCreated(record.updatedAt));

  const timeline = document.getElementById("viewRouteTimeline");
  if (timeline) {
    const history = Array.isArray(record.statusHistory)
      ? record.statusHistory.slice()
      : [];
    if (history.length === 0) {
      timeline.innerHTML =
        "<li><strong>Created</strong><span>" +
        escapeRouteHtml(formatRouteCreated(record.createdAt)) +
        "</span></li>";
    } else {
      timeline.innerHTML = history
        .map((h) => {
          const when = formatRouteCreated(h.at);
          const note = h.note ? " — " + escapeRouteHtml(h.note) : "";
          return (
            "<li><strong>" +
            escapeRouteHtml(h.status) +
            "</strong><span>" +
            escapeRouteHtml(when) +
            note +
            "</span></li>"
          );
        })
        .join("");
    }
  }

  const archiveBtn = document.getElementById("archiveRouteFromViewBtn");
  const restoreBtn = document.getElementById("restoreRouteFromViewBtn");
  if (archiveBtn) {
    archiveBtn.hidden = record.status === "Archived";
  }
  if (restoreBtn) {
    restoreBtn.hidden = record.status !== "Archived";
  }

  modal.dataset.routeId = record.id;
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeViewRouteModal() {
  const modal = document.getElementById("viewRouteModal");
  if (!modal) return;
  modal.classList.remove("show");
  document.body.style.overflow = "";
  delete modal.dataset.routeId;
}

function openDeleteRouteModal(record) {
  const modal = document.getElementById("deleteRouteModal");
  if (!modal || !record) return;
  routeDeleteTargetId = record.id;
  const desc = document.getElementById("deleteRouteModalDescription");
  if (desc) {
    desc.innerHTML =
      "Are you sure you want to delete route <strong>" +
      escapeRouteHtml(record.routeNumber) +
      "</strong> (" +
      escapeRouteHtml(record.origin) +
      " → " +
      escapeRouteHtml(record.destination) +
      ")?";
  }
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
  document.getElementById("cancelDeleteRoute")?.focus();
}

function closeDeleteRouteModal() {
  const modal = document.getElementById("deleteRouteModal");
  if (!modal) return;
  modal.classList.remove("show");
  document.body.style.overflow = "";
  routeDeleteTargetId = null;
}

function saveRouteFromForm() {
  if (!validateRouteForm()) return;

  const data = collectRouteFormData();
  const now = new Date().toISOString();

  if (routeFormMode === "edit" && routeEditingId) {
    const existing = getRouteRecordById(routeEditingId);
    if (!existing) {
      if (typeof showToast === "function") {
        showToast("Route is no longer available.", "error");
      }
      return;
    }
    const updated = upsertRouteRecord({
      ...existing,
      ...data,
      id: existing.id,
      routeNumber: existing.routeNumber,
      createdAt: existing.createdAt,
      updatedAt: now,
      statusHistory: existing.statusHistory,
      _order: existing._order,
    });
    closeRouteFormModal();
    refreshRoutePlanningTable({
      resetPage: false,
      focusId: updated.id,
      reason: "edit",
    });
    if (typeof showToast === "function") {
      showToast("Route updated successfully.", "success");
    }
    return;
  }

  const record = upsertRouteRecord({
    id: generateRouteInternalId(),
    ...data,
    createdAt: now,
    updatedAt: now,
    statusHistory: [{ status: data.status || "Draft", at: now, note: "Created" }],
    _order: routeNextOriginalOrder++,
  });

  closeRouteFormModal();
  refreshRoutePlanningTable({
    resetPage: true,
    focusId: record.id,
    reason: "add",
  });
  if (typeof showToast === "function") {
    showToast("Route saved successfully.", "success");
  }
}

function initRoutePlanningModals() {
  if (routeModalsInitialized) return;
  if (!document.getElementById("routePlanningPage")) return;
  routeModalsInitialized = true;

  populateRouteFormOptions();

  document.getElementById("newRouteBtn")?.addEventListener("click", () => {
    openRouteFormModal("add");
  });

  document
    .getElementById("closeRouteFormModal")
    ?.addEventListener("click", closeRouteFormModal);
  document
    .getElementById("cancelRouteForm")
    ?.addEventListener("click", closeRouteFormModal);

  document.getElementById("routeFormModal")?.addEventListener("click", (e) => {
    if (e.target.id === "routeFormModal") closeRouteFormModal();
  });

  document.getElementById("addRouteStopBtn")?.addEventListener("click", () => {
    const stops = getRouteStopsFromForm();
    stops.push("");
    renderRouteStops(stops);
  });

  document.getElementById("routeStopsList")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".route-remove-stop");
    if (!btn) return;
    const row = btn.closest(".route-stop-row");
    row?.remove();
    const remaining = getRouteStopsFromForm();
    if (remaining.length === 0) renderRouteStops([""]);
  });

  document.getElementById("optimizeRouteBtn")?.addEventListener("click", () => {
    const data = collectRouteFormData();
    if (!data.origin || !data.destination) {
      if (typeof showToast === "function") {
        showToast("Enter origin and destination before optimizing.", "warning");
      }
      return;
    }
    const result = simulateRouteOptimization(data);
    applyOptimizationToForm(result);
    if (typeof showToast === "function") {
      showToast("Simulated route optimization complete.", "success");
    }
  });

  document.getElementById("routeForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    saveRouteFromForm();
  });

  /* Table actions — delegated once */
  document.getElementById("routeTableBody")?.addEventListener("click", (e) => {
    const viewBtn = e.target.closest(".view-route");
    const editBtn = e.target.closest(".edit-route");
    const deleteBtn = e.target.closest(".delete-route");
    const tr = e.target.closest("tr[data-route-id]");
    if (!tr) return;
    const record = getRouteRecordById(tr.dataset.routeId);
    if (!record) return;

    if (viewBtn) {
      openViewRouteModal(record);
      updateRouteMapPanel(record);
      updateOptimizationSummaryPanel(record);
      return;
    }
    if (editBtn) {
      openRouteFormModal("edit", record);
      return;
    }
    if (deleteBtn) {
      openDeleteRouteModal(record);
    }
  });

  document
    .getElementById("closeViewRouteModal")
    ?.addEventListener("click", closeViewRouteModal);
  document
    .getElementById("closeViewRouteBtn")
    ?.addEventListener("click", closeViewRouteModal);
  document.getElementById("viewRouteModal")?.addEventListener("click", (e) => {
    if (e.target.id === "viewRouteModal") closeViewRouteModal();
  });

  document
    .getElementById("editRouteFromViewBtn")
    ?.addEventListener("click", () => {
      const modal = document.getElementById("viewRouteModal");
      const id = modal?.dataset.routeId;
      const record = getRouteRecordById(id);
      if (!record) return;
      closeViewRouteModal();
      openRouteFormModal("edit", record);
    });

  document
    .getElementById("duplicateRouteFromViewBtn")
    ?.addEventListener("click", () => {
      const modal = document.getElementById("viewRouteModal");
      const id = modal?.dataset.routeId;
      const copy = duplicateRouteRecord(id);
      if (!copy) {
        if (typeof showToast === "function") {
          showToast("Unable to duplicate route.", "error");
        }
        return;
      }
      closeViewRouteModal();
      refreshRoutePlanningTable({
        resetPage: true,
        focusId: copy.id,
        reason: "duplicate",
      });
      if (typeof showToast === "function") {
        showToast("Route duplicated as " + copy.routeNumber + ".", "success");
      }
    });

  document
    .getElementById("archiveRouteFromViewBtn")
    ?.addEventListener("click", () => {
      const modal = document.getElementById("viewRouteModal");
      const id = modal?.dataset.routeId;
      const archived = archiveRouteRecord(id);
      if (!archived) {
        if (typeof showToast === "function") {
          showToast("Unable to archive route.", "error");
        }
        return;
      }
      closeViewRouteModal();
      refreshRoutePlanningTable({ resetPage: false, reason: "archive" });
      if (typeof showToast === "function") {
        showToast("Route archived.", "success");
      }
    });

  document
    .getElementById("restoreRouteFromViewBtn")
    ?.addEventListener("click", () => {
      const modal = document.getElementById("viewRouteModal");
      const id = modal?.dataset.routeId;
      const restored = restoreRouteRecord(id);
      if (!restored) {
        if (typeof showToast === "function") {
          showToast("Unable to restore route.", "error");
        }
        return;
      }
      closeViewRouteModal();
      refreshRoutePlanningTable({
        resetPage: false,
        focusId: restored.id,
        reason: "restore",
      });
      if (typeof showToast === "function") {
        showToast("Route restored to Planned.", "success");
      }
    });

  document
    .getElementById("closeDeleteRouteModal")
    ?.addEventListener("click", closeDeleteRouteModal);
  document
    .getElementById("cancelDeleteRoute")
    ?.addEventListener("click", closeDeleteRouteModal);
  document.getElementById("deleteRouteModal")?.addEventListener("click", (e) => {
    if (e.target.id === "deleteRouteModal") closeDeleteRouteModal();
  });

  document
    .getElementById("confirmDeleteRoute")
    ?.addEventListener("click", () => {
      if (!routeDeleteTargetId) return;
      const ok = removeRouteRecord(routeDeleteTargetId);
      closeDeleteRouteModal();
      if (!ok) {
        if (typeof showToast === "function") {
          showToast("Unable to delete route.", "error");
        }
        return;
      }
      refreshRoutePlanningTable({ resetPage: false, reason: "delete" });
      if (typeof showToast === "function") {
        showToast("Route deleted successfully.", "success");
      }
    });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (document.getElementById("routeFormModal")?.classList.contains("show")) {
      closeRouteFormModal();
    } else if (
      document.getElementById("viewRouteModal")?.classList.contains("show")
    ) {
      closeViewRouteModal();
    } else if (
      document.getElementById("deleteRouteModal")?.classList.contains("show")
    ) {
      closeDeleteRouteModal();
    }
  });
}

function initRoutePlanningPage() {
  if (!document.getElementById("routePlanningPage")) return;
  if (document.getElementById("routePlanningPage").dataset.init === "true") {
    return;
  }
  document.getElementById("routePlanningPage").dataset.init = "true";

  seedRoutePlanningSampleData();
  initRoutePlanningPipeline();
  initRoutePlanningModals();
  if (typeof initRouteTemplates === "function") {
    initRouteTemplates();
  }
  if (typeof initRouteExport === "function") {
    initRouteExport();
  }
  refreshRoutePlanningTable({ resetPage: true, reason: "init" });
}
