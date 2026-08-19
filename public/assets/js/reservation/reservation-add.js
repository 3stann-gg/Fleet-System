

async function loadNextReservationNumber() {
    const numberInput = document.getElementById("reservationNumber");
    if (!numberInput) {
        return;
    }
    try {
        const response = await fetch("/reservation/next-number", {
            headers: {
                Accept: "application/json",
            },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(
                data.message || "Failed to generate reservation number.",
            );
        }
        numberInput.value = data.reservation_number || "";
    } catch (error) {
        console.error("Failed to load next reservation number:", error);
        numberInput.value = "";
    }
}

async function loadReservationOptions() {
    const vehicleSelect = document.getElementById("reservationVehicle");
    const driverSelect = document.getElementById("reservationDriver");

    if (!vehicleSelect || !driverSelect) return;

    vehicleSelect.innerHTML =
        '<option value="">Loading vehicles...</option>';

    driverSelect.innerHTML =
        '<option value="">Select Vehicle First</option>';

    driverSelect.disabled = true;

    try {
        const response = await fetch("/fleet/available", {
            headers: {
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to load vehicles.");
        }

        const vehicles = await response.json();

        vehicleSelect.innerHTML =
            '<option value="">Select Vehicle</option>';

        vehicles.forEach((vehicle) => {
            const option = document.createElement("option");
            option.value = vehicle.id;
            option.textContent =
                `${vehicle.brand} ${vehicle.model} - ${vehicle.vehicle_type}`;
            option.dataset.driverId =
                vehicle.drivers?.[0]?.id || "";
            option.dataset.driverName =
                vehicle.drivers?.[0]
                    ? `${vehicle.drivers[0].first_name} ${vehicle.drivers[0].last_name}`
                    : "";
            vehicleSelect.appendChild(option);
        });

        vehicleSelect.addEventListener("change", () => {
            const selectedOption =
                vehicleSelect.options[vehicleSelect.selectedIndex];
            const driverId =
                selectedOption?.dataset.driverId || "";
            const driverName =
                selectedOption?.dataset.driverName || "";

            driverSelect.innerHTML = "";

            if (driverId && driverName) {
                const option = document.createElement("option");

                option.value = driverId;
                option.textContent = driverName;

                driverSelect.appendChild(option);

                driverSelect.disabled = false;
            } else {
                const option = document.createElement("option");

                option.value = "";
                option.textContent = "No Assigned Driver";

                driverSelect.appendChild(option);

                driverSelect.disabled = true;
            }
        });

    } catch (error) {
        console.error("Failed to load reservation options:", error);

        vehicleSelect.innerHTML =
            '<option value="">Failed to load vehicles</option>';

        driverSelect.innerHTML =
            '<option value="">Failed to load driver</option>';

        driverSelect.disabled = true;
    }
}

function initReservationAdd() {
    const modal = document.getElementById("addReservationModal");
    const form = document.getElementById("reservationForm");

    if (!modal || !form) return;
    if (form.dataset.reservationAddInitialized === "true") return;

    form.dataset.reservationAddInitialized = "true";

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!validateReservationForm(form)) {
            return;
        }

        const formData = {
            reservation_number:
                document.getElementById("reservationNumber").value.trim(),
            patient_name:
                document.getElementById("reservationPatient").value.trim(),
            request_type:
                document.getElementById("reservationType").value,
            vehicle_id:
                document.getElementById("reservationVehicle").value || null,
            driver_id:
                document.getElementById("reservationDriver").value || null,
            pickup_location:
                document.getElementById("reservationPickup").value.trim(),
            destination:
                document.getElementById("reservationDestination").value.trim(),
            schedule_date:
                document.getElementById("reservationDate").value,
            schedule_time:
                document.getElementById("reservationTime").value,
            priority:
                document.getElementById("reservationPriority").value,
            status:
                document.getElementById("reservationStatus").value,
            contact_number:
                document.getElementById("reservationContact").value.trim(),
            notes:
                document.getElementById("reservationNotes").value.trim(),
        };

        try {
            const response = await fetch("/reservation", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",

                    "X-CSRF-TOKEN":
                        document.querySelector(
                            'meta[name="csrf-token"]'
                        ).content,
                },

                body: JSON.stringify(formData),
            });

            const data = await response.json();

            console.log("ADD RESERVATION RESPONSE:", response.status, data);

            if (response.status === 422) {
                const errors = data.errors;

                const firstError = errors
                    ? Object.values(errors).flat()[0]
                    : null;

                window.showToast(
                    firstError ||
                    data.message ||
                    "Please check the reservation information.",
                    "error"
                );

                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to add reservation."
                );
            }

            if (data.success) {

                // Reload from database
                await loadReservations();

                // Reset form
                form.reset();

                if (typeof clearAllReservationErrors === "function") {
                    clearAllReservationErrors(form);
                }

                form
                    .querySelectorAll(".is-invalid")
                    .forEach((field) => {
                        field.classList.remove("is-invalid");
                    });

                // Close modal
                modal.classList.remove("show");
                document.body.style.overflow = "";

                // Toast
                window.showToast(
                    data.message,
                    "success"
                );
            }

        } catch (error) {

            console.error("ADD RESERVATION ERROR:", error);

            window.showToast(
                "Failed to add reservation.",
                "error"
            );
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initReservationAdd();
    loadNextReservationNumber();
});