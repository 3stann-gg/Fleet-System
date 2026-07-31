/* ==========================================
   View Vehicle Modal
========================================== */

function getViewVehicleRowText(row, columnIndex, selector) {
  const selectedElement = selector ? row.querySelector(selector) : null;
  const cell = row.children?.[columnIndex];
  const value = selectedElement ? selectedElement.textContent : cell?.textContent;

  return value && value.trim() ? value.trim() : "Not provided";
}

function getViewVehicleData(row, key, fallback) {
  const value = row.dataset?.[key];

  return value && value.trim() ? value.trim() : fallback;
}

function setViewVehicleText(modal, id, value) {
  const element = modal.querySelector(`#${id}`);

  if (element) {
    element.textContent = value || "Not provided";
  }
}

function openVehicleDetailsModal(modal) {
  if (!modal.classList.contains("show")) {
    modal.dataset.previousBodyOverflow = document.body.style.overflow;
  }

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeVehicleDetailsModal(modal) {
  if (!modal.classList.contains("show")) return;

  modal.classList.remove("show");
  document.body.style.overflow = modal.dataset.previousBodyOverflow || "";
  delete modal.dataset.previousBodyOverflow;
  modal.currentRow = null;
}

function populateViewVehicleModal(modal, vehicle) {

    const name = `${vehicle.brand} ${vehicle.model}`;

    setViewVehicleText(modal, "viewVehicleName", name);
    setViewVehicleText(modal, "viewVehicleSubtitle", vehicle.year_model);
    setViewVehicleText(modal, "viewPlateNumber", vehicle.plate_number);
    setViewVehicleText(modal, "viewVehicleType", vehicle.vehicle_type);
    setViewVehicleText(modal, "viewDriver", vehicle.driver_name ?? "Not Assigned");
    setViewVehicleText(modal, "viewFuelType", vehicle.fuel_type);
    setViewVehicleText(modal, "viewFuelLevel", vehicle.fuel_level ?? "N/A");
    setViewVehicleText(modal, "viewMileage", vehicle.mileage ?? "N/A");
    setViewVehicleText(modal, "viewPurchaseDate", vehicle.purchase_date ?? "N/A");
    setViewVehicleText(modal, "viewInsuranceExpiry", vehicle.insurance_expiry ?? "N/A");
    setViewVehicleText(modal, "viewVehicleNotes", vehicle.notes ?? "No additional information");

    const statusBadge = modal.querySelector("#viewVehicleStatus");
    const summaryStatus = modal.querySelector("#viewVehicleStatusSummary");

    if (statusBadge) {
        statusBadge.textContent = vehicle.status;

        if (typeof getVehicleStatusClass === "function") {
            statusBadge.className =
                `status-badge ${getVehicleStatusClass(vehicle.status)}`;
        }
    }

    if (summaryStatus) {
        summaryStatus.textContent = vehicle.status;

        if (typeof getVehicleStatusClass === "function") {
            summaryStatus.className =
                `status-badge ${getVehicleStatusClass(vehicle.status)}`;
        }
    }
}

function initViewVehicleModal() {
  const modal = document.getElementById("viewVehicleModal");
  const closeButton = document.getElementById("closeViewVehicleModal");
  const footerCloseButton = document.getElementById("closeViewBtn");
  const editFromViewButton = document.getElementById("editVehicleBtn");

  if (!modal || modal.dataset.viewVehicleModalInitialized === "true") return;

  modal.dataset.viewVehicleModalInitialized = "true";

  document.addEventListener("click", (event) => {
    if (!event.target || typeof event.target.closest !== "function") return;

    const viewButton = event.target.closest(".action-btn.view");

    if (!viewButton) return;

    const row = viewButton.closest("tr");

    if (!row) return;

    modal.currentRow = row;
    populateViewVehicleModal(modal, row);
    openVehicleDetailsModal(modal);
  });

  closeButton?.addEventListener("click", () => closeVehicleDetailsModal(modal));
  footerCloseButton?.addEventListener("click", () =>
    closeVehicleDetailsModal(modal),
  );
  editFromViewButton?.addEventListener("click", () => {
    const editModal = document.getElementById("editVehicleModal");

      if (
          !modal.currentVehicle ||
          !editModal
      ) {
          return;
      }

      closeVehicleDetailsModal(modal);
      populateEditVehicleModal(modal.currentVehicle);
      openEditVehicleModal(editModal);

  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeVehicleDetailsModal(modal);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeVehicleDetailsModal(modal);
    }
  });
}

function initVehicleView() {
    const modal = document.getElementById("viewVehicleModal");

    document.addEventListener("click", function (event) {

        const button = event.target.closest(".action-btn.view");

        if (!button) return;

        const vehicleId = button.dataset.id;

        fetch(`/fleet/${vehicleId}`)
          .then(response => response.json())
          .then(vehicle => {
              modal.currentVehicle = vehicle;
              populateViewVehicleModal(modal, vehicle);
              openVehicleDetailsModal(modal);
          });

    });
}

document.addEventListener("DOMContentLoaded", () => {
    initVehicleView();
    initViewVehicleModal();
});