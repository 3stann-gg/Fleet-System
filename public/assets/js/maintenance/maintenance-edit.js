/* ==========================================
   Maintenance Edit
========================================== */

/* ==========================================
   Maintenance Module Settings
========================================== */
async function getEditMaintenanceSettings() {
    if (typeof window.getMaintenanceModuleSettings === "function") {
        return await window.getMaintenanceModuleSettings();
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
        const settings = data?.settings?.maintenance || {};
        return {
            requireCost: settings.requireCost !== false,
            overdueWarnDays: Math.max(
                1,
                Math.min(90, Number(settings.overdueWarnDays ?? 3)),
            ),
        };
    } catch {
        return {
            requireCost: true,
            overdueWarnDays: 3,
        };
    }
}

function applyEditMaintenanceSettings(settings) {
    const status = document.getElementById("editMaintenanceStatus");
    const cost = document.getElementById("editMaintenanceCost");
    const mark = document.getElementById("editMaintenanceCostRequiredMark");
    const completed = status?.value === "Completed";
    const required = settings.requireCost && completed;
    if (cost) {
        cost.required = required;
    }
    if (mark) {
        mark.hidden = !required;
    }
}

let editMaintenanceInitialized = false;

function formatEditMaintenanceVehicle(vehicle) {
    if (!vehicle) {
        return "Unassigned";
    }

    return [
        [vehicle.brand, vehicle.model].filter(Boolean).join(" "),
        vehicle.vehicle_type,
    ]
        .filter(Boolean)
        .join(" - ");
}

async function loadEditMaintenanceVehicles(
    selectedVehicleId = null,
    currentVehicle = null,
) {
    const select = document.getElementById("editMaintenanceVehicle");

    if (!select) {
        return;
    }

    select.innerHTML = '<option value="">Loading vehicles...</option>';

    try {
        const response = await fetch("/maintenance/available-vehicles", {
            headers: {
                Accept: "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load vehicles.");
        }

        const vehicles = data.vehicles || [];

        select.innerHTML = '<option value="">Select Vehicle</option>';

        vehicles.forEach((vehicle) => {
            const option = document.createElement("option");

            option.value = vehicle.id;
            option.textContent = formatEditMaintenanceVehicle(vehicle);

            select.appendChild(option);
        });

        /*
        |----------------------------------------------------------------------
        | Keep the current vehicle available in the edit select
        |----------------------------------------------------------------------
        */
        if (
            currentVehicle &&
            selectedVehicleId &&
            !Array.from(select.options).some(
                (option) => String(option.value) === String(selectedVehicleId),
            )
        ) {
            const option = document.createElement("option");

            option.value = currentVehicle.id;
            option.textContent = formatEditMaintenanceVehicle(currentVehicle);
            option.dataset.current = "true";
            select.appendChild(option);
        }

        if (selectedVehicleId) {
            select.value = String(selectedVehicleId);
        }
    } catch (error) {
        console.error("Maintenance edit vehicle load error:", error);

        select.innerHTML = '<option value="">Failed to load vehicles</option>';
    }
}

async function populateEditMaintenanceForm(row, maintenanceData = null) {
    if (!row) {
        return null;
    }

    const maintenanceId = row.dataset.id;

    if (!maintenanceId || !/^\d+$/.test(String(maintenanceId))) {
        console.error("Invalid maintenance database ID:", maintenanceId, row);

        if (typeof showToast === "function") {
            showToast("Invalid maintenance record ID.", "error");
        }

        return null;
    }

    try {
        let maintenance = maintenanceData;

        /*
        |--------------------------------------------------------------------------
        | Only fetch when data was not already supplied
        |--------------------------------------------------------------------------
        */
        if (!maintenance) {
            const response = await fetch(`/maintenance/${maintenanceId}`, {
                headers: {
                    Accept: "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load maintenance details.",
                );
            }

            maintenance = data.maintenance;
        }

        if (!maintenance) {
            throw new Error("Maintenance record not found.");
        }

        const setValue = (id, value) => {
            const field = document.getElementById(id);

            if (field) {
                field.value = value ?? "";
            }
        };

        setValue("editMaintenanceNumber", maintenance.maintenance_number);

        await loadEditMaintenanceVehicles(
            maintenance.vehicle_id,
            maintenance.vehicle || null,
        );

        setValue("editMaintenanceServiceType", maintenance.maintenance_type);
        setValue("editMaintenanceTechnician", maintenance.technician);
        setValue(
            "editMaintenanceScheduledDate",
            maintenance.maintenance_date
                ? String(maintenance.maintenance_date).substring(0, 10)
                : "",
        );
        setValue(
            "editMaintenanceCompletionDate",
            maintenance.completion_date
                ? String(maintenance.completion_date).substring(0, 10)
                : "",
        );
        setValue("editMaintenanceCost", maintenance.cost);
        setValue("editMaintenancePriority", maintenance.priority);
        document
            .getElementById("editMaintenanceStatus")
            ?.dispatchEvent(new Event("change"));
        setValue("editMaintenanceOdometer", maintenance.odometer);
        setValue("editMaintenanceDescription", maintenance.description);
        setValue("editMaintenancePartsUsed", maintenance.parts_used);
        setValue("editMaintenanceNotes", maintenance.notes);

        return maintenance;
    } catch (error) {
        console.error("Error loading maintenance for edit:", error);

        if (typeof showToast === "function") {
            showToast(
                error.message || "Failed to load maintenance details.",
                "error",
            );
        }

        return null;
    }
}


function openEditMaintenanceModal(
    row,
    maintenanceId = null,
    maintenanceData = null,
) {
    const modal = document.getElementById("editMaintenanceModal");

    if (!modal || !row || !document.body.contains(row)) {
        return false;
    }

    const databaseId = maintenanceId || row.dataset.id;

    if (!databaseId || !/^\d+$/.test(String(databaseId))) {
        console.error("Invalid maintenance database ID:", databaseId, row);

        if (typeof showToast === "function") {
            showToast("Invalid maintenance record ID.", "error");
        }

        return false;
    }

    modal.currentRow = row;
    modal.currentMaintenanceId = String(databaseId);
    modal.classList.add("show");
    document.body.style.overflow = "hidden";

    const focusTarget = document.getElementById("editMaintenanceNumber");

    if (focusTarget && typeof focusTarget.focus === "function") {
        requestAnimationFrame(() => {
            focusTarget.focus();
        });
    }
    
    populateEditMaintenanceForm(row, maintenanceData).then((maintenance) => {
        if (!maintenance) {
            closeEditMaintenanceModal();
        }
    });

    return true;
}

function closeEditMaintenanceModal() {
    const modal = document.getElementById(
        "editMaintenanceModal"
    );

    if (!modal) {
        return;
    }

    modal.classList.remove("show");
    document.body.style.overflow = "";

    modal.currentRow = null;
    modal.currentMaintenanceId = null;
}

async function updateMaintenanceRecord(form, maintenanceId) {
    const getValue = (id) => document.getElementById(id)?.value || "";

    const payload = {
        maintenance_number: getValue("editMaintenanceNumber").trim(),
        vehicle_id: getValue("editMaintenanceVehicle") || null,
        maintenance_type: getValue("editMaintenanceServiceType"),
        technician: getValue("editMaintenanceTechnician").trim(),
        maintenance_date: getValue("editMaintenanceScheduledDate"),
        completion_date: getValue("editMaintenanceCompletionDate") || null,
        cost: getValue("editMaintenanceCost") || null,
        priority: getValue("editMaintenancePriority"),
        status: getValue("editMaintenanceStatus"),
        odometer: getValue("editMaintenanceOdometer") || null,
        description: getValue("editMaintenanceDescription").trim(),
        parts_used: getValue("editMaintenancePartsUsed").trim() || null,
        notes: getValue("editMaintenanceNotes").trim() || null,
    };

    const response = await fetch(`/maintenance/${maintenanceId}`, {
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
            firstError ||
                data.message ||
                "Failed to update maintenance record.",
        );
    }

    return data.maintenance;
}

async function initMaintenanceEdit() {
    if (editMaintenanceInitialized) {
        return;
    }

    const modal = document.getElementById("editMaintenanceModal");
    const form = document.getElementById("editMaintenanceForm");

    if (!modal || !form) {
        return;
    }

    const maintenanceSettings = await getEditMaintenanceSettings();

    applyEditMaintenanceSettings(maintenanceSettings);

    editMaintenanceInitialized = true;

    document
        .getElementById("editMaintenanceStatus")
        ?.addEventListener("change", () => {
            applyEditMaintenanceSettings(maintenanceSettings);
        });

    document.addEventListener("click", (event) => {
        const editBtn = event.target.closest(".action-btn.edit-maintenance");

        if (!editBtn) {
            return;
        }

        const row = editBtn.closest("tr");

        if (!row) {
            return;
        }

        const maintenanceId = editBtn.dataset.id;

        if (!maintenanceId || !/^\d+$/.test(String(maintenanceId))) {
            console.error(
                "Invalid maintenance ID on edit button:",
                maintenanceId,
            );

            if (typeof showToast === "function") {
                showToast("Invalid maintenance record ID.", "error");
            }

            return;
        }

        openEditMaintenanceModal(row, maintenanceId);
    });

    document
        .getElementById("closeEditMaintenanceModal")
        ?.addEventListener("click", closeEditMaintenanceModal);
    document
        .getElementById("cancelEditMaintenance")
        ?.addEventListener("click", closeEditMaintenanceModal);
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeEditMaintenanceModal();
        }
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("show")) {
            closeEditMaintenanceModal();
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!modal.currentRow) {
            return;
        }

        if (
            typeof validateMaintenanceForm === "function" &&
            !validateMaintenanceForm(form)
        ) {
            return;
        }

        const maintenanceId = modal.currentMaintenanceId;

        if (!maintenanceId || !/^\d+$/.test(String(maintenanceId))) {
            console.error("Invalid maintenance database ID:", maintenanceId);

            if (typeof showToast === "function") {
                showToast("Invalid maintenance record ID.", "error");
            }

            return;
        }

        const submitBtn = document.getElementById("updateMaintenanceBtn");

        if (submitBtn) {
            submitBtn.disabled = true;

            submitBtn.textContent = "Updating...";
        }

        try {
            await updateMaintenanceRecord(form, maintenanceId);

            closeEditMaintenanceModal();

            if (typeof loadMaintenances === "function") {
                await loadMaintenances();
            }
            if (typeof loadAvailableMaintenanceVehicles === "function") {
                await loadAvailableMaintenanceVehicles();
            }
            if (typeof updateMaintenanceStatistics === "function") {
                updateMaintenanceStatistics();
            }
            if (typeof updateMaintenancePagination === "function") {
                updateMaintenancePagination();
            }
            if (typeof refreshMaintenanceBulkState === "function") {
                refreshMaintenanceBulkState();
            }
            if (typeof showToast === "function") {
                showToast(
                    "Maintenance record updated successfully.",
                    "success",
                );
            }
        } catch (error) {
            console.error("Maintenance update error:", error);

            if (typeof showToast === "function") {
                showToast(
                    error.message || "Failed to update maintenance record.",
                    "error",
                );
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;

                submitBtn.textContent = "Update Maintenance";
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await initMaintenanceEdit();
});
