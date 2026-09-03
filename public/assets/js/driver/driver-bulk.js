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

  deleteButton.addEventListener("click", async () => {
      const ids = getDriverBulkCheckboxes()
          .filter(checkbox => checkbox.checked)
          .map(checkbox => checkbox.dataset.id);
      if (ids.length === 0) return;

      try {

          const response = await fetch("/drivers/bulk-delete", {
              method: "DELETE",
              headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                  "X-CSRF-TOKEN": document
                      .querySelector('meta[name="csrf-token"]').content
              },
              body: JSON.stringify({
                  ids: ids
              })
          });

          const data = await response.json();

          if (!response.ok) {
              window.showToast(
                  data.message || "Failed to delete drivers.",
                  "error"
              );
              return;

          }
          clearDriverSelection();
          loadDrivers();
          if (typeof loadDriverVehicleOptions === "function") {
              await loadDriverVehicleOptions();
          }
          window.showToast(
              data.message,
              "success"
          );
      }
      catch (error) {
          console.error(error);
          window.showToast(
              "Failed to delete drivers.",
              "error"
          );
      }

  });
  
  refreshDriverBulkState();
}

document.addEventListener("DOMContentLoaded", () => {
    initDriverBulkActions();
});