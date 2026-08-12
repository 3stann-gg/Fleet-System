/* ==========================================
   Dispatch Bulk Actions
========================================== */

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

        return checkbox && checkbox.checked === true;
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

    const count = getSelectedDispatchRows().length;

    if (!selectedCountEl) {
        return;
    }

    if (count === 1) {
        selectedCountEl.textContent = "1 dispatch selected";
    } else {
        selectedCountEl.textContent = `${count} dispatches selected`;
    }
}


function updateToolbarVisibility() {
    const toolbar = document.getElementById("dispatchBulkToolbar");

    if (!toolbar) {
        return;
    }

    const selectedCount = getSelectedDispatchRows().length;

    toolbar.classList.toggle("show", selectedCount > 0);
}

function refreshDispatchBulkState() {
    const selectAll = document.getElementById("selectAllDispatches");

    const visibleRows = getVisibleSelectableRows();

    if (selectAll) {
        const selectedVisible = visibleRows.filter((row) => {
            const checkbox = row.querySelector(".dispatch-checkbox");

            return checkbox && checkbox.checked === true;
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

async function handleDeleteSelected() {
    const tableBody = document.getElementById("dispatchTableBody");

    if (!tableBody) {
        return;
    }

    const rowsToDelete = getSelectedDispatchRows();

    if (rowsToDelete.length === 0) {
        return;
    }

    const dispatchIds = rowsToDelete
        .map((row) => row.dataset.id)
        .filter(Boolean);

    if (dispatchIds.length === 0) {
        return;
    }

    const deleteBtn = document.getElementById("deleteSelectedDispatches");

    if (deleteBtn) {
        deleteBtn.disabled = true;
        deleteBtn.textContent = "Deleting...";
    }

    try {
        const response = await fetch("/dispatch/bulk-delete", {
            method: "DELETE",

            headers: {
                "Content-Type": "application/json",

                Accept: "application/json",

                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content"),
            },

            body: JSON.stringify({
                dispatch_ids: dispatchIds,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(data);

            if (typeof showToast === "function") {
                showToast(
                    data.message || "Failed to delete dispatches.",
                    "error",
                );
            }

            return;
        }

        /* Remove successfully deleted rows */
        const deletedIds = (data.deleted_ids || []).map(String);

        rowsToDelete.forEach((row) => {
            const rowId = String(row.dataset.id);

            if (deletedIds.includes(rowId)) {
                row.remove();
            }
        });

        /* Reset select all */
        const selectAll = document.getElementById("selectAllDispatches");

        if (selectAll) {
            selectAll.checked = false;
            selectAll.indeterminate = false;
        }

        refreshDispatchBulkState();

        /* Refresh statistics */
        if (typeof updateDispatchStatistics === "function") {
            updateDispatchStatistics();
        }
        /* Refresh pagination */
        if (typeof updateDispatchPagination === "function") {
            updateDispatchPagination();
        }
        /* Refresh available reservations */
        if (typeof loadAvailableReservations === "function") {
            await loadAvailableReservations();
        }
        if (typeof showToast === "function") {
            showToast(
                data.message || "Dispatches deleted successfully.",
                "success",
            );
        }
    } catch (error) {
        console.error("Bulk dispatch deletion error:", error);

        if (typeof showToast === "function") {
            showToast(
                "Something went wrong while deleting dispatches.",
                "error",
            );
        }
    } finally {
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.textContent = "Delete Selected";
        }
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
    const toolbar = document.getElementById("dispatchBulkToolbar");

    /*
     * Important:
     * If these elements don't exist yet,
     * don't mark initialization as complete.
     */
    if (!tableBody || !selectAll || !clearBtn || !deleteBtn || !toolbar) {
        return;
    }

    dispatchBulkInitialized = true;

    /* Row checkbox */
    tableBody.addEventListener("change", (event) => {
        if (event.target.classList.contains("dispatch-checkbox")) {
            handleCheckboxChange();
        }
    });

    /* Select all */
    selectAll.addEventListener("change", handleSelectAllChange);

    /* Clear */
    clearBtn.addEventListener("click", handleClearSelection);

    /* Bulk delete */
    deleteBtn.addEventListener("click", handleDeleteSelected);

    refreshDispatchBulkState();
}

document.addEventListener("DOMContentLoaded", () => {
    initDispatchBulkActions();
});
