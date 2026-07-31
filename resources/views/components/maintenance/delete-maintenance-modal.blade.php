<div
  id="deleteMaintenanceModal"
  class="modal-overlay"
  role="dialog"
  aria-modal="true"
  aria-labelledby="deleteMaintenanceModalTitle"
  aria-describedby="deleteMaintenanceModalDescription"
>
  <div class="custom-modal delete-modal">
    <button
      type="button"
      class="modal-close"
      id="closeDeleteMaintenanceModal"
      aria-label="Close delete maintenance modal"
    >
      <i class="ph ph-x"></i>
    </button>

    <div class="delete-icon">
      <i class="ph-fill ph-warning-circle"></i>
    </div>

    <h2 id="deleteMaintenanceModalTitle">Delete Maintenance Record</h2>

    <p id="deleteMaintenanceModalDescription">
      Are you sure you want to delete
      <strong id="deleteMaintenanceNumber">this maintenance record</strong>
      for <strong id="deleteMaintenanceVehicle">this vehicle</strong>?
    </p>
    <!-- Description text is replaced for bulk delete mode -->

    <p class="delete-note">This action cannot be undone.</p>

    <div class="modal-footer">
      <button type="button" class="btn-outline" id="cancelDeleteMaintenance">
        Cancel
      </button>

      <button type="button" class="btn-danger" id="confirmDeleteMaintenance">
        <i class="ph ph-trash"></i>
        Delete Maintenance
      </button>
    </div>
  </div>
</div>
