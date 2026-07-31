let viewDispatchInitialized = false;

function openViewDispatchModal() {
  const modal = document.getElementById("viewDispatchModal");

  if (!modal) {
    return;
  }

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeViewDispatchModal() {
  const modal = document.getElementById("viewDispatchModal");

  if (!modal) {
    return;
  }

  modal.classList.remove("show");
  document.body.style.overflow = "";

  if (modal.currentRow) {
    modal.currentRow = null;
  }
}

function initViewDispatchModal() {
  if (viewDispatchInitialized) {
    return;
  }

  viewDispatchInitialized = true;

  const modal = document.getElementById("viewDispatchModal");

  if (!modal) {
    return;
  }

  document.body.addEventListener("click", (event) => {
    const viewBtn = event.target.closest(".action-btn.view-dispatch");

    if (!viewBtn) {
      return;
    }

    const row = viewBtn.closest("tr");

    if (!row) {
      openViewDispatchModal();
      return;
    }

    const statusEl = document.getElementById("viewDispatchStatus");
    const statusText =
      row.querySelector(".status-badge")?.textContent?.trim() || "";

    if (statusEl) {
      statusEl.className = "status-badge";
      statusEl.textContent = statusText;

      const statusClassMap = {
        Pending: "pending",
        Assigned: "scheduled",
        "En Route": "trip",
        Arrived: "approved",
        Completed: "completed",
        Cancelled: "cancelled",
      };

      const statusClass =
        statusClassMap[statusText] ||
        statusText.toLowerCase().replace(/\s+/g, "-");

      statusEl.classList.add(statusClass);
    }

    const numberEl = document.getElementById("viewDispatchNumber");
    if (numberEl) {
      numberEl.textContent =
        row.querySelector(".dispatch-number")?.textContent?.trim() || "";
    }

    const reservationEl = document.getElementById("viewDispatchReservation");
    if (reservationEl) {
      reservationEl.textContent =
        row.querySelector(".dispatch-reservation-number")?.textContent?.trim() ||
        "";
    }

    const patientEl = document.getElementById("viewDispatchPatient");
    if (patientEl) {
      patientEl.textContent =
        row.querySelector(".dispatch-patient-name")?.textContent?.trim() || "";
    }

    const requestTypeEl = document.getElementById("viewDispatchRequestType");
    if (requestTypeEl) {
      requestTypeEl.textContent =
        row.querySelector(".dispatch-request-type")?.textContent?.trim() ||
        row.dataset.requestType ||
        "";
    }

    const vehicleEl = document.getElementById("viewDispatchVehicle");
    if (vehicleEl) {
      vehicleEl.textContent =
        row.querySelector(".dispatch-vehicle")?.textContent?.trim() || "";
    }

    const driverEl = document.getElementById("viewDispatchDriver");
    if (driverEl) {
      driverEl.textContent =
        row.querySelector(".dispatch-driver")?.textContent?.trim() || "";
    }

    const pickupEl = document.getElementById("viewDispatchPickup");
    if (pickupEl) {
      pickupEl.textContent = row.dataset.pickup || "";
    }

    const destinationEl = document.getElementById("viewDispatchDestination");
    if (destinationEl) {
      destinationEl.textContent = row.dataset.destination || "";
    }

    const scheduleEl = document.getElementById("viewDispatchSchedule");
    if (scheduleEl) {
      scheduleEl.textContent =
        row.querySelector(".dispatch-schedule")?.textContent?.trim() || "";
    }

    const priorityEl = document.getElementById("viewDispatchPriority");
    if (priorityEl) {
      priorityEl.textContent =
        row.querySelector(".dispatch-priority")?.textContent?.trim() ||
        row.dataset.priority ||
        "";
    }

    const contactEl = document.getElementById("viewDispatchContact");
    if (contactEl) {
      contactEl.textContent = row.dataset.contact || "Not provided";
    }

    const notesEl = document.getElementById("viewDispatchNotes");
    if (notesEl) {
      notesEl.textContent = row.dataset.notes || "Not provided";
    }

    modal.currentRow = row;

    openViewDispatchModal();
  });

  const closeXBtn = document.getElementById("closeViewDispatchModal");

  if (closeXBtn) {
    closeXBtn.addEventListener("click", closeViewDispatchModal);
  }

  const closeBtn = document.getElementById("closeViewDispatchBtn");

  if (closeBtn) {
    closeBtn.addEventListener("click", closeViewDispatchModal);
  }

  const editFromViewBtn = document.getElementById("editDispatchFromViewBtn");

  if (editFromViewBtn) {
    editFromViewBtn.addEventListener("click", () => {
      const viewModal = document.getElementById("viewDispatchModal");
      const editModal = document.getElementById("editDispatchModal");

      if (!viewModal || !editModal || !viewModal.currentRow) {
        return;
      }

      editModal.currentRow = viewModal.currentRow;
      populateEditDispatchForm(viewModal.currentRow);
      closeViewDispatchModal();
      openEditDispatchModal();
    });
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeViewDispatchModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeViewDispatchModal();
    }
  });
}
