/* ==========================================
   Dispatch Table :)
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadDispatches();
});

function loadDispatches() {
    fetch("/dispatch", {
        headers: {
            Accept: "application/json",
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to load dispatches.");
            }

            return response.json();
        })
        .then((data) => {
            const dispatches = data.dispatches || [];

            renderDispatchTable(dispatches);

            if (typeof updateDispatchStatistics === "function") {
                updateDispatchStatistics(dispatches);
            }
            if (typeof refreshDispatchPagination === "function") {
                refreshDispatchPagination();
            }
        })
        .catch((error) => {
            console.error("Error loading dispatches:", error);
        });
}

function getDispatchStatusClass(status) {
    const value = (status || "")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "");

    if (value === "pending") return "pending";
    if (value === "assigned") return "scheduled";
    if (value === "enroute") return "trip";
    if (value === "arrived") return "approved";
    if (value === "completed") return "completed";
    if (value === "cancelled") return "cancelled";

    return "out";
}

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

function renderDispatchTable(dispatches) {
    const tableBody = document.getElementById("dispatchTableBody");

    if (!tableBody) return;

    let html = "";

    dispatches.forEach((dispatch) => {
        const reservation = dispatch.reservation || {};

        const vehicle = reservation.vehicle || null;
        const driver = reservation.driver || null;

        const patientName = reservation.patient_name || "N/A";
        const requestType = reservation.request_type || "N/A";

        const vehicleText = vehicle
            ? `${[vehicle.brand, vehicle.model].filter(Boolean).join(" ")} - ${vehicle.vehicle_type ?? ""}`
            : "Unassigned";

        const driverText = driver
            ? [driver.first_name, driver.last_name].filter(Boolean).join(" ")
            : "Unassigned";

        const pickup = reservation.pickup_location || "";
        const destination = reservation.destination || "";

        const scheduleDate = reservation.schedule_date || "";
        const scheduleTime = reservation.schedule_time || "";

        const priority = reservation.priority || "";
        const status = dispatch.trip_status || "";

        const statusClass = getDispatchStatusClass(status);

        html += `
            <tr
                data-id="${dispatch.id}"
                data-dispatch-number="${dispatch.dispatch_number ?? ""}"
                data-reservation-number="${reservation.reservation_number ?? ""}"
                data-patient="${patientName}"
                data-request-type="${requestType}"
                data-pickup="${pickup}"
                data-destination="${destination}"
                data-schedule-date="${scheduleDate}"
                data-schedule-time="${scheduleTime}"
                data-priority="${priority}"
                data-status="${status}"
                data-contact="${reservation.contact_number ?? ""}"
                data-notes="${reservation.notes ?? ""}"
            >
                <td>
                    <input
                        type="checkbox"
                        class="dispatch-checkbox"
                        data-id="${dispatch.id}"
                        aria-label="Select ${dispatch.dispatch_number ?? ""}"
                    >
                </td>

                <td>
                    <span class="dispatch-number">
                        ${dispatch.dispatch_number ?? "N/A"}
                    </span>
                </td>

                <td>
                    <span class="dispatch-reservation-number">
                        ${reservation.reservation_number ?? "N/A"}
                    </span>
                </td>

                <td>
                    <div class="dispatch-patient-info">

                        <div class="dispatch-patient-name">
                            ${patientName}
                        </div>

                        <div class="dispatch-request-type">
                            ${requestType}
                        </div>

                    </div>
                </td>

                <td>
                    ${
                        vehicle
                            ? `
                        <div class="vehicle-info">
                            <span class="dispatch-vehicle">
                                ${vehicleText}
                            </span>
                        </div>
                        `
                            : `
                        <span class="dispatch-vehicle">
                            Unassigned
                        </span>
                        `
                    }
                </td>

                <td>
                    ${
                        driver
                            ? `
                        <span class="dispatch-driver">
                            ${driverText}
                        </span>
                    `
                            : "Unassigned"
                    }
                </td>

                <td>
                    <span class="dispatch-route">
                        ${pickup} → ${destination}
                    </span>
                </td>

                <td>
                    <span class="dispatch-schedule">
                        ${formatDispatchSchedule(scheduleDate, scheduleTime)}
                    </span>
                </td>

                <td>
                    <span class="dispatch-priority">
                        ${priority}
                    </span>
                </td>

                <td>
                    <span class="status-badge ${statusClass}">
                        ${status}
                    </span>
                </td>

                <td>
                    <div class="action-buttons">

                        <button
                            type="button"
                            class="action-btn view-dispatch"
                            data-id="${dispatch.id}"
                            aria-label="View ${dispatch.dispatch_number ?? ""}"
                        >
                            <i class="ph ph-eye"></i>
                        </button>

                        <button
                            type="button"
                            class="action-btn edit-dispatch"
                            data-id="${dispatch.id}"
                            aria-label="Edit ${dispatch.dispatch_number ?? ""}"
                        >
                            <i class="ph ph-pencil-simple"></i>
                        </button>

                        <button
                            type="button"
                            class="action-btn delete-dispatch"
                            data-id="${dispatch.id}"
                            aria-label="Delete ${dispatch.dispatch_number ?? ""}"
                        >
                            <i class="ph ph-trash"></i>
                        </button>

                    </div>
                </td>

            </tr>
        `;
    });

    tableBody.innerHTML = html;

    if (typeof refreshDispatchBulkState === "function") {
        refreshDispatchBulkState();
    }

    if (typeof initDispatchPagination === "function") {
        initDispatchPagination();
    }
}
