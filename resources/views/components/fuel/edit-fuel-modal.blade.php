<div
  id="editFuelModal"
  class="modal-overlay"
  role="dialog"
  aria-modal="true"
  aria-labelledby="editFuelModalTitle"
  aria-describedby="editFuelModalDescription"
>
  <div class="custom-modal">
    <div class="modal-header">
      <div>
        <h2 id="editFuelModalTitle">Edit Fuel Record</h2>
        <p id="editFuelModalDescription">
          Update vehicle fuel transaction information.
        </p>
      </div>
      <button
        type="button"
        class="modal-close"
        id="closeEditFuelModal"
        aria-label="Close edit fuel modal"
      >
        <i class="ph ph-x"></i>
      </button>
    </div>

    <div class="modal-body">
      <form id="editFuelForm">
        <div class="form-grid">
          <div class="form-group">
            <label for="editFuelNumber">Fuel Record Number *</label>
            <input type="text" id="editFuelNumber" readonly required />
          </div>

          <div class="form-group">
            <label for="editFuelRefuelDate">Refueling Date *</label>
            <input type="date" id="editFuelRefuelDate" required />
          </div>

          <div class="form-group">
            <label for="editFuelRefuelTime">Refueling Time</label>
            <input type="time" id="editFuelRefuelTime" />
          </div>

          <div class="form-group">
            <label for="editFuelVehicle">Vehicle *</label>
            <select id="editFuelVehicle" required>
              <option value="">Select Vehicle</option>
              <option value="Ambulance 01" data-plate="ABC-1001">Ambulance 01</option>
              <option value="Ambulance 03" data-plate="ABC-1003">Ambulance 03</option>
              <option value="Patient Van 02" data-plate="DEF-2002">Patient Van 02</option>
              <option value="Service Vehicle 04" data-plate="GHI-4004">Service Vehicle 04</option>
              <option value="Van 02" data-plate="JKL-2002">Van 02</option>
              <option value="Van 05" data-plate="JKL-2005">Van 05</option>
              <option value="SUV 03" data-plate="MNO-3003">SUV 03</option>
            </select>
          </div>

          <div class="form-group">
            <label for="editFuelPlate">Plate Number</label>
            <input type="text" id="editFuelPlate" readonly />
          </div>

          <div class="form-group">
            <label for="editFuelDriver">Driver *</label>
            <input type="text" id="editFuelDriver" required />
          </div>

          <div class="form-group">
            <label for="editFuelType">Fuel Type *</label>
            <select id="editFuelType" required>
              <option value="">Select Fuel Type</option>
              <option value="Diesel">Diesel</option>
              <option value="Gasoline">Gasoline</option>
              <option value="Premium Gasoline">Premium Gasoline</option>
            </select>
          </div>

          <div class="form-group">
            <label for="editFuelQuantity">Quantity (Liters) *</label>
            <input type="number" id="editFuelQuantity" min="0.01" step="0.01" required />
          </div>

          <div class="form-group">
            <label for="editFuelCostPerLiter">Cost per Liter *</label>
            <input type="number" id="editFuelCostPerLiter" min="0.01" step="0.01" required />
          </div>

          <div class="form-group">
            <label for="editFuelTotalCost">Total Cost *</label>
            <input type="number" id="editFuelTotalCost" min="0" step="0.01" readonly required />
          </div>

          <div class="form-group">
            <label for="editFuelOdometer">Odometer Reading *</label>
            <input type="number" id="editFuelOdometer" min="0" step="1" required />
          </div>

          <div class="form-group">
            <label for="editFuelStation">Fuel Station *</label>
            <input type="text" id="editFuelStation" required />
          </div>

          <div class="form-group">
            <label for="editFuelReceipt">Receipt / Reference Number</label>
            <input type="text" id="editFuelReceipt" maxlength="40" />
          </div>

          <div class="form-group">
            <label for="editFuelPayment">Payment Method</label>
            <select id="editFuelPayment">
              <option value="">Select payment method</option>
              <option value="Fleet Card">Fleet Card</option>
              <option value="Cash">Cash</option>
              <option value="Company Account">Company Account</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="form-group full-width">
            <label for="editFuelNotes">Notes</label>
            <textarea id="editFuelNotes" rows="3"></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-outline" id="cancelEditFuel">Cancel</button>
          <button type="submit" class="btn-primary" id="updateFuelBtn">Update Fuel Record</button>
        </div>
      </form>
    </div>
  </div>
</div>
