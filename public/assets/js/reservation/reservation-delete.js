
function initDeleteReservationModal() {
    const modal = document.getElementById("deleteReservationModal");

    if (
        !modal ||
        modal.dataset.deleteReservationModalInitialized === "true"
    ) {
        return;
    }

    modal.dataset.deleteReservationModalInitialized = "true";
    modal.currentRow = null;

    const openModal = (row) => {
        if (!row) return;

        const reservationNumber = row.querySelector(".reservation-number");
        const numberElement = document.getElementById("deleteReservationName");

        if (numberElement && reservationNumber) {
            numberElement.textContent =
                reservationNumber.textContent.trim();
        }

        modal.currentRow = row;

        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        if (!modal.classList.contains("show")) {
            return;
        }

        modal.classList.remove("show");
        document.body.style.overflow = "";
        modal.currentRow = null;
    };

    // Open delete modal
    document.body.addEventListener("click", (event) => {
        const button = event.target.closest(
            ".action-btn.delete-reservation"
        );

        if (!button) return;

        const row = button.closest("tr");

        if (!row) return;

        openModal(row);
    });

    // Cancel
    document.getElementById("cancelDeleteReservation")
        ?.addEventListener("click", closeModal);

    // Confirm delete
    document.getElementById("confirmDeleteReservation")
        ?.addEventListener("click", async () => {
            const row = modal.currentRow;

            if (!row) return;

            const reservationId = row.dataset.id;

            if (!reservationId) return;

            const confirmButton = document.getElementById("confirmDeleteReservation");

            try {
                if (confirmButton) {
                    confirmButton.disabled = true;
                }

                const response = await fetch(
                    `/reservation/${reservationId}`,
                    {
                        method: "DELETE",
                        headers: {
                            Accept: "application/json",
                            "X-CSRF-TOKEN":
                                document.querySelector(
                                    'meta[name="csrf-token"]'
                                ).content,
                        },
                    }
                );
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to delete reservation."
                    );
                }

                if (data.success) {
                    closeModal();

                    // Reload table from database
                    await loadReservations();

                    // Update statistics
                    if (typeof updateReservationStatistics === "function") {
                        updateReservationStatistics();
                    }

                    // Project's styled toast
                    if (typeof window.showToast === "function") {
                        window.showToast(
                            data.message ||
                            "Reservation deleted successfully.",
                            "success"
                        );
                    }
                }
            } catch (error) {
                if (typeof window.showToast === "function") {
                    window.showToast(
                        error.message ||
                        "Failed to delete reservation.",
                        "error"
                    );
                }
            } finally {
                if (confirmButton) {
                    confirmButton.disabled = false;
                }
            }
        });

    // Click outside
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // ESC
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("show")) {
            closeModal();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initDeleteReservationModal();
});