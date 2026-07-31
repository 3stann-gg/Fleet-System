<div
  id="editDriverModal"
  class="modal-overlay"
  role="dialog"
  aria-modal="true"
  aria-labelledby="editDriverModalTitle"
  aria-describedby="editDriverModalDescription"
>
  <div class="custom-modal">
    <div class="modal-header">
      <div>
        <h2 id="editDriverModalTitle">Edit Driver</h2>

        <p id="editDriverModalDescription">Update driver information.</p>
      </div>

      <button
        type="button"
        class="modal-close"
        id="closeEditDriverModal"
        aria-label="Close Edit Driver modal"
      >
        <i class="ph ph-x"></i>
      </button>
    </div>

    <div class="modal-body">
      <form id="editDriverForm" class="driver-form vehicle-form">
        <div class="vehicle-image-section">
          <label class="vehicle-image-label" for="editDriverImage">
            Driver Photo
          </label>

          <div class="vehicle-image-upload">
            <img
              id="editDriverPreview"
              src="data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%20170%20170%27%3E%3Crect%20width%3D%27170%27%20height%3D%27170%27%20fill%3D%27%23f8fafc%27%2F%3E%3Ccircle%20cx%3D%2785%27%20cy%3D%2762%27%20r%3D%2730%27%20fill%3D%27%23cbd5e1%27%2F%3E%3Cpath%20d%3D%27M30%20155c10-35%2035-50%2055-50s45%2015%2055%2050%27%20fill%3D%27%23cbd5e1%27%2F%3E%3C%2Fsvg%3E"
              alt="Driver photo preview"
            />

            <input
              type="file"
              id="editDriverImage"
              accept="image/*"
              hidden
            />

            <label for="editDriverImage" class="btn-outline upload-btn">
              <i class="ph ph-image"></i>
              Choose Photo
            </label>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="editDriverName">Full Name *</label>
            <input type="text" id="editDriverName" required />
          </div>

          <div class="form-group">
            <label for="editDriverEmployeeId">Employee ID *</label>
            <input type="text" id="editDriverEmployeeId" required />
          </div>

          <div class="form-group">
            <label for="editDriverLicenseNumber">License Number *</label>
            <input type="text" id="editDriverLicenseNumber" required />
          </div>

          <div class="form-group">
            <label for="editDriverLicenseClass">License Class *</label>
            <select id="editDriverLicenseClass" required>
              <option value="">Select License Class</option>
              <option value="Professional">Professional</option>
              <option value="Non-Professional">Non-Professional</option>
            </select>
          </div>

          <div class="form-group">
            <label for="editDriverLicenseExpiry">License Expiry *</label>
            <input type="date" id="editDriverLicenseExpiry" required />
          </div>

          <div class="form-group">
            <label for="editDriverPhone">Phone Number *</label>
            <input type="tel" id="editDriverPhone" required />
          </div>

          <div class="form-group">
            <label for="editDriverEmail">Email</label>
            <input type="email" id="editDriverEmail" />
          </div>

          <div class="form-group">
            <label for="editDriverAssignedVehicle">Assigned Vehicle</label>
            <select id="editDriverAssignedVehicle">
              <option value="">Select Assigned Vehicle</option>
              <option value="Ambulance 01">Ambulance 01</option>
              <option value="Patient Van 02">Patient Van 02</option>
              <option value="Service Vehicle 01">Service Vehicle 01</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>

          <div class="form-group">
            <label for="editDriverExperience">Experience (Years)</label>
            <input type="number" id="editDriverExperience" min="0" />
          </div>

          <div class="form-group">
            <label for="editDriverStatus">Status *</label>
            <select id="editDriverStatus" required>
              <option value="">Select Status</option>
              <option value="Available">Available</option>
              <option value="On Duty">On Duty</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div class="form-group full-width">
            <label for="editDriverAddress">Address</label>
            <input type="text" id="editDriverAddress" />
          </div>

          <div class="form-group">
            <label for="editDriverEmergencyContact">Emergency Contact</label>
            <input type="tel" id="editDriverEmergencyContact" />
          </div>

          <div class="form-group full-width">
            <label for="editDriverNotes">Notes</label>
            <textarea id="editDriverNotes" rows="4"></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-outline" id="cancelEditDriver">
            Cancel
          </button>

          <button type="submit" class="btn-primary" id="updateDriverBtn">
            <i class="ph ph-floppy-disk"></i>
            Update Driver
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
