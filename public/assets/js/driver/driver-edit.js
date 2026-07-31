/* ==========================================
   Edit Driver Modal
========================================== */

function getEditDriverRowText(row, columnIndex, selector) {
  const selectedElement = selector ? row.querySelector(selector) : null;
  const cell = row.children && row.children[columnIndex];
  const value = selectedElement ? selectedElement.textContent : cell?.textContent;

  return value && value.trim() ? value.trim() : "";
}

function getEditDriverData(row, key) {
  const value = row.dataset && row.dataset[key];

  return value && value.trim() ? value.trim() : "";
}

function setEditDriverFieldValue(id, value) {
  const field = document.getElementById(id);

  if (field) {
    field.value = value;
  }
}

function setEditDriverSelectValue(id, value) {
  const select = document.getElementById(id);

  if (!select) return;

  if (
    value &&
    !Array.from(select.options).some((option) => option.value === value)
  ) {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  }

  select.value = value;
}

function getEditDriverPlaceholderSource(preview) {
  if (!preview) return "";

  if (!preview.dataset.placeholderSrc) {
    preview.dataset.placeholderSrc = preview.getAttribute("src") || preview.src;
  }

  return preview.dataset.placeholderSrc;
}

function openEditDriverModal(modal) {
  if (!modal.classList.contains("show")) {
    modal.dataset.previousBodyOverflow = document.body.style.overflow;
  }

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeEditDriverModal(modal) {
  if (!modal.classList.contains("show")) return;

  modal.classList.remove("show");
  document.body.style.overflow = modal.dataset.previousBodyOverflow || "";
  delete modal.dataset.previousBodyOverflow;
  modal.currentRow = null;
  modal.dataset.photoChanged = "false";
}

function populateEditDriverModal(modal, row) {
  const preview = document.getElementById("editDriverPreview");
  const imageInput = document.getElementById("editDriverImage");
  const rowImage = row.querySelector(".driver-photo");
  const photoSource =
    (rowImage && rowImage.src) || getEditDriverPlaceholderSource(preview);

  modal.currentRow = row;
  modal.dataset.photoChanged = "false";

  if (preview && photoSource) {
    preview.src = photoSource;
  }

  if (imageInput) {
    imageInput.value = "";
  }

  setEditDriverFieldValue(
    "editDriverName",
    getEditDriverRowText(row, 1, ".driver-name"),
  );
  setEditDriverFieldValue("editDriverEmployeeId", getEditDriverRowText(row, 2));
  setEditDriverFieldValue(
    "editDriverLicenseNumber",
    getEditDriverRowText(row, 3, ".driver-license"),
  );
  setEditDriverSelectValue("editDriverLicenseClass", getEditDriverRowText(row, 4));
  setEditDriverFieldValue(
    "editDriverLicenseExpiry",
    getEditDriverData(row, "licenseExpiry"),
  );
  setEditDriverFieldValue("editDriverPhone", getEditDriverRowText(row, 7));
  setEditDriverFieldValue("editDriverEmail", getEditDriverData(row, "email"));
  setEditDriverSelectValue(
    "editDriverAssignedVehicle",
    getEditDriverRowText(row, 5, ".driver-assignment"),
  );
  setEditDriverFieldValue(
    "editDriverExperience",
    getEditDriverData(row, "experience"),
  );
  setEditDriverSelectValue(
    "editDriverStatus",
    getEditDriverRowText(row, 6, ".status-badge"),
  );
  setEditDriverFieldValue(
    "editDriverAddress",
    getEditDriverData(row, "address"),
  );
  setEditDriverFieldValue(
    "editDriverEmergencyContact",
    getEditDriverData(row, "emergencyContact"),
  );
  setEditDriverFieldValue("editDriverNotes", getEditDriverData(row, "notes"));
}

function updateDriverRowPhoto(row, photoSource, name) {
  const driverInfo = row.querySelector(".driver-info");

  if (!driverInfo || !photoSource) return;

  const existingPhoto = driverInfo.querySelector(".driver-photo");

  if (existingPhoto) {
    existingPhoto.src = photoSource;
    existingPhoto.alt = `Photo of ${name}`;
    return;
  }

  const photo = document.createElement("img");
  const avatar = driverInfo.querySelector(".driver-avatar");

  photo.className = "driver-photo vehicle-photo";
  photo.src = photoSource;
  photo.alt = `Photo of ${name}`;

  if (avatar) {
    avatar.remove();
  }

  driverInfo.prepend(photo);
}

function updateDriverActionLabels(row, name) {
  const checkbox = row.querySelector(".driver-checkbox");
  const viewButton = row.querySelector(".view-driver");
  const editButton = row.querySelector(".edit-driver");
  const deleteButton = row.querySelector(".delete-driver");

  checkbox?.setAttribute("aria-label", `Select ${name}`);
  viewButton?.setAttribute("aria-label", `View ${name}`);
  editButton?.setAttribute("aria-label", `Edit ${name}`);
  deleteButton?.setAttribute("aria-label", `Delete ${name}`);
}

function initEditDriverModal() {
  const modal = document.getElementById("editDriverModal");
  const form = document.getElementById("editDriverForm");
  const closeButton = document.getElementById("closeEditDriverModal");
  const cancelButton = document.getElementById("cancelEditDriver");
  const imageInput = document.getElementById("editDriverImage");
  const preview = document.getElementById("editDriverPreview");

  if (!modal || !form || modal.dataset.editDriverModalInitialized === "true") {
    return;
  }

  modal.dataset.editDriverModalInitialized = "true";

  if (imageInput && preview) {
    getEditDriverPlaceholderSource(preview);

    imageInput.addEventListener("change", () => {
      const file = imageInput.files && imageInput.files[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        imageInput.value = "";
        return;
      }

      const reader = new FileReader();

      reader.addEventListener("load", () => {
        preview.src = reader.result;
        modal.dataset.photoChanged = "true";
      });

      reader.readAsDataURL(file);
    });
  }

  document.addEventListener("click", (event) => {
    if (!event.target || typeof event.target.closest !== "function") return;

    const editButton = event.target.closest(".action-btn.edit-driver");

    if (!editButton) return;

    const row = editButton.closest("tr");

    if (!row) return;

    populateEditDriverModal(modal, row);
    openEditDriverModal(modal);
  });

  closeButton?.addEventListener("click", () => closeEditDriverModal(modal));
  cancelButton?.addEventListener("click", () => closeEditDriverModal(modal));

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeEditDriverModal(modal);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeEditDriverModal(modal);
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const requiredFields = [
      "editDriverName",
      "editDriverEmployeeId",
      "editDriverLicenseNumber",
      "editDriverLicenseClass",
      "editDriverLicenseExpiry",
      "editDriverPhone",
      "editDriverStatus",
    ]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const emptyField = requiredFields.find((field) => !field.value.trim());

    if (emptyField) {
      if (typeof setDriverFieldValidationMessage === "function") {
        setDriverFieldValidationMessage(emptyField);
      } else {
        emptyField.focus();
      }

      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const row = modal.currentRow;

    if (!row) return;

    const name = document.getElementById("editDriverName").value.trim();
    const employeeId = document
      .getElementById("editDriverEmployeeId")
      .value.trim();
    const licenseNumber = document
      .getElementById("editDriverLicenseNumber")
      .value.trim();
    const licenseClass = document.getElementById("editDriverLicenseClass").value;
    const licenseExpiry = document.getElementById("editDriverLicenseExpiry").value;
    const phone = document.getElementById("editDriverPhone").value.trim();
    const email = document.getElementById("editDriverEmail").value.trim();
    const assignedVehicle = document.getElementById(
      "editDriverAssignedVehicle",
    ).value;
    const experience = document.getElementById("editDriverExperience").value;
    const status = document.getElementById("editDriverStatus").value;
    const address = document.getElementById("editDriverAddress").value.trim();
    const emergencyContact = document
      .getElementById("editDriverEmergencyContact")
      .value.trim();
    const notes = document.getElementById("editDriverNotes").value.trim();
    const nameElement = row.querySelector(".driver-name");
    const licenseElement = row.querySelector(".driver-license");
    const assignmentElement = row.querySelector(".driver-assignment");
    const statusBadge = row.querySelector(".status-badge");
    const avatar = row.querySelector(".driver-avatar");
    const photoChanged = modal.dataset.photoChanged === "true";

    if (nameElement) {
      nameElement.textContent = name;
    }

    if (row.children[2]) {
      row.children[2].textContent = employeeId;
    }

    if (licenseElement) {
      licenseElement.textContent = licenseNumber;
    } else if (row.children[3]) {
      row.children[3].textContent = licenseNumber;
    }

    if (row.children[4]) {
      row.children[4].textContent = licenseClass;
    }

    if (assignmentElement) {
      assignmentElement.textContent = assignedVehicle || "Unassigned";
    } else if (row.children[5]) {
      row.children[5].textContent = assignedVehicle || "Unassigned";
    }

    if (statusBadge) {
      const statusClass =
        typeof getDriverStatusClass === "function"
          ? getDriverStatusClass(status)
          : "out";

      statusBadge.textContent = status;
      statusBadge.className = `status-badge ${statusClass}`;
    }

    if (row.children[7]) {
      row.children[7].textContent = phone;
    }

    row.dataset.licenseExpiry = licenseExpiry;
    row.dataset.email = email;
    row.dataset.experience = experience;
    row.dataset.address = address;
    row.dataset.emergencyContact = emergencyContact;
    row.dataset.notes = notes;

    if (photoChanged && preview) {
      updateDriverRowPhoto(row, preview.src, name);
    } else if (avatar) {
      avatar.textContent = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
    }

    updateDriverActionLabels(row, name);

    if (typeof updateDriverStats === "function") {
      updateDriverStats();
    }

    form.reset();
    closeEditDriverModal(modal);

    if (typeof window.showToast === "function") {
      window.showToast("Driver updated successfully.", "success");
    }
  });
}
