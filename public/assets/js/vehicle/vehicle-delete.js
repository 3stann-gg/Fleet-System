/* ==========================================
   Delete Vehicle Modal
========================================== */

function openDeleteVehicleModal(modal) {
  if (!modal.classList.contains("show")) {
    modal.dataset.previousBodyOverflow = document.body.style.overflow;
  }

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeDeleteVehicleModal(modal) {
  if (!modal.classList.contains("show")) return;

  modal.classList.remove("show");
  document.body.style.overflow = modal.dataset.previousBodyOverflow || "";
  delete modal.dataset.previousBodyOverflow;
  modal.currentRow = null;
}

function refreshVehicleAfterDelete() {
  if (typeof updateVehicleStats === "function") {
    updateVehicleStats();
  }

  if (typeof applyVehicleFilters === "function") {
    applyVehicleFilters();
  } else if (typeof refreshVehiclePagination === "function") {
    refreshVehiclePagination();
  }

  if (typeof refreshVehicleBulkState === "function") {
    refreshVehicleBulkState();
  }
}

function initDeleteVehicleModal() {
  const modal = document.getElementById("deleteVehicleModal");
  const cancelButton = document.getElementById("cancelDeleteVehicle");
  const confirmButton = document.getElementById("confirmDeleteVehicle");
  const vehicleNameElement = document.getElementById("deleteVehicleName");

  if (!modal || modal.dataset.deleteVehicleModalInitialized === "true") {
    return;
  }

  modal.dataset.deleteVehicleModalInitialized = "true";

  document.addEventListener("click", (event) => {
    if (!event.target || typeof event.target.closest !== "function") return;

    const deleteButton = event.target.closest(".action-btn.delete");

    if (!deleteButton) return;

    const vehicleId = deleteButton.dataset.id;

    fetch(`/fleet/${vehicleId}`)
      .then(response => response.json())
      .then(data => {

          console.log("DELETE VEHICLE RESPONSE:", data);

          const vehicle = data.vehicle;

          if (!vehicle) {
              console.error("Vehicle data not found.");
              return;
          }

          modal.dataset.vehicleId = vehicle.id;

          if (vehicleNameElement) {
              vehicleNameElement.textContent =
                  `${vehicle.brand} ${vehicle.model}`;
          }

          openDeleteVehicleModal(modal);

      });
  });

  cancelButton?.addEventListener("click", () => closeDeleteVehicleModal(modal));
  confirmButton?.addEventListener("click", () => {
      const vehicleId = modal.dataset.vehicleId;

      if (!vehicleId) {
          console.error("No vehicle ID found.");
          return;
      }

      fetch(`/fleet/${vehicleId}`, {
          method: "DELETE",
          headers: {
              "Accept": "application/json",
              "X-CSRF-TOKEN": document
                  .querySelector('meta[name="csrf-token"]')
                  .content
          }
      })
      .then(response => response.json())
      .then(data => {

          if (!data.success) return;

          closeDeleteVehicleModal(modal);

          if (typeof window.showToast === "function") {
              window.showToast(
                  data.message,
                  "success"
              );
          }

          loadVehicles();

      })
      .catch(error => {
          console.error("DELETE VEHICLE ERROR:", error);

          if (typeof window.showToast === "function") {
              window.showToast(
                  "Unable to delete vehicle.",
                  "error"
              );
          }
      });
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeDeleteVehicleModal(modal);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeDeleteVehicleModal(modal);
    }
  });

}

document.addEventListener("DOMContentLoaded", initDeleteVehicleModal);