function initViewReservationModal() {
  const modal = document.getElementById("viewReservationModal");

  if (!modal || modal.dataset.viewReservationModalInitialized === "true") {
    return;
  }

  modal.dataset.viewReservationModalInitialized = "true";

  const NOT_PROVIDED = "Not provided";

  const statusClassMap = {
    Pending: "pending",
    Approved: "trip",
    Scheduled: "scheduled",
    Completed: "completed",
    Rejected: "rejected",
    Cancelled: "cancelled",
  };

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value != null && String(value).trim() !== "" ? value : NOT_PROVIDED;
    }
  };

  const getRowText = (row, selector) => {
    const el = row.querySelector(selector);
    return el ? el.textContent.trim() : "";
  };

  const populateViewReservation = (row) => {
    if (!row) return;

    setText("viewReservationNumber", getRowText(row, ".reservation-number"));
    setText("viewReservationType", row.dataset.requestType || "");
    setText("viewReservationPatient", getRowText(row, ".patient-name"));
    setText("viewReservationVehicle", getRowText(row, ".reservation-vehicle"));
    setText("viewReservationDriver", getRowText(row, ".reservation-driver"));
    setText("viewReservationPickup", getRowText(row, ".reservation-pickup"));
    setText("viewReservationDestination", getRowText(row, ".reservation-destination"));
    setText("viewReservationSchedule", getRowText(row, ".reservation-schedule"));
    setText("viewReservationPriority", row.dataset.priority || "");
    setText("viewReservationContact", row.dataset.contact || "");
    setText("viewReservationNotes", row.dataset.notes || "");

    const statusBadge = row.querySelector(".status-badge");
    const statusEl = document.getElementById("viewReservationStatusSummary");
    const statusText = statusBadge ? statusBadge.textContent.trim() : "";
    if (statusEl) {
      statusEl.className = "status-badge";
      statusEl.textContent = statusText || NOT_PROVIDED;
      if (statusClassMap[statusText]) {
        statusEl.classList.add(statusClassMap[statusText]);
      }
    }
  };

  document.body.addEventListener("click", (event) => {
    const button = event.target.closest(".action-btn.view-reservation");
    if (button) {
      const row = button.closest("tr");
      modal.currentRow = row;
      populateViewReservation(row);
      openReservationModal(modal);
    }
  });

  document
    .getElementById("closeViewReservationModal")
    ?.addEventListener("click", () => {
      closeReservationModal(modal);
    });

  document.getElementById("closeViewReservationBtn")?.addEventListener("click", () => {
    closeReservationModal(modal);
  });

  document
    .getElementById("editReservationFromViewBtn")
    ?.addEventListener("click", () => {
      const row = modal.currentRow;
      const editModal = document.getElementById("editReservationModal");

      if (
        !row ||
        !editModal ||
        typeof populateEditReservationForm !== "function" ||
        typeof openEditReservationModal !== "function"
      ) {
        return;
      }

      closeReservationModal(modal);
      populateEditReservationForm(row);
      openEditReservationModal(row);
    });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeReservationModal(modal);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeReservationModal(modal);
    }
  });
}
