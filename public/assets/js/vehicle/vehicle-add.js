/* ==========================================
   Add Vehicle
========================================== */

async function loadAvailableDrivers(selectedId = null) {
    const select = document.getElementById("vehicleDriver");

    if (!select) return;

    try {

        const response = await fetch("/drivers/available");

        const drivers = await response.json();

        select.innerHTML = `
            <option value="">Select Driver</option>
        `;

        drivers.forEach(driver => {

            const option = document.createElement("option");

            option.value = driver.id;
            option.textContent =
                `${driver.first_name} ${driver.last_name}`;

            if (selectedId == driver.id) {
                option.selected = true;
            }

            select.appendChild(option);

        });

    } catch (error) {

        console.error(error);

    }
}

function setVehicleFieldValidationMessage(field) {
  if (!field) return;

  field.setCustomValidity("Please complete this required field.");

  const clearValidationMessage = () => field.setCustomValidity("");

  field.addEventListener("input", clearValidationMessage, { once: true });
  field.addEventListener("change", clearValidationMessage, { once: true });
  field.reportValidity();
  field.focus();
}

function initVehicleAdd() {
  const form = document.getElementById("vehicleForm");

  if (!form || form.dataset.vehicleAddInitialized === "true") return;

  const requiredFields = ["vehiclePlate", "vehicleType", "vehicleStatus"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  requiredFields.forEach((field) => {
    field.required = true;
  });

  form.dataset.vehicleAddInitialized = "true";

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    console.log("AJAX submit");

    const emptyField = requiredFields.find((field) => !field.value.trim());

    if (emptyField) {
      setVehicleFieldValidationMessage(emptyField);
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = {
        plate_number: document.getElementById("vehiclePlate").value,
        vehicle_type: document.getElementById("vehicleType").value,
        brand: document.getElementById("vehicleBrand").value,
        model: document.getElementById("vehicleModel").value,
        purchase_date: document.getElementById("vehiclePurchaseDate").value || null,
        insurance_expiry: document.getElementById("vehicleInsuranceExpiry").value || null,
        capacity: document.getElementById("vehicleCapacity").value,
        fuel_type: document.getElementById("vehicleFuel").value,
        status: document.getElementById("vehicleStatus").value,
        notes: document.getElementById("vehicleNotes").value || null,
        assigned_driver_id: document.getElementById("vehicleDriver").value || null,
    };

    fetch("/fleet", {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-CSRF-TOKEN": document
                .querySelector('meta[name="csrf-token"]')
                .content,
        },
        body: JSON.stringify(formData)
    })
    .then(async response => {

        const data = await response.json();
        console.log("ADD VEHICLE RESPONSE:", response.status, data);

        if (!response.ok) {
            throw {
                status: response.status,
                data: data
            };
        }

        return data;
    })
    .then(data => {
        if (!data.success) return;

        form.reset();

        if (typeof resetVehicleImagePreview === "function") {
            resetVehicleImagePreview();
        }
        closeVehicleModal(
            document.getElementById("vehicleModal")
        );
        if (typeof applyVehicleFilters === "function") {
            applyVehicleFilters();
        }
        if (typeof updateVehicleStats === "function") {
            updateVehicleStats();
        }
        window.showToast(
            data.message,
            "success"
        );

        loadVehicles();
    })

    .catch(error => {
        console.error("ADD VEHICLE ERROR:", error);

        if (error.status === 422) {
            const errors = error.data?.errors;

            console.log("VALIDATION ERRORS:", errors);

            const firstError = errors
                ? Object.values(errors).flat()[0]
                : null;

            window.showToast(
                firstError ||
                error.data?.message ||
                "Please check the vehicle information.",
                "error"
            );

            return;
        }

        window.showToast(
            "Unable to add vehicle.",
            "error"
        );
    });
    
  });
}

document.addEventListener("DOMContentLoaded", initVehicleAdd);