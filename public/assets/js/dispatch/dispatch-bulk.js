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

            credentials: "same-origin",

            body: JSON.stringify({
                dispatch_ids: dispatchIds,
            }),
        });

        let data = {};

        try {
            data = await response.json();
        } catch (error) {
            data = {};
        }

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

        const selectAll = document.getElementById("selectAllDispatches");

        if (selectAll) {
            selectAll.checked = false;

            selectAll.indeterminate = false;
        }

        /*
        |--------------------------------------------------------------------------
        | Reload authoritative backend state
        |--------------------------------------------------------------------------
        |
        | Do not manually remove rows.
        |
        | Backend may have updated Reservation state
        | while deleting valid Dispatch records.
        |--------------------------------------------------------------------------
        */

        if (typeof loadDispatches === "function") {
            await loadDispatches();
        }

        /*
        |--------------------------------------------------------------------------
        | Refresh available reservations
        |--------------------------------------------------------------------------
        |
        | Deleted Pending / Assigned Dispatch records may make their
        | reservations available for Dispatch creation again.
        |--------------------------------------------------------------------------
        */

        if (typeof loadAvailableReservations === "function") {
            await loadAvailableReservations();
        }

        if (typeof refreshDispatchBulkState === "function") {
            refreshDispatchBulkState();
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

        const deletedCount = Array.isArray(data.deleted_ids)
            ? data.deleted_ids.length
            : 0;

        if (typeof showToast === "function") {
            if (deletedCount > 0) {
                showToast(
                    data.message ||
                        `${deletedCount} dispatch${deletedCount === 1 ? "" : "es"} deleted successfully.`,
                    "success",
                );
            } else {
                showToast(
                    data.message || "No selected dispatches could be deleted.",
                    "error",
                );
            }
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
