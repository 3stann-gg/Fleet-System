function initDeleteReservationModal() {
  const modal = document.getElementById("deleteReservationModal");

  if (!modal || modal.dataset.deleteReservationModalInitialized === "true") {
    return;
  }

  modal.dataset.deleteReservationModalInitialized = "true";
  modal.currentRow = null;

  const openModal = (row) => {
    if (!modal || !row) return;

    const reservationNumber = row.querySelector(".reservation-number");
    const numberEl = document.getElementById("deleteReservationName");
    if (numberEl && reservationNumber) {
      numberEl.textContent = reservationNumber.textContent.trim();
    }

    modal.currentRow = row;
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    if (!modal || !modal.classList.contains("show")) return;

    modal.classList.remove("show");
    document.body.style.overflow = "";
    modal.currentRow = null;
  };

  document.body.addEventListener("click", (event) => {
    const button = event.target.closest(".action-btn.delete-reservation");
    if (button) {
      const row = button.closest("tr");
      openModal(row);
    }
  });

  document.getElementById("cancelDeleteReservation")?.addEventListener("click", closeModal);

  document.getElementById("confirmDeleteReservation")?.addEventListener("click", () => {
    if (!modal.currentRow) return;

    modal.currentRow.remove();

    if (typeof updateReservationStatistics === "function") {
      updateReservationStatistics();
    }

    modal.classList.remove("show");
    document.body.style.overflow = "";
    modal.currentRow = null;

    if (typeof showToast === "function") {
      showToast("Reservation deleted successfully.", "success");
    }
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeModal();
    }
  });
}
