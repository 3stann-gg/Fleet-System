/* ==========================================
   Dispatch Delete
========================================== */

let deleteDispatchModal = null;

function initDeleteDispatchModal() {
    if (initDeleteDispatchModal.initialized) {
        return;
    }

    initDeleteDispatchModal.initialized = true;
    deleteDispatchModal = document.getElementById("deleteDispatchModal");

    if (!deleteDispatchModal) {
        return;
    }

    document.addEventListener("click", (event) => {
        const deleteButton = event.target.closest(
            ".action-btn.delete-dispatch",
        );

        if (!deleteButton) {
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

        const dispatchNumber =
            row.querySelector(".dispatch-number")?.textContent?.trim() ||
            "this dispatch";

        const nameElement = deleteDispatchModal.querySelector(
            "#deleteDispatchName",
        );

        if (nameElement) {
            nameElement.textContent = dispatchNumber;
        }

        deleteDispatchModal.currentRow = row;
        deleteDispatchModal.currentDispatchId = dispatchId;

        deleteDispatchModal.classList.add("show");
        document.body.style.overflow = "hidden";
    });

    deleteDispatchModal.addEventListener("click", (event) => {
        if (event.target === deleteDispatchModal) {
            closeDeleteDispatchModal();
        }
    });

    const cancelButton = deleteDispatchModal.querySelector(
        "#cancelDeleteDispatch",
    );

    if (cancelButton) {
        cancelButton.addEventListener("click", closeDeleteDispatchModal);
    }

    const confirmButton = deleteDispatchModal.querySelector(
        "#confirmDeleteDispatch",
    );

    if (confirmButton) {
        confirmButton.addEventListener("click", handleConfirmDeleteDispatch);
    }

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            deleteDispatchModal.classList.contains("show")
        ) {
            closeDeleteDispatchModal();
        }
    });
}

async function handleConfirmDeleteDispatch() {
    if (!deleteDispatchModal) {
        return;
    }

    const row = deleteDispatchModal.currentRow;
    const dispatchId = deleteDispatchModal.currentDispatchId;

    if (!row || !dispatchId) {
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
        const response = await fetch(`/dispatch/${dispatchId}`, {
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
            console.error(data);

            if (typeof showToast === "function") {
                showToast(
                    data.message || "Failed to delete dispatch.",
                    "error",
                );
            }

            return;
        }

        row.remove();

        closeDeleteDispatchModal();

        /* Refresh UI */
        if (typeof updateDispatchStatistics === "function") {
            updateDispatchStatistics();
        }
        if (typeof updateDispatchPagination === "function") {
            updateDispatchPagination();
        }
        if (typeof refreshDispatchBulkState === "function") {
            refreshDispatchBulkState();
        }
        if (typeof loadAvailableReservations === "function") {
            await loadAvailableReservations();
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

function closeDeleteDispatchModal() {
    if (!deleteDispatchModal) {
        return;
    }

    deleteDispatchModal.classList.remove("show");

    document.body.style.overflow = "";

    delete deleteDispatchModal.currentRow;
    delete deleteDispatchModal.currentDispatchId;
}

document.addEventListener("DOMContentLoaded", () => {
    initDeleteDispatchModal();
});
