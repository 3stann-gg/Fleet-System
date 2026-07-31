let editDispatchInitialized = false;

function getEditFormValues() {
  return {
    number: document.getElementById("editDispatchNumber")?.value || "",
    reservation: document.getElementById("editDispatchReservation")?.value || "",
    patient: document.getElementById("editDispatchPatient")?.value || "",
    requestType:
      document.getElementById("editDispatchRequestType")?.value || "",
    vehicle: document.getElementById("editDispatchVehicle")?.value || "",
    driver: document.getElementById("editDispatchDriver")?.value || "",
    pickup: document.getElementById("editDispatchPickup")?.value || "",
    destination:
      document.getElementById("editDispatchDestination")?.value || "",
    date: document.getElementById("editDispatchDate")?.value || "",
    time: document.getElementById("editDispatchTime")?.value || "",
    priority: document.getElementById("editDispatchPriority")?.value || "",
    status: document.getElementById("editDispatchStatus")?.value || "",
    contact: document.getElementById("editDispatchContact")?.value || "",
    notes: document.getElementById("editDispatchNotes")?.value || "",
  };
}

function validateEditDispatchForm(form) {
  let isValid = true;
  const firstInvalid = [];

  const requiredFields = [
    { id: "editDispatchNumber", validate: (v) => v.trim().length >= 5 },
    { id: "editDispatchReservation", validate: (v) => v.trim() !== "" },
    { id: "editDispatchPatient", validate: (v) => v.trim() !== "" },
    { id: "editDispatchRequestType", validate: (v) => v.trim() !== "" },
    { id: "editDispatchVehicle", validate: (v) => v.trim() !== "" },
    { id: "editDispatchDriver", validate: (v) => v.trim() !== "" },
    { id: "editDispatchPickup", validate: (v) => v.trim() !== "" },
    { id: "editDispatchDestination", validate: (v) => v.trim() !== "" },
    {
      id: "editDispatchDate",
      validate: (v) => {
        if (v.trim() === "") return false;
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        )
          .toISOString()
          .split("T")[0];
        return v >= today;
      },
    },
    { id: "editDispatchTime", validate: (v) => v.trim() !== "" },
    { id: "editDispatchPriority", validate: (v) => v.trim() !== "" },
    { id: "editDispatchStatus", validate: (v) => v.trim() !== "" },
  ];

  requiredFields.forEach((field) => {
    const el = document.getElementById(field.id);
    if (!el) return;

    const value = el.value || "";
    const valid = field.validate(value);

    if (!valid) {
      isValid = false;
      el.classList.add("is-invalid");
      firstInvalid.push(el);
    } else {
      el.classList.remove("is-invalid");
    }
  });

  const contactEl = document.getElementById("editDispatchContact");
  if (contactEl && contactEl.value.trim() !== "") {
    const contactValid = /^[0-9+\-() ]*$/.test(contactEl.value);
    if (!contactValid) {
      isValid = false;
      contactEl.classList.add("is-invalid");
      firstInvalid.push(contactEl);
    } else {
      contactEl.classList.remove("is-invalid");
    }
  }

  if (firstInvalid.length > 0) {
    firstInvalid[0].focus();
  }

  return isValid;
}

function formatScheduleText(date, time) {
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
}

function updateDispatchRow(row, values) {
  const statusClassMap = {
    Pending: "pending",
    Assigned: "scheduled",
    "En Route": "trip",
    Arrived: "approved",
    Completed: "completed",
    Cancelled: "cancelled",
  };

  const numberEl = row.querySelector(".dispatch-number");
  if (numberEl) {
    numberEl.textContent = values.number;
  }

  const reservationEl = row.querySelector(".dispatch-reservation-number");
  if (reservationEl) {
    reservationEl.textContent = values.reservation;
  }

  const patientEl = row.querySelector(".dispatch-patient-name");
  if (patientEl) {
    patientEl.textContent = values.patient;
  }

  const requestTypeEl = row.querySelector(".dispatch-request-type");
  if (requestTypeEl) {
    requestTypeEl.textContent = values.requestType;
  }

  const vehicleEl = row.querySelector(".dispatch-vehicle");
  if (vehicleEl) {
    vehicleEl.textContent = values.vehicle;
  }

  const driverEl = row.querySelector(".dispatch-driver");
  if (driverEl) {
    driverEl.textContent = values.driver;
  }

  const routeEl = row.querySelector(".dispatch-route");
  if (routeEl) {
    routeEl.textContent = values.pickup + " → " + values.destination;
  }

  const scheduleEl = row.querySelector(".dispatch-schedule");
  if (scheduleEl) {
    scheduleEl.textContent = formatScheduleText(values.date, values.time);
  }

  const priorityEl = row.querySelector(".dispatch-priority");
  if (priorityEl) {
    priorityEl.textContent = values.priority;
  }

  const statusEl = row.querySelector(".status-badge");
  if (statusEl) {
    statusEl.className = "status-badge";
    statusEl.textContent = values.status;
    const statusClass =
      statusClassMap[values.status] ||
      values.status.toLowerCase().replace(/\s+/g, "-");
    statusEl.classList.add(statusClass);
  }

  row.dataset.pickup = values.pickup;
  row.dataset.destination = values.destination;
  row.dataset.scheduleDate = values.date;
  row.dataset.scheduleTime = values.time;
  row.dataset.priority = values.priority;
  row.dataset.contact = values.contact;
  row.dataset.notes = values.notes;
  row.dataset.requestType = values.requestType;
}

function populateEditDispatchForm(row) {
  const numberEl = document.getElementById("editDispatchNumber");
  if (numberEl) {
    numberEl.value =
      row.querySelector(".dispatch-number")?.textContent?.trim() || "";
  }

  const reservationEl = document.getElementById("editDispatchReservation");
  if (reservationEl) {
    reservationEl.value =
      row.querySelector(".dispatch-reservation-number")?.textContent?.trim() ||
      "";
  }

  const patientEl = document.getElementById("editDispatchPatient");
  if (patientEl) {
    patientEl.value =
      row.querySelector(".dispatch-patient-name")?.textContent?.trim() || "";
  }

  const requestTypeEl = document.getElementById("editDispatchRequestType");
  if (requestTypeEl) {
    requestTypeEl.value =
      row.querySelector(".dispatch-request-type")?.textContent?.trim() ||
      row.dataset.requestType ||
      "";
  }

  const vehicleEl = document.getElementById("editDispatchVehicle");
  if (vehicleEl) {
    vehicleEl.value =
      row.querySelector(".dispatch-vehicle")?.textContent?.trim() || "";
  }

  const driverEl = document.getElementById("editDispatchDriver");
  if (driverEl) {
    driverEl.value =
      row.querySelector(".dispatch-driver")?.textContent?.trim() || "";
  }

  const pickupEl = document.getElementById("editDispatchPickup");
  if (pickupEl) {
    pickupEl.value = row.dataset.pickup || "";
  }

  const destinationEl = document.getElementById("editDispatchDestination");
  if (destinationEl) {
    destinationEl.value = row.dataset.destination || "";
  }

  const dateEl = document.getElementById("editDispatchDate");
  if (dateEl) {
    dateEl.value = row.dataset.scheduleDate || "";
  }

  const timeEl = document.getElementById("editDispatchTime");
  if (timeEl) {
    timeEl.value = row.dataset.scheduleTime || "";
  }

  const priorityEl = document.getElementById("editDispatchPriority");
  if (priorityEl) {
    priorityEl.value =
      row.querySelector(".dispatch-priority")?.textContent?.trim() ||
      row.dataset.priority ||
      "";
  }

  const statusEl = document.getElementById("editDispatchStatus");
  if (statusEl) {
    const statusText = (
      row.querySelector(".status-badge")?.textContent?.trim() || ""
    ).trim();

    if (statusText) {
      statusEl.value = statusText;
    }
  }

  const contactEl = document.getElementById("editDispatchContact");
  if (contactEl) {
    contactEl.value = row.dataset.contact || "";
  }

  const notesEl = document.getElementById("editDispatchNotes");
  if (notesEl) {
    notesEl.value = row.dataset.notes || "";
  }
}

function openEditDispatchModal() {
  const modal = document.getElementById("editDispatchModal");

  if (!modal) {
    return;
  }

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeEditDispatchModal() {
  const modal = document.getElementById("editDispatchModal");

  if (!modal) {
    return;
  }

  modal.classList.remove("show");
  document.body.style.overflow = "";

  if (modal.currentRow) {
    modal.currentRow = null;
  }
}

function initEditDispatchModal() {
  if (editDispatchInitialized) {
    return;
  }

  editDispatchInitialized = true;

  const modal = document.getElementById("editDispatchModal");

  if (!modal) {
    return;
  }

  document.body.addEventListener("click", (event) => {
    const editBtn = event.target.closest(".action-btn.edit-dispatch");

    if (!editBtn) {
      return;
    }

    const row = editBtn.closest("tr");

    if (!row) {
      return;
    }

    modal.currentRow = row;

    populateEditDispatchForm(row);

    openEditDispatchModal();
  });

  const closeXBtn = document.getElementById("closeEditDispatchModal");

  if (closeXBtn) {
    closeXBtn.addEventListener("click", closeEditDispatchModal);
  }

  const cancelBtn = document.getElementById("cancelEditDispatch");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeEditDispatchModal);
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeEditDispatchModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeEditDispatchModal();
    }
  });

  const form = document.getElementById("editDispatchForm");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!validateEditDispatchForm(form)) {
        return;
      }

      const row = modal.currentRow;

      if (!row) {
        return;
      }

      const values = getEditFormValues();
      updateDispatchRow(row, values);

      modal.classList.remove("show");
      document.body.style.overflow = "";
      modal.currentRow = null;

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
        showToast("Dispatch updated successfully.", "success");
      }
    });

    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        input.classList.remove("is-invalid");
      });
      input.addEventListener("change", () => {
        input.classList.remove("is-invalid");
      });
    });
  }
}
