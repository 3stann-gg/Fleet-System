function createMaintenanceRow(form) {
  const get = (id) => {
    const el = form.querySelector("#" + id);
    return el ? el.value : "";
  };

  const number = get("maintenanceNumber");
  const vehicle = get("maintenanceVehicle");
  const serviceType = get("maintenanceServiceType");
  const technician = get("maintenanceTechnician");
  const scheduledDateRaw = get("maintenanceScheduledDate");
  const completionDateRaw = get("maintenanceCompletionDate");
  const costRaw = get("maintenanceCost");
  const priority = get("maintenancePriority");
  const status = get("maintenanceStatus");
  const odometer = get("maintenanceOdometer");
  const description = get("maintenanceDescription");
  const partsUsed = get("maintenancePartsUsed");
  const notes = get("maintenanceNotes");

  function formatDate(raw) {
    if (!raw) {
      return "";
    }

    const date = new Date(raw);
    if (isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  const scheduledDisplay = formatDate(scheduledDateRaw);
  let completionDisplay = formatDate(completionDateRaw);
  if (!completionDisplay) {
    completionDisplay = "Not completed";
  }

  let costDisplay = "₱0.00";
  if (costRaw !== "" && costRaw != null) {
    const costValue = parseFloat(costRaw);
    if (!isNaN(costValue)) {
      costDisplay = "₱" + costValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  }

  const statusMap = {
    "Scheduled": "scheduled",
    "In Progress": "trip",
    "Completed": "completed",
    "Cancelled": "cancelled"
  };
  const statusClass = statusMap[status] || "scheduled";

  const tr = document.createElement("tr");
  tr.dataset.maintenanceId = number;
  tr.dataset.scheduledDate = scheduledDateRaw;
  tr.dataset.completionDate = completionDateRaw;
  tr.dataset.priority = priority;
  tr.dataset.odometer = odometer;
  tr.dataset.description = description;
  tr.dataset.partsUsed = partsUsed;
  tr.dataset.notes = notes;
  tr.dataset.cost = costRaw;

  function makeCell() {
    return document.createElement("td");
  }

  function makeSpan(className, text) {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = text;
    return span;
  }

  // 1. Checkbox
  const checkboxTd = makeCell();
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "maintenance-checkbox";
  checkbox.dataset.maintenanceId = number;
  checkbox.setAttribute("aria-label", "Select " + number);
  checkbox.checked = false;
  checkboxTd.appendChild(checkbox);

  // 2. Maintenance No.
  const numberTd = makeCell();
  numberTd.appendChild(makeSpan("maintenance-number", number));

  // 3. Vehicle
  const vehicleTd = makeCell();
  vehicleTd.appendChild(makeSpan("maintenance-vehicle", vehicle));

  // 4. Service Type
  const serviceTd = makeCell();
  serviceTd.appendChild(makeSpan("maintenance-service-type", serviceType));

  // 5. Technician / Workshop
  const technicianTd = makeCell();
  technicianTd.appendChild(makeSpan("maintenance-technician", technician));

  // 6. Scheduled Date
  const scheduledTd = makeCell();
  scheduledTd.appendChild(makeSpan("maintenance-scheduled-date", scheduledDisplay));

  // 7. Completion Date
  const completionTd = makeCell();
  completionTd.appendChild(makeSpan("maintenance-completion-date", completionDisplay));

  // 8. Cost
  const costTd = makeCell();
  costTd.appendChild(makeSpan("maintenance-cost", costDisplay));

  // 9. Priority
  const priorityTd = makeCell();
  priorityTd.appendChild(makeSpan("maintenance-priority", priority));

  // 10. Status
  const statusTd = makeCell();
  const statusBadge = document.createElement("span");
  statusBadge.className = "status-badge " + statusClass;
  statusBadge.textContent = status;
  statusTd.appendChild(statusBadge);

  // 11. Actions
  const actionsTd = makeCell();
  const actionsWrapper = document.createElement("div");
  actionsWrapper.className = "action-buttons";

  const viewBtn = document.createElement("button");
  viewBtn.type = "button";
  viewBtn.className = "action-btn view-maintenance";
  viewBtn.setAttribute("aria-label", "View " + number);
  const viewIcon = document.createElement("i");
  viewIcon.className = "ph ph-eye";
  viewBtn.appendChild(viewIcon);

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "action-btn edit-maintenance";
  editBtn.setAttribute("aria-label", "Edit " + number);
  const editIcon = document.createElement("i");
  editIcon.className = "ph ph-pencil-simple";
  editBtn.appendChild(editIcon);

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "action-btn delete-maintenance";
  deleteBtn.setAttribute("aria-label", "Delete " + number);
  const deleteIcon = document.createElement("i");
  deleteIcon.className = "ph ph-trash";
  deleteBtn.appendChild(deleteIcon);

  actionsWrapper.appendChild(viewBtn);
  actionsWrapper.appendChild(editBtn);
  actionsWrapper.appendChild(deleteBtn);
  actionsTd.appendChild(actionsWrapper);

  tr.appendChild(checkboxTd);
  tr.appendChild(numberTd);
  tr.appendChild(vehicleTd);
  tr.appendChild(serviceTd);
  tr.appendChild(technicianTd);
  tr.appendChild(scheduledTd);
  tr.appendChild(completionTd);
  tr.appendChild(costTd);
  tr.appendChild(priorityTd);
  tr.appendChild(statusTd);
  tr.appendChild(actionsTd);

  return tr;
}

function initMaintenanceAdd() {
  if (typeof initMaintenanceModal !== "function") {
    return;
  }

  const form = document.getElementById("maintenanceForm");
  const tableBody = document.getElementById("maintenanceTableBody");

  if (!form) {
    return;
  }

  if (typeof createMaintenanceRow !== "function") {
    return;
  }

  if (typeof validateMaintenanceForm !== "function") {
    return;
  }

  if (!tableBody) {
    return;
  }

  if (form.dataset.maintenanceAddInitialized) {
    return;
  }

  form.dataset.maintenanceAddInitialized = "true";

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validateMaintenanceForm(form)) {
      return;
    }

    const row = createMaintenanceRow(form);
    if (!row) {
      return;
    }

    tableBody.prepend(row);

    form.reset();

    const invalidFields = form.querySelectorAll(".is-invalid");
    invalidFields.forEach(function (field) {
      field.classList.remove("is-invalid");
    });

    const fieldErrors = form.querySelectorAll(".field-error");
    fieldErrors.forEach(function (errorEl) {
      errorEl.textContent = "";
      errorEl.style.display = "none";
    });

    const modal = document.getElementById("addMaintenanceModal");
    if (modal) {
      modal.classList.remove("show");
    }

    document.body.style.overflow = "";

    if (typeof refreshMaintenanceTable === "function") {
      refreshMaintenanceTable({
        resetPage: false,
        refreshStatistics: true,
        reason: "add",
      });
    } else if (typeof updateMaintenanceStatistics === "function") {
      updateMaintenanceStatistics();
    }

    if (typeof showToast === "function") {
      showToast("Maintenance record created successfully.", "success");
    }
  });
}
