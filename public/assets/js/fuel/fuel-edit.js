/* ==========================================
   Edit Fuel Record
========================================== */

async function getEditFuelSettings() {
    if (typeof window.getFuelModuleSettings === "function") {
        return await window.getFuelModuleSettings();
    }
    try {
        const response = await fetch("/settings/data", {
            headers: {
                Accept: "application/json",
            },
            credentials: "same-origin",
        });
        if (!response.ok) {
            throw new Error();
        }
        const data = await response.json();
        const settings = data?.settings?.fuel || {};
        return {
            requireStation: settings.requireStation === true,

            highCostAlert: Math.max(0, Number(settings.highCostAlert ?? 5000)),
        };
    } catch {
        return {
            requireStation: false,
            highCostAlert: 5000,
        };
    }
}

function applyEditFuelSettings(settings) {
    const station = document.getElementById("editFuelStation");
    const mark = document.getElementById("editFuelStationRequiredMark");
    const required = settings.requireStation === true;
    if (station) {
        station.required = required;
    }
    if (mark) {
        mark.hidden = !required;
    }
}

function updateEditFuelHighCostWarning(settings) {
    const total = Number(document.getElementById("editFuelTotalCost")?.value);
    const warning = document.getElementById("editFuelHighCostWarning");
    if (!warning) {
        return;
    }
    const threshold = Number(settings.highCostAlert || 0);
    if (threshold > 0 && !Number.isNaN(total) && total >= threshold) {
        warning.hidden = false;
        warning.textContent = `High-cost fuel transaction: total has reached the ₱${threshold.toLocaleString()} alert threshold.`;
    } else {
        warning.hidden = true;
        warning.textContent = "";
    }
}

//  RBAC
function canEditFuelRecords() {
    return window.FleetRBAC?.hasPermission?.("fuel", "canUpdate") === true;
}

let editFuelInitialized = false;


function populateEditFuelForm(row) {
    if (!row) {
        return;
    }

    const setValue = (id, value) => {
        const field = document.getElementById(id);

        if (!field) {
            return;
        }

        field.value = value == null ? "" : value;
    };

    const setSelect = (id, value) => {
        const field = document.getElementById(id);

        if (!field) {
            return;
        }

        const candidate = value == null ? "" : String(value);
        const exists = Array.from(field.options).some(
            (option) => option.value === candidate,
        );

        if (exists) {
            field.value = candidate;
        } else {
            field.value = "";
        }
    };

    const number =
        (row.dataset.fuelNumber || "").trim() ||
        row.querySelector(".fuel-number")?.textContent?.trim() ||
        "";
    const refuelDate = (row.dataset.refuelDate || "").trim();
    const refuelTime = (row.dataset.refuelTime || "").trim();
    const vehicle =
        (row.dataset.vehicle || "").trim() ||
        row.querySelector(".fuel-vehicle")?.textContent?.trim() ||
        "";
    const plate =
        (row.dataset.plate || "").trim() ||
        row.querySelector(".fuel-plate")?.textContent?.trim() ||
        "";
    const driver =
        (row.dataset.driver || "").trim() ||
        row.querySelector(".fuel-driver")?.textContent?.trim() ||
        "";
    const driverId = (row.dataset.driverId || "").trim();
    const fuelType =
        (row.dataset.fuelType || "").trim() ||
        row.querySelector(".fuel-type")?.textContent?.trim() ||
        "";
    const quantity = (row.dataset.quantity || "").trim();
    const costPerLiter = (row.dataset.costPerLiter || "").trim();
    const totalCost =
        (row.dataset.totalCost || "").trim() ||
        normalizeFuelTotal(quantity, costPerLiter);
    const odometer = (row.dataset.odometer || "").trim();
    const station =
        (row.dataset.station || "").trim() ||
        row.querySelector(".fuel-station")?.textContent?.trim() ||
        "";
    const receipt = (row.dataset.receipt || "").trim();
    const payment = (row.dataset.payment || "").trim();
    const notes = (row.dataset.notes || "").trim();

    setValue("editFuelNumber", number);
    // Refueling Date
    const editDate = refuelDate ? String(refuelDate).substring(0, 10) : "";

    setValue("editFuelRefuelDate", editDate);
    // Refueling Time
    const editTime = refuelTime ? String(refuelTime).substring(0, 5) : "";

    setValue("editFuelRefuelTime", editTime);
    // Vehicle
    const vehicleSelect = document.getElementById("editFuelVehicle");
    const vehicleId = (row.dataset.vehicleId || "").trim();
    if (vehicleSelect) {
        vehicleSelect.innerHTML = "";
        const vehicleOption = document.createElement("option");
        vehicleOption.value = vehicleId;
        const vehicleType = (row.dataset.vehicleType || "").trim();
        vehicleOption.textContent = vehicleType
            ? `${vehicle} - ${vehicleType}`
            : vehicle || "Vehicle";
        vehicleOption.selected = true;
        vehicleSelect.appendChild(vehicleOption);
    }
    setValue("editFuelPlate", plate === "—" ? "" : plate);
    setValue("editFuelDriver", driver);
    setValue("editFuelDriverId", driverId);
    // Fuel Type
    const fuelTypeSelect = document.getElementById("editFuelType");
    if (fuelTypeSelect) {
        fuelTypeSelect.value = fuelType;
        fuelTypeSelect.disabled = true;
    }
    setValue("editFuelQuantity", quantity);
    setValue("editFuelCostPerLiter", costPerLiter);
    setValue("editFuelTotalCost", totalCost);
    setValue("editFuelOdometer", odometer);
    setValue("editFuelStation", station);
    setValue("editFuelReceipt", receipt);
    setSelect("editFuelPayment", payment);
    setValue("editFuelNotes", notes);

    /*
    |--------------------------------------------------------------------------
    | Keep read-only fields disabled
    |--------------------------------------------------------------------------
    */

    const vehicleField = document.getElementById("editFuelVehicle");
    const fuelTypeField = document.getElementById("editFuelType");

    if (vehicleField) {
        vehicleField.disabled = true;
    }

    if (fuelTypeField) {
        fuelTypeField.disabled = true;
    }

    syncFuelTotalCostFields("editFuel");

    document
        .getElementById("editFuelCostPerLiter")
        ?.dispatchEvent(new Event("input"));
}

function openEditFuelModal(row) {
    const modal = document.getElementById("editFuelModal");

    if (!modal || !row || !document.body.contains(row)) {
        return false;
    }

    const fuelId = row.dataset.id || row.dataset.fuelId;

    if (!fuelId || !/^\d+$/.test(String(fuelId))) {
        console.error("Invalid fuel database ID:", fuelId);

        showToast?.("Invalid fuel record ID.", "error");

        return false;
    }

    modal.currentRow = row;
    modal.currentFuelId = String(fuelId);

    populateEditFuelForm(row);

    const form = document.getElementById("editFuelForm");

    if (form) {
        clearAllFuelErrors(form);
    }

    modal.classList.add("show");

    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
        document.getElementById("editFuelRefuelDate")?.focus();
    });

    return true;
}

function closeEditFuelModal() {
    const modal = document.getElementById("editFuelModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("show");

    document.body.style.overflow = "";

    modal.currentRow = null;
    modal.currentFuelId = null;
}

async function updateFuelRecord(form, fuelId) {
    const getValue = (id) => {
        const field = document.getElementById(id);

        return field ? field.value : "";
    };

    const payload = {
        date: getValue("editFuelRefuelDate"),

        refuel_time: getValue("editFuelRefuelTime") || null,
        cost_per_liter: getValue("editFuelCostPerLiter"),
        fuel_station: getValue("editFuelStation").trim() || null,
        receipt_number: getValue("editFuelReceipt").trim() || null,
        payment_method: getValue("editFuelPayment") || null,
        notes: getValue("editFuelNotes").trim() || null,
    };

    const response = await fetch(`/fuel-records/${fuelId}`, {
        method: "PUT",
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
            firstError || data.message || "Failed to update fuel record.",
        );
    }

    return data.fuelLog;
}

async function initEditFuelModal() {
    if (!canEditFuelRecords()) {
        return;
    }
    if (editFuelInitialized) {
        return;
    }

    const modal = document.getElementById("editFuelModal");

    if (!modal) {
        return;
    }

    const fuelSettings = await getEditFuelSettings();

    applyEditFuelSettings(fuelSettings);

    editFuelInitialized = true;

    document.addEventListener("click", (event) => {
        const editBtn = event.target.closest(".action-btn.edit-fuel");

        if (!editBtn) {
            return;
        }

        const row = editBtn.closest("tr");

        if (!row) {
            return;
        }

        openEditFuelModal(row);
    });

    document
        .getElementById("closeEditFuelModal")
        ?.addEventListener("click", closeEditFuelModal);
    document
        .getElementById("cancelEditFuel")
        ?.addEventListener("click", closeEditFuelModal);
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeEditFuelModal();
        }
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("show")) {
            closeEditFuelModal();
        }
    });

    bindFuelTotalCostCalculation("editFuel");

    document
        .getElementById("editFuelCostPerLiter")
        ?.addEventListener("input", () => {
            requestAnimationFrame(() => {
                updateEditFuelHighCostWarning(fuelSettings);
            });
        });
}

function initFuelEdit() {
    if (!canEditFuelRecords()) {
        return;
    }
    const form = document.getElementById("editFuelForm");

    const modal = document.getElementById("editFuelModal");

    if (!form || !modal) {
        return;
    }

    if (form.dataset.fuelEditInitialized === "true") {
        return;
    }

    form.dataset.fuelEditInitialized = "true";

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!modal.currentRow || !document.body.contains(modal.currentRow)) {
            return;
        }
        if (!modal.currentFuelId) {
            showToast?.("Fuel record ID not found.", "error");

            return;
        }
        if (typeof validateFuelForm === "function" && !validateFuelForm(form)) {
            return;
        }

        const updateButton = document.getElementById("updateFuelBtn");

        if (updateButton) {
            updateButton.disabled = true;

            updateButton.textContent = "Updating...";
        }

        try {
            await updateFuelRecord(form, modal.currentFuelId);

            closeEditFuelModal();

            if (typeof loadFuelRecords === "function") {
                await loadFuelRecords();
            }
            if (typeof updateFuelStatistics === "function") {
                updateFuelStatistics();
            }
            if (typeof refreshFuelTable === "function") {
                refreshFuelTable({
                    resetPage: false,
                    refreshStatistics: true,
                    reason: "edit",
                });
            }

            showToast?.("Fuel record updated successfully.", "success");
        } catch (error) {
            console.error("FUEL UPDATE ERROR:", error);

            showToast?.(
                error.message || "Unable to update fuel record.",
                "error",
            );
        } finally {
            if (updateButton) {
                updateButton.disabled = false;

                updateButton.textContent = "Update Fuel Record";
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initEditFuelModal();
    initFuelEdit();
});
