<div
  id="deleteDriverModal"
  class="modal-overlay"
  role="dialog"
  aria-modal="true"
  aria-labelledby="deleteDriverModalTitle"
  aria-describedby="deleteDriverModalDescription"
>
  <div class="custom-modal delete-modal">
    <div class="delete-icon">
      <i class="ph-fill ph-warning-circle"></i>
    </div>

    <h2 id="deleteDriverModalTitle">Delete Driver</h2>

    <p id="deleteDriverModalDescription">
      Are you sure you want to delete
      <strong id="deleteDriverName">this driver</strong>?
    </p>

    <p class="delete-note">This action cannot be undone.</p>

    <div class="modal-footer">
      <button type="button" class="btn-outline" id="cancelDeleteDriver">
        Cancel
      </button>

      <button type="button" class="btn-danger" id="confirmDeleteDriver">
        <i class="ph ph-trash"></i>
        Delete Driver
      </button>
    </div>
  </div>
</div>
