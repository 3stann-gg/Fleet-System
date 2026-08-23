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
          <!--
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
          -->
          <!--
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
          -->
          <div class="form-group">
            <label for="editVehiclePlate">
                Plate Number
                <span id="editVehiclePlateRequiredMark">*</span>
            </label>
            <input
              type="text"
              id="editVehiclePlate"
              name="plate_number"
              placeholder="ABC-1234"

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
              <label for="editVehicleCapacity">Capacity</label>

              <input
                  type="number"
                  id="editVehicleCapacity"
                  name="capacity"
                  placeholder="4"
                  required
              >
          </div>

          <div class="form-group">
            <label for="editVehicleDriver">Assigned Driver</label>
            <select id="editVehicleDriver">
        
            </select>
          </div>

          <div class="form-group">
            <label for="editVehicleFuel">Fuel Type</label>
            <select id="editVehicleFuel" name="fuel_type">
              <option value="">Select Fuel Type</option>
              <option value="Diesel">Diesel</option>
              <option value="Gasoline">Gasoline</option>
              <option value="Premium Gasoline">Premium Gasoline</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div class="form-group">
            <label for="editVehicleTankCapacity">Tank Capacity (Liters)</label>
            <input
              type="number"
              id="editVehicleTankCapacity"
              name="tank_capacity"
              min="0.01"
              step="0.01"
              placeholder="80"
            />
          </div>

          <!--<div class="form-group">
            <label for="editVehicleCurrentFuel">
              Current Fuel (Liters)
            </label>
            <input
              type="number"
              id="editVehicleCurrentFuel"
              name="current_fuel"
              readonly
            />
          </div>-->

          <div class="form-group">
            <label for="editVehicleMileage">Current Mileage</label>
            <input
              type="number"
              id="editVehicleMileage"
              name="current_odometer"
              readonly
            />
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
