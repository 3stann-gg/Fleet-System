/* ==========================================
   Driver Table
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadDrivers();
});

function loadDrivers() {
    fetch("/drivers")
        .then(response => response.json())
        .then(drivers => {
            renderDriverTable(drivers);
            if (typeof updateDriverStats === "function") {
                updateDriverStats();
            }
        })
        .catch(error => console.error(error));

}

function getDriverStatusClass(status) {
    const value = (status || "")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "");

    if (value === "available") return "available";
    if (value === "onduty") return "trip";
    if (value === "onleave") return "maintenance";

    return "out";

}

function getDriverInitials(firstName, lastName) {

    return (
        (firstName?.charAt(0) || "") +
        (lastName?.charAt(0) || "")
    ).toUpperCase();

}

function renderDriverTable(drivers) {
    if (typeof applyDriverFilters === "function") {
        applyDriverFilters();
    }
    if (typeof refreshDriverPagination === "function") {
        refreshDriverPagination();
    }

    const tableBody = document.getElementById("driverTableBody");

    if (!tableBody) return;

    let html = "";
    drivers.forEach(driver => {

        const badgeClass = getDriverStatusClass(driver.status);

        html += `
        <tr
            data-id="${driver.id}"
            data-first-name="${driver.first_name ?? ""}"
            data-last-name="${driver.last_name ?? ""}"
            data-license-number="${driver.license_number ?? ""}"
            data-license-class="${driver.license_class ?? ""}"
            data-license-expiry="${driver.license_expiry ?? ""}"
            data-contact-number="${driver.contact_number ?? ""}"
            data-email="${driver.email ?? ""}"
            data-experience="${driver.experience ?? ""}"
            data-address="${driver.address ?? ""}"
            data-emergency-contact="${driver.emergency_contact ?? ""}"
            data-notes="${driver.notes ?? ""}"
            data-status="${driver.status ?? ""}"
            data-assigned-vehicle-id="${driver.assigned_vehicle_id ?? ""}"
            data-vehicle="${driver.vehicle ? `${driver.vehicle.brand ?? ""} ${driver.vehicle.model ?? ""} — ${driver.vehicle.vehicle_type ?? ""}`.trim() : "Unassigned"}"
            data-photo="${driver.photo ?? ""}"
        >
            <td>
                <input
                    type="checkbox"
                    class="driver-checkbox"
                    data-id="${driver.id}">
            </td>

            <td>
                <div class="driver-info">
                    <div class="driver-avatar">
                        ${getDriverInitials(
                            driver.first_name,
                            driver.last_name
                        )}
                    </div>
                    <div>
                        <div class="driver-name">
                            ${driver.first_name}
                            ${driver.last_name}
                        </div>
                        <small>
                            Fleet Driver
                        </small>
                    </div>
                </div>
            </td>

            <td>
                DRV-${String(driver.id).padStart(3,"0")}
            </td>

            <td>
                ${driver.license_number}
            </td>

            <td>
                ${driver.license_class}
            </td>

            <td>
                ${driver.vehicle ? `
                    <div class="vehicle-info">
                        <div>
                            <div>
                                ${driver.vehicle.brand ?? ""}
                                ${driver.vehicle.model ?? ""}
                            </div>
                            <small>
                                ${driver.vehicle.vehicle_type ?? ""}
                            </small>
                        </div>
                    </div>
                `: "Unassigned"}
            </td>

            <td>
                <span class="status-badge ${badgeClass}">
                    ${driver.status}
                </span>
            </td>

            <td>
                ${driver.contact_number}
            </td>

            <td>
                <div class="action-buttons">
                    <button
                        class="action-btn view"
                        data-id="${driver.id}">
                        <i class="ph ph-eye"></i>
                    </button>

                    <button
                        class="action-btn edit"
                        data-id="${driver.id}">
                        <i class="ph ph-pencil-simple"></i>
                    </button>

                    <button
                        class="action-btn delete"
                        data-id="${driver.id}">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            </td>
        </tr>

        `;

    });

    tableBody.innerHTML = html;

    if (typeof refreshDriverBulkState === "function") {
        refreshDriverBulkState();
    }
    else if (typeof initDriverPagination === "function") {
        initDriverPagination();
    }

}