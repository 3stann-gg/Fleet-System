let viewDispatchInitialized = false;

function openViewDispatchModal() {
    const modal = document.getElementById("viewDispatchModal");

    if (!modal) {
        return;
    }

    modal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeViewDispatchModal() {
    const modal = document.getElementById("viewDispatchModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("show");
    document.body.style.overflow = "";

    modal.currentDispatchId = null;
}

function setViewDispatchValue(id, value, fallback = "") {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value || fallback;
    }
}

function setViewDispatchStatus(status) {
    const statusEl = document.getElementById("viewDispatchStatus");

    if (!statusEl) {
        return;
    }

    const statusClassMap = {
        Pending: "pending",
        Assigned: "scheduled",
        "En Route": "trip",
        Arrived: "approved",
        Completed: "completed",
        Cancelled: "cancelled",
    };

    const statusClass =
        statusClassMap[status] ||
        (status || "").toLowerCase().replace(/\s+/g, "-");

    statusEl.className = "status-badge";
    statusEl.classList.add(statusClass);
    statusEl.textContent = status || "N/A";
}

function formatViewVehicle(vehicle) {
    if (!vehicle) {
        return "Unassigned";
    }

    return `${[vehicle.brand, vehicle.model]
        .filter(Boolean)
        .join(" ")} - ${vehicle.vehicle_type ?? ""}`;
}

function formatViewDriver(driver) {
    if (!driver) {
        return "Unassigned";
    }

    return [driver.first_name, driver.last_name].filter(Boolean).join(" ");
}

async function loadViewDispatch(dispatchId) {
    try {
        const response = await fetch(`/dispatch/${dispatchId}`, {
            headers: {
                Accept: "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load dispatch details.");
        }

        const dispatch = data.dispatch;

        if (!dispatch) {
            throw new Error("Dispatch information not found.");
        }

        const reservation = dispatch.reservation || {};
        const vehicle = reservation.vehicle || null;
        const driver = reservation.driver || null;

        setViewDispatchValue("viewDispatchNumber", dispatch.dispatch_number);

        setViewDispatchValue(
            "viewDispatchReservation",
            reservation.reservation_number,
        );

        setViewDispatchValue("viewDispatchPatient", reservation.patient_name);

        setViewDispatchValue(
            "viewDispatchRequestType",
            reservation.request_type,
        );

        setViewDispatchValue(
            "viewDispatchVehicle",
            formatViewVehicle(vehicle),
            "Unassigned",
        );

        setViewDispatchValue(
            "viewDispatchDriver",
            formatViewDriver(driver),
            "Unassigned",
        );

        setViewDispatchValue("viewDispatchPickup", reservation.pickup_location);

        setViewDispatchValue(
            "viewDispatchDestination",
            reservation.destination,
        );

        setViewDispatchValue(
            "viewDispatchSchedule",
            formatDispatchSchedule(
                reservation.schedule_date,
                reservation.schedule_time,
            ),
        );

        setViewDispatchValue("viewDispatchPriority", reservation.priority);

        setViewDispatchValue(
            "viewDispatchContact",
            reservation.contact_number,
            "Not provided",
        );

        setViewDispatchValue(
            "viewDispatchNotes",
            reservation.notes,
            "Not provided",
        );

        setViewDispatchStatus(dispatch.trip_status);

        const modal = document.getElementById("viewDispatchModal");

        if (modal) {
            modal.currentDispatchId = dispatch.id;
        }

        openViewDispatchModal();
    } catch (error) {
        console.error("Error loading dispatch:", error);

        if (typeof showToast === "function") {
            showToast("Failed to load dispatch details.", "error");
        }
    }
}

function initViewDispatchModal() {
    if (viewDispatchInitialized) {
        return;
    }

    const modal = document.getElementById("viewDispatchModal");

    if (!modal) {
        return;
    }

    viewDispatchInitialized = true;

    document.body.addEventListener("click", (event) => {
        const viewBtn = event.target.closest(".action-btn.view-dispatch");

        if (!viewBtn) {
            return;
        }

        const dispatchId = viewBtn.dataset.id;

        if (!dispatchId) {
            console.error("Dispatch ID not found.");
            return;
        }

        loadViewDispatch(dispatchId);
    });

    const closeXBtn = document.getElementById("closeViewDispatchModal");

    if (closeXBtn) {
        closeXBtn.addEventListener("click", closeViewDispatchModal);
    }

    const closeBtn = document.getElementById("closeViewDispatchBtn");

    if (closeBtn) {
        closeBtn.addEventListener("click", closeViewDispatchModal);
    }

    const editFromViewBtn = document.getElementById("editDispatchFromViewBtn");

    if (editFromViewBtn) {
        editFromViewBtn.addEventListener("click", () => {
            const viewModal = document.getElementById("viewDispatchModal");

            const editModal = document.getElementById("editDispatchModal");

            if (!viewModal || !editModal || !viewModal.currentDispatchId) {
                return;
            }

            editModal.currentDispatchId = viewModal.currentDispatchId;

            if (typeof populateEditDispatchForm === "function") {
                populateEditDispatchForm(viewModal.currentDispatchId);
            }

            closeViewDispatchModal();

            if (typeof openEditDispatchModal === "function") {
                openEditDispatchModal();
            }
        });
    }

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeViewDispatchModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("show")) {
            closeViewDispatchModal();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initViewDispatchModal();
});