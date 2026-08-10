/* ==========================================
   Vehicle Table :)
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadVehicles();
});

function loadVehicles() {

    fetch("/fleet", {
        headers: {
            "Accept": "application/json"
        }
    })
        .then(response => response.json())
        .then(data => {
            const vehicles = data.vehicles ?? data;
            renderVehicleTable(vehicles);

            if (typeof updateVehicleStats === "function") {
                updateVehicleStats();
            }

        })
        .catch(error => {
            console.error("VEHICLE LOAD ERROR:", error);
        });
}

function getVehicleStatusClass(status) {
    const value = (status || "")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "");
    if (value === "available") return "available";
    if (value === "ontrip") return "trip";
    if (value === "maintenance") return "maintenance";

    return "out";
}

function getVehicleIcon(type) {

    switch (type) {

        case "Ambulance":
            return "ph-fill ph-ambulance";

        case "Patient Van":
        case "Van":
            return "ph-fill ph-van";

        case "Motorcycle":
            return "ph-fill ph-motorcycle";

        case "SUV":
        case "Car":
            return "ph-fill ph-car";

        default:
            return "ph-fill ph-car";
    }
}

function getVehicleDriverInitials(driverName) {
    if (!driverName || driverName === "Not Assigned") {
        return "";
    }

    return driverName
        .split(" ")
        .filter(Boolean)
        .map(name => name.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();
}

function renderVehicleTable(vehicles) {
    const tableBody =
        document.getElementById("vehicleTableBody");
    if (!tableBody) return;

    let html = "";

    vehicles.forEach(vehicle => {
        const badgeClass =
            getVehicleStatusClass(vehicle.status);
        const vehicleIcon =
            getVehicleIcon(vehicle.vehicle_type);
        const driverName =
            vehicle.driver_name ?? "Not Assigned";
        const initials =
            getVehicleDriverInitials(driverName);

        html += `
            <tr
                data-id="${vehicle.id}"
                data-brand="${vehicle.brand ?? ""}"
                data-model="${vehicle.model ?? ""}"
                data-plate-number="${vehicle.plate_number ?? ""}"
                data-vehicle-type="${vehicle.vehicle_type ?? ""}"
                data-driver-name="${driverName}"
                data-driver-license="${vehicle.driver_license ?? ""}"
                data-status="${vehicle.status ?? ""}"
                data-capacity="${vehicle.capacity ?? ""}"
                data-fuel-type="${vehicle.fuel_type ?? ""}"
                data-last-service="${vehicle.last_service ?? ""}"
            >

                <td>
                    <input
                        type="checkbox"
                        class="vehicle-checkbox"
                        data-id="${vehicle.id}">
                </td>

                <td>
                    <div class="vehicle-info">

                        <div class="vehicle-avatar">
                            <i class="${vehicleIcon}"></i>
                        </div>

                        <div>
                            <div class="vehicle-name">
                                ${vehicle.brand ?? ""}
                                ${vehicle.model ?? ""}
                            </div>

                            <small>
                                Emergency Response Unit
                            </small>
                        </div>

                    </div>
                </td>

                <td>
                    ${vehicle.plate_number ?? ""}
                </td>

                <td>
                    ${vehicle.vehicle_type ?? ""}
                </td>

                <td>
                    <div class="driver-info">

                        <div class="driver-avatar">
                            ${initials}
                        </div>

                        <span>
                            ${driverName}
                        </span>

                    </div>
                </td>

                <td>
                    <span class="status-badge ${badgeClass}">
                        ${vehicle.status ?? ""}
                    </span>
                </td>

                <td>
                    ${vehicle.fuel_type ?? ""}
                </td>

                <td>
                    ${vehicle.last_service ?? "---"}
                </td>

                <td>
                    <div class="action-buttons">

                        <button
                            class="action-btn view"
                            data-id="${vehicle.id}"
                            title="View">
                            <i class="ph ph-eye"></i>
                        </button>

                        <button
                            class="action-btn edit"
                            data-id="${vehicle.id}"
                            title="Edit">
                            <i class="ph ph-pencil-simple"></i>
                        </button>

                        <button
                            class="action-btn delete"
                            data-id="${vehicle.id}"
                            title="Delete">
                            <i class="ph ph-trash"></i>
                        </button>

                    </div>
                </td>

            </tr>
        `;
    });

    tableBody.innerHTML = html;

    if (typeof refreshVehicleBulkState === "function") {
        refreshVehicleBulkState();
    }

    if (typeof initVehiclePagination === "function") {
        initVehiclePagination();
    }
}