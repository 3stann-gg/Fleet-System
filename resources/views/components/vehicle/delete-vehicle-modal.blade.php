<div
  class="modal-overlay"
  id="deleteVehicleModal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="deleteVehicleTitle"
>
  <div class="custom-modal delete-modal">
    <div class="delete-icon">
      <i class="ph-fill ph-warning-circle"></i>
    </div>

    <h2 id="deleteVehicleTitle">Delete Vehicle</h2>

    <p>
      Are you sure you want to delete
      <strong id="deleteVehicleName">Vehicle</strong>?
    </p>

    <p class="delete-note">This action cannot be undone.</p>

    <div class="modal-footer">
      <button type="button" class="btn-outline" id="cancelDeleteVehicle">Cancel</button>

      <button type="button" class="btn-danger" id="confirmDeleteVehicle">
        <i class="ph ph-trash"></i>

        Delete Vehicle
      </button>
    </div>
  </div>
</div>
