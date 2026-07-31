<div
  class="modal-overlay"
  id="editVehicleModal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="editVehicleModalTitle"
>
  <div class="custom-modal">
    <div class="modal-header">
      <div>
        <h2 id="editVehicleModalTitle">Edit Vehicle</h2>
        <p>Update vehicle information.</p>
      </div>

      <button
        type="button"
        class="modal-close"
        id="closeEditVehicleModal"
        aria-label="Close edit vehicle dialog"
      >
        <i class="ph ph-x"></i>
      </button>
    </div>

    <div class="modal-body">
      <form
          class="vehicle-form"
          id="editVehicleForm"
          data-id=""
      >
        <input type="hidden" id="editVehicleId">
        <div class="form-grid">
          <div class="form-group">
              <label for="editVehicleBrand">Brand</label>
              <input
                  type="text"
                  id="editVehicleBrand"
                  name="brand"
                  placeholder="Toyota"
                  required
              >
          </div>

          <div class="form-group">
              <label for="editVehicleModel">Model</label>
              <input
                  type="text"
                  id="editVehicleModel"
                  name="model"
                  placeholder="HiAce"
                  required
              >
          </div>

          <div class="form-group">
            <label for="editVehiclePlate">Plate Number</label>
            <input
              type="text"
              id="editVehiclePlate"
              name="plate_number"
              placeholder="ABC-1234"
              required
            />
          </div>

          <div class="form-group">
            <label for="editVehicleType">Vehicle Type</label>
            <select id="editVehicleType" name="vehicle_type" required>
              <option value="">Select Vehicle Type</option>
              <option>Ambulance</option>
              <option>Patient Van</option>
              <option>Service Vehicle</option>
              <option>SUV</option>
              <option>Motorcycle</option>
            </select>
          </div>

          <div class="form-group">
              <label for="editYearModel">Year Model</label>

              <input
                  type="number"
                  id="editYearModel"
                  name="year_model"
                  placeholder="2025"
                  required
              >
          </div>

          <div class="form-group">
              <label for="editVehicleCapacity">Capacity</label>

              <input
                  type="number"
                  id="editVehicleCapacity"
                  name="capacity"
                  placeholder="8"
                  required
              >
          </div>

          <div class="form-group">
            <label for="editVehicleDriver">Assigned Driver</label>
            <select id="editVehicleDriver">
              <option value="">Select Driver</option>
              <option>Juan Dela Cruz</option>
              <option>Pedro Santos</option>
              <option>Maria Reyes</option>
              <option>Carlos Mendoza</option>
            </select>
          </div>

          <div class="form-group">
            <label for="editVehicleFuel">Fuel Type</label>
            <select id="editVehicleFuel" name="fuel_type">
              <option value="">Select Fuel Type</option>
              <option>Diesel</option>
              <option>Gasoline</option>
              <option>Electric</option>
              <option>Hybrid</option>
            </select>
          </div>

          <div class="form-group">
            <label for="editVehicleStatus">Status</label>
            <select id="editVehicleStatus" name="status" required>
              <option value="">Select Status</option>
              <option>Available</option>
              <option>On Trip</option>
              <option>Maintenance</option>
              <option>Out of Service</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="editVehicleNotes">Notes</label>

          <textarea
            id="editVehicleNotes"
            rows="4"
            name="notes"
            placeholder="Additional notes..."
          ></textarea>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-outline" id="cancelEditVehicle">
            Cancel
          </button>

          <button type="submit" id="updateVehicleBtn" class="btn-primary">
            <i class="ph ph-floppy-disk"></i>
            Update Vehicle
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
