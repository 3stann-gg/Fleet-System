function initEditReservationModal() {
  const modal = document.getElementById("editReservationModal");

  if (!modal || modal.dataset.editReservationModalInitialized === "true") {
    return;
  }

  modal.dataset.editReservationModalInitialized = "true";

  const getRowText = (row, selector) => {
    const el = row.querySelector(selector);
    return el ? el.textContent.trim() : "";
  };

  const getRowData = (row, key) => {
    return row.dataset[key] || "";
  };

  populateEditReservationForm = (row) => {
    const form = document.getElementById("editReservationForm");
    if (!form) return;

    const setValue = (id, value) => {
      const field = form.querySelector("#" + id);
      if (field) {
        field.value = value;
      }
    };

    setValue("editReservationNumber", getRowText(row, ".reservation-number"));
    setValue("editReservationPatient", getRowText(row, ".patient-name"));
    setValue("editReservationType", getRowData(row, "requestType"));
    setValue("editReservationVehicle", getRowText(row, ".reservation-vehicle"));
    setValue("editReservationDriver", getRowText(row, ".reservation-driver"));
    setValue("editReservationPickup", getRowText(row, ".reservation-pickup"));
    setValue("editReservationDestination", getRowText(row, ".reservation-destination"));
    setValue("editReservationDate", getRowData(row, "scheduleDate"));
    setValue("editReservationTime", getRowData(row, "scheduleTime"));
    setValue("editReservationPriority", getRowData(row, "priority"));
    setValue("editReservationStatus", getRowText(row, ".status-badge"));
    setValue("editReservationContact", getRowData(row, "contact"));
    setValue("editReservationNotes", getRowData(row, "notes"));
  };

  openEditReservationModal = (row) => {
    modal.currentRow = row;
    populateEditReservationForm(row);
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  };

  const closeEditReservationModal = () => {
    modal.classList.remove("show");
    document.body.style.overflow = "";
    modal.currentRow = null;
  };

  document.body.addEventListener("click", (event) => {
    const button = event.target.closest(".action-btn.edit-reservation");
    if (button) {
      const row = button.closest("tr");
      openEditReservationModal(row);
    }
  });

  document
    .getElementById("closeEditReservationModal")
    ?.addEventListener("click", closeEditReservationModal);

  document
    .getElementById("cancelEditReservation")
    ?.addEventListener("click", closeEditReservationModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeEditReservationModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeEditReservationModal();
    }
  });

  const form = document.getElementById("editReservationForm");
  if (form && !form.dataset.editReservationFormInitialized) {
    form.dataset.editReservationFormInitialized = "true";

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!modal.currentRow) return;

      clearAllReservationErrors(form);

      const reservationNumber = document.getElementById("editReservationNumber");
      const reservationPatient = document.getElementById("editReservationPatient");
      const reservationType = document.getElementById("editReservationType");
      const reservationVehicle = document.getElementById("editReservationVehicle");
      const reservationDriver = document.getElementById("editReservationDriver");
      const reservationPickup = document.getElementById("editReservationPickup");
      const reservationDestination = document.getElementById("editReservationDestination");
      const reservationDate = document.getElementById("editReservationDate");
      const reservationTime = document.getElementById("editReservationTime");
      const reservationPriority = document.getElementById("editReservationPriority");
      const reservationStatus = document.getElementById("editReservationStatus");
      const reservationContact = document.getElementById("editReservationContact");

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
        return;
      }

      const row = modal.currentRow;
      const reservationNumberValue = reservationNumber.value.trim();
      const reservationPatientValue = reservationPatient.value.trim();
      const reservationTypeValue = reservationType.value;
      const reservationVehicleValue = reservationVehicle.value;
      const reservationDriverValue = reservationDriver.value;
      const reservationPickupValue = reservationPickup.value.trim();
      const reservationDestinationValue = reservationDestination.value.trim();
      const reservationDateValue = reservationDate.value;
      const reservationTimeValue = reservationTime.value;
      const reservationPriorityValue = reservationPriority.value;
      const reservationStatusValue = reservationStatus.value;
      const reservationContactValue = reservationContact.value.trim();
      const reservationNotesValue = document
        .getElementById("editReservationNotes")
        ?.value.trim() || "";

      const scheduleText = (() => {
        if (reservationDateValue && reservationTimeValue) {
          const dateObj = new Date(
            reservationDateValue + "T" + reservationTimeValue,
          );
          if (!isNaN(dateObj.getTime())) {
            return dateObj.toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          }
          return reservationDateValue + " " + reservationTimeValue;
        }
        if (reservationDateValue) return reservationDateValue;
        if (reservationTimeValue) return reservationTimeValue;
        return "";
      })();

      const statusClassMap = {
        Pending: "pending",
        Approved: "trip",
        Scheduled: "scheduled",
        Completed: "completed",
        Rejected: "rejected",
        Cancelled: "cancelled",
      };

      const numberEl = row.querySelector(".reservation-number");
      if (numberEl) numberEl.textContent = reservationNumberValue;

      const patientNameEl = row.querySelector(".patient-name");
      if (patientNameEl) patientNameEl.textContent = reservationPatientValue;

      const patientSmallEl = row.querySelector(".patient-info small");
      if (patientSmallEl) patientSmallEl.textContent = reservationTypeValue;

      const vehicleEl = row.querySelector(".reservation-vehicle");
      if (vehicleEl) vehicleEl.textContent = reservationVehicleValue;

      const driverEl = row.querySelector(".reservation-driver");
      if (driverEl) driverEl.textContent = reservationDriverValue;

      const pickupEl = row.querySelector(".reservation-pickup");
      if (pickupEl) pickupEl.textContent = reservationPickupValue;

      const destinationEl = row.querySelector(".reservation-destination");
      if (destinationEl) destinationEl.textContent = reservationDestinationValue;

      const scheduleEl = row.querySelector(".reservation-schedule");
      if (scheduleEl) scheduleEl.textContent = scheduleText;

      const statusBadge = row.querySelector(".status-badge");
      if (statusBadge) {
        statusBadge.textContent = reservationStatusValue;
        statusBadge.className = "status-badge";
        const mappedClass = statusClassMap[reservationStatusValue];
        if (mappedClass) {
          statusBadge.classList.add(mappedClass);
        }
      }

      row.dataset.requestType = reservationTypeValue;
      row.dataset.priority = reservationPriorityValue;
      row.dataset.contact = reservationContactValue;
      row.dataset.notes = reservationNotesValue;
      row.dataset.scheduleDate = reservationDateValue;
      row.dataset.scheduleTime = reservationTimeValue;

      if (typeof updateReservationStatistics === "function") {
        updateReservationStatistics();
      }

      closeEditReservationModal();

      if (typeof showToast === "function") {
        showToast("Reservation updated successfully.", "success");
      }
    });
  }
}
