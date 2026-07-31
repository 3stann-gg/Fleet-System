/* ==========================================
   Maintenance Bulk Selection + Bulk Delete
   Persists via stable IDs; UI sync does not re-run the table pipeline.
========================================== */

const selectedMaintenanceIds = new Set();

let maintenanceBulkState = null;

function getMaintenanceRecordId(row) {
  if (!row) return "";

  if (row.dataset.maintenanceId && row.dataset.maintenanceId.trim()) {
    return row.dataset.maintenanceId.trim();
  }

  const numberEl = row.querySelector(".maintenance-number");
  const number = numberEl ? numberEl.textContent.trim() : "";

  if (number) {
    row.dataset.maintenanceId = number;
    return number;
  }

  return "";
}

function ensureMaintenanceRecordId(row) {
  return getMaintenanceRecordId(row);
}

function getMaintenanceBulkRows() {
  if (!maintenanceBulkState) {
    const tableBody = document.getElementById("maintenanceTableBody");
    if (!tableBody || typeof getMaintenanceDataRows !== "function") {
      return [];
    }
    return getMaintenanceDataRows(tableBody);
  }

  if (typeof getMaintenanceDataRows === "function") {
    return getMaintenanceDataRows(maintenanceBulkState.tableBody);
  }

  return Array.from(
    maintenanceBulkState.tableBody.querySelectorAll("tr"),
  ).filter((row) => row.querySelector(".maintenance-checkbox"));
}

function getVisibleMaintenanceBulkRows() {
  return getMaintenanceBulkRows().filter(
    (row) => row.style.display !== "none",
  );
}

/**
 * Sync checkboxes + row styles from selectedMaintenanceIds.
 * Does NOT run Search/Filter/Sort/Pagination/Statistics.
 */
function syncMaintenanceSelectionUI() {
  const tableBody =
    maintenanceBulkState?.tableBody ||
    document.getElementById("maintenanceTableBody");
  const selectAll =
    maintenanceBulkState?.selectAll ||
    document.getElementById("selectAllMaintenance");
  const toolbar =
    maintenanceBulkState?.toolbar ||
    document.getElementById("maintenanceBulkToolbar");
  const selectedCount =
    maintenanceBulkState?.selectedCount ||
    document.getElementById("maintenanceSelectedCount");

  if (!tableBody) return;

  const dataRows =
    typeof getMaintenanceDataRows === "function"
      ? getMaintenanceDataRows(tableBody)
      : getMaintenanceBulkRows();

  dataRows.forEach((row) => {
    const id = ensureMaintenanceRecordId(row);
    const checkbox = row.querySelector(".maintenance-checkbox");
    const isSelected = Boolean(id && selectedMaintenanceIds.has(id));

    if (checkbox) {
      checkbox.checked = isSelected;
      if (id) {
        checkbox.setAttribute("aria-label", `Select ${id}`);
        checkbox.dataset.maintenanceId = id;
      }
    }

    row.classList.toggle("is-selected", isSelected);
  });

  const visibleRows = dataRows.filter((row) => row.style.display !== "none");
  const selectedVisibleCount = visibleRows.filter((row) => {
    const id = getMaintenanceRecordId(row);
    return id && selectedMaintenanceIds.has(id);
  }).length;

  const totalSelected = selectedMaintenanceIds.size;
  const allVisibleSelected =
    visibleRows.length > 0 && selectedVisibleCount === visibleRows.length;
  const someVisibleSelected =
    selectedVisibleCount > 0 && !allVisibleSelected;

  if (selectedCount) {
    selectedCount.textContent = `${totalSelected} maintenance selected`;
  }

  if (toolbar) {
    toolbar.classList.toggle("show", totalSelected > 0);
  }

  if (selectAll) {
    selectAll.disabled = visibleRows.length === 0;
    selectAll.checked = allVisibleSelected;
    selectAll.indeterminate = someVisibleSelected;
  }

  const bulkDeleteButton =
    maintenanceBulkState?.bulkDeleteButton ||
    document.getElementById("deleteSelectedMaintenance");

  if (bulkDeleteButton) {
    bulkDeleteButton.disabled =
      totalSelected === 0 || bulkDeleteButton.dataset.processing === "true";
    bulkDeleteButton.setAttribute(
      "aria-label",
      totalSelected === 0
        ? "Delete selected maintenance records"
        : `Delete ${totalSelected} selected maintenance record${
            totalSelected === 1 ? "" : "s"
          }`,
    );
  }
}

/** Alias used by pagination pipeline hook */
function refreshMaintenanceBulkState() {
  syncMaintenanceSelectionUI();
}

function clearMaintenanceSelection() {
  selectedMaintenanceIds.clear();
  syncMaintenanceSelectionUI();
}

function setMaintenanceRowSelected(row, selected) {
  const id = ensureMaintenanceRecordId(row);
  if (!id) return;

  if (selected) {
    selectedMaintenanceIds.add(id);
  } else {
    selectedMaintenanceIds.delete(id);
  }
}

/**
 * When the maintenance number (stable ID) changes on edit, migrate selection.
 */
function migrateMaintenanceSelectionId(oldId, newId) {
  const previous = (oldId || "").trim();
  const next = (newId || "").trim();

  if (!previous || !next || previous === next) return;

  if (selectedMaintenanceIds.has(previous)) {
    selectedMaintenanceIds.delete(previous);
    selectedMaintenanceIds.add(next);
  }
}

function removeMaintenanceSelectionId(id) {
  const key = (id || "").trim();
  if (!key) return;
  selectedMaintenanceIds.delete(key);
}

function requestBulkDeleteMaintenance(opener) {
  const ids = Array.from(selectedMaintenanceIds);

  if (ids.length === 0) {
    return;
  }

  if (typeof openBulkDeleteMaintenanceModal === "function") {
    openBulkDeleteMaintenanceModal(ids, opener || null);
    return;
  }

  /* Fallback if modal API is unavailable */
  const confirmed = window.confirm(
    "Delete " +
      ids.length +
      " selected maintenance record" +
      (ids.length === 1 ? "" : "s") +
      "?\n\nThis action cannot be undone.",
  );

  if (!confirmed) {
    return;
  }

  let successCount = 0;
  let failCount = 0;

  ids.forEach((id) => {
    if (
      typeof deleteMaintenanceRecord === "function" &&
      deleteMaintenanceRecord(id)
    ) {
      successCount += 1;
    } else {
      failCount += 1;
    }
  });

  clearMaintenanceSelection();

  if (typeof refreshMaintenanceTable === "function") {
    refreshMaintenanceTable({
      resetPage: false,
      refreshStatistics: true,
      reason: "bulk-delete",
    });
  }

  if (typeof showToast === "function") {
    if (failCount === 0) {
      showToast(
        "Successfully deleted " + successCount + " maintenance records.",
        "success",
      );
    } else {
      showToast(
        "Successfully deleted " +
          successCount +
          " records. " +
          failCount +
          " could not be deleted.",
        "warning",
      );
    }
  }
}

function initMaintenanceBulkSelection() {
  const tableBody = document.getElementById("maintenanceTableBody");
  const selectAll = document.getElementById("selectAllMaintenance");
  const toolbar = document.getElementById("maintenanceBulkToolbar");
  const selectedCount = document.getElementById("maintenanceSelectedCount");
  const clearButton = document.getElementById("clearMaintenanceSelection");
  const bulkDeleteButton = document.getElementById("deleteSelectedMaintenance");

  if (!tableBody || !selectAll || !toolbar || !selectedCount) {
    return;
  }

  if (tableBody.dataset.maintenanceBulkInitialized === "true") {
    syncMaintenanceSelectionUI();
    return;
  }

  tableBody.dataset.maintenanceBulkInitialized = "true";

  maintenanceBulkState = {
    tableBody,
    selectAll,
    toolbar,
    selectedCount,
    bulkDeleteButton,
  };

  /* Seed stable IDs for existing rows */
  getMaintenanceBulkRows().forEach((row) => {
    ensureMaintenanceRecordId(row);
  });

  selectAll.addEventListener("change", () => {
    const shouldSelect = selectAll.checked;
    const visibleRows = getVisibleMaintenanceBulkRows();

    visibleRows.forEach((row) => {
      setMaintenanceRowSelected(row, shouldSelect);
    });

    /* Select All applies to current page only — do not touch hidden pages */
    syncMaintenanceSelectionUI();
  });

  tableBody.addEventListener("change", (event) => {
    const checkbox = event.target;

    if (!checkbox?.classList?.contains("maintenance-checkbox")) {
      return;
    }

    const row = checkbox.closest("tr");
    if (!row) return;

    setMaintenanceRowSelected(row, checkbox.checked);
    syncMaintenanceSelectionUI();
  });

  clearButton?.addEventListener("click", (event) => {
    event.preventDefault();
    clearMaintenanceSelection();
  });

  bulkDeleteButton?.addEventListener("click", (event) => {
    event.preventDefault();

    if (bulkDeleteButton.disabled) return;

    requestBulkDeleteMaintenance(bulkDeleteButton);
  });

  syncMaintenanceSelectionUI();
}

/** Alias matching other modules */
function initMaintenanceBulkActions() {
  initMaintenanceBulkSelection();
}
