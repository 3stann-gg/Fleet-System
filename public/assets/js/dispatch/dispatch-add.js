/* ==========================================
   Dispatch Add 
========================================== */

let availableReservations = [];

document.addEventListener("DOMContentLoaded", () => {
    initDispatchAdd();
    loadAvailableReservations();
});

function loadAvailableReservations() {
    fetch("/dispatch/available-reservations", {
        headers: {
            Accept: "application/json",
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to load reservations.");
            }

            return response.json();
        })
        .then((data) => {
            availableReservations = data.reservations || [];

            populateReservationSelect(availableReservations);
        })
        .catch((error) => {
            console.error("Error loading reservations:", error);
        });
}

function populateReservationSelect(reservations) {
    const select = document.getElementById("dispatchReservation");

    if (!select) return;

    select.innerHTML = `
        <option value="">Select Reservation</option>
    `;
    reservations.forEach((reservation) => {
        const option = document.createElement("option");
        option.value = reservation.id;
        option.textContent = reservation.reservation_number;
        select.appendChild(option);
    });
}

function handleReservationChange() {
    const select = document.getElementById("dispatchReservation");
    if (!select) return;

    const reservationId = select.value;

    if (!reservationId) {
        clearReservationDetails();
        return;
    }
    const reservation = availableReservations.find(
        (item) => String(item.id) === String(reservationId),
    );

    if (!reservation) return;

    fillReservationDetails(reservation);
}

function fillReservationDetails(reservation) {
    const setValue = (id, value) => {
        const element = document.getElementById(id);

        if (element) {
            element.value = value ?? "";
        }
    };

    setValue("dispatchPatient", reservation.patient_name);
    setValue("dispatchRequestType", reservation.request_type);

    if (reservation.vehicle) {
        const vehicle = reservation.vehicle;
        const vehicleText = [
            [vehicle.brand, vehicle.model].filter(Boolean).join(" "),
            vehicle.vehicle_type,
        ]
            .filter(Boolean)
            .join(" - ");
        setValue("dispatchVehicle", vehicleText);
    } else {
        setValue("dispatchVehicle", "Unassigned");
    }

    if (reservation.driver) {
        const driver = reservation.driver;
        const driverText = [driver.first_name, driver.last_name]
            .filter(Boolean)
            .join(" ");
        setValue("dispatchDriver", driverText);
    } else {
        setValue("dispatchDriver", "Unassigned");
    }

    setValue("dispatchPickup", reservation.pickup_location);
    setValue("dispatchDestination", reservation.destination);
    setValue("dispatchDate", reservation.schedule_date);
    setValue("dispatchTime", reservation.schedule_time);
    setValue("dispatchPriority", reservation.priority);
    setValue("dispatchContact", reservation.contact_number);
    setValue("dispatchNotes", reservation.notes);
}

function clearReservationDetails() {
    const fields = [
        "dispatchPatient",
        "dispatchRequestType",
        "dispatchVehicle",
        "dispatchDriver",
        "dispatchPickup",
        "dispatchDestination",
        "dispatchDate",
        "dispatchTime",
        "dispatchPriority",
        "dispatchContact",
        "dispatchNotes",
    ];
    fields.forEach((id) => {
        const element = document.getElementById(id);

        if (element) {
            element.value = "";
        }
    });
}

function createDispatchRow(dispatch) {
    const reservation = dispatch.reservation;
    const vehicle = reservation?.vehicle;
    const driver = reservation?.driver;
    const vehicleName = vehicle
        ? [vehicle.brand, vehicle.model].filter(Boolean).join(" ")
        : "Unassigned";
    const vehicleType = vehicle?.vehicle_type || "";
    const driverName = driver
        ? [driver.first_name, driver.last_name].filter(Boolean).join(" ")
        : "Unassigned";
    const scheduleText = formatDispatchSchedule(
        reservation?.schedule_date,
        reservation?.schedule_time,
    );

    //const status = dispatch.trip_status || "Pending";
    const status = dispatch.trip_status || "Assigned";
    const statusClassMap = {
        //Pending: "pending",
        Assigned: "scheduled",
        "En Route": "trip",
        Arrived: "approved",
        Completed: "completed",
        Cancelled: "cancelled",
    };

    const statusClass =
        statusClassMap[status] || status.toLowerCase().replace(/\s+/g, "-");
    const tr = document.createElement("tr");

    tr.dataset.id = dispatch.id;
    tr.dataset.pickup = reservation?.pickup_location ?? "";
    tr.dataset.destination = reservation?.destination ?? "";
    tr.dataset.scheduleDate = reservation?.schedule_date ?? "";
    tr.dataset.scheduleTime = reservation?.schedule_time ?? "";
    tr.dataset.priority = reservation?.priority ?? "";
    tr.dataset.contact = reservation?.contact_number ?? "";
    tr.dataset.notes = reservation?.notes ?? "";
    tr.dataset.requestType = reservation?.request_type ?? "";

    /* Checkbox */
    const tdCheckbox = document.createElement("td");
    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.className = "dispatch-checkbox";
    checkbox.dataset.id = dispatch.id;
    checkbox.setAttribute("aria-label", `Select ${dispatch.dispatch_number}`);
    tdCheckbox.appendChild(checkbox);

    /* Dispatch Number */
    const tdNumber = document.createElement("td");
    const numberSpan = document.createElement("span");
    numberSpan.className = "dispatch-number";
    numberSpan.textContent = dispatch.dispatch_number;
    tdNumber.appendChild(numberSpan);

    /* Dispatch Number */
    const tdReservation = document.createElement("td");
    const reservationSpan = document.createElement("span");
    reservationSpan.className = "dispatch-reservation-number";
    reservationSpan.textContent = reservation?.reservation_number ?? "—";
    tdReservation.appendChild(reservationSpan);

    /* Patient */
    const tdPatient = document.createElement("td");
    const patientInfo = document.createElement("div");
    patientInfo.className = "dispatch-patient-info";
    const patientName = document.createElement("div");
    patientName.className = "dispatch-patient-name";
    patientName.textContent = reservation?.patient_name ?? "—";
    const requestType = document.createElement("div");
    requestType.className = "dispatch-request-type";
    requestType.textContent = reservation?.request_type ?? "—";
    patientInfo.appendChild(patientName);
    patientInfo.appendChild(requestType);
    tdPatient.appendChild(patientInfo);

    /* Vehicle */
    const tdVehicle = document.createElement("td");
    if (vehicle) {
        const vehicleInfo = document.createElement("div");
        vehicleInfo.className = "vehicle-info dispatch-vehicle";
        
        const vehicleDetails = document.createElement("div");
        const vehicleNameElement = document.createElement("div");
        vehicleNameElement.textContent = vehicleName;

        const vehicleTypeElement = document.createElement("small");
        vehicleTypeElement.textContent = vehicleType;
        vehicleDetails.appendChild(vehicleNameElement);
        vehicleDetails.appendChild(vehicleTypeElement);
        vehicleInfo.appendChild(vehicleDetails);
        tdVehicle.appendChild(vehicleInfo);
    } else {
        tdVehicle.textContent = "Unassigned";
    }

    /* Driver */
    const tdDriver = document.createElement("td");
    const driverSpan = document.createElement("span");
    driverSpan.className = "dispatch-driver";
    driverSpan.textContent = driverName;
    tdDriver.appendChild(driverSpan);

    /* Route */
    const tdRoute = document.createElement("td");
    const routeSpan = document.createElement("span");
    routeSpan.className = "dispatch-route";
    routeSpan.textContent = `${reservation?.pickup_location ?? ""} → ${reservation?.destination ?? ""}`;
    tdRoute.appendChild(routeSpan);

    /* Schedule */
    const tdSchedule = document.createElement("td");
    const scheduleSpan = document.createElement("span");
    scheduleSpan.className = "dispatch-schedule";
    scheduleSpan.textContent = scheduleText;
    tdSchedule.appendChild(scheduleSpan);

    /* Priority */
    const tdPriority = document.createElement("td");
    const prioritySpan = document.createElement("span");
    prioritySpan.className = "dispatch-priority";
    prioritySpan.textContent = reservation?.priority ?? "—";
    tdPriority.appendChild(prioritySpan);

    /* Status */
    const tdStatus = document.createElement("td");
    const statusSpan = document.createElement("span");
    statusSpan.className = `status-badge ${statusClass}`;
    statusSpan.textContent = status;
    tdStatus.appendChild(statusSpan);

    /* Actions */
    const tdActions = document.createElement("td");
    const actionsWrap = document.createElement("div");
    actionsWrap.className = "action-buttons";

    const viewBtn = document.createElement("button");
    viewBtn.type = "button";
    viewBtn.className = "action-btn view-dispatch";
    viewBtn.dataset.id = dispatch.id;
    viewBtn.setAttribute("aria-label", `View ${dispatch.dispatch_number}`);

    const viewIcon = document.createElement("i");
    viewIcon.className = "ph ph-eye";
    viewBtn.appendChild(viewIcon);
    
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "action-btn edit-dispatch";
    editBtn.dataset.id = dispatch.id;
    editBtn.setAttribute("aria-label", `Edit ${dispatch.dispatch_number}`);

    const editIcon = document.createElement("i");
    editIcon.className = "ph ph-pencil-simple";
    editBtn.appendChild(editIcon);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "action-btn delete-dispatch";
    deleteBtn.dataset.id = dispatch.id;
    deleteBtn.setAttribute("aria-label", `Delete ${dispatch.dispatch_number}`);

    const deleteIcon = document.createElement("i");
    deleteIcon.className = "ph ph-trash";
    deleteBtn.appendChild(deleteIcon);
    actionsWrap.appendChild(viewBtn);
    actionsWrap.appendChild(editBtn);
    actionsWrap.appendChild(deleteBtn);

    tdActions.appendChild(actionsWrap);

    /* Append Row */
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

/* ==========================================
   Schedule Formatter
========================================== */

function formatDispatchSchedule(date, time) {
    if (!date) return "";

    const iso = time ? `${date}T${time}` : `${date}T00:00`;
    const parsed = new Date(iso);

    if (isNaN(parsed.getTime())) {
        return "";
    }
    const datePart = parsed.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    if (!time) {
        return datePart;
    }

    const timePart = parsed.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    return `${datePart}, ${timePart}`;
}

/* ==========================================
   Initialize Add Dispatch
========================================== */

function initDispatchAdd() {
    const modal = document.getElementById("addDispatchModal");
    const form = document.getElementById("dispatchForm");

    if (!modal || !form) {
        return;
    }
    if (form.dataset.dispatchAddInitialized === "true") {
        return;
    }

    form.dataset.dispatchAddInitialized = "true";

    /* Reservation Change */
    const reservationSelect = document.getElementById("dispatchReservation");
    if (reservationSelect) {
        reservationSelect.addEventListener("change", handleReservationChange);
    }

    /* Submit */
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (typeof validateDispatchForm === "function") {
            if (!validateDispatchForm(form)) {
                return;
            }
        }
        const reservationId = reservationSelect?.value;
        if (!reservationId) {
            if (typeof showToast === "function") {
                showToast("Please select a reservation.", "error");
            }
            return;
        }

        const payload = {
            dispatch_number: document
                .getElementById("dispatchNumber")
                ?.value.trim(),
            reservation_id: reservationId,
            dispatch_date: document.getElementById("dispatchDate")?.value,
            departure_time: document.getElementById("dispatchTime")?.value,
            arrival_time: null,
            trip_status: "Assigned",
            remarks:
                document.getElementById("dispatchNotes")?.value.trim() || null,
        };

        try {
            const response = await fetch("/dispatch", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",

                    Accept: "application/json",

                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content"),
                },

                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error(data);

                if (typeof showToast === "function") {
                    showToast(
                        data.message || "Failed to create dispatch.",
                        "error",
                    );
                }

                return;
            }

            /* Successfully saved */

            const tableBody = document.getElementById("dispatchTableBody");
            if (tableBody && data.dispatch) {
                const row = createDispatchRow(data.dispatch);

                tableBody.insertBefore(row, tableBody.firstChild);
            }

            /* Remove reservation from available list */

            availableReservations = availableReservations.filter(
                (reservation) =>
                    String(reservation.id) !== String(reservationId),
            );

            populateReservationSelect(availableReservations);

            /* Reset */
            form.reset();
            clearReservationDetails();
            form.querySelectorAll(".is-invalid").forEach((element) =>
                element.classList.remove("is-invalid"),
            );

            modal.classList.remove("show");
            document.body.style.overflow = "";

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
            if (typeof showToast === "function") {
                showToast("Dispatch created successfully.", "success");
            }
        } catch (error) {
            console.error("Dispatch creation error:", error);

            if (typeof showToast === "function") {
                showToast(
                    "Something went wrong while creating the dispatch.",
                    "error",
                );
            }
        }
    });
}

