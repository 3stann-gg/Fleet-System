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

function createDriverActionButton(action, label, iconClass) {
  const button = document.createElement("button");
  const icon = document.createElement("i");

  button.type = "button";
  button.className = `action-btn ${action}-driver`;
  button.setAttribute("aria-label", label);

  icon.className = iconClass;
  button.appendChild(icon);

  return button;
}

function getDriverStatusClass(status) {
  const statusClasses = {
    Available: "available",
    "On Duty": "trip",
    "On Leave": "maintenance",
    Inactive: "out",
  };

  return statusClasses[status] || "out";
}

function createDriverTableRow(driver) {
  const row = document.createElement("tr");
  const checkboxCell = document.createElement("td");
  const checkbox = document.createElement("input");
  const driverCell = document.createElement("td");
  const driverInfo = document.createElement("div");
  const photo = document.createElement("img");
  const driverDetails = document.createElement("div");
  const driverName = document.createElement("div");
  const driverRole = document.createElement("small");
  const licenseCell = document.createElement("td");
  const assignmentCell = document.createElement("td");
  const statusCell = document.createElement("td");
  const statusBadge = document.createElement("span");
  const actionsCell = document.createElement("td");
  const actions = document.createElement("div");

  row.dataset.licenseExpiry = driver.licenseExpiry || "";
  row.dataset.email = driver.email || "";
  row.dataset.experience = driver.experience || "";
  row.dataset.address = driver.address || "";
  row.dataset.emergencyContact = driver.emergencyContact || "";
  row.dataset.notes = driver.notes || "";

  checkbox.type = "checkbox";
  checkbox.className = "driver-checkbox";
  checkbox.setAttribute("aria-label", `Select ${driver.name}`);
  checkboxCell.appendChild(checkbox);

  driverInfo.className = "driver-info";
  photo.className = "driver-photo vehicle-photo";
  photo.src = driver.photoSource;
  photo.alt = `Photo of ${driver.name}`;
  driverName.className = "driver-name";
  driverName.textContent = driver.name;
  driverRole.textContent = "Fleet Driver";
  driverDetails.append(driverName, driverRole);
  driverInfo.append(photo, driverDetails);
  driverCell.appendChild(driverInfo);

  licenseCell.className = "driver-license";
  licenseCell.textContent = driver.licenseNumber;

  assignmentCell.className = "driver-assignment";
  assignmentCell.textContent = driver.assignedVehicle || "Unassigned";

  statusBadge.className = `status-badge ${getDriverStatusClass(driver.status)}`;
  statusBadge.textContent = driver.status;
  statusCell.appendChild(statusBadge);

  actions.className = "action-buttons";
  actions.append(
    createDriverActionButton("view", `View ${driver.name}`, "ph ph-eye"),
    createDriverActionButton(
      "edit",
      `Edit ${driver.name}`,
      "ph ph-pencil-simple",
    ),
    createDriverActionButton("delete", `Delete ${driver.name}`, "ph ph-trash"),
  );
  actionsCell.appendChild(actions);

  const employeeIdCell = document.createElement("td");
  const licenseClassCell = document.createElement("td");
  const contactCell = document.createElement("td");

  employeeIdCell.textContent = driver.employeeId;
  licenseClassCell.textContent = driver.licenseClass;
  contactCell.textContent = driver.phone;

  row.append(
    checkboxCell,
    driverCell,
    employeeIdCell,
    licenseCell,
    licenseClassCell,
    assignmentCell,
    statusCell,
    contactCell,
    actionsCell,
  );

  return row;
}

function initDriverAdd() {
  const form = document.getElementById("driverForm");

  if (!form || form.dataset.driverAddInitialized === "true") return;

  const requiredFieldIds = [
    "driverName",
    "driverEmployeeId",
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

  form.addEventListener("submit", (event) => {
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

    const tableBody = document.getElementById("driverTableBody");

    if (!tableBody) return;

    const preview = document.getElementById("driverPreview");
    const imageInput = document.getElementById("driverImage");
    const placeholderSource =
      typeof getDriverPlaceholderSource === "function"
        ? getDriverPlaceholderSource(preview)
        : "";
    const photoSource = (preview && preview.src) || placeholderSource;
    const driver = {
      name: document.getElementById("driverName").value.trim(),
      employeeId: document.getElementById("driverEmployeeId").value.trim(),
      licenseNumber: document
        .getElementById("driverLicenseNumber")
        .value.trim(),
      licenseClass: document.getElementById("driverLicenseClass").value,
      licenseExpiry: document.getElementById("driverLicenseExpiry").value,
      phone: document.getElementById("driverPhone").value.trim(),
      email: document.getElementById("driverEmail").value.trim(),
      assignedVehicle: document.getElementById("driverAssignedVehicle").value,
      experience: document.getElementById("driverExperience").value,
      status: document.getElementById("driverStatus").value,
      address: document.getElementById("driverAddress").value.trim(),
      emergencyContact: document
        .getElementById("driverEmergencyContact")
        .value.trim(),
      notes: document.getElementById("driverNotes").value.trim(),
      image: imageInput && imageInput.files ? imageInput.files[0] : null,
      photoSource,
    };

    tableBody.prepend(createDriverTableRow(driver));

    if (typeof updateDriverStats === "function") {
      updateDriverStats();
    }

    form.reset();

    if (typeof resetDriverImagePreview === "function") {
      resetDriverImagePreview();
    } else if (imageInput) {
      imageInput.value = "";
    }

    if (typeof closeDriverModal === "function") {
      closeDriverModal();
    }

    if (typeof window.showToast === "function") {
      window.showToast("Driver added successfully.", "success");
    }
  });
}
