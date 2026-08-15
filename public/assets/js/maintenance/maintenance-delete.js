/* ==========================================
   Maintenance Delete
========================================== */

let deleteMaintenanceInitialized = false;

const deleteMaintenanceModal = {
    currentRow: null,
    opener: null,
    mode: "single", // "single" | "bulk"
    bulkIds: [],
};

function getMaintenanceDatabaseId(row) {
    if (!row) {
        return "";
    }

    const id = (row.dataset.id || "").trim();

    if (!id || !/^\d+$/.test(id)) {
        return "";
    }

    return id;
}

function populateDeleteMaintenance(row) {
    if (!row) {
        return;
    }

    const getText = (selector, fallback = "Not available") => {
        const el = row.querySelector(selector);

        return el ? el.textContent.trim() : fallback;
    };

    const setText = (id, value) => {
        const el = document.getElementById(id);

        if (el) {
            el.textContent = value;
        }
    };

    const number = getText(".maintenance-number");

    const vehicle = getText(".maintenance-vehicle");

    setText("deleteMaintenanceNumber", number);

    setText("deleteMaintenanceVehicle", vehicle);

    const title = document.getElementById("deleteMaintenanceModalTitle");

    const description = document.getElementById(
        "deleteMaintenanceModalDescription",
    );

    const confirmButton = document.getElementById("confirmDeleteMaintenance");

    if (title) {
        title.textContent = "Delete Maintenance Record";
    }

    if (description) {
        description.innerHTML =
            "Are you sure you want to delete " +
            "<strong>" +
            number +
            "</strong> for <strong>" +
            vehicle +
            "</strong>?";
    }

    if (confirmButton) {
        confirmButton.innerHTML =
            '<i class="ph ph-trash"></i> Delete Maintenance';
    }
}

/* ==========================================
   Populate Bulk Delete Modal
========================================== */

function populateBulkDeleteMaintenance(count) {
    const title = document.getElementById("deleteMaintenanceModalTitle");

    const description = document.getElementById(
        "deleteMaintenanceModalDescription",
    );

    const confirmButton = document.getElementById("confirmDeleteMaintenance");

    const safeCount = Number(count) || 0;

    if (title) {
        title.textContent = "Delete Selected Maintenance Records";
    }

    if (description) {
        description.textContent =
            "Delete " +
            safeCount +
            " selected maintenance record" +
            (safeCount === 1 ? "" : "s") +
            "?";
    }

    if (confirmButton) {
        confirmButton.innerHTML = '<i class="ph ph-trash"></i> Delete Selected';
    }
}

/* ==========================================
   Open Single Delete Modal
========================================== */

function openDeleteMaintenanceModal(row, opener) {
    const modal = document.getElementById("deleteMaintenanceModal");

    if (!modal || !row) {
        return;
    }

    const maintenanceId = getMaintenanceDatabaseId(row);

    if (!maintenanceId) {
        console.error("Invalid maintenance database ID:", row.dataset.id);

        if (typeof showToast === "function") {
            showToast("Invalid maintenance record ID.", "error");
        }

        return;
    }

    deleteMaintenanceModal.mode = "single";

    deleteMaintenanceModal.bulkIds = [];

    deleteMaintenanceModal.currentRow = row;

    deleteMaintenanceModal.opener = opener || null;

    modal.dataset.maintenanceId = maintenanceId;

    populateDeleteMaintenance(row);

    modal.classList.add("show");

    document.body.style.overflow = "hidden";

    const cancelBtn = document.getElementById("cancelDeleteMaintenance");

    if (cancelBtn) {
        cancelBtn.focus();
    }
}

function openBulkDeleteMaintenanceModal(ids, opener) {
    const modal = document.getElementById("deleteMaintenanceModal");

    if (!modal) {
        return;
    }

    const bulkIds = Array.isArray(ids)
        ? ids.map((id) => String(id).trim()).filter((id) => /^\d+$/.test(id))
        : [];

    if (bulkIds.length === 0) {
        return;
    }

    deleteMaintenanceModal.mode = "bulk";

    deleteMaintenanceModal.bulkIds = [...new Set(bulkIds)];

    deleteMaintenanceModal.currentRow = null;

    deleteMaintenanceModal.opener = opener || null;

    populateBulkDeleteMaintenance(deleteMaintenanceModal.bulkIds.length);

    modal.classList.add("show");

    document.body.style.overflow = "hidden";

    const cancelBtn = document.getElementById("cancelDeleteMaintenance");

    if (cancelBtn) {
        cancelBtn.focus();
    }
}

/* ==========================================
   Close Modal
========================================== */

function closeDeleteMaintenanceModal(opener = null) {
    const modal = document.getElementById("deleteMaintenanceModal");

    if (!modal || !modal.classList.contains("show")) {
        return;
    }

    modal.classList.remove("show");

    document.body.style.overflow = "";

    deleteMaintenanceModal.currentRow = null;

    deleteMaintenanceModal.bulkIds = [];

    deleteMaintenanceModal.mode = "single";

    delete modal.dataset.maintenanceId;

    const focusTarget = opener || deleteMaintenanceModal.opener;

    deleteMaintenanceModal.opener = null;

    if (focusTarget && focusTarget.isConnected) {
        focusTarget.focus();
    }
}

async function confirmSingleMaintenanceDelete() {
    const row = deleteMaintenanceModal.currentRow;

    const opener = deleteMaintenanceModal.opener;

    if (!row || !row.isConnected) {
        closeDeleteMaintenanceModal(opener);

        return;
    }

    const maintenanceId = getMaintenanceDatabaseId(row);

    if (!maintenanceId) {
        closeDeleteMaintenanceModal(opener);

        if (typeof showToast === "function") {
            showToast("Invalid maintenance record ID.", "error");
        }

        return;
    }

    const confirmButton = document.getElementById("confirmDeleteMaintenance");

    if (confirmButton) {
        confirmButton.disabled = true;

        confirmButton.innerHTML = '<i class="ph ph-spinner"></i> Deleting...';
    }

    try {
        const response = await fetch(`/maintenance/${maintenanceId}`, {
            method: "DELETE",

            headers: {
                Accept: "application/json",

                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content"),
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to delete maintenance record.",
            );
        }

        closeDeleteMaintenanceModal(opener);

        if (typeof loadMaintenances === "function") {
            await loadMaintenances();
        }

        if (typeof loadAvailableMaintenanceVehicles === "function") {
            await loadAvailableMaintenanceVehicles();
        }

        if (typeof updateMaintenanceStatistics === "function") {
            updateMaintenanceStatistics();
        }

        if (typeof updateMaintenancePagination === "function") {
            updateMaintenancePagination();
        }

        if (typeof refreshMaintenanceBulkState === "function") {
            refreshMaintenanceBulkState();
        }

        if (typeof showToast === "function") {
            showToast(
                data.message || "Maintenance record deleted successfully.",
                "success",
            );
        }
    } catch (error) {
        console.error("Maintenance delete error:", error);

        if (typeof showToast === "function") {
            showToast(
                error.message || "Failed to delete maintenance record.",
                "error",
            );
        }
    } finally {
        if (confirmButton) {
            confirmButton.disabled = false;

            confirmButton.innerHTML =
                '<i class="ph ph-trash"></i> Delete Maintenance';
        }
    }
}

async function confirmBulkMaintenanceDelete() {
    const opener = deleteMaintenanceModal.opener;

    const bulkIds = [
        ...new Set(
            deleteMaintenanceModal.bulkIds
                .map((id) => String(id).trim())
                .filter((id) => /^\d+$/.test(id)),
        ),
    ];

    if (bulkIds.length === 0) {
        closeDeleteMaintenanceModal(opener);

        return;
    }

    const confirmButton = document.getElementById("confirmDeleteMaintenance");

    if (confirmButton) {
        confirmButton.disabled = true;

        confirmButton.innerHTML = '<i class="ph ph-spinner"></i> Deleting...';
    }

    try {
        const response = await fetch("/maintenance/bulk-delete", {
            method: "DELETE",

            headers: {
                "Content-Type": "application/json",

                Accept: "application/json",

                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content"),
            },

            body: JSON.stringify({
                maintenance_ids: bulkIds,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to delete maintenance records.",
            );
        }

        const deletedIds = (data.deleted_ids || []).map((id) => String(id));

        closeDeleteMaintenanceModal(opener);

        if (typeof loadMaintenances === "function") {
            await loadMaintenances();
        }

        if (typeof loadAvailableMaintenanceVehicles === "function") {
            await loadAvailableMaintenanceVehicles();
        }

        if (typeof updateMaintenanceStatistics === "function") {
            updateMaintenanceStatistics();
        }

        if (typeof updateMaintenancePagination === "function") {
            updateMaintenancePagination();
        }

        if (typeof refreshMaintenanceBulkState === "function") {
            refreshMaintenanceBulkState();
        }

        if (typeof showToast === "function") {
            showToast(
                data.message ||
                    (deletedIds.length === 1
                        ? "Maintenance record deleted successfully."
                        : deletedIds.length +
                          " maintenance records deleted successfully."),
                "success",
            );
        }
    } catch (error) {
        console.error("Bulk maintenance delete error:", error);

        if (typeof showToast === "function") {
            showToast(
                error.message || "Failed to delete maintenance records.",
                "error",
            );
        }
    } finally {
        if (confirmButton) {
            confirmButton.disabled = false;

            confirmButton.innerHTML =
                '<i class="ph ph-trash"></i> Delete Selected';
        }
    }
}

function initDeleteMaintenanceModal() {
    if (deleteMaintenanceInitialized) {
        return;
    }

    const modal = document.getElementById("deleteMaintenanceModal");

    if (!modal || modal.dataset.deleteMaintenanceModalInitialized === "true") {
        return;
    }

    modal.dataset.deleteMaintenanceModalInitialized = "true";

    deleteMaintenanceModal.currentRow = null;

    deleteMaintenanceModal.bulkIds = [];

    deleteMaintenanceModal.mode = "single";

    document.addEventListener("click", (event) => {
        const deleteButton = event.target.closest(
            ".action-btn.delete-maintenance",
        );

        if (!deleteButton) {
            return;
        }

        const row = deleteButton.closest("tr");

        if (row) {
            openDeleteMaintenanceModal(row, deleteButton);
        }
    });

    const closeButton = document.getElementById("closeDeleteMaintenanceModal");

    if (closeButton) {
        closeButton.addEventListener("click", () => {
            closeDeleteMaintenanceModal(deleteMaintenanceModal.opener);
        });
    }

    const cancelButton = document.getElementById("cancelDeleteMaintenance");

    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            closeDeleteMaintenanceModal(deleteMaintenanceModal.opener);
        });
    }

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeDeleteMaintenanceModal(deleteMaintenanceModal.opener);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("show")) {
            closeDeleteMaintenanceModal(deleteMaintenanceModal.opener);
        }
    });

    const confirmButton = document.getElementById("confirmDeleteMaintenance");

    if (confirmButton) {
        confirmButton.addEventListener("click", async () => {
            if (deleteMaintenanceModal.mode === "bulk") {
                await confirmBulkMaintenanceDelete();
                return;
            }

            await confirmSingleMaintenanceDelete();
        });
    }

    deleteMaintenanceInitialized = true;
}

document.addEventListener("DOMContentLoaded", () => {
    initDeleteMaintenanceModal();
});
