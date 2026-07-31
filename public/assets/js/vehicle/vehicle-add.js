/* ==========================================
   Add Vehicle
========================================== */

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
        year_model: document.getElementById("vehicleYear").value,
        capacity: document.getElementById("vehicleCapacity").value,
        fuel_type: document.getElementById("vehicleFuel").value,
        status: document.getElementById("vehicleStatus").value,
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

    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to add vehicle.");
        }

        return response.json();

    })

    .then(data => {
        if (!data.success) return;
        renderVehicleTable(data.vehicles);
        updateVehicleStats();
        form.reset();

        if (typeof resetVehicleImagePreview === "function") {
            resetVehicleImagePreview();
        }

        closeVehicleModal(
            document.getElementById("vehicleModal")
        );

        window.showToast(
            data.message,
            "success"
        );

    })

    .catch(error => {
        console.error(error);
        window.showToast(
            "Unable to add vehicle.",
            "error"
        );

    });

  });

}

document.addEventListener("DOMContentLoaded", initVehicleAdd);