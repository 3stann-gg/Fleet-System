/* ==========================================
   HIMS Fleet - Dispatch Delete
========================================== */

let deleteDispatchModal = null;

function getDeleteDispatchCsrfToken() {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || ""
    );
}

async function deleteDispatchApiRequest(url, options = {}) {
    const method = String(options.method || "GET").toUpperCase();

    const headers = {
        Accept: "application/json",
        ...(options.headers || {}),
    };

    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
        const csrfToken = getDeleteDispatchCsrfToken();

        if (csrfToken) {
            headers["X-CSRF-TOKEN"] = csrfToken;
        }
    }

    const response = await fetch(url, {
        ...options,
        method,
        headers,
        credentials: "same-origin",
    });

    let data = {};

    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok) {
        const requestError = new Error(
            data.message || "Failed to delete dispatch.",
        );
        requestError.status = response.status;
        requestError.data = data;
        throw requestError;
    }

    return data;
}

function openDeleteDispatchModal(row, dispatchId, dispatchNumber) {
    if (!deleteDispatchModal) {
        return;
    }

    const nameElement = deleteDispatchModal.querySelector(
        "#deleteDispatchName",
    );

    if (nameElement) {
        nameElement.textContent = dispatchNumber || "this dispatch";
    }
    deleteDispatchModal.currentRow = row;
    deleteDispatchModal.currentDispatchId = dispatchId;
    deleteDispatchModal.classList.add("show");
    document.body.style.overflow = "hidden";
}


function closeDeleteDispatchModal() {
    if (!deleteDispatchModal) {
        return;
    }

    deleteDispatchModal.classList.remove("show");

    document.body.style.overflow = "";

    delete deleteDispatchModal.currentRow;
    delete deleteDispatchModal.currentDispatchId;
}
async function handleConfirmDeleteDispatch() {
    if (!deleteDispatchModal) {
        return;
    }

    const dispatchId = deleteDispatchModal.currentDispatchId;

    if (!dispatchId) {
        return;
    }

    const confirmButton = deleteDispatchModal.querySelector(
        "#confirmDeleteDispatch",
    );

    if (confirmButton) {
        confirmButton.disabled = true;

        confirmButton.innerHTML = `
            <i class="ph ph-spinner"></i>
            Deleting...
        `;
    }

    try {
        const data = await deleteDispatchApiRequest(
            `/dispatch/${encodeURIComponent(dispatchId)}`,
            {
                method: "DELETE",
            },
        );

        closeDeleteDispatchModal();

        /*
        |--------------------------------------------------------------------------
        | Reload from backend
        |--------------------------------------------------------------------------
        |
        | Better than row.remove() because backend lifecycle may also update:
        |
        | Reservation → Approved
        | Vehicle / Driver → available state when applicable
        |
        */

        if (typeof loadDispatches === "function") {
            await loadDispatches();
        }

        /*
        |--------------------------------------------------------------------------
        | Refresh available reservations
        |--------------------------------------------------------------------------
        |
        | Deleted Dispatch means the Reservation may become available again,
        | provided RoutePlan is still Ready For Dispatch.
        |--------------------------------------------------------------------------
        */

        if (typeof loadAvailableReservations === "function") {
            await loadAvailableReservations();
        }

        if (typeof applyDispatchFilters === "function") {
            applyDispatchFilters({
                resetPage: false,
            });
        }

        if (typeof updateDispatchStatistics === "function") {
            updateDispatchStatistics();
        }

        if (typeof refreshDispatchPagination === "function") {
            refreshDispatchPagination({
                reset: false,
            });
        } else if (typeof updateDispatchPagination === "function") {
            updateDispatchPagination();
        }

        if (typeof refreshDispatchBulkState === "function") {
            refreshDispatchBulkState();
        }

        if (typeof showToast === "function") {
            showToast(
                data.message || "Dispatch deleted successfully.",
                "success",
            );
        }
    } catch (error) {
        console.error("Dispatch deletion error:", error);

        if (typeof showToast === "function") {
            showToast(
                error.message ||
                    "Something went wrong while deleting the dispatch.",
                "error",
            );
        }
    } finally {
        if (confirmButton) {
            confirmButton.disabled = false;

            confirmButton.innerHTML = `
                <i class="ph ph-trash"></i>
                Delete Dispatch
            `;
        }
    }
}
function initDeleteDispatchModal() {
    if (initDeleteDispatchModal.initialized) {
        return;
    }
    deleteDispatchModal = document.getElementById("deleteDispatchModal");
    if (!deleteDispatchModal) {
        return;
    }
    initDeleteDispatchModal.initialized = true;
    document.addEventListener("click", (event) => {
        const deleteButton = event.target.closest(
            ".action-btn.delete-dispatch",
        );

        if (!deleteButton || deleteButton.disabled) {
            return;
        }

        const row = deleteButton.closest("tr");

        if (!row) {
            return;
        }

        const dispatchId = row.dataset.id;

        if (!dispatchId) {
            console.error("Dispatch ID not found.");

            return;
        }
        const status = String(
            row.dataset.status ||
                row.querySelector(".status-badge")?.textContent ||
                "",
        ).trim();

        const deletableStatuses = ["Pending", "Assigned"];

        if (!deletableStatuses.includes(status)) {
            if (typeof showToast === "function") {
                showToast(
                    "Only Pending or Assigned dispatches can be deleted.",
                    "error",
                );
            }

            return;
        }

        const dispatchNumber =
            row.querySelector(".dispatch-number")?.textContent?.trim() ||
            "this dispatch";

        openDeleteDispatchModal(row, dispatchId, dispatchNumber);
    });
    deleteDispatchModal.addEventListener("click", (event) => {
        if (event.target === deleteDispatchModal) {
            closeDeleteDispatchModal();
        }
    });
    deleteDispatchModal
        .querySelector("#cancelDeleteDispatch")
        ?.addEventListener("click", closeDeleteDispatchModal);
    deleteDispatchModal
        .querySelector("#confirmDeleteDispatch")
        ?.addEventListener("click", handleConfirmDeleteDispatch);
    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            deleteDispatchModal.classList.contains("show")
        ) {
            closeDeleteDispatchModal();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initDeleteDispatchModal();
});
