/* ==========================================
   Driver Bulk Actions
========================================== */

let driverBulkState = null;

function getDriverBulkRows() {
  if (!driverBulkState || typeof getDriverDataRows !== "function") {
    return [];
  }

  return getDriverDataRows(driverBulkState.tableBody);
}

function getDriverBulkCheckboxes() {
  return getDriverBulkRows()
    .map((row) => row.querySelector(".driver-checkbox"))
    .filter(Boolean);
}

function getVisibleDriverBulkCheckboxes() {
  return getDriverBulkRows()
    .filter((row) => row.style.display !== "none")
    .map((row) => row.querySelector(".driver-checkbox"))
    .filter(Boolean);
}

function refreshDriverBulkState() {
  if (!driverBulkState) return;

  const {
    selectAll,
    toolbar,
    selectedCount,
  } = driverBulkState;
  const checkboxes = getDriverBulkCheckboxes();
  const visibleCheckboxes = getVisibleDriverBulkCheckboxes();
  const selectedCheckboxes = checkboxes.filter((checkbox) => checkbox.checked);
  const selectedVisibleCheckboxes = visibleCheckboxes.filter(
    (checkbox) => checkbox.checked,
  );
  const allVisibleSelected =
    visibleCheckboxes.length > 0 &&
    selectedVisibleCheckboxes.length === visibleCheckboxes.length;

  selectedCount.textContent = `${selectedCheckboxes.length} driver${
    selectedCheckboxes.length === 1 ? "" : "s"
  } selected`;
  toolbar.classList.toggle("show", selectedCheckboxes.length > 0);
  selectAll.checked = allVisibleSelected;
  selectAll.indeterminate =
    selectedVisibleCheckboxes.length > 0 && !allVisibleSelected;
}

function clearDriverSelection() {
  getDriverBulkCheckboxes().forEach((checkbox) => {
    checkbox.checked = false;
  });

  if (driverBulkState) {
    driverBulkState.selectAll.checked = false;
    driverBulkState.selectAll.indeterminate = false;
  }

  refreshDriverBulkState();
}

function refreshDriverAfterBulkDelete() {
  if (typeof applyDriverFilters === "function") {
    applyDriverFilters();
  } else if (typeof refreshDriverPagination === "function") {
    refreshDriverPagination();
  }

  if (typeof updateDriverStats === "function") {
    updateDriverStats();
  }

  refreshDriverBulkState();
}

function initDriverBulkActions() {
  const tableBody = document.getElementById("driverTableBody");
  const selectAll = document.getElementById("selectAllDrivers");
  const toolbar = document.getElementById("driverBulkToolbar");
  const selectedCount = document.getElementById("driverSelectedCount");
  const clearButton = document.getElementById("clearDriverSelection");
  const deleteButton = document.getElementById("deleteSelectedDrivers");

  if (
    !tableBody ||
    !selectAll ||
    !toolbar ||
    !selectedCount ||
    !deleteButton
  ) {
    return;
  }

  if (tableBody.dataset.driverBulkInitialized === "true") {
    refreshDriverBulkState();
    return;
  }

  tableBody.dataset.driverBulkInitialized = "true";
  driverBulkState = {
    tableBody,
    selectAll,
    toolbar,
    selectedCount,
  };

  selectAll.addEventListener("change", () => {
    getVisibleDriverBulkCheckboxes().forEach((checkbox) => {
      checkbox.checked = selectAll.checked;
    });

    refreshDriverBulkState();
  });

  tableBody.addEventListener("change", (event) => {
    if (!event.target?.classList?.contains("driver-checkbox")) return;

    refreshDriverBulkState();
  });

  clearButton?.addEventListener("click", clearDriverSelection);

  deleteButton.addEventListener("click", () => {
    const selectedRows = getDriverBulkCheckboxes()
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.closest("tr"))
      .filter(Boolean);

    if (selectedRows.length === 0) return;

    selectedRows.forEach((row) => row.remove());
    selectAll.checked = false;
    selectAll.indeterminate = false;
    refreshDriverAfterBulkDelete();

    if (
      typeof window !== "undefined" &&
      typeof window.showToast === "function"
    ) {
      window.showToast("Driver(s) deleted successfully.", "success");
    }
  });

  refreshDriverBulkState();
}
