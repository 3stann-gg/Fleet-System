/* ==========================================
   HIMS Fleet - Dispatch Add

   Flow:
   Approved Reservation
   + RoutePlan = Ready For Dispatch
          ↓
   Create Dispatch = Pending
          ↓
   Schedule comes from RoutePlan
========================================== */

let availableReservations = [];

document.addEventListener("DOMContentLoaded", () => {
    initDispatchAdd();
    loadAvailableReservations();
    loadNextDispatchNumber();
});


function getDispatchCsrfToken() {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || ""
    );
}

async function dispatchAddApiRequest(url, options = {}) {
    const method = String(options.method || "GET").toUpperCase();
    const headers = {
        Accept: "application/json",
        ...(options.headers || {}),
    };
    if (options.body !== undefined && options.body !== null) {
        headers["Content-Type"] = "application/json";
    }
    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
        const csrfToken = getDispatchCsrfToken();
        if (csrfToken) {
            headers["X-CSRF-TOKEN"] = csrfToken;
        }
    }
    const response = await fetch(url, {
        ...options,
        method,
        headers,
        credentials: "same-origin",
    });

    let data = {};

    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok) {
        const error = new Error(data.message || "Dispatch request failed.");
        error.status = response.status;
        error.errors = data.errors || {};
        error.data = data;
        throw error;
    }

    return data;
}

async function loadNextDispatchNumber() {
    const numberInput = document.getElementById("dispatchNumber");

    if (!numberInput) {
        return;
    }

    try {
        const data = await dispatchAddApiRequest("/dispatch/next-number", {
            method: "GET",
        });

        numberInput.value = data.dispatch_number || "";
    } catch (error) {
        console.error("Unable to load next dispatch number:", error);

        numberInput.value = "";
    }
}

function getReservationRoutePlan(reservation) {
    return reservation?.route_plan || reservation?.routePlan || null;
}

function getDispatchVehicleLabel(vehicle) {
    if (!vehicle) {
        return "Unassigned";
    }
    const brandModel = [vehicle.brand, vehicle.model]
        .filter(Boolean)
        .map((value) => String(value).trim())
        .filter(Boolean)
        .join(" ")
        .trim();
    const vehicleType = String(
        vehicle.vehicle_type || vehicle.type || "",
    ).trim();
    if (brandModel && vehicleType) {
        return `${brandModel} - ${vehicleType}`;
    }
    if (brandModel) {
        return brandModel;
    }
    if (vehicleType) {
        return vehicleType;
    }
    return (
        vehicle.vehicle_name ||
        vehicle.name ||
        vehicle.plate_number ||
        "Unassigned"
    );
}

function getDispatchDriverLabel(driver) {
    if (!driver) {
        return "Unassigned";
    }
    const name = [driver.first_name, driver.last_name]
        .filter(Boolean)
        .map((value) => String(value).trim())
        .filter(Boolean)
        .join(" ")
        .trim();
    return name || driver.name || "Unassigned";
}

async function loadAvailableReservations() {
    try {
        const data = await dispatchAddApiRequest(
            "/dispatch/available-reservations",
            {
                method: "GET",
            },
        );
        availableReservations = Array.isArray(data.reservations)
            ? data.reservations
            : [];

        populateReservationSelect(availableReservations);
    } catch (error) {
        console.error("Error loading Dispatch reservations:", error);
        availableReservations = [];
        populateReservationSelect([]);
        if (typeof showToast === "function") {
            showToast(
                error.message ||
                    "Unable to load reservations ready for dispatch.",
                "error",
            );
        }
    }
}


function populateReservationSelect(reservations) {
    const select = document.getElementById("dispatchReservation");

    if (!select) {
        return;
    }
    select.innerHTML = '<option value="">Select Reservation</option>';
    reservations.forEach((reservation) => {
        const option = document.createElement("option");
        option.value = String(reservation.id);
        const number =
            reservation.reservation_number || `Reservation #${reservation.id}`;
        const patient = reservation.patient_name
            ? ` — ${reservation.patient_name}`
            : "";
        option.textContent = number + patient;
        select.appendChild(option);
    });

    if (reservations.length === 0) {
        select.innerHTML =
            '<option value="">No routes ready for dispatch</option>';
    }
}

function handleReservationChange() {
    const select = document.getElementById("dispatchReservation");
    if (!select) {
        return;
    }
    const reservationId = select.value;
    if (!reservationId) {
        clearReservationDetails();
        return;
    }
    const reservation = availableReservations.find(
        (item) => String(item.id) === String(reservationId),
    );
    if (!reservation) {
        clearReservationDetails();
        return;
    }
    fillReservationDetails(reservation);
}

function fillReservationDetails(reservation) {
    const routePlan = getReservationRoutePlan(reservation);

    const setValue = (id, value) => {
        const element = document.getElementById(id);

        if (element) {
            element.value = value ?? "";
        }
    };


    setValue("dispatchPatient", reservation.patient_name);
    setValue("dispatchRequestType", reservation.request_type);
    setValue("dispatchContact", reservation.contact_number);
    setValue("dispatchVehicle", getDispatchVehicleLabel(reservation.vehicle));
    setValue("dispatchDriver", getDispatchDriverLabel(reservation.driver));
    /*
    |--------------------------------------------------------------------------
    | FINAL ROUTE
    |--------------------------------------------------------------------------
    |
    | Route Planning may have changed the initial
    | Reservation route, so Dispatch uses RoutePlan.
    |
    */
    setValue(
        "dispatchPickup",
        routePlan?.origin || reservation.pickup_location || "",
    );
    setValue(
        "dispatchDestination",
        routePlan?.destination || reservation.destination || "",
    );
    /*
    |--------------------------------------------------------------------------
    | FINAL DISPATCH SCHEDULE
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | Dispatch date/time comes from RoutePlan,
    | NOT Reservation.schedule_date/time.
    |
    */
    setValue(
        "dispatchDate",
        String(routePlan?.departure_date || "").slice(0, 10),
    );
    setValue(
        "dispatchTime",
        String(routePlan?.departure_time || "").slice(0, 5),
    );
    setValue(
        "dispatchPriority",
        routePlan?.priority || reservation.priority || "",
    );
    setValue("dispatchNotes", "");
}

/* ==========================================
   CLEAR AUTO-FILLED DETAILS
========================================== */

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
    const reservation = dispatch.reservation || null;
    const routePlan = getReservationRoutePlan(reservation);
    const vehicle = reservation?.vehicle || null;
    const driver = reservation?.driver || null;
    const vehicleName = getDispatchVehicleLabel(vehicle);
    const driverName = getDispatchDriverLabel(driver);
    const scheduleText = formatDispatchSchedule(
        dispatch.dispatch_date || routePlan?.departure_date,
        dispatch.departure_time || routePlan?.departure_time,
    );
    const routeOrigin = routePlan?.origin || reservation?.pickup_location || "";
    const routeDestination =
        routePlan?.destination || reservation?.destination || "";
    const priority = routePlan?.priority || reservation?.priority || "";
    const status = dispatch.trip_status || "Pending";
    const statusClassMap = {
        Pending: "pending",
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
    tr.dataset.pickup = routeOrigin;
    tr.dataset.destination = routeDestination;
    tr.dataset.scheduleDate = String(
        dispatch.dispatch_date || routePlan?.departure_date || "",
    ).slice(0, 10);
    tr.dataset.scheduleTime = String(
        dispatch.departure_time || routePlan?.departure_time || "",
    ).slice(0, 5);
    tr.dataset.priority = priority;
    tr.dataset.contact = reservation?.contact_number ?? "";
    tr.dataset.notes = dispatch.remarks ?? "";
    tr.dataset.requestType = reservation?.request_type ?? "";

    const tdCheckbox = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "dispatch-checkbox";
    checkbox.dataset.id = dispatch.id;
    checkbox.setAttribute("aria-label", `Select ${dispatch.dispatch_number}`);
    tdCheckbox.appendChild(checkbox);
    /*
    |--------------------------------------------------------------------------
    | Dispatch Number
    |--------------------------------------------------------------------------
    */
    const tdNumber = document.createElement("td");
    const numberSpan = document.createElement("span");
    numberSpan.className = "dispatch-number";
    numberSpan.textContent = dispatch.dispatch_number || "—";
    tdNumber.appendChild(numberSpan);
    /*
    |--------------------------------------------------------------------------
    | Reservation Number
    |--------------------------------------------------------------------------
    */
    const tdReservation = document.createElement("td");
    const reservationSpan = document.createElement("span");
    reservationSpan.className = "dispatch-reservation-number";
    reservationSpan.textContent = reservation?.reservation_number ?? "—";
    tdReservation.appendChild(reservationSpan);
    /*
    |--------------------------------------------------------------------------
    | Patient
    |--------------------------------------------------------------------------
    */
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
    /*
    |--------------------------------------------------------------------------
    | Vehicle
    |--------------------------------------------------------------------------
    */
    const tdVehicle = document.createElement("td");
    const vehicleSpan = document.createElement("span");
    vehicleSpan.className = "dispatch-vehicle";
    vehicleSpan.textContent = vehicleName;
    tdVehicle.appendChild(vehicleSpan);
    /*
    |--------------------------------------------------------------------------
    | Driver
    |--------------------------------------------------------------------------
    */
    const tdDriver = document.createElement("td");
    const driverSpan = document.createElement("span");
    driverSpan.className = "dispatch-driver";
    driverSpan.textContent = driverName;
    tdDriver.appendChild(driverSpan);
    /*
    |--------------------------------------------------------------------------
    | Final Planned Route
    |--------------------------------------------------------------------------
    */
    const tdRoute = document.createElement("td");
    const routeSpan = document.createElement("span");
    routeSpan.className = "dispatch-route";
    routeSpan.textContent =
        routeOrigin && routeDestination
            ? `${routeOrigin} → ${routeDestination}`
            : "—";
    tdRoute.appendChild(routeSpan);
    /*
    |--------------------------------------------------------------------------
    | Schedule
    |--------------------------------------------------------------------------
    */
    const tdSchedule = document.createElement("td");
    const scheduleSpan = document.createElement("span");
    scheduleSpan.className = "dispatch-schedule";
    scheduleSpan.textContent = scheduleText || "—";
    tdSchedule.appendChild(scheduleSpan);
    /*
    |--------------------------------------------------------------------------
    | Priority
    |--------------------------------------------------------------------------
    */
    const tdPriority = document.createElement("td");
    const prioritySpan = document.createElement("span");
    prioritySpan.className = "dispatch-priority";
    prioritySpan.textContent = priority || "—";
    tdPriority.appendChild(prioritySpan);
    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */
    const tdStatus = document.createElement("td");
    const statusSpan = document.createElement("span");
    statusSpan.className = `status-badge ${statusClass}`;
    statusSpan.textContent = status;
    tdStatus.appendChild(statusSpan);
    /*
    |--------------------------------------------------------------------------
    | Actions
    |--------------------------------------------------------------------------
    */
    const tdActions = document.createElement("td");
    const actionsWrap = document.createElement("div");
    actionsWrap.className = "action-buttons";
    const viewBtn = document.createElement("button");
    viewBtn.type = "button";
    viewBtn.className = "action-btn view-dispatch";
    viewBtn.dataset.id = dispatch.id;
    viewBtn.setAttribute("aria-label", `View ${dispatch.dispatch_number}`);
    viewBtn.innerHTML = '<i class="ph ph-eye"></i>';
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "action-btn edit-dispatch";
    editBtn.dataset.id = dispatch.id;
    editBtn.setAttribute("aria-label", `Edit ${dispatch.dispatch_number}`);
    editBtn.innerHTML = '<i class="ph ph-pencil-simple"></i>';
    /*
    |--------------------------------------------------------------------------
    | Completed / Cancelled dispatches are history.
    |--------------------------------------------------------------------------
    */
    if (["Completed", "Cancelled"].includes(status)) {
        editBtn.disabled = true;
    }
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "action-btn delete-dispatch";
    deleteBtn.dataset.id = dispatch.id;
    deleteBtn.setAttribute("aria-label", `Delete ${dispatch.dispatch_number}`);
    deleteBtn.innerHTML = '<i class="ph ph-trash"></i>';
  
    if (!["Pending", "Assigned"].includes(status)) {
        deleteBtn.disabled = true;
    }
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


function formatDispatchSchedule(date, time) {
    if (!date) {
        return "";
    }
    const cleanDate = String(date).slice(0, 10);
    const cleanTime = String(time || "").slice(0, 5);
    const iso = cleanTime ? `${cleanDate}T${cleanTime}` : `${cleanDate}T00:00`;
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) {
        return "";
    }
    const datePart = parsed.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
    if (!cleanTime) {
        return datePart;
    }
    const timePart = parsed.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
    return `${datePart}, ${timePart}`;
}


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
    const reservationSelect = document.getElementById("dispatchReservation");
    /*
    |--------------------------------------------------------------------------
    | Reservation Change
    |--------------------------------------------------------------------------
    */
    reservationSelect?.addEventListener("change", handleReservationChange);
    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (
            typeof validateDispatchForm === "function" &&
            !validateDispatchForm(form)
        ) {
            return;
        }
        const reservationId = reservationSelect?.value;
        if (!reservationId) {
            if (typeof showToast === "function") {
                showToast("Please select a reservation.", "error");
            }
            return;
        }
        const submitButton = form.querySelector('[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
        }
        /*
            |--------------------------------------------------------------------------
            | IMPORTANT
            |--------------------------------------------------------------------------
            | Do NOT send dispatch_date / departure_time.
            | DispatchController gets those values from:
            | Reservation → RoutePlan
            */

        const payload = {
            dispatch_number:
                document.getElementById("dispatchNumber")?.value.trim() || null,
            reservation_id: Number(reservationId),
            arrival_time: null,
            remarks:
                document.getElementById("dispatchNotes")?.value.trim() || null,
        };

        try {
            const data = await dispatchAddApiRequest("/dispatch", {
                method: "POST",

                body: JSON.stringify(payload),
            });

            /*
                |--------------------------------------------------------------------------
                | Refresh table
                |--------------------------------------------------------------------------
                */
            const tableBody = document.getElementById("dispatchTableBody");
            if (tableBody && data.dispatch) {
                const row = createDispatchRow(data.dispatch);
                tableBody.insertBefore(row, tableBody.firstChild);
            }
            /*
                |--------------------------------------------------------------------------
                | Remove reservation from available selector
                |--------------------------------------------------------------------------
                */
            availableReservations = availableReservations.filter(
                (reservation) =>
                    String(reservation.id) !== String(reservationId),
            );
            populateReservationSelect(availableReservations);
            /*
                |--------------------------------------------------------------------------
                | Reset Form
                |--------------------------------------------------------------------------
                */
            form.reset();
            clearReservationDetails();
            form.querySelectorAll(".is-invalid").forEach((element) =>
                element.classList.remove("is-invalid"),
            );
            modal.classList.remove("show");
            document.body.style.overflow = "";
            /*
                |--------------------------------------------------------------------------
                | Refresh Supporting UI
                |--------------------------------------------------------------------------
                */
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
                showToast(
                    data.message || "Dispatch created successfully.",
                    "success",
                );
            }
        } catch (error) {
            console.error("Dispatch creation error:", error);
            if (typeof showToast === "function") {
                showToast(
                    error.message ||
                        "Something went wrong while creating the dispatch.",
                    "error",
                );
            }
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
}
