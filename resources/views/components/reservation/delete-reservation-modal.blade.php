<div
  id="deleteReservationModal"
  class="modal-overlay"
  role="dialog"
  aria-modal="true"
  aria-labelledby="deleteReservationModalTitle"
  aria-describedby="deleteReservationModalDescription"
>
  <div class="custom-modal delete-modal">
    <div class="delete-icon">
      <i class="ph-fill ph-warning-circle"></i>
    </div>

    <h2 id="deleteReservationModalTitle">Delete Reservation</h2>

    <p id="deleteReservationModalDescription">
      Are you sure you want to delete
      <strong id="deleteReservationName">this reservation</strong>?
    </p>

    <p class="delete-note">This action cannot be undone.</p>

    <div class="modal-footer">
      <button type="button" class="btn-outline" id="cancelDeleteReservation">
        Cancel
      </button>

      <button type="button" class="btn-danger" id="confirmDeleteReservation">
        <i class="ph ph-trash"></i>
        Delete Reservation
      </button>
    </div>
  </div>
</div>
