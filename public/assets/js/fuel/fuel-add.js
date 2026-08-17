/* ==========================================
   Add Fuel Record
========================================== */

let fuelAddInitialized = false;
let availableFuelVehicles = [];

function formatFuelVehicleName(vehicle) {
    const name = [vehicle.brand, vehicle.model].filter(Boolean).join(" ");

    return [name, vehicle.vehicle_type].filter(Boolean).join(" - ");
}

function formatFuelLiters(value) {
    const number = Number(value);

    if (Number.isNaN(number)) {
        return "Not available";
    }

    return `${number.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} L`;
}

function formatFuelLevel(currentFuel, tankCapacity) {
    const fuel = Number(currentFuel);
    const tank = Number(tankCapacity);

    if (Number.isNaN(fuel) || Number.isNaN(tank) || tank <= 0) {
        return "Not available";
    }

    const percentage = Math.max(0, Math.min(100, (fuel / tank) * 100));

    return `${percentage.toFixed(0)}%`;
}


async function generateFuelRecordNumber() {
    try {
        const response = await fetch("/fuel-records/next-number", {
            headers: {
                Accept: "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to generate fuel record number.",
            );
        }

        return data.fuel_number || "";
    } catch (error) {
        console.error("FUEL NUMBER GENERATION ERROR:", error);

        return "";
    }
}


async function loadFuelVehicles() {
    const vehicleSelect = document.getElementById("fuelVehicle");

    if (!vehicleSelect) {
        return;
    }

    vehicleSelect.innerHTML = '<option value="">Loading vehicles...</option>';

    try {
        const response = await fetch("/fleet", {
            headers: {
                Accept: "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load vehicles.");
        }

        const vehicles = data.vehicles || [];
        /*
        |--------------------------------------------------------------------------
        | Fuel Management currently handles liquid fuel vehicles.
        |--------------------------------------------------------------------------
        */
        availableFuelVehicles = vehicles.filter(
            (vehicle) =>
                ["Diesel", "Gasoline", "Premium Gasoline", "Hybrid"].includes(
                    vehicle.fuel_type,
                ) &&
                Array.isArray(vehicle.drivers) &&
                vehicle.drivers.length > 0,
        );

        vehicleSelect.innerHTML = '<option value="">Select Vehicle</option>';

        availableFuelVehicles.forEach((vehicle) => {
            const option = document.createElement("option");

            option.value = vehicle.id;

            option.textContent = formatFuelVehicleName(vehicle);

            vehicleSelect.appendChild(option);
        });
    } catch (error) {
        console.error("FUEL VEHICLE LOAD ERROR:", error);

        vehicleSelect.innerHTML =
            '<option value="">Failed to load vehicles</option>';

        if (typeof showToast === "function") {
            showToast("Failed to load fuel vehicles.", "error");
        }
    }
}

function populateFuelVehicleDetails(vehicle) {
    const plateInput = document.getElementById("fuelPlate");
    const driverInput = document.getElementById("fuelDriver");
    const driverIdInput = document.getElementById("fuelDriverId");
    const fuelTypeSelect = document.getElementById("fuelType");
    const currentFuelInput = document.getElementById("fuelCurrentFuel");
    const tankCapacityInput = document.getElementById("fuelTankCapacity");
    const odometerInput = document.getElementById("fuelOdometer");

    if (!vehicle) {
        if (plateInput) {
            plateInput.value = "";
        }
        if (driverInput) {
            driverInput.value = "";
        }
        if (driverIdInput) {
            driverIdInput.value = "";
        }

        if (fuelTypeSelect) {
            fuelTypeSelect.value = "";
        }
        if (currentFuelInput) {
            currentFuelInput.value = "";
        }
        if (tankCapacityInput) {
            tankCapacityInput.value = "";
        }
        if (odometerInput) {
            odometerInput.value = "";
        }

        return;
    }

    plateInput.value = vehicle.plate_number || "";

    const driver = vehicle.drivers?.[0];

    if (driver) {
        driverInput.value = [driver.first_name, driver.last_name]
            .filter(Boolean)
            .join(" ");

        driverIdInput.value = driver.id;
    } else {
        driverInput.value = "No assigned driver";

        driverIdInput.value = "";
    }

    fuelTypeSelect.value = vehicle.fuel_type || "";
    fuelTypeSelect.disabled = false;
    currentFuelInput.value = formatFuelLiters(vehicle.current_fuel);
    tankCapacityInput.value = formatFuelLiters(vehicle.tank_capacity);

    /*
    |--------------------------------------------------------------------------
    | Use latest vehicle mileage as starting value.
    | User can only enter the new reading.
    |--------------------------------------------------------------------------
    */
    if (
        vehicle.current_odometer !== null &&
        vehicle.current_odometer !== undefined
    ) {
        odometerInput.placeholder = `Current: ${Number(
            vehicle.current_odometer,
        ).toLocaleString()} km`;
    }
}

function updateFuelTotalCost() {
    const quantity = Number(document.getElementById("fuelQuantity")?.value);

    const costPerLiter = Number(
        document.getElementById("fuelCostPerLiter")?.value,
    );

    const totalCostInput = document.getElementById("fuelTotalCost");

    if (!totalCostInput) {
        return;
    }

    if (Number.isNaN(quantity) || Number.isNaN(costPerLiter)) {
        totalCostInput.value = "";

        return;
    }

    totalCostInput.value = (quantity * costPerLiter).toFixed(2);
}

function initFuelAdd() {
    const form = document.getElementById("fuelForm");

    if (!form || form.dataset.fuelAddInitialized === "true") {
        return;
    }

    fuelAddInitialized = true;
    form.dataset.fuelAddInitialized = "true";
    const vehicleSelect = document.getElementById("fuelVehicle");
    const quantityInput = document.getElementById("fuelQuantity");
    const costPerLiterInput = document.getElementById("fuelCostPerLiter");
    /*
    |--------------------------------------------------------------------------
    | Generate record number
    |--------------------------------------------------------------------------
    */
    const fuelNumberInput = document.getElementById("fuelNumber");

    /*
    |--------------------------------------------------------------------------
    | Load Vehicles
    |--------------------------------------------------------------------------
    */
    loadFuelVehicles();
    /*
    |--------------------------------------------------------------------------
    | Vehicle change
    |--------------------------------------------------------------------------
    */
    vehicleSelect?.addEventListener("change", () => {
        const vehicleId = vehicleSelect.value;

        const vehicle = availableFuelVehicles.find(
            (item) => String(item.id) === String(vehicleId),
        );

        populateFuelVehicleDetails(vehicle || null);
    });
    /*
    |--------------------------------------------------------------------------
    | Cost calculation
    |--------------------------------------------------------------------------
    */
    quantityInput?.addEventListener("input", updateFuelTotalCost);
    costPerLiterInput?.addEventListener("input", updateFuelTotalCost);
    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (form.dataset.submitting === "true") {
            return;
        }
        if (typeof validateFuelForm === "function" && !validateFuelForm(form)) {
            return;
        }

        const vehicleId = vehicleSelect?.value;
        const driverId = document.getElementById("fuelDriverId")?.value;

        if (!vehicleId) {
            showToast?.("Please select a vehicle.", "error");
            return;
        }
        if (!driverId) {
            showToast?.(
                "The selected vehicle has no assigned driver.",
                "error",
            );
            return;
        }

        form.dataset.submitting = "true";

        const saveButton = document.getElementById("saveFuelBtn");

        if (saveButton) {
            saveButton.disabled = true;

            saveButton.textContent = "Saving...";
        }

        try {
            const payload = {
                fuel_number: document
                    .getElementById("fuelNumber")
                    ?.value.trim(),

                vehicle_id: vehicleId,
                driver_id: driverId,
                fuel_amount: document.getElementById("fuelQuantity")?.value,
                cost_per_liter:
                    document.getElementById("fuelCostPerLiter")?.value,

                /*
                    |--------------------------------------------------------------------------
                    | Backend recalculates total cost.
                    |--------------------------------------------------------------------------
                    */
                cost: document.getElementById("fuelTotalCost")?.value,
                odometer: document.getElementById("fuelOdometer")?.value,
                date: document.getElementById("fuelRefuelDate")?.value,
                refuel_time:
                    document.getElementById("fuelRefuelTime")?.value || null,
                fuel_type: document.getElementById("fuelType")?.value,
                fuel_station: document
                    .getElementById("fuelStation")
                    ?.value.trim(),
                receipt_number:
                    document.getElementById("fuelReceipt")?.value.trim() ||
                    null,
                payment_method:
                    document.getElementById("fuelPayment")?.value || null,
                notes:
                    document.getElementById("fuelNotes")?.value.trim() || null,
            };

            const response = await fetch("/fuel-records", {
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
                const firstError = data.errors
                    ? Object.values(data.errors).flat()[0]
                    : null;

                throw new Error(
                    firstError || data.message || "Failed to save fuel record.",
                );
            }
            /*
                |--------------------------------------------------------------------------
                | Reload real database records
                |--------------------------------------------------------------------------
                */
            if (typeof loadFuelRecords === "function") {
                await loadFuelRecords();
            }
            if (typeof loadFuelVehicles === "function") {
                await loadFuelVehicles();
            }

            form.reset();

            clearAllFuelErrors?.(form);
            /*
                |--------------------------------------------------------------------------
                | Generate a new number for the next record
                |--------------------------------------------------------------------------
                */

            populateFuelVehicleDetails(null);

            updateFuelTotalCost();

            if (typeof closeAddFuelModal === "function") {
                closeAddFuelModal();
            }

            if (typeof refreshFuelTable === "function") {
                refreshFuelTable({
                    resetPage: false,
                    refreshStatistics: true,
                    reason: "add",
                });
            }
            if (typeof updateFuelStatistics === "function") {
                updateFuelStatistics();
            }

            showToast?.(
                data.message || "Fuel record saved successfully.",
                "success",
            );
        } catch (error) {
            console.error("FUEL CREATE ERROR:", error);

            showToast?.(
                error.message || "Unable to save fuel record.",
                "error",
            );
        } finally {
            form.dataset.submitting = "false";

            if (saveButton) {
                saveButton.disabled = false;

                saveButton.textContent = "Save Fuel Record";
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initFuelAdd();
});
