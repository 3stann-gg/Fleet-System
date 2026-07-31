<div
  id="addMaintenanceModal"
  class="modal-overlay"
  role="dialog"
  aria-modal="true"
  aria-labelledby="addMaintenanceModalTitle"
  aria-describedby="addMaintenanceModalDescription"
>
  <div class="custom-modal">
    <div class="modal-header">
      <div>
        <h2 id="addMaintenanceModalTitle">Add Maintenance</h2>
        <p id="addMaintenanceModalDescription">Create a maintenance record for a hospital fleet vehicle.</p>
      </div>

      <button
        type="button"
        class="modal-close"
        id="closeAddMaintenanceModal"
        aria-label="Close add maintenance modal"
      >
        <i class="ph ph-x"></i>
      </button>
    </div>

    <div class="modal-body">
      <form id="maintenanceForm">
        <div class="form-grid">
          <div class="form-group">
            <label for="maintenanceNumber">Maintenance Number *</label>
            <input
              type="text"
              id="maintenanceNumber"
              placeholder="MNT-2026-001"
              required
            />
          </div>

          <div class="form-group">
            <label for="maintenanceVehicle">Vehicle *</label>
            <select id="maintenanceVehicle" required>
              <option value="">Select Vehicle</option>
              <option value="Ambulance 01">Ambulance 01</option>
              <option value="Patient Van 02">Patient Van 02</option>
              <option value="SUV 03">SUV 03</option>
              <option value="Service Vehicle 04">Service Vehicle 04</option>
              <option value="Van 05">Van 05</option>
            </select>
          </div>

          <div class="form-group">
            <label for="maintenanceServiceType">Service Type *</label>
            <select id="maintenanceServiceType" required>
              <option value="">Select Service Type</option>
              <option value="Preventive Maintenance">Preventive Maintenance</option>
              <option value="Corrective Repair">Corrective Repair</option>
              <option value="Inspection">Inspection</option>
              <option value="Oil Change">Oil Change</option>
              <option value="Tire Service">Tire Service</option>
              <option value="Brake Service">Brake Service</option>
              <option value="Engine Service">Engine Service</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label for="maintenanceTechnician">Technician / Workshop *</label>
            <input
              type="text"
              id="maintenanceTechnician"
              placeholder="Enter technician or workshop"
              required
            />
          </div>

          <div class="form-group">
            <label for="maintenanceScheduledDate">Scheduled Date *</label>
            <input
              type="date"
              id="maintenanceScheduledDate"
              required
            />
          </div>

          <div class="form-group">
            <label for="maintenanceCompletionDate">Completion Date</label>
            <input
              type="date"
              id="maintenanceCompletionDate"
            />
          </div>

          <div class="form-group">
            <label for="maintenanceCost">Cost</label>
            <input
              type="number"
              id="maintenanceCost"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div class="form-group">
            <label for="maintenancePriority">Priority *</label>
            <select id="maintenancePriority" required>
              <option value="">Select Priority</option>
              <option value="Emergency">Emergency</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div class="form-group">
            <label for="maintenanceStatus">Status *</label>
            <select id="maintenanceStatus" required>
              <option value="">Select Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div class="form-group">
            <label for="maintenanceOdometer">Odometer Reading</label>
            <input
              type="number"
              id="maintenanceOdometer"
              min="0"
              placeholder="Enter kilometer reading"
            />
          </div>

          <div class="form-group full-width">
            <label for="maintenanceDescription">Description *</label>
            <textarea
              id="maintenanceDescription"
              rows="4"
              placeholder="Describe the required service or repair"
              required
            ></textarea>
          </div>

          <div class="form-group full-width">
            <label for="maintenancePartsUsed">Parts Used</label>
            <textarea
              id="maintenancePartsUsed"
              rows="3"
              placeholder="List parts used, if any"
            ></textarea>
          </div>

          <div class="form-group full-width">
            <label for="maintenanceNotes">Notes</label>
            <textarea
              id="maintenanceNotes"
              rows="3"
              placeholder="Add additional notes"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn-outline"
            id="cancelAddMaintenance"
          >
            Cancel
          </button>
          <button type="submit" class="btn-primary" id="saveMaintenanceBtn">
            Save Maintenance
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
