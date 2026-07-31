<div
  id="deleteDispatchModal"
  class="modal-overlay"
  role="dialog"
  aria-modal="true"
  aria-labelledby="deleteDispatchModalTitle"
  aria-describedby="deleteDispatchModalDescription"
>
  <div class="custom-modal delete-modal">
    <div class="delete-icon">
      <i class="ph-fill ph-warning-circle"></i>
    </div>

    <h2 id="deleteDispatchModalTitle">Delete Dispatch</h2>

    <p id="deleteDispatchModalDescription">
      Are you sure you want to delete
      <strong id="deleteDispatchName">this dispatch</strong>?
    </p>

    <p class="delete-note">This action cannot be undone.</p>

    <div class="modal-footer">
      <button type="button" class="btn-outline" id="cancelDeleteDispatch">
        Cancel
      </button>

      <button type="button" class="btn-danger" id="confirmDeleteDispatch">
        <i class="ph ph-trash"></i>
        Delete Dispatch
      </button>
    </div>
  </div>
</div>
