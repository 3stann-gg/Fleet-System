/* ==========================================
   Dispatch Edit
========================================== */

let editDispatchInitialized = false;

function getEditFormValues() {
    return {
        dispatch_number:
            document.getElementById("editDispatchNumber")?.value.trim() || "",

        trip_status:
            document.getElementById("editDispatchStatus")?.value || "",
    };  
}


function validateEditDispatchForm(form) {
    let isValid = true;
    const firstInvalid = [];

    const dispatchNumber = document.getElementById("editDispatchNumber");
    const status = document.getElementById("editDispatchStatus");

    if (dispatchNumber) {
        const value = dispatchNumber.value.trim();

        if (value.length < 5) {
            dispatchNumber.classList.add("is-invalid");
            isValid = false;
            firstInvalid.push(dispatchNumber);
        } else {
            dispatchNumber.classList.remove("is-invalid");
        }
    }

    if (status) {
        const value = status.value.trim();

        if (!value) {
            status.classList.add("is-invalid");
            isValid = false;
            firstInvalid.push(status);
        } else {
            status.classList.remove("is-invalid");
        }
    }

    if (firstInvalid.length > 0) {
        firstInvalid[0].focus();
    }

    return isValid;
}

function updateEditDispatchStatusOptions(currentStatus) {
    const statusEl = document.getElementById("editDispatchStatus");

    if (!statusEl) {
        return;
    }

    const allowedTransitions = {
        Assigned: ["En Route", "Cancelled"],
        "En Route": ["Assigned", "Arrived", "Cancelled"],
        Arrived: ["Completed"],
        Completed: [],
        Cancelled: [],
    };

    const allowed = allowedTransitions[currentStatus] || [];

    Array.from(statusEl.options).forEach((option) => {
        const optionStatus = option.value;

        if (!optionStatus) {
            option.disabled = false;
            return;
        }

        /*
         * Current status should remain selectable.
         */
        if (optionStatus === currentStatus) {
            option.disabled = false;
            return;
        }

        /*
         * Only valid next statuses are selectable.
         */
        option.disabled = !allowed.includes(optionStatus);
    });

    statusEl.value = currentStatus;
}

function formatEditVehicle(vehicle) {
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


function formatEditDriver(driver) {
    if (!driver) {
        return "Unassigned";
    }

    const name = [driver.first_name, driver.last_name]
        .filter(Boolean)
        .join(" ");

    return name || "Unassigned";
}

async function populateEditDispatchForm(dispatchId) {
    try {
        const response = await fetch(`/dispatch/${dispatchId}`, {
            headers: {
                Accept: "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load dispatch details.",
            );
        }

        const dispatch = data.dispatch;

        if (!dispatch) {
            throw new Error("Dispatch information not found.");
        }

        const reservation = dispatch.reservation || {};
        const vehicle = reservation.vehicle || null;
        const driver = reservation.driver || null;

        /* Dispatch Number */
        const numberEl = document.getElementById("editDispatchNumber");

        if (numberEl) {
            numberEl.value = dispatch.dispatch_number || "";
        }

        /* Reservation */
        const reservationEl = document.getElementById(
            "editDispatchReservation",
        );

        if (reservationEl) {
            reservationEl.value = reservation.reservation_number || "";
        }

        /* Patient */
        const patientEl = document.getElementById("editDispatchPatient");

        if (patientEl) {
            patientEl.value = reservation.patient_name || "";
        }

        /* Request Type */
        const requestTypeEl = document.getElementById(
            "editDispatchRequestType",
        );

        if (requestTypeEl) {
            requestTypeEl.value = reservation.request_type || "";
        }

        /* Vehicle */
        const vehicleEl = document.getElementById("editDispatchVehicle");

        if (vehicleEl) {
            vehicleEl.value = formatEditVehicle(vehicle);
        }

        /* Driver */
        const driverEl = document.getElementById("editDispatchDriver");

        if (driverEl) {
            driverEl.value = formatEditDriver(driver);
        }

        /* Pickup */
        const pickupEl = document.getElementById("editDispatchPickup");

        if (pickupEl) {
            pickupEl.value = reservation.pickup_location || "";
        }

        /* Destination */
        const destinationEl = document.getElementById(
            "editDispatchDestination",
        );

        if (destinationEl) {
            destinationEl.value = reservation.destination || "";
        }

        /* Schedule Date */
        const dateEl = document.getElementById("editDispatchDate");

        if (dateEl) {
            dateEl.value = reservation.schedule_date || "";
        }

        /* Schedule Time */
        const timeEl = document.getElementById("editDispatchTime");

        if (timeEl) {
            timeEl.value = reservation.schedule_time || "";
        }

        /* Priority */
        const priorityEl = document.getElementById("editDispatchPriority");

        if (priorityEl) {
            priorityEl.value = reservation.priority || "";
        }

        /* Status */
        const statusEl = document.getElementById("editDispatchStatus");

        if (statusEl) {
            const currentStatus = dispatch.trip_status || "Assigned";
            statusEl.value = currentStatus;
            updateEditDispatchStatusOptions(currentStatus);
        }

        /* Contact */
        const contactEl = document.getElementById("editDispatchContact");

        if (contactEl) {
            contactEl.value = reservation.contact_number || "";
        }

        /* Notes */
        const notesEl = document.getElementById("editDispatchNotes");

        if (notesEl) {
            notesEl.value = reservation.notes || "";
        }

        return dispatch;
    } catch (error) {
        console.error(
            "Error loading dispatch for edit:",
            error,
        );

        if (typeof showToast === "function") {
            showToast(
                "Failed to load dispatch details.",
                "error",
            );
        }

        return null;
    }
}

function openEditDispatchModal() {
    const modal =
        document.getElementById("editDispatchModal");

    if (!modal) {
        return;
    }

    modal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeEditDispatchModal() {
    const modal =
        document.getElementById("editDispatchModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("show");
    document.body.style.overflow = "";

    modal.currentDispatchId = null;
}

async function submitEditDispatch(form, dispatchId) {
    const values = getEditFormValues();

    try {
        const response = await fetch(
            `/dispatch/${dispatchId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",

                    "X-CSRF-TOKEN":
                        document
                            .querySelector(
                                'meta[name="csrf-token"]',
                            )
                            ?.getAttribute("content"),
                },

                body: JSON.stringify(values),
            },
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data);

            if (typeof showToast === "function") {
                showToast(
                    data.message ||
                        "Failed to update dispatch.",
                    "error",
                );
            }

            return false;
        }

        /* Close modal */
        closeEditDispatchModal();

        /* Reload dispatch table */
        if (typeof loadDispatches === "function") {
            await loadDispatches();
        }

        /* Refresh UI */
        if (
            typeof updateDispatchStatistics ===
            "function"
        ) {
            updateDispatchStatistics();
        }

        if (
            typeof refreshDispatchPagination ===
            "function"
        ) {
            refreshDispatchPagination();
        }

        if (
            typeof refreshDispatchBulkState ===
            "function"
        ) {
            refreshDispatchBulkState();
        }

        if (typeof showToast === "function") {
            showToast(
                "Dispatch updated successfully.",
                "success",
            );
        }

        return true;
    } catch (error) {
        console.error(
            "Dispatch update error:",
            error,
        );

        if (typeof showToast === "function") {
            showToast(
                "Something went wrong while updating the dispatch.",
                "error",
            );
        }

        return false;
    }
}

function initEditDispatchModal() {
    if (editDispatchInitialized) {
        return;
    }

    const modal =
        document.getElementById("editDispatchModal");

    if (!modal) {
        return;
    }

    editDispatchInitialized = true;

    document.body.addEventListener("click", async (event) => {
        const editBtn =
            event.target.closest(
                ".action-btn.edit-dispatch",
            );

        if (!editBtn) {
            return;
        }

        const dispatchId =
            editBtn.dataset.id;

        if (!dispatchId) {
            console.error(
                "Dispatch ID not found.",
            );
            return;
        }

        modal.currentDispatchId =
            dispatchId;

        const dispatch =
            await populateEditDispatchForm(
                dispatchId,
            );

        if (!dispatch) {
            modal.currentDispatchId = null;
            return;
        }

        openEditDispatchModal();
    });

    const closeXBtn =
        document.getElementById(
            "closeEditDispatchModal",
        );

    if (closeXBtn) {
        closeXBtn.addEventListener(
            "click",
            closeEditDispatchModal,
        );
    }

    const cancelBtn =
        document.getElementById(
            "cancelEditDispatch",
        );

    if (cancelBtn) {
        cancelBtn.addEventListener(
            "click",
            closeEditDispatchModal,
        );
    }

    modal.addEventListener(
        "click",
        (event) => {
            if (event.target === modal) {
                closeEditDispatchModal();
            }
        },
    );

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Escape" &&
                modal.classList.contains("show")
            ) {
                closeEditDispatchModal();
            }
        },
    );

    const form =
        document.getElementById(
            "editDispatchForm",
        );

    if (form) {
        form.addEventListener(
            "submit",
            async (event) => {
                event.preventDefault();

                if (
                    !validateEditDispatchForm(
                        form,
                    )
                ) {
                    return;
                }

                const dispatchId =
                    modal.currentDispatchId;

                if (!dispatchId) {
                    console.error(
                        "Dispatch ID not found.",
                    );
                    return;
                }

                const submitBtn =
                    document.getElementById(
                        "updateDispatchBtn",
                    );

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent =
                        "Updating...";
                }

                await submitEditDispatch(
                    form,
                    dispatchId,
                );

                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent =
                        "Update Dispatch";
                }
            },
        );

        /* Remove validation error */
        const inputs =
            form.querySelectorAll(
                "input, select, textarea",
            );

        inputs.forEach((input) => {
            input.addEventListener(
                "input",
                () => {
                    input.classList.remove(
                        "is-invalid",
                    );
                },
            );

            input.addEventListener(
                "change",
                () => {
                    input.classList.remove(
                        "is-invalid",
                    );
                },
            );
        });
    }
}

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initEditDispatchModal();
    },
);