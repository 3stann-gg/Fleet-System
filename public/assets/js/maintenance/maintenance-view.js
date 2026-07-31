let viewMaintenanceInitialized = false;

const viewMaintenanceModal = {
  currentRow: null,
};

function getMaintenanceRecordIdFromRow(row) {
  if (!row) {
    return "";
  }

  const fromDataset = (row.dataset.maintenanceId || "").trim();
  if (fromDataset) {
    return fromDataset;
  }

  const numberCell = row.querySelector(".maintenance-number");
  return numberCell ? numberCell.textContent.trim() : "";
}

function resolveMaintenanceRowById(recordId) {
  const id = (recordId || "").trim();
  if (!id) {
    return null;
  }

  const rows = document.querySelectorAll("#maintenanceTableBody tr[data-maintenance-id]");

  for (const row of rows) {
    if ((row.dataset.maintenanceId || "").trim() === id) {
      return row;
    }
  }

  const numberCells = document.querySelectorAll(
    "#maintenanceTableBody tr .maintenance-number",
  );

  for (const cell of numberCells) {
    if (cell.textContent.trim() === id) {
      return cell.closest("tr");
    }
  }

  return null;
}

/**
 * Close View Details and open Edit for the same maintenance record.
 * @param {string} [recordId]
 */
function openEditMaintenanceFromView(recordId) {
  const viewModal = document.getElementById("viewMaintenanceModal");
  const storedId =
    (recordId || "").trim() ||
    (viewModal?.dataset.maintenanceId || "").trim() ||
    getMaintenanceRecordIdFromRow(viewMaintenanceModal.currentRow);

  let row = viewMaintenanceModal.currentRow;

  if (!row || !document.body.contains(row)) {
    row = resolveMaintenanceRowById(storedId);
  }

  if (!row || !document.body.contains(row)) {
    if (typeof showToast === "function") {
      showToast("Maintenance record is no longer available.", "error");
    } else {
      console.error("Edit from View: maintenance record not found", storedId);
    }
    return;
  }

  if (typeof openEditMaintenanceModal !== "function") {
    console.error("Edit from View: openEditMaintenanceModal is not available");
    return;
  }

  closeViewMaintenanceModal();

  const opened = openEditMaintenanceModal(row);

  if (!opened && typeof showToast === "function") {
    showToast("Unable to open Edit Maintenance.", "error");
  }
}

function initViewMaintenanceModal() {
  if (viewMaintenanceInitialized) {
    return;
  }

  const modal = document.getElementById("viewMaintenanceModal");
  const container = document.getElementById("view-maintenance-modal");

  if (!modal || !container) {
    viewMaintenanceInitialized = true;
    return;
  }

  document.addEventListener("click", (event) => {
    const openBtn = event.target.closest(".action-btn.view-maintenance");

    if (openBtn) {
      const row = openBtn.closest("tr");

      if (row) {
        openViewMaintenanceModal(row);
      }

      return;
    }

    const editFromViewBtn = event.target.closest("#editMaintenanceFromViewBtn");

    if (editFromViewBtn) {
      event.preventDefault();
      openEditMaintenanceFromView(
        editFromViewBtn.dataset.maintenanceId || modal.dataset.maintenanceId,
      );
      return;
    }

    if (event.target.closest("#closeViewMaintenanceModal")) {
      closeViewMaintenanceModal();
      return;
    }

    if (event.target.closest("#closeViewMaintenanceBtn")) {
      closeViewMaintenanceModal();
      return;
    }

    if (event.target === modal) {
      closeViewMaintenanceModal();
      return;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeViewMaintenanceModal();
    }
  });

  viewMaintenanceInitialized = true;
}

function openViewMaintenanceModal(row) {
  const modal = document.getElementById("viewMaintenanceModal");

  if (!modal) {
    return;
  }

  viewMaintenanceModal.currentRow = row;

  const recordId = getMaintenanceRecordIdFromRow(row);
  modal.dataset.maintenanceId = recordId;

  const editFromViewBtn = document.getElementById("editMaintenanceFromViewBtn");
  if (editFromViewBtn) {
    editFromViewBtn.dataset.maintenanceId = recordId;
  }

  const getText = (selector, fallback = "Not provided") => {
    const el = row.querySelector(selector);
    return el ? el.textContent.trim() : fallback;
  };

  const getData = (key, fallback = "Not provided") => {
    const val = row.dataset[key];
    return val && val.trim() !== "" ? val.trim() : fallback;
  };

  const number = getText(".maintenance-number");
  const vehicle = getText(".maintenance-vehicle");
  const serviceType = getText(".maintenance-service-type");
  const technician = getText(".maintenance-technician");
  const scheduledDate = getText(".maintenance-scheduled-date");
  const completionDate = getText(".maintenance-completion-date");
  const cost = getText(".maintenance-cost");
  const priority = getText(".maintenance-priority") !== "Not provided"
    ? getText(".maintenance-priority")
    : getData("priority");
  const statusText = getText(".status-badge");

  const statusMap = {
    "Scheduled": "scheduled",
    "In Progress": "trip",
    "Completed": "completed",
    "Cancelled": "cancelled"
  };
  const statusClass = statusMap[statusText] || "scheduled";

  const statusEl = document.getElementById("viewMaintenanceStatus");
  if (statusEl) {
    statusEl.className = "status-badge " + statusClass;
    statusEl.textContent = statusText;
  }

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value;
    }
  };

  setText("viewMaintenanceNumber", number);
  setText("viewMaintenanceVehicle", vehicle);
  setText("viewMaintenancePriority", priority);
  setText("viewMaintenanceServiceType", serviceType);
  setText("viewMaintenanceTechnician", technician);
  setText("viewMaintenanceScheduledDate", scheduledDate);
  setText("viewMaintenanceCompletionDate", completionDate);
  setText("viewMaintenanceCost", cost);
  setText("viewMaintenanceOdometer", getData("odometer"));
  setText("viewMaintenanceDescription", getData("description"));
  setText("viewMaintenancePartsUsed", getData("partsUsed"));
  setText("viewMaintenanceNotes", getData("notes"));

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeViewMaintenanceModal() {
  const modal = document.getElementById("viewMaintenanceModal");

  if (!modal) {
    return;
  }

  modal.classList.remove("show");
  document.body.style.overflow = "";
  viewMaintenanceModal.currentRow = null;
  delete modal.dataset.maintenanceId;

  const editFromViewBtn = document.getElementById("editMaintenanceFromViewBtn");
  if (editFromViewBtn) {
    delete editFromViewBtn.dataset.maintenanceId;
  }
}
