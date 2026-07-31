function createDispatchRow(form) {
  const getValue = (id) => {
    const el = form.querySelector("#" + id);
    return el ? el.value.trim() : "";
  };

  const dispatchNumber = getValue("dispatchNumber");
  const reservation = getValue("dispatchReservation");
  const patient = getValue("dispatchPatient");
  const requestType = getValue("dispatchRequestType");
  const vehicle = getValue("dispatchVehicle");
  const driver = getValue("dispatchDriver");
  const pickup = getValue("dispatchPickup");
  const destination = getValue("dispatchDestination");
  const date = getValue("dispatchDate");
  const time = getValue("dispatchTime");
  const priority = getValue("dispatchPriority");
  const status = getValue("dispatchStatus");
  const contact = getValue("dispatchContact");
  const notes = getValue("dispatchNotes");

  const tr = document.createElement("tr");
  tr.dataset.pickup = pickup;
  tr.dataset.destination = destination;
  tr.dataset.scheduleDate = date;
  tr.dataset.scheduleTime = time;
  tr.dataset.priority = priority;
  tr.dataset.contact = contact;
  tr.dataset.notes = notes;
  tr.dataset.requestType = requestType;

  const statusClassMap = {
    Pending: "pending",
    Assigned: "scheduled",
    "En Route": "trip",
    Arrived: "approved",
    Completed: "completed",
    Cancelled: "cancelled",
  };
  const statusClass =
    statusClassMap[status] ||
    status.toLowerCase().replace(/\s+/g, "-");

  const scheduleText = (() => {
    if (!date) return "";
    const iso = time ? date + "T" + time : date + "T00:00";
    const parsed = new Date(iso);
    if (isNaN(parsed.getTime())) return "";
    const datePart = parsed.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    if (!time) return datePart;
    const timePart = parsed.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return datePart + ", " + timePart;
  })();

  const tdCheckbox = document.createElement("td");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "dispatch-checkbox";
  checkbox.setAttribute("aria-label", "Select " + dispatchNumber);
  tdCheckbox.appendChild(checkbox);

  const tdNumber = document.createElement("td");
  const numberSpan = document.createElement("span");
  numberSpan.className = "dispatch-number";
  numberSpan.textContent = dispatchNumber;
  tdNumber.appendChild(numberSpan);

  const tdReservation = document.createElement("td");
  const reservationSpan = document.createElement("span");
  reservationSpan.className = "dispatch-reservation-number";
  reservationSpan.textContent = reservation;
  tdReservation.appendChild(reservationSpan);

  const tdPatient = document.createElement("td");
  const patientInfo = document.createElement("div");
  patientInfo.className = "dispatch-patient-info";
  const patientName = document.createElement("div");
  patientName.className = "dispatch-patient-name";
  patientName.textContent = patient;
  const requestTypeEl = document.createElement("div");
  requestTypeEl.className = "dispatch-request-type";
  requestTypeEl.textContent = requestType;
  patientInfo.appendChild(patientName);
  patientInfo.appendChild(requestTypeEl);
  tdPatient.appendChild(patientInfo);

  const tdVehicle = document.createElement("td");
  const vehicleSpan = document.createElement("span");
  vehicleSpan.className = "dispatch-vehicle";
  vehicleSpan.textContent = vehicle;
  tdVehicle.appendChild(vehicleSpan);

  const tdDriver = document.createElement("td");
  const driverSpan = document.createElement("span");
  driverSpan.className = "dispatch-driver";
  driverSpan.textContent = driver;
  tdDriver.appendChild(driverSpan);

  const tdRoute = document.createElement("td");
  const routeSpan = document.createElement("span");
  routeSpan.className = "dispatch-route";
  routeSpan.textContent = pickup + " → " + destination;
  tdRoute.appendChild(routeSpan);

  const tdSchedule = document.createElement("td");
  const scheduleSpan = document.createElement("span");
  scheduleSpan.className = "dispatch-schedule";
  scheduleSpan.textContent = scheduleText;
  tdSchedule.appendChild(scheduleSpan);

  const tdPriority = document.createElement("td");
  const prioritySpan = document.createElement("span");
  prioritySpan.className = "dispatch-priority";
  prioritySpan.textContent = priority;
  tdPriority.appendChild(prioritySpan);

  const tdStatus = document.createElement("td");
  const statusSpan = document.createElement("span");
  statusSpan.className = "status-badge " + statusClass;
  statusSpan.textContent = status;
  tdStatus.appendChild(statusSpan);

  const tdActions = document.createElement("td");
  const actionsWrap = document.createElement("div");
  actionsWrap.className = "action-buttons";

  const viewBtn = document.createElement("button");
  viewBtn.type = "button";
  viewBtn.className = "action-btn view-dispatch";
  viewBtn.setAttribute("aria-label", "View " + dispatchNumber);
  const viewIcon = document.createElement("i");
  viewIcon.className = "ph ph-eye";
  viewBtn.appendChild(viewIcon);

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "action-btn edit-dispatch";
  editBtn.setAttribute("aria-label", "Edit " + dispatchNumber);
  const editIcon = document.createElement("i");
  editIcon.className = "ph ph-pencil-simple";
  editBtn.appendChild(editIcon);

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "action-btn delete-dispatch";
  deleteBtn.setAttribute("aria-label", "Delete " + dispatchNumber);
  const deleteIcon = document.createElement("i");
  deleteIcon.className = "ph ph-trash";
  deleteBtn.appendChild(deleteIcon);

  actionsWrap.appendChild(viewBtn);
  actionsWrap.appendChild(editBtn);
  actionsWrap.appendChild(deleteBtn);
  tdActions.appendChild(actionsWrap);

  tr.appendChild(tdCheckbox);
  tr.appendChild(tdNumber);
  tr.appendChild(tdReservation);
  tr.appendChild(tdPatient);
  tr.appendChild(tdVehicle);
  tr.appendChild(tdDriver);
  tr.appendChild(tdRoute);
  tr.appendChild(tdSchedule);
  tr.appendChild(tdPriority);
  tr.appendChild(tdStatus);
  tr.appendChild(tdActions);

  return tr;
}

function initDispatchAdd() {
  const modal = document.getElementById("addDispatchModal");
  const form = document.getElementById("dispatchForm");
  const tableBody = document.getElementById("dispatchTableBody");

  if (!modal || !form || !tableBody) {
    return;
  }

  if (form.dataset.dispatchAddInitialized === "true") {
    return;
  }
  form.dataset.dispatchAddInitialized = "true";

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateDispatchForm(form)) {
      return;
    }

    const row = createDispatchRow(form);
    tableBody.insertBefore(row, tableBody.firstChild);

    form.reset();

    form
      .querySelectorAll(".is-invalid")
      .forEach((el) => el.classList.remove("is-invalid"));

    modal.classList.remove("show");
    document.body.style.overflow = "";

    if (typeof updateDispatchStatistics === "function") {
      updateDispatchStatistics();
    }

    if (typeof updateDispatchPagination === "function") {
      updateDispatchPagination();
    }

    if (typeof refreshDispatchBulkState === "function") {
      refreshDispatchBulkState();
    }

    if (typeof showToast === "function") {
      showToast("Dispatch created successfully.", "success");
    }
  });
}
