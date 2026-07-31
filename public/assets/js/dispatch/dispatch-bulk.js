let dispatchBulkInitialized = false;

function getRealDispatchRows(tableBody) {
  return Array.from(tableBody.querySelectorAll("tr")).filter((row) => {
    return (
      row.querySelector(".dispatch-number") !== null ||
      row.querySelector(".dispatch-checkbox") !== null
    );
  });
}

function getSelectedDispatchRows() {
  const tableBody = document.getElementById("dispatchTableBody");
  if (!tableBody) {
    return [];
  }
  return getRealDispatchRows(tableBody).filter((row) => {
    const checkbox = row.querySelector(".dispatch-checkbox");
    return checkbox !== null && checkbox.checked === true;
  });
}

function getVisibleSelectableRows() {
  const tableBody = document.getElementById("dispatchTableBody");
  if (!tableBody) {
    return [];
  }
  return getRealDispatchRows(tableBody).filter((row) => {
    return (
      row.dataset.dispatchMatchesFilter !== "false" &&
      row.style.display !== "none"
    );
  });
}

function updateSelectedCount() {
  const selectedCountEl = document.getElementById("dispatchSelectedCount");
  const selectedRows = getSelectedDispatchRows();
  const count = selectedRows.length;

  if (selectedCountEl) {
    if (count === 1) {
      selectedCountEl.textContent = "1 dispatch selected";
    } else {
      selectedCountEl.textContent = count + " dispatches selected";
    }
  }
}

function updateToolbarVisibility() {
  const toolbar = document.getElementById("dispatchBulkToolbar");
  const selectedRows = getSelectedDispatchRows();
  const selectedCount = selectedRows.length;

  if (toolbar) {
    toolbar.classList.toggle("show", selectedCount > 0);
  }
}

function refreshDispatchBulkState() {
  const selectAll = document.getElementById("selectAllDispatches");
  const visibleRows = getVisibleSelectableRows();

  if (selectAll) {
    const selectedVisible = visibleRows.filter((row) => {
      const checkbox = row.querySelector(".dispatch-checkbox");
      return checkbox !== null && checkbox.checked === true;
    });

    if (selectedVisible.length === 0) {
      selectAll.checked = false;
      selectAll.indeterminate = false;
    } else if (selectedVisible.length === visibleRows.length) {
      selectAll.checked = true;
      selectAll.indeterminate = false;
    } else {
      selectAll.checked = false;
      selectAll.indeterminate = true;
    }
  }

  updateSelectedCount();
  updateToolbarVisibility();
}

function handleCheckboxChange() {
  refreshDispatchBulkState();
}

function handleSelectAllChange() {
  const selectAll = document.getElementById("selectAllDispatches");
  const tableBody = document.getElementById("dispatchTableBody");

  if (!selectAll || !tableBody) {
    return;
  }

  const rows = getRealDispatchRows(tableBody);
  const shouldCheck = selectAll.checked === true;

  rows.forEach((row) => {
    if (
      row.dataset.dispatchMatchesFilter !== "false" &&
      row.style.display !== "none"
    ) {
      const checkbox = row.querySelector(".dispatch-checkbox");
      if (checkbox) {
        checkbox.checked = shouldCheck;
      }
    }
  });

  refreshDispatchBulkState();
}

function handleClearSelection() {
  const tableBody = document.getElementById("dispatchTableBody");
  if (!tableBody) {
    return;
  }

  const checkboxes = tableBody.querySelectorAll(".dispatch-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  const selectAll = document.getElementById("selectAllDispatches");
  if (selectAll) {
    selectAll.checked = false;
    selectAll.indeterminate = false;
  }

  refreshDispatchBulkState();
}

function handleDeleteSelected() {
  const tableBody = document.getElementById("dispatchTableBody");
  if (!tableBody) {
    return;
  }

  const rowsToDelete = getSelectedDispatchRows();
  if (rowsToDelete.length === 0) {
    return;
  }

  rowsToDelete.forEach((row) => {
    row.remove();
  });

  const selectAll = document.getElementById("selectAllDispatches");
  if (selectAll) {
    selectAll.checked = false;
    selectAll.indeterminate = false;
  }

  refreshDispatchBulkState();

  if (typeof updateDispatchStatistics === "function") {
    updateDispatchStatistics();
  }
  if (typeof updateDispatchPagination === "function") {
    updateDispatchPagination();
  }

  if (typeof showToast === "function") {
    showToast("Dispatch(es) deleted successfully.", "success");
  }
}

function initDispatchBulkActions() {
  if (dispatchBulkInitialized) {
    return;
  }

  const tableBody = document.getElementById("dispatchTableBody");
  const selectAll = document.getElementById("selectAllDispatches");
  const clearBtn = document.getElementById("clearDispatchSelection");
  const deleteBtn = document.getElementById("deleteSelectedDispatches");

  if (!tableBody || !selectAll || !clearBtn || !deleteBtn) {
    return;
  }

  dispatchBulkInitialized = true;

  tableBody.addEventListener("change", (event) => {
    if (event.target.classList.contains("dispatch-checkbox")) {
      handleCheckboxChange();
    }
  });

  selectAll.addEventListener("change", handleSelectAllChange);
  clearBtn.addEventListener("click", handleClearSelection);
  deleteBtn.addEventListener("click", handleDeleteSelected);

  refreshDispatchBulkState();
}
