/* ==========================================
Reservation Table
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadReservations();
});

async function loadReservations() {
    try {
        const response = await fetch("/reservation", {
            headers: {
                "Accept": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load reservations.");
        }

        console.log("RESERVATIONS:", data);

        renderReservationTable(data.reservations);

    } catch (error) {
        console.error("RESERVATION LOAD ERROR:", error);
    }
}

function getReservationStatusClass(status) {
    const value = (status || "")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "");

    if (value === "pending") return "pending";
    if (value === "approved") return "trip";
    if (value === "scheduled") return "scheduled";
    if (value === "completed") return "completed";
    if (value === "rejected") return "rejected";
    if (value === "cancelled") return "cancelled";

    return "out";
}

function formatReservationSchedule(date, time) {
    if (!date && !time) {
        return "";
    }

    if (date && time) {
        const dateObj = new Date(
            `${date}T${time}`
        );

        if (!isNaN(dateObj.getTime())) {

            return dateObj.toLocaleString(
                undefined,
                {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );
        }
    }

    if (date) return date;
    if (time) return time;

    return "";
}

function renderReservationTable(reservations) {

    const tableBody =
        document.getElementById("reservationTableBody");

    if (!tableBody) return;

    let html = "";

    reservations.forEach(reservation => {

        const statusClass =
            getReservationStatusClass(
                reservation.status
            );

        const vehicle = reservation.vehicle;

        const driver = reservation.driver;

        const vehicleName = vehicle
            ? `${vehicle.brand} ${vehicle.model}`
            : "Unassigned";

        const driverName = driver
            ? `${driver.first_name} ${driver.last_name}`
            : "Unassigned";

        const schedule = formatReservationSchedule(
            reservation.schedule_date,
            reservation.schedule_time
        );

        html += `
            <tr
                data-id="${reservation.id}"
                data-reservation-number="${reservation.reservation_number ?? ""}"
                data-patient-name="${reservation.patient_name ?? ""}"
                data-request-type="${reservation.request_type ?? ""}"
                data-vehicle-id="${reservation.vehicle_id ?? ""}"
                data-driver-id="${reservation.driver_id ?? ""}"
                data-pickup-location="${reservation.pickup_location ?? ""}"
                data-destination="${reservation.destination ?? ""}"
                data-schedule-date="${reservation.schedule_date ?? ""}"
                data-schedule-time="${reservation.schedule_time ?? ""}"
                data-priority="${reservation.priority ?? ""}"
                data-status="${reservation.status ?? ""}"
                data-contact-number="${reservation.contact_number ?? ""}"
                data-notes="${reservation.notes ?? ""}"
            >

                <td>
                    <input
                        type="checkbox"
                        class="reservation-checkbox"
                        data-id="${reservation.id}"
                        aria-label="Select ${reservation.reservation_number}"
                    >
                </td>

                <td>
                    <span class="reservation-number">
                        ${reservation.reservation_number ?? ""}
                    </span>
                </td>

                <td>
                    <div class="patient-info">

                        <div class="patient-name">
                            ${reservation.patient_name ?? ""}
                        </div>

                        <small>
                            ${reservation.request_type ?? ""}
                        </small>

                    </div>
                </td>

                <td>
                    <span class="reservation-vehicle">
                        ${vehicleName}
                    </span>
                </td>

                <td>
                    <span class="reservation-driver">
                        ${driverName}
                    </span>
                </td>

                <td>
                    <span class="reservation-pickup">
                        ${reservation.pickup_location ?? ""}
                    </span>
                </td>

                <td>
                    <span class="reservation-destination">
                        ${reservation.destination ?? ""}
                    </span>
                </td>

                <td>
                    <span class="reservation-schedule">
                        ${schedule}
                    </span>
                </td>

                <td>
                    <span class="status-badge ${statusClass}">
                        ${reservation.status ?? ""}
                    </span>
                </td>

                <td>

                    <div class="action-buttons">

                        <button
                            type="button"
                            class="action-btn view-reservation"
                            data-id="${reservation.id}"
                            aria-label="View ${reservation.reservation_number}"
                        >
                            <i class="ph ph-eye"></i>
                        </button>

                        <button
                            type="button"
                            class="action-btn edit-reservation"
                            data-id="${reservation.id}"
                            aria-label="Edit ${reservation.reservation_number}"
                        >
                            <i class="ph ph-pencil-simple"></i>
                        </button>

                        <button
                            type="button"
                            class="action-btn delete-reservation"
                            data-id="${reservation.id}"
                            aria-label="Delete ${reservation.reservation_number}"
                        >
                            <i class="ph ph-trash"></i>
                        </button>

                    </div>

                </td>

            </tr>
        `;
    });

    tableBody.innerHTML = html;

    if (typeof window.applyReservationFilters === "function") {
        window.applyReservationFilters();
    }

    if (typeof refreshReservationBulkState === "function") {
        refreshReservationBulkState();
    }
   
    if (typeof updateReservationStatistics === "function") {
        updateReservationStatistics();
    }
    
}