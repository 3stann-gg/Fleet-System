/* ==========================================
   View Vehicle Modal
========================================== */

function setViewVehicleText(modal, id, value, fallback = "Not provided") {
    const element = modal.querySelector(`#${id}`);

    if (!element) {
        return;
    }

    const text =
        value !== null && value !== undefined && String(value).trim() !== ""
            ? String(value)
            : fallback;

    element.textContent = text;
}

function calculateVehicleFuelLevel(currentFuel, tankCapacity) {
    const fuel = Number(currentFuel);

    const tank = Number(tankCapacity);

    if (Number.isNaN(fuel) || Number.isNaN(tank) || tank <= 0) {
        return null;
    }

    const percentage = (fuel / tank) * 100;

    return Math.max(0, Math.min(100, percentage));
}

function formatVehicleFuelLevel(currentFuel, tankCapacity) {
    const percentage = calculateVehicleFuelLevel(currentFuel, tankCapacity);

    if (percentage === null) {
        return "0%";
    }

    return `${percentage.toFixed(1)}%`;
}

function formatVehicleFuelAmount(currentFuel) {
    const value = Number(currentFuel);

    if (Number.isNaN(value)) {
        return "Not available";
    }

    return `${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} L`;
}

function formatVehicleTankCapacity(tankCapacity) {
    const value = Number(tankCapacity);

    if (Number.isNaN(value)) {
        return "Not available";
    }

    return `${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} L`;
}

function formatVehicleMileage(mileage) {
    const value = Number(mileage);

    if (Number.isNaN(value)) {
        return "Not available";
    }

    return `${value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })} km`;
}

function formatVehicleViewDate(date) {
    if (!date) {
        return "Not provided";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "Not provided";
    }

    return parsed.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function openVehicleDetailsModal(modal) {
    if (!modal.classList.contains("show")) {
        modal.dataset.previousBodyOverflow = document.body.style.overflow;
    }

    modal.classList.add("show");

    document.body.style.overflow = "hidden";
}

function closeVehicleDetailsModal(modal) {
    if (!modal.classList.contains("show")) {
        return;
    }

    modal.classList.remove("show");
    document.body.style.overflow = modal.dataset.previousBodyOverflow || "";
    delete modal.dataset.previousBodyOverflow;
    modal.currentVehicle = null;
    modal.currentRow = null;
}

function populateViewVehicleModal(modal, vehicle) {
    if (!modal || !vehicle) {
        return;
    }

    const driver = vehicle.drivers?.[0];
    const vehicleName =
        [vehicle.brand, vehicle.model].filter(Boolean).join(" ") ||
        "Not provided";
    const driverName = driver
        ? [driver.first_name, driver.last_name].filter(Boolean).join(" ")
        : "Not Assigned";
    const fuelType = vehicle.fuel_type || "Not provided";
    const tankCapacity = vehicle.tank_capacity;
    const currentFuel = vehicle.current_fuel;
    const currentMileage = vehicle.current_odometer;

    setViewVehicleText(modal, "viewVehicleName", vehicleName);
    setViewVehicleText(
        modal,
        "viewVehicleSubtitle",
        "Emergency Response Unit",
        "",
    );

    setViewVehicleText(modal, "viewPlateNumber", vehicle.plate_number);
    setViewVehicleText(modal, "viewVehicleType", vehicle.vehicle_type);
    setViewVehicleText(
        modal,
        "viewVehicleDepartment",
        vehicle.department,
        "Unassigned",
    );
    setViewVehicleText(modal, "viewDriver", driverName, "Not Assigned");
    setViewVehicleText(modal, "viewFuelType", fuelType);
    setViewVehicleText(
        modal,
        "viewTankCapacity",
        formatVehicleTankCapacity(tankCapacity),
        "Not available",
    );
    setViewVehicleText(
        modal,
        "viewCurrentFuel",
        formatVehicleFuelAmount(currentFuel),
        "Not available",
    );
    setViewVehicleText(
        modal,
        "viewFuelLevel",
        formatVehicleFuelLevel(currentFuel, tankCapacity),
        "Not available",
    );
    setViewVehicleText(
        modal,
        "viewMileage",
        formatVehicleMileage(currentMileage),
        "Not available",
    );
    setViewVehicleText(
        modal,
        "viewPurchaseDate",
        formatVehicleViewDate(vehicle.purchase_date),
    );
    setViewVehicleText(
        modal,
        "viewInsuranceExpiry",
        formatVehicleViewDate(vehicle.insurance_expiry),
    );
    setViewVehicleText(
        modal,
        "viewVehicleNotes",
        vehicle.notes,
        "No additional information",
    );

    const status = vehicle.status || "Not provided";
    const statusClass =
        typeof getVehicleStatusClass === "function"
            ? getVehicleStatusClass(status)
            : "out";
    const statusBadge = modal.querySelector("#viewVehicleStatus");
    const summaryStatus = modal.querySelector("#viewVehicleStatusSummary");

    if (statusBadge) {
        statusBadge.className = `status-badge ${statusClass}`;

        statusBadge.textContent = status;
    }

    if (summaryStatus) {
        summaryStatus.className = `status-badge ${statusClass}`;

        summaryStatus.textContent = status;
    }
}


function initViewVehicleModal() {
    const modal = document.getElementById("viewVehicleModal");
    const closeButton = document.getElementById("closeViewVehicleModal");
    const footerCloseButton = document.getElementById("closeViewBtn");
    const editFromViewButton = document.getElementById("editVehicleBtn");

    if (!modal || modal.dataset.viewVehicleModalInitialized === "true") {
        return;
    }

    modal.dataset.viewVehicleModalInitialized = "true";


    document.addEventListener("click", async (event) => {
        const viewButton = event.target.closest(".action-btn.view");

        if (!viewButton) {
            return;
        }

        const vehicleId = viewButton.dataset.id;

        if (!vehicleId) {
            window.showToast("Vehicle ID not found.", "error");

            return;
        }

        try {
            const response = await fetch(`/fleet/${vehicleId}`, {
                headers: {
                    Accept: "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load vehicle details.",
                );
            }

            if (!data.vehicle) {
                throw new Error("Vehicle record not found.");
            }

            modal.currentVehicle = data.vehicle;

            modal.availableDrivers = Array.isArray(data.drivers)
                ? data.drivers
                : [];

            const row = viewButton.closest("tr");

            modal.currentRow = row || null;

            populateViewVehicleModal(modal, data.vehicle);

            openVehicleDetailsModal(modal);
        } catch (error) {
            console.error("VIEW VEHICLE ERROR:", error);

            window.showToast(
                error.message || "Unable to load vehicle details.",
                "error",
            );
        }
    });


    closeButton?.addEventListener("click", () =>
        closeVehicleDetailsModal(modal),
    );

    footerCloseButton?.addEventListener("click", () =>
        closeVehicleDetailsModal(modal),
    );

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeVehicleDetailsModal(modal);
        }
    });

    editFromViewButton?.addEventListener("click", () => {
        const vehicle = modal.currentVehicle;

        const editModal = document.getElementById("editVehicleModal");

        if (!vehicle || !editModal) {
            return;
        }

        /*
            |--------------------------------------------------------------------------
            | No second fetch needed.
            | We already have the complete vehicle data.
            |--------------------------------------------------------------------------
            */
        populateEditVehicleModal(vehicle);

        /*
            |--------------------------------------------------------------------------
            | VehicleController@show already provides available drivers.
            | Store them when View opened.
            |--------------------------------------------------------------------------
            */
        if (
            Array.isArray(modal.availableDrivers) &&
            typeof populateEditDriverDropdown === "function"
        ) {
            populateEditDriverDropdown(modal.availableDrivers, vehicle);
        }

        closeVehicleDetailsModal(modal);

        openEditVehicleModal(editModal);
    });


    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("show")) {
            closeVehicleDetailsModal(modal);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initViewVehicleModal();
});
