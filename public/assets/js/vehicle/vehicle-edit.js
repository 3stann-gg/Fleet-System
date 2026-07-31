/* ==========================================
   Edit Vehicle Modal
========================================== */

function getEditVehicleRowText(row, columnIndex, selector) {
  const selectedElement = selector ? row.querySelector(selector) : null;
  const cell = row.children?.[columnIndex];
  const value = selectedElement ? selectedElement.textContent : cell?.textContent;

  return value && value.trim() ? value.trim() : "";
}

function setEditVehicleFieldValue(id, value) {
  const field = document.getElementById(id);

  if (field) {
    field.value = value;
  }
}

function setEditVehicleSelectValue(id, value) {
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

function openEditVehicleModal(modal) {
  if (!modal) return;

  if (!modal.classList.contains("show")) {
    modal.dataset.previousBodyOverflow = document.body.style.overflow;
  }

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeEditVehicleModal(modal) {
  if (!modal || !modal.classList.contains("show")) return;

  modal.classList.remove("show");
  document.body.style.overflow = modal.dataset.previousBodyOverflow || "";
  delete modal.dataset.previousBodyOverflow;
  modal.currentRow = null;
}

function populateEditVehicleModal(vehicle) {

    document.getElementById("editVehicleId").value = vehicle.id;

    document.getElementById("editVehicleBrand").value = vehicle.brand;

    document.getElementById("editVehicleModel").value = vehicle.model;

    document.getElementById("editVehiclePlate").value = vehicle.plate_number;

    document.getElementById("editVehicleType").value = vehicle.vehicle_type;

    document.getElementById("editYearModel").value = vehicle.year_model;

    document.getElementById("editVehicleCapacity").value = vehicle.capacity;

    document.getElementById("editVehicleDriver").value =
        vehicle.driver_name ?? "";

    document.getElementById("editVehicleFuel").value =
        vehicle.fuel_type;

    document.getElementById("editVehicleStatus").value =
        vehicle.status;

    document.getElementById("editVehicleNotes").value =
        vehicle.notes ?? "";
}

function updateVehicleActionLabels(row, name) {
  const checkbox = row.querySelector(".vehicle-checkbox");
  const viewButton = row.querySelector(".action-btn.view");
  const editButton = row.querySelector(".action-btn.edit");
  const deleteButton = row.querySelector(".action-btn.delete");

  checkbox?.setAttribute("aria-label", `Select ${name}`);
  viewButton?.setAttribute("aria-label", `View ${name}`);
  editButton?.setAttribute("aria-label", `Edit ${name}`);
  deleteButton?.setAttribute("aria-label", `Delete ${name}`);
}

function refreshVehicleAfterEdit() {
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

function initEditVehicleModal() {
  const modal = document.getElementById("editVehicleModal");
  const form = document.getElementById("editVehicleForm");
  const closeButton = document.getElementById("closeEditVehicleModal");
  const cancelButton = document.getElementById("cancelEditVehicle");

  if (!modal || !form || modal.dataset.editVehicleModalInitialized === "true") {
    return;
  }

  modal.dataset.editVehicleModalInitialized = "true";

  document.addEventListener("click", function (event) {
      const button = event.target.closest(".action-btn.edit");

      if (!button) return;

      const vehicleId = button.dataset.id;

      fetch(`/fleet/${vehicleId}`)
          .then(response => response.json())
          .then(vehicle => {

              populateEditVehicleModal(vehicle);

              openEditVehicleModal(modal);

          });

  });

  closeButton?.addEventListener("click", () => closeEditVehicleModal(modal));
  cancelButton?.addEventListener("click", () => closeEditVehicleModal(modal));

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeEditVehicleModal(modal);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeEditVehicleModal(modal);
    }
  });

  form.addEventListener("submit", function (event) {
      event.preventDefault();

      const vehicleId = document.getElementById("editVehicleId").value;

      const formData = {
          brand: document.getElementById("editVehicleBrand").value,
          model: document.getElementById("editVehicleModel").value,
          plate_number: document.getElementById("editVehiclePlate").value,
          vehicle_type: document.getElementById("editVehicleType").value,
          year_model: document.getElementById("editYearModel").value,
          capacity: document.getElementById("editVehicleCapacity").value,
          fuel_type: document.getElementById("editVehicleFuel").value,
          status: document.getElementById("editVehicleStatus").value,
      };

      fetch(`/fleet/${vehicleId}`, {

          method: "PUT",

          headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",

              "X-CSRF-TOKEN": document
                  .querySelector('meta[name="csrf-token"]')
                  .content,
          },

          body: JSON.stringify(formData),

      })

      .then(response => response.json())

      .then(data => {
          if (!data.success) return;

          const vehicle = data.vehicle;

          const row = document.querySelector(
              `.action-btn.edit[data-id="${vehicle.id}"]`
          ).closest("tr");

          if (!row) return;

          row.querySelector(".vehicle-name").textContent =
              `${vehicle.brand} ${vehicle.model}`;

          row.querySelector(".vehicle-info small").textContent =
              vehicle.year_model;

          row.children[2].textContent =
              vehicle.plate_number;

          row.children[3].textContent =
              vehicle.vehicle_type;

          row.children[5].querySelector(".status-badge").textContent =
              vehicle.status;

          row.children[6].textContent =
              vehicle.fuel_type;

          closeEditVehicleModal(modal);

          if (typeof window.showToast === "function") {

              window.showToast(
                  "Vehicle updated successfully!",
                  "success"
              );

          }

      });

  });
}

document.addEventListener("DOMContentLoaded", initEditVehicleModal);
