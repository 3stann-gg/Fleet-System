/* ==========================================
   Add Driver 
========================================== */

function setDriverFieldValidationMessage(field) {
  field.setCustomValidity("Please complete this required field.");

  const clearValidationMessage = () => {
    field.setCustomValidity("");
  };

  field.addEventListener("input", clearValidationMessage, { once: true });
  field.addEventListener("change", clearValidationMessage, { once: true });
  field.reportValidity();
  field.focus();
}

function initDriverAdd() {
  const form = document.getElementById("driverForm");

  if (!form || form.dataset.driverAddInitialized === "true") return;

  const requiredFieldIds = [
    "driverFirstName",
    "driverLastName",
    "driverLicenseNumber",
    "driverLicenseClass",
    "driverLicenseExpiry",
    "driverPhone",
    "driverStatus",
];
  const requiredFields = requiredFieldIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  requiredFields.forEach((field) => {
    field.required = true;
  });

  form.dataset.driverAddInitialized = "true";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emptyField = requiredFields.find(
      (field) => !field.value.trim(),
    );

    if (emptyField) {
      setDriverFieldValidationMessage(emptyField);
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData();
    const vehicle =
        document.getElementById("driverAssignedVehicle").value;

    formData.append(
        "first_name",
        document.getElementById("driverFirstName").value.trim()
    );
    formData.append(
        "last_name",
        document.getElementById("driverLastName").value.trim()
    );
    formData.append(
        "license_number",
        document.getElementById("driverLicenseNumber").value
    );
    formData.append(
        "license_class",
        document.getElementById("driverLicenseClass").value
    );
    formData.append(
        "license_expiry",
        document.getElementById("driverLicenseExpiry").value
    );
    formData.append(
        "contact_number",
        document.getElementById("driverPhone").value
    );
    formData.append(
        "email",
        document.getElementById("driverEmail").value
    );
    formData.append(
        "assigned_vehicle_id", vehicle || ""
    );
    formData.append(
        "experience",
        document.getElementById("driverExperience").value
    );
    formData.append(
        "status",
        document.getElementById("driverStatus").value
    );
    formData.append(
        "address",
        document.getElementById("driverAddress").value
    );
    formData.append(
        "emergency_contact",
        document.getElementById("driverEmergencyContact").value
    );
    formData.append(
        "notes",
        document.getElementById("driverNotes").value
    );

    const image = document.getElementById("driverImage").files[0];

    if (image) {
        formData.append("photo", image);
    }
  
    try {
      console.log([...formData.entries()]);
        const response = await fetch("/drivers", {

            method: "POST",
            headers: {
                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    .content,
                "Accept": "application/json"
            },
            body: formData
        });
        
        const data = await response.json();

        if (response.status === 422) {
            console.log(data.errors);

            const firstError = Object.values(data.errors)[0][0];
            window.showToast(firstError, "error");
            return;
        }

        if (data.success) {

            loadDrivers();

            if (typeof loadDriverVehicleOptions === "function") {
                await loadDriverVehicleOptions();
            }
            
            form.reset();

            if (typeof resetDriverImagePreview === "function") {
                resetDriverImagePreview();
            }
            if (typeof closeDriverModal === "function") {
                closeDriverModal();
            }
            window.showToast(data.message, "success");

        }
      }
      catch (error) {
          console.error(error);
          window.showToast("Failed to add driver.", "error");
      }

  });
}

document.addEventListener("DOMContentLoaded", () => {
    initDriverAdd();
});
