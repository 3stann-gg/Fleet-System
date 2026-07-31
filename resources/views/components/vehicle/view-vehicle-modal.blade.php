<div
  class="modal-overlay"
  id="viewVehicleModal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="viewVehicleName"
>
  <div class="custom-modal">
    <div class="modal-header">
      <div>
        <h2>Vehicle Details</h2>
        <p>View complete vehicle information.</p>
      </div>

      <button
        type="button"
        class="modal-close"
        id="closeViewVehicleModal"
        aria-label="Close vehicle details dialog"
      >
        <i class="ph ph-x"></i>
      </button>
    </div>
    <div class="vehicle-profile">
      <img
        id="viewVehicleImage"
        src="../assets/images/vehicle-placeholder.svg"
        alt="Vehicle"
      />

      <h3 id="viewVehicleName"></h3>

      <p id="viewVehicleSubtitle"></p>
      <span
        id="viewVehicleStatus"
        class="status-badge available">
    </span>
    </div>

    <div class="modal-body">
      <div class="view-vehicle-summary">
        <div class="view-vehicle-summary-item">
          <span class="view-vehicle-summary-label">Plate Number</span>
          <span class="view-vehicle-summary-value" id="viewPlateNumber"></span>
        </div>

        <div class="view-vehicle-summary-item">
          <span class="view-vehicle-summary-label">Vehicle Type</span>
          <span class="view-vehicle-summary-value" id="viewVehicleType"></span>
        </div>

        <div class="view-vehicle-summary-item">
          <span class="view-vehicle-summary-label">Status</span>
          <span id="viewVehicleStatusSummary"></span>
        </div>

        <div class="view-vehicle-summary-item">
          <span class="view-vehicle-summary-label">Assigned Driver</span>
          <span class="view-vehicle-summary-value" id="viewDriver"></span>
        </div>
      </div>

      <div class="view-vehicle-details">
        <div class="view-vehicle-detail-item">
          <label>Model / Subtitle</label>
          <p id="viewVehicleSubtitle"></p>
        </div>

        <div class="view-vehicle-detail-item">
          <label>Fuel Type</label>
          <p id="viewFuelType"></p>
        </div>

        <div class="view-vehicle-detail-item">
          <label>Fuel Level</label>
          <p id="viewFuelLevel"></p>
        </div>

        <div class="view-vehicle-detail-item">
          <label>Mileage</label>
          <p id="viewMileage"></p>
        </div>

        <div class="view-vehicle-detail-item">
          <label>Purchase Date</label>
          <p id="viewPurchaseDate"></p>
        </div>

        <div class="view-vehicle-detail-item">
          <label>Insurance Expiry</label>
          <p id="viewInsuranceExpiry"></p>
        </div>
      </div>

      <div class="view-vehicle-notes">
        <label>Additional Information</label>
        <p id="viewVehicleNotes"></p>
      </div>
    </div>

      <div class="modal-footer">
        <button type="button" class="btn-outline" id="closeViewBtn">Close</button>

        <button type="button" class="btn-primary" id="editVehicleBtn">
          <i class="ph ph-pencil-simple"></i>
          Edit Vehicle
        </button>
      </div>
    </div>
</div>
