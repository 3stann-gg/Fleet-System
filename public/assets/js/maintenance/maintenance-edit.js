let editMaintenanceInitialized = false;

function populateEditMaintenanceForm(row) {
  if (!row) return;

  const getText = (selector) => {
    const el = row.querySelector(selector);
    return el ? el.textContent.trim() : "";
  };

  const setValue = (id, value) => {
    const field = document.getElementById(id);
    if (!field) return;
    field.value = value == null ? "" : value;
  };

  const setSelectValue = (id, value) => {
    const field = document.getElementById(id);
    if (!field) return;

    const candidate = value == null ? "" : String(value);
    const hasOption = Array.prototype.some.call(
      field.options,
      (option) => option.value === candidate
    );

    field.value = hasOption ? candidate : "";
  };

  const normalizeStatus = (raw) => {
    const value = (raw || "").trim().toLowerCase();
    if (value === "scheduled") return "Scheduled";
    if (value === "in progress") return "In Progress";
    if (value === "completed") return "Completed";
    if (value === "cancelled") return "Cancelled";
    return "";
  };

  const normalizePriority = (raw) => {
    const value = (raw || "").trim().toLowerCase();
    if (value === "emergency") return "Emergency";
    if (value === "high") return "High";
    if (value === "normal") return "Normal";
    if (value === "low") return "Low";
    return "";
  };

  const parseCostText = (raw) => {
    if (!raw) return "";
    const cleaned = raw.replace(/[^0-9.\-]/g, "");
    return cleaned;
  };

  const dataset = row.dataset || {};

  const number = getText(".maintenance-number");
  const vehicle = getText(".maintenance-vehicle");
  const serviceType = getText(".maintenance-service-type");
  const technician = getText(".maintenance-technician");

  const scheduledDate =
    dataset.scheduledDate || getText(".maintenance-scheduled-date") || "";
  const completionDate = dataset.completionDate || "";

  let cost = dataset.cost;
  if (cost == null || cost === "") {
    cost = parseCostText(getText(".maintenance-cost"));
  }

  const priority = normalizePriority(
    dataset.priority || getText(".maintenance-priority")
  );
  const status = normalizeStatus(getText(".status-badge"));

  const odometer = dataset.odometer || "";
  const description = dataset.description || "";
  const partsUsed = dataset.partsUsed || "";
  const notes = dataset.notes || "";

  setValue("editMaintenanceNumber", number);
  setSelectValue("editMaintenanceVehicle", vehicle);
  setSelectValue("editMaintenanceServiceType", serviceType);
  setValue("editMaintenanceTechnician", technician);
  setValue("editMaintenanceScheduledDate", scheduledDate);
  setValue("editMaintenanceCompletionDate", completionDate);
  setValue("editMaintenanceCost", cost);
  setSelectValue("editMaintenancePriority", priority);
  setSelectValue("editMaintenanceStatus", status);
  setValue("editMaintenanceOdometer", odometer);
  setValue("editMaintenanceDescription", description);
  setValue("editMaintenancePartsUsed", partsUsed);
  setValue("editMaintenanceNotes", notes);
}

/**
 * Open the Edit Maintenance modal for a table row (shared by table action + View handoff).
 * @param {HTMLTableRowElement} row
 * @returns {boolean} true when opened and populated
 */
function openEditMaintenanceModal(row) {
  const modal = document.getElementById("editMaintenanceModal");

  if (!modal || !row || !document.body.contains(row)) {
    return false;
  }

  if (typeof populateEditMaintenanceForm !== "function") {
    return false;
  }

  modal.currentRow = row;
  populateEditMaintenanceForm(row);
  modal.classList.add("show");
  document.body.style.overflow = "hidden";

  const focusTarget =
    document.getElementById("editMaintenanceVehicle") ||
    document.getElementById("editMaintenanceModalTitle") ||
    modal.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");

  if (focusTarget && typeof focusTarget.focus === "function") {
    requestAnimationFrame(() => {
      focusTarget.focus();
    });
  }

  return true;
}

function closeEditMaintenanceModal() {
  const modal = document.getElementById("editMaintenanceModal");

  if (!modal) {
    return;
  }

  modal.classList.remove("show");
  document.body.style.overflow = "";
  modal.currentRow = null;
}

function initEditMaintenanceModal() {
  if (editMaintenanceInitialized) return;

  const modal = document.getElementById("editMaintenanceModal");
  if (!modal) return;

  editMaintenanceInitialized = true;

  document.addEventListener("click", (event) => {
    const editBtn = event.target.closest(".action-btn.edit-maintenance");
    if (!editBtn) return;

    const row = editBtn.closest("tr");
    if (!row) return;

    openEditMaintenanceModal(row);
  });

  const closeHandlers = [
    document.getElementById("closeEditMaintenanceModal"),
    document.getElementById("cancelEditMaintenance"),
    modal,
  ];

  closeHandlers.forEach((element) => {
    if (!element) return;

    element.addEventListener("click", (event) => {
      if (element === modal && event.target !== modal) return;
      if (element === modal && event.target.closest(".custom-modal")) return;

      closeEditMaintenanceModal();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeEditMaintenanceModal();
    }
  });
}

function initMaintenanceEdit() {
  if (typeof initEditMaintenanceModal !== "function") {
    return;
  }

  const form = document.getElementById("editMaintenanceForm");
  const modal = document.getElementById("editMaintenanceModal");

  if (!form || !modal) {
    return;
  }

  if (form.dataset.maintenanceEditInitialized) {
    return;
  }

  form.dataset.maintenanceEditInitialized = "true";

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!modal.currentRow) {
      return;
    }

    const valid = validateMaintenanceForm(form);
    if (!valid) {
      return;
    }

    const row = modal.currentRow;

    const getValue = (id) => {
      const field = document.getElementById(id);
      return field ? field.value : "";
    };

    const number = getValue("editMaintenanceNumber");
    const vehicle = getValue("editMaintenanceVehicle");
    const serviceType = getValue("editMaintenanceServiceType");
    const technician = getValue("editMaintenanceTechnician");
    const scheduledDate = getValue("editMaintenanceScheduledDate");
    const completionDate = getValue("editMaintenanceCompletionDate");
    const costRaw = getValue("editMaintenanceCost");
    const priority = getValue("editMaintenancePriority");
    const status = getValue("editMaintenanceStatus");
    const odometer = getValue("editMaintenanceOdometer");
    const description = getValue("editMaintenanceDescription");
    const partsUsed = getValue("editMaintenancePartsUsed");
    const notes = getValue("editMaintenanceNotes");

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

    const scheduledDisplay = formatDate(scheduledDate);
    let completionDisplay = formatDate(completionDate);
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

    const previousId =
      (row.dataset.maintenanceId || "").trim() ||
      (row.querySelector(".maintenance-number")?.textContent || "").trim();

    if (
      previousId &&
      previousId !== number &&
      typeof migrateMaintenanceSelectionId === "function"
    ) {
      migrateMaintenanceSelectionId(previousId, number);
    }

    row.dataset.maintenanceId = number;

    const numberCell = row.querySelector(".maintenance-number");
    if (numberCell) numberCell.textContent = number;

    const rowCheckbox = row.querySelector(".maintenance-checkbox");
    if (rowCheckbox) {
      rowCheckbox.dataset.maintenanceId = number;
      rowCheckbox.setAttribute("aria-label", "Select " + number);
    }
    const vehicleCell = row.querySelector(".maintenance-vehicle");
    if (vehicleCell) vehicleCell.textContent = vehicle;
    const serviceTypeCell = row.querySelector(".maintenance-service-type");
    if (serviceTypeCell) serviceTypeCell.textContent = serviceType;
    const technicianCell = row.querySelector(".maintenance-technician");
    if (technicianCell) technicianCell.textContent = technician;
    const scheduledCell = row.querySelector(".maintenance-scheduled-date");
    if (scheduledCell) scheduledCell.textContent = scheduledDisplay;
    const completionCell = row.querySelector(".maintenance-completion-date");
    if (completionCell) completionCell.textContent = completionDisplay;
    const costCell = row.querySelector(".maintenance-cost");
    if (costCell) costCell.textContent = costDisplay;
    const priorityCell = row.querySelector(".maintenance-priority");
    if (priorityCell) priorityCell.textContent = priority;

    const statusBadge = row.querySelector(".status-badge");
    if (statusBadge) {
      statusBadge.className = "status-badge";
      const statusMap = {
        "Scheduled": "scheduled",
        "In Progress": "trip",
        "Completed": "completed",
        "Cancelled": "cancelled"
      };
      statusBadge.classList.add(statusMap[status] || "scheduled");
      statusBadge.textContent = status;
    }

    row.dataset.scheduledDate = scheduledDate;
    row.dataset.completionDate = completionDate;
    row.dataset.priority = priority;
    row.dataset.cost = costRaw;
    row.dataset.odometer = odometer;
    row.dataset.description = description;
    row.dataset.partsUsed = partsUsed;
    row.dataset.notes = notes;

    if (typeof closeEditMaintenanceModal === "function") {
      closeEditMaintenanceModal();
    } else {
      modal.classList.remove("show");
      document.body.style.overflow = "";
      modal.currentRow = null;
    }

    if (typeof refreshMaintenanceTable === "function") {
      refreshMaintenanceTable({
        resetPage: false,
        refreshStatistics: true,
        reason: "edit",
      });
    } else if (typeof updateMaintenanceStatistics === "function") {
      updateMaintenanceStatistics();
    }

    if (typeof showToast === "function") {
      showToast("Maintenance record updated successfully.", "success");
    }
  });
}
