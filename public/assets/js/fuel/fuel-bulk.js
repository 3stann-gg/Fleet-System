/* ==========================================
   Fuel Bulk Selection + Bulk Delete
========================================== */

const selectedFuelIds = new Set();
let fuelBulkState = null;

function getFuelRecordId(row) {
  if (!row) return "";

  if (row.dataset.fuelId && row.dataset.fuelId.trim()) {
    return row.dataset.fuelId.trim();
  }

  const numberEl = row.querySelector(".fuel-number");
  const number = numberEl ? numberEl.textContent.trim() : "";

  if (number) {
    row.dataset.fuelId = number;
    return number;
  }

  return "";
}

function ensureFuelRecordId(row) {
  return getFuelRecordId(row);
}

function getFuelBulkRows() {
  const tableBody =
    fuelBulkState?.tableBody || document.getElementById("fuelTableBody");

  if (!tableBody) return [];

  if (typeof getFuelDataRows === "function") {
    return getFuelDataRows(tableBody);
  }

  return Array.from(tableBody.querySelectorAll("tr")).filter((row) =>
    row.querySelector(".fuel-checkbox"),
  );
}

function getVisibleFuelBulkRows() {
  return getFuelBulkRows().filter((row) => row.style.display !== "none");
}

/**
 * Sync checkboxes + row styles from selectedFuelIds.
 * Does NOT run Search/Filter/Sort/Pagination/Statistics.
 */
function syncFuelSelectionUI() {
  const tableBody =
    fuelBulkState?.tableBody || document.getElementById("fuelTableBody");
  const selectAll =
    fuelBulkState?.selectAll || document.getElementById("selectAllFuel");
  const toolbar =
    fuelBulkState?.toolbar || document.getElementById("fuelBulkToolbar");
  const selectedCount =
    fuelBulkState?.selectedCount ||
    document.getElementById("fuelSelectedCount");

  if (!tableBody) return;

  const dataRows =
    typeof getFuelDataRows === "function"
      ? getFuelDataRows(tableBody)
      : getFuelBulkRows();

  dataRows.forEach((row) => {
    const id = ensureFuelRecordId(row);
    const checkbox = row.querySelector(".fuel-checkbox");
    const isSelected = Boolean(id && selectedFuelIds.has(id));
    const number =
      row.querySelector(".fuel-number")?.textContent?.trim() || id;

    if (checkbox) {
      checkbox.checked = isSelected;
      if (id) {
        checkbox.setAttribute("aria-label", "Select fuel record " + number);
        checkbox.dataset.fuelId = id;
      }
    }

    row.classList.toggle("is-selected", isSelected);
  });

  const visibleRows = dataRows.filter((row) => row.style.display !== "none");
  const selectedVisibleCount = visibleRows.filter((row) => {
    const id = getFuelRecordId(row);
    return id && selectedFuelIds.has(id);
  }).length;

  const totalSelected = selectedFuelIds.size;
  const allVisibleSelected =
    visibleRows.length > 0 && selectedVisibleCount === visibleRows.length;
  const someVisibleSelected =
    selectedVisibleCount > 0 && !allVisibleSelected;

  if (selectedCount) {
    selectedCount.textContent =
      totalSelected +
      " fuel record" +
      (totalSelected === 1 ? "" : "s") +
      " selected";
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
    fuelBulkState?.bulkDeleteButton ||
    document.getElementById("deleteSelectedFuel");

  if (bulkDeleteButton) {
    bulkDeleteButton.disabled =
      totalSelected === 0 || bulkDeleteButton.dataset.processing === "true";
    bulkDeleteButton.setAttribute(
      "aria-label",
      totalSelected === 0
        ? "Delete selected fuel records"
        : "Delete " +
            totalSelected +
            " selected fuel record" +
            (totalSelected === 1 ? "" : "s"),
    );
  }
}

function refreshFuelBulkState() {
  syncFuelSelectionUI();
}

function clearFuelSelection() {
  selectedFuelIds.clear();
  syncFuelSelectionUI();
}

function setFuelRowSelected(row, selected) {
  const id = ensureFuelRecordId(row);
  if (!id) return;

  if (selected) {
    selectedFuelIds.add(id);
  } else {
    selectedFuelIds.delete(id);
  }
}

function removeFuelSelectionId(id) {
  const key = (id || "").trim();
  if (!key) return;
  selectedFuelIds.delete(key);
}

function requestBulkDeleteFuel(opener) {
  const ids = Array.from(selectedFuelIds);
  if (ids.length === 0) return;

  if (typeof openBulkDeleteFuelModal === "function") {
    openBulkDeleteFuelModal(ids, opener || null);
    return;
  }

  const confirmed = window.confirm(
    "Delete " +
      ids.length +
      " selected fuel record" +
      (ids.length === 1 ? "" : "s") +
      "?\n\nThis action cannot be undone.",
  );

  if (!confirmed) return;

  let successCount = 0;
  let failCount = 0;

  ids.forEach((id) => {
    if (typeof deleteFuelRecord === "function" && deleteFuelRecord(id)) {
      successCount += 1;
    } else {
      failCount += 1;
    }
  });

  clearFuelSelection();

  if (typeof refreshFuelTable === "function") {
    refreshFuelTable({
      resetPage: false,
      refreshStatistics: true,
      reason: "bulk-delete",
    });
  }

  if (typeof showToast === "function") {
    if (failCount === 0) {
      showToast(
        "Successfully deleted " + successCount + " fuel records.",
        "success",
      );
    } else {
      showToast(
        "Successfully deleted " +
          successCount +
          " fuel records. " +
          failCount +
          " could not be deleted.",
        "warning",
      );
    }
  }
}

function initFuelBulkSelection() {
  const tableBody = document.getElementById("fuelTableBody");
  const selectAll = document.getElementById("selectAllFuel");
  const toolbar = document.getElementById("fuelBulkToolbar");
  const selectedCount = document.getElementById("fuelSelectedCount");
  const clearButton = document.getElementById("clearFuelSelection");
  const bulkDeleteButton = document.getElementById("deleteSelectedFuel");

  if (!tableBody || !selectAll || !toolbar || !selectedCount) {
    return;
  }

  if (tableBody.dataset.fuelBulkInitialized === "true") {
    syncFuelSelectionUI();
    return;
  }

  tableBody.dataset.fuelBulkInitialized = "true";

  fuelBulkState = {
    tableBody,
    selectAll,
    toolbar,
    selectedCount,
    bulkDeleteButton,
  };

  getFuelBulkRows().forEach((row) => {
    ensureFuelRecordId(row);
  });

  selectAll.addEventListener("change", () => {
    const shouldSelect = selectAll.checked;
    getVisibleFuelBulkRows().forEach((row) => {
      setFuelRowSelected(row, shouldSelect);
    });
    syncFuelSelectionUI();
  });

  tableBody.addEventListener("change", (event) => {
    const checkbox = event.target;
    if (!checkbox?.classList?.contains("fuel-checkbox")) return;

    const row = checkbox.closest("tr");
    if (!row) return;

    setFuelRowSelected(row, checkbox.checked);
    syncFuelSelectionUI();
  });

  clearButton?.addEventListener("click", (event) => {
    event.preventDefault();
    clearFuelSelection();
  });

  bulkDeleteButton?.addEventListener("click", (event) => {
    event.preventDefault();
    if (bulkDeleteButton.disabled) return;
    requestBulkDeleteFuel(bulkDeleteButton);
  });

  syncFuelSelectionUI();
}

function initFuelBulkActions() {
  initFuelBulkSelection();
}
