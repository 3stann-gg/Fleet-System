/* ==========================================
   Maintenance Bulk Selection + Bulk Delete
   Uses database IDs only.
========================================== */

const selectedMaintenanceIds = new Set();

let maintenanceBulkState = null;

function getMaintenanceRecordId(row) {
    if (!row) {
        return "";
    }

    const id = (row.dataset.id || "").trim();

    if (!id || !/^\d+$/.test(id)) {
        return "";
    }

    return id;
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

    if (!tableBody) {
        return;
    }

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
                checkbox.dataset.id = id;

                checkbox.setAttribute(
                    "aria-label",
                    `Select maintenance ${row.querySelector(".maintenance-number")?.textContent?.trim() || id}`,
                );
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
    const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

    if (selectedCount) {
        selectedCount.textContent =
            totalSelected === 1
                ? "1 maintenance selected"
                : `${totalSelected} maintenance records selected`;
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
            totalSelected === 0 ||
            bulkDeleteButton.dataset.processing === "true";

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

function refreshMaintenanceBulkState() {
    syncMaintenanceSelectionUI();
}

function clearMaintenanceSelection() {
    selectedMaintenanceIds.clear();

    syncMaintenanceSelectionUI();
}

function setMaintenanceRowSelected(row, selected) {
    const id = ensureMaintenanceRecordId(row);

    if (!id) {
        return;
    }

    if (selected) {
        selectedMaintenanceIds.add(id);
    } else {
        selectedMaintenanceIds.delete(id);
    }
}

function removeMaintenanceSelectionId(id) {
    const key = String(id || "").trim();

    if (!key) {
        return;
    }

    selectedMaintenanceIds.delete(key);
}

function requestBulkDeleteMaintenance(opener) {
    const ids = Array.from(selectedMaintenanceIds);

    if (ids.length === 0) {
        return;
    }

    const validIds = ids.filter((id) => /^\d+$/.test(String(id)));

    if (validIds.length === 0) {
        return;
    }

    if (typeof openBulkDeleteMaintenanceModal === "function") {
        openBulkDeleteMaintenanceModal(validIds, opener || null);

        return;
    }

    const confirmed = window.confirm(
        "Delete " +
            validIds.length +
            " selected maintenance record" +
            (validIds.length === 1 ? "" : "s") +
            "?\n\nThis action cannot be undone.",
    );

    if (!confirmed) {
        return;
    }

    if (typeof showToast === "function") {
        showToast("Delete confirmation is unavailable.", "error");
    }
}

function initMaintenanceBulkSelection() {
    const tableBody = document.getElementById("maintenanceTableBody");
    const selectAll = document.getElementById("selectAllMaintenance");
    const toolbar = document.getElementById("maintenanceBulkToolbar");
    const selectedCount = document.getElementById("maintenanceSelectedCount");
    const clearButton = document.getElementById("clearMaintenanceSelection");
    const bulkDeleteButton = document.getElementById(
        "deleteSelectedMaintenance",
    );

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

    getMaintenanceBulkRows().forEach((row) => {
        ensureMaintenanceRecordId(row);
    });

    selectAll.addEventListener("change", () => {
        const shouldSelect = selectAll.checked;

        const visibleRows = getVisibleMaintenanceBulkRows();

        visibleRows.forEach((row) => {
            setMaintenanceRowSelected(row, shouldSelect);
        });

        syncMaintenanceSelectionUI();
    });

    tableBody.addEventListener("change", (event) => {
        const checkbox = event.target;

        if (!checkbox?.classList?.contains("maintenance-checkbox")) {
            return;
        }

        const row = checkbox.closest("tr");

        if (!row) {
            return;
        }

        setMaintenanceRowSelected(row, checkbox.checked);

        syncMaintenanceSelectionUI();
    });

    clearButton?.addEventListener("click", (event) => {
        event.preventDefault();

        clearMaintenanceSelection();
    });

    bulkDeleteButton?.addEventListener("click", (event) => {
        event.preventDefault();

        if (bulkDeleteButton.disabled) {
            return;
        }

        requestBulkDeleteMaintenance(bulkDeleteButton);
    });

    syncMaintenanceSelectionUI();
}

function initMaintenanceBulkActions() {
    initMaintenanceBulkSelection();
}

document.addEventListener("DOMContentLoaded", () => {
    initMaintenanceBulkSelection();
});
