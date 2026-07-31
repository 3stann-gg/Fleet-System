function openReservationModal(modal) {
  if (!modal) return;

  if (!modal.classList.contains("show")) {
    modal.dataset.previousBodyOverflow = document.body.style.overflow;
  }

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeReservationModal(modal) {
  if (!modal || !modal.classList.contains("show")) return;

  modal.classList.remove("show");
  document.body.style.overflow = modal.dataset.previousBodyOverflow || "";
  delete modal.dataset.previousBodyOverflow;
}

function showReservationFieldError(field, message) {
  if (!field) return;
  field.classList.add("is-invalid");
  const formGroup = field.closest(".form-group");
  if (formGroup) {
    let errorEl = formGroup.querySelector(".invalid-feedback");
    if (!errorEl) {
      errorEl = document.createElement("div");
      errorEl.className = "invalid-feedback";
      formGroup.appendChild(errorEl);
    }
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }
}

function clearReservationFieldError(field) {
  if (!field) return;
  field.classList.remove("is-invalid");
  const formGroup = field.closest(".form-group");
  if (formGroup) {
    const errorEl = formGroup.querySelector(".invalid-feedback");
    if (errorEl) {
      errorEl.style.display = "none";
    }
  }
}

function clearAllReservationErrors(form) {
  if (!form) return;
  form.querySelectorAll(".is-invalid").forEach((field) => {
    clearReservationFieldError(field);
  });
}

function validateReservationForm(form) {
  if (!form) return false;
  clearAllReservationErrors(form);

  const reservationNumber = document.getElementById("reservationNumber");
  const reservationPatient = document.getElementById("reservationPatient");
  const reservationType = document.getElementById("reservationType");
  const reservationVehicle = document.getElementById("reservationVehicle");
  const reservationDriver = document.getElementById("reservationDriver");
  const reservationPickup = document.getElementById("reservationPickup");
  const reservationDestination = document.getElementById("reservationDestination");
  const reservationDate = document.getElementById("reservationDate");
  const reservationTime = document.getElementById("reservationTime");
  const reservationPriority = document.getElementById("reservationPriority");
  const reservationStatus = document.getElementById("reservationStatus");
  const reservationContact = document.getElementById("reservationContact");

  let firstInvalid = null;
  let isValid = true;

  if (
    !reservationNumber ||
    !reservationNumber.value.trim() ||
    reservationNumber.value.trim().length < 5
  ) {
    showReservationFieldError(
      reservationNumber,
      "Reservation Number must be at least 5 characters.",
    );
    if (!firstInvalid) firstInvalid = reservationNumber;
    isValid = false;
  }

  if (!reservationPatient || !reservationPatient.value.trim()) {
    showReservationFieldError(reservationPatient, "Patient Name is required.");
    if (!firstInvalid) firstInvalid = reservationPatient;
    isValid = false;
  }

  if (!reservationType || !reservationType.value) {
    showReservationFieldError(reservationType, "Request Type is required.");
    if (!firstInvalid) firstInvalid = reservationType;
    isValid = false;
  }

  if (!reservationVehicle || !reservationVehicle.value) {
    showReservationFieldError(reservationVehicle, "Vehicle is required.");
    if (!firstInvalid) firstInvalid = reservationVehicle;
    isValid = false;
  }

  if (!reservationDriver || !reservationDriver.value) {
    showReservationFieldError(reservationDriver, "Driver is required.");
    if (!firstInvalid) firstInvalid = reservationDriver;
    isValid = false;
  }

  if (!reservationPickup || !reservationPickup.value.trim()) {
    showReservationFieldError(
      reservationPickup,
      "Pickup Location is required.",
    );
    if (!firstInvalid) firstInvalid = reservationPickup;
    isValid = false;
  }

  if (!reservationDestination || !reservationDestination.value.trim()) {
    showReservationFieldError(
      reservationDestination,
      "Destination is required.",
    );
    if (!firstInvalid) firstInvalid = reservationDestination;
    isValid = false;
  }

  if (!reservationDate || !reservationDate.value) {
    showReservationFieldError(reservationDate, "Schedule Date is required.");
    if (!firstInvalid) firstInvalid = reservationDate;
    isValid = false;
  } else {
    const today = new Date().toISOString().split("T")[0];
    if (reservationDate.value < today) {
      showReservationFieldError(
        reservationDate,
        "Schedule Date cannot be in the past.",
      );
      if (!firstInvalid) firstInvalid = reservationDate;
      isValid = false;
    }
  }

  if (!reservationTime || !reservationTime.value) {
    showReservationFieldError(reservationTime, "Schedule Time is required.");
    if (!firstInvalid) firstInvalid = reservationTime;
    isValid = false;
  }

  if (!reservationPriority || !reservationPriority.value) {
    showReservationFieldError(reservationPriority, "Priority is required.");
    if (!firstInvalid) firstInvalid = reservationPriority;
    isValid = false;
  }

  if (!reservationStatus || !reservationStatus.value) {
    showReservationFieldError(reservationStatus, "Status is required.");
    if (!firstInvalid) firstInvalid = reservationStatus;
    isValid = false;
  }

  if (
    reservationContact &&
    reservationContact.value.trim() &&
    !/^[0-9+\-() ]+$/.test(reservationContact.value.trim())
  ) {
    showReservationFieldError(
      reservationContact,
      "Contact Number can only contain numbers, +, -, spaces, and parentheses.",
    );
    if (!firstInvalid) firstInvalid = reservationContact;
    isValid = false;
  }

  if (!isValid) {
    if (firstInvalid) firstInvalid.focus();
    return false;
  }

  return true;
}

function initReservationModal() {
  const modal = document.getElementById("addReservationModal");
  const openButton = document.getElementById("addReservationBtn");
  const closeButton = document.getElementById("closeAddReservationModal");
  const cancelButton = document.getElementById("cancelAddReservation");
  const form = document.getElementById("reservationForm");

  if (!modal || modal.dataset.reservationModalInitialized === "true") return;

  modal.dataset.reservationModalInitialized = "true";

  openButton?.addEventListener("click", () => openReservationModal(modal));
  closeButton?.addEventListener("click", () => closeReservationModal(modal));
  cancelButton?.addEventListener("click", () => closeReservationModal(modal));

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

  if (form && !form.dataset.reservationFormInitialized) {
    form.dataset.reservationFormInitialized = "true";
    form.setAttribute("novalidate", "");

    const reservationNumber = document.getElementById("reservationNumber");
    const reservationPatient = document.getElementById("reservationPatient");
    const reservationType = document.getElementById("reservationType");
    const reservationVehicle = document.getElementById("reservationVehicle");
    const reservationDriver = document.getElementById("reservationDriver");
    const reservationPickup = document.getElementById("reservationPickup");
    const reservationDestination = document.getElementById("reservationDestination");
    const reservationDate = document.getElementById("reservationDate");
    const reservationTime = document.getElementById("reservationTime");
    const reservationPriority = document.getElementById("reservationPriority");
    const reservationStatus = document.getElementById("reservationStatus");
    const reservationContact = document.getElementById("reservationContact");
    const reservationNotes = document.getElementById("reservationNotes");

    const fieldsToClear = [
      reservationNumber,
      reservationPatient,
      reservationType,
      reservationVehicle,
      reservationDriver,
      reservationPickup,
      reservationDestination,
      reservationDate,
      reservationTime,
      reservationPriority,
      reservationStatus,
      reservationContact,
      reservationNotes,
    ];

    fieldsToClear.forEach((field) => {
      if (!field) return;
      field.addEventListener("input", () => clearReservationFieldError(field));
      field.addEventListener("change", () => clearReservationFieldError(field));
    });
  }
}
