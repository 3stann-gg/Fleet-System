function createReservationRow(form) {
  const getVal = (id) => {
    const el = form.querySelector("#" + id);
    return el ? el.value.trim() : "";
  };

  const reservationNumber = getVal("reservationNumber");
  const reservationPatient = getVal("reservationPatient");
  const reservationType = getVal("reservationType");
  const reservationVehicle = getVal("reservationVehicle");
  const reservationDriver = getVal("reservationDriver");
  const reservationPickup = getVal("reservationPickup");
  const reservationDestination = getVal("reservationDestination");
  const reservationDate = getVal("reservationDate");
  const reservationTime = getVal("reservationTime");
  const reservationPriority = getVal("reservationPriority");
  const reservationStatus = getVal("reservationStatus");
  const reservationContact = getVal("reservationContact");
  const reservationNotes = getVal("reservationNotes");

  const statusClassMap = {
    Pending: "pending",
    Approved: "trip",
    Scheduled: "scheduled",
    Completed: "completed",
    Rejected: "rejected",
    Cancelled: "cancelled",
  };

  const scheduleText = (() => {
    if (reservationDate && reservationTime) {
      const dateObj = new Date(reservationDate + "T" + reservationTime);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return reservationDate + " " + reservationTime;
    }
    if (reservationDate) return reservationDate;
    if (reservationTime) return reservationTime;
    return "";
  })();

  const tr = document.createElement("tr");
  tr.dataset.requestType = reservationType;
  tr.dataset.priority = reservationPriority;
  tr.dataset.contact = reservationContact;
  tr.dataset.notes = reservationNotes;
  tr.dataset.scheduleDate = reservationDate;
  tr.dataset.scheduleTime = reservationTime;

  const tdCheckbox = document.createElement("td");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "reservation-checkbox";
  checkbox.setAttribute("aria-label", "Select " + reservationNumber);
  tdCheckbox.appendChild(checkbox);
  tr.appendChild(tdCheckbox);

  const tdNumber = document.createElement("td");
  const numberSpan = document.createElement("span");
  numberSpan.className = "reservation-number";
  numberSpan.textContent = reservationNumber;
  tdNumber.appendChild(numberSpan);
  tr.appendChild(tdNumber);

  const tdPatient = document.createElement("td");
  const patientInfo = document.createElement("div");
  patientInfo.className = "patient-info";
  const patientName = document.createElement("div");
  patientName.className = "patient-name";
  patientName.textContent = reservationPatient;
  const patientType = document.createElement("small");
  patientType.textContent = reservationType;
  patientInfo.appendChild(patientName);
  patientInfo.appendChild(patientType);
  tdPatient.appendChild(patientInfo);
  tr.appendChild(tdPatient);

  const tdVehicle = document.createElement("td");
  const vehicleSpan = document.createElement("span");
  vehicleSpan.className = "reservation-vehicle";
  vehicleSpan.textContent = reservationVehicle;
  tdVehicle.appendChild(vehicleSpan);
  tr.appendChild(tdVehicle);

  const tdDriver = document.createElement("td");
  const driverSpan = document.createElement("span");
  driverSpan.className = "reservation-driver";
  driverSpan.textContent = reservationDriver;
  tdDriver.appendChild(driverSpan);
  tr.appendChild(tdDriver);

  const tdPickup = document.createElement("td");
  const pickupSpan = document.createElement("span");
  pickupSpan.className = "reservation-pickup";
  pickupSpan.textContent = reservationPickup;
  tdPickup.appendChild(pickupSpan);
  tr.appendChild(tdPickup);

  const tdDestination = document.createElement("td");
  const destinationSpan = document.createElement("span");
  destinationSpan.className = "reservation-destination";
  destinationSpan.textContent = reservationDestination;
  tdDestination.appendChild(destinationSpan);
  tr.appendChild(tdDestination);

  const tdSchedule = document.createElement("td");
  const scheduleSpan = document.createElement("span");
  scheduleSpan.className = "reservation-schedule";
  scheduleSpan.textContent = scheduleText;
  tdSchedule.appendChild(scheduleSpan);
  tr.appendChild(tdSchedule);

  const tdStatus = document.createElement("td");
  const statusBadge = document.createElement("span");
  statusBadge.className = "status-badge";
  const statusKey = reservationStatus;
  if (statusClassMap[statusKey]) {
    statusBadge.classList.add(statusClassMap[statusKey]);
  }
  statusBadge.textContent = reservationStatus;
  tdStatus.appendChild(statusBadge);
  tr.appendChild(tdStatus);

  const tdActions = document.createElement("td");
  const actionButtons = document.createElement("div");
  actionButtons.className = "action-buttons";

  const viewButton = document.createElement("button");
  viewButton.type = "button";
  viewButton.className = "action-btn view-reservation";
  viewButton.setAttribute("aria-label", "View " + reservationNumber);
  const viewIcon = document.createElement("i");
  viewIcon.className = "ph ph-eye";
  viewButton.appendChild(viewIcon);

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "action-btn edit-reservation";
  editButton.setAttribute("aria-label", "Edit " + reservationNumber);
  const editIcon = document.createElement("i");
  editIcon.className = "ph ph-pencil-simple";
  editButton.appendChild(editIcon);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "action-btn delete-reservation";
  deleteButton.setAttribute("aria-label", "Delete " + reservationNumber);
  const deleteIcon = document.createElement("i");
  deleteIcon.className = "ph ph-trash";
  deleteButton.appendChild(deleteIcon);

  actionButtons.appendChild(viewButton);
  actionButtons.appendChild(editButton);
  actionButtons.appendChild(deleteButton);
  tdActions.appendChild(actionButtons);
  tr.appendChild(tdActions);

  return tr;
}

function initReservationAdd() {
  const modal = document.getElementById("addReservationModal");
  const form = document.getElementById("reservationForm");
  const tableBody = document.getElementById("reservationTableBody");

  if (!modal || !form || !tableBody) return;
  if (form.dataset.reservationAddInitialized === "true") return;

  form.dataset.reservationAddInitialized = "true";

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateReservationForm(form)) {
      return;
    }

    const row = createReservationRow(form);
    tableBody.prepend(row);

    if (typeof updateReservationStatistics === "function") {
      updateReservationStatistics();
    }

    form.reset();

    if (typeof clearAllReservationErrors === "function") {
      clearAllReservationErrors(form);
    }

    form
      .querySelectorAll(".is-invalid")
      .forEach((field) => field.classList.remove("is-invalid"));

    modal.classList.remove("show");
    document.body.style.overflow = "";

    if (typeof showToast === "function") {
      showToast("Reservation added successfully.", "success");
    }
  });
}
