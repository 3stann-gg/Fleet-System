/* ==========================================
   View Driver Modal
========================================== */

function getViewDriverRowText(row, columnIndex, selector) {
  const selectedElement = selector ? row.querySelector(selector) : null;
  const cell = row.children && row.children[columnIndex];
  const value = selectedElement ? selectedElement.textContent : cell?.textContent;

  return value && value.trim() ? value.trim() : "Not provided";
}

function getViewDriverData(row, key) {
  const value = row.dataset && row.dataset[key];

  return value && value.trim() ? value.trim() : "Not provided";
}

function setViewDriverText(modal, id, value) {
  const element = modal.querySelector(`#${id}`);

  if (element) {
    element.textContent = value || "Not provided";
  }
}

function getViewDriverStatusClass(status) {
  const statusClasses = {
    Available: "available",
    "On Duty": "trip",
    "On Leave": "maintenance",
    Inactive: "out",
  };

  return statusClasses[status] || "out";
}

function populateViewDriverModal(modal, row) {
  const name = getViewDriverRowText(row, 1, ".driver-name");
  const subtitle = getViewDriverRowText(row, 1, ".driver-info small");
  const employeeId = getViewDriverRowText(row, 2);
  const licenseNumber = getViewDriverRowText(row, 3, ".driver-license");
  const licenseClass = getViewDriverRowText(row, 4);
  const assignedVehicle = getViewDriverRowText(row, 5, ".driver-assignment");
  const status = getViewDriverRowText(row, 6, ".status-badge");
  const phone = getViewDriverRowText(row, 7);
  const image = modal.querySelector("#viewDriverImage");
  const statusBadge = modal.querySelector("#viewDriverStatus");
  const rowImage = row.querySelector(".driver-photo");

  if (image) {
    if (!image.dataset.placeholderSrc) {
      image.dataset.placeholderSrc = image.getAttribute("src") || image.src;
    }

    const placeholderSource = image.dataset.placeholderSrc;
    const imageSource = (rowImage && rowImage.src) || placeholderSource;

    if (imageSource) {
      image.src = imageSource;
    }

    image.alt = "Driver photo";
  }

  setViewDriverText(modal, "viewDriverName", name);
  setViewDriverText(
    modal,
    "viewDriverSubtitle",
    subtitle === "Not provided" ? "Fleet Driver" : subtitle,
  );
  setViewDriverText(modal, "viewDriverEmployeeId", employeeId);
  setViewDriverText(modal, "viewDriverLicenseNumber", licenseNumber);
  setViewDriverText(modal, "viewDriverLicenseClass", licenseClass);
  setViewDriverText(
    modal,
    "viewDriverLicenseExpiry",
    getViewDriverData(row, "licenseExpiry"),
  );
  setViewDriverText(modal, "viewDriverPhone", phone);
  setViewDriverText(modal, "viewDriverEmail", getViewDriverData(row, "email"));
  setViewDriverText(modal, "viewDriverAssignedVehicle", assignedVehicle);
  setViewDriverText(
    modal,
    "viewDriverExperience",
    getViewDriverData(row, "experience"),
  );
  setViewDriverText(
    modal,
    "viewDriverAddress",
    getViewDriverData(row, "address"),
  );
  setViewDriverText(
    modal,
    "viewDriverEmergencyContact",
    getViewDriverData(row, "emergencyContact"),
  );
  setViewDriverText(modal, "viewDriverNotes", getViewDriverData(row, "notes"));

  if (statusBadge) {
    statusBadge.className = "status-badge";
    statusBadge.classList.add(getViewDriverStatusClass(status));
    statusBadge.textContent = status;

    const summaryStatus = modal.querySelector("#viewDriverStatusSummary");
    if (summaryStatus) {
      summaryStatus.className = "status-badge";
      summaryStatus.classList.add(getViewDriverStatusClass(status));
      summaryStatus.textContent = status;
    }
  }
}

function openDriverDetailsModal(modal) {
  if (!modal.classList.contains("show")) {
    modal.dataset.previousBodyOverflow = document.body.style.overflow;
  }

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeDriverDetailsModal(modal) {
  if (!modal.classList.contains("show")) return;

  modal.classList.remove("show");
  document.body.style.overflow = modal.dataset.previousBodyOverflow || "";
  delete modal.dataset.previousBodyOverflow;
  modal.currentRow = null;
}

function initViewDriverModal() {
  const modal = document.getElementById("viewDriverModal");

  if (!modal || modal.dataset.viewDriverModalInitialized === "true") return;

  const closeButton = document.getElementById("closeViewDriverModal");
  const footerCloseButton = document.getElementById("closeViewDriverBtn");
  const editFromViewButton = document.getElementById("editDriverFromViewBtn");

  modal.dataset.viewDriverModalInitialized = "true";

  document.addEventListener("click", (event) => {
    if (!event.target || typeof event.target.closest !== "function") return;

    const viewButton = event.target.closest(".action-btn.view-driver");

    if (!viewButton) return;

    const row = viewButton.closest("tr");

    if (!row) return;

    modal.currentRow = row;
    populateViewDriverModal(modal, row);
    openDriverDetailsModal(modal);
  });

  if (closeButton) {
    closeButton.addEventListener("click", () => closeDriverDetailsModal(modal));
  }

  if (footerCloseButton) {
    footerCloseButton.addEventListener("click", () =>
      closeDriverDetailsModal(modal),
    );
  }

  if (editFromViewButton) {
    editFromViewButton.addEventListener("click", () => {
      const row = modal.currentRow;
      const editModal = document.getElementById("editDriverModal");

      if (
        !row ||
        !editModal ||
        typeof populateEditDriverModal !== "function" ||
        typeof openEditDriverModal !== "function"
      ) {
        return;
      }

      closeDriverDetailsModal(modal);
      populateEditDriverModal(editModal, row);
      openEditDriverModal(editModal);
    });
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeDriverDetailsModal(modal);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeDriverDetailsModal(modal);
    }
  });
}
