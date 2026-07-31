<div
  id="addDispatchModal"
  class="modal-overlay"
  role="dialog"
  aria-modal="true"
  aria-labelledby="addDispatchModalTitle"
>
  <div class="custom-modal">
    <div class="modal-header">
      <div>
        <h2 id="addDispatchModalTitle">Create Dispatch</h2>
        <p>Create a hospital transport dispatch request.</p>
      </div>

      <button
        type="button"
        class="modal-close"
        id="closeAddDispatchModal"
        aria-label="Close modal"
      >
        <i class="ph ph-x"></i>
      </button>
    </div>

    <div class="modal-body">
      <form id="dispatchForm">
        <div class="form-grid">
          <div class="form-group">
            <label for="dispatchNumber">Dispatch Number</label>
            <input
              type="text"
              id="dispatchNumber"
              name="dispatchNumber"
              required
            />
          </div>

          <div class="form-group">
            <label for="dispatchReservation">Reservation</label>
            <select id="dispatchReservation" name="dispatchReservation" required>
              <option value="">Select reservation</option>
              <option value="RES-2026-001">RES-2026-001</option>
              <option value="RES-2026-002">RES-2026-002</option>
              <option value="RES-2026-003">RES-2026-003</option>
              <option value="RES-2026-004">RES-2026-004</option>
              <option value="RES-2026-005">RES-2026-005</option>
            </select>
          </div>

          <div class="form-group">
            <label for="dispatchPatient">Patient Name</label>
            <input
              type="text"
              id="dispatchPatient"
              name="dispatchPatient"
              required
            />
          </div>

          <div class="form-group">
            <label for="dispatchRequestType">Request Type</label>
            <select
              id="dispatchRequestType"
              name="dispatchRequestType"
              required
            >
              <option value="">Select request type</option>
              <option value="Emergency Transfer">Emergency Transfer</option>
              <option value="Patient Transport">Patient Transport</option>
              <option value="Medical Appointment">Medical Appointment</option>
              <option value="Staff Transport">Staff Transport</option>
              <option value="Supply Delivery">Supply Delivery</option>
            </select>
          </div>

          <div class="form-group">
            <label for="dispatchVehicle">Vehicle</label>
            <select id="dispatchVehicle" name="dispatchVehicle" required>
              <option value="">Select vehicle</option>
              <option value="Ambulance 01">Ambulance 01</option>
              <option value="Patient Van-02">Patient Van-02</option>
              <option value="SUV-03">SUV-03</option>
              <option value="Car-04">Car-04</option>
              <option value="Van-05">Van-05</option>
            </select>
          </div>

          <div class="form-group">
            <label for="dispatchDriver">Driver</label>
            <select id="dispatchDriver" name="dispatchDriver" required>
              <option value="">Select driver</option>
              <option value="Maria Santos">Maria Santos</option>
              <option value="Juan Dela Cruz">Juan Dela Cruz</option>
              <option value="Ana Gonzales">Ana Gonzales</option>
              <option value="Roberto Banaag">Roberto Banaag</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>

          <div class="form-group">
            <label for="dispatchPickup">Pickup Location</label>
            <input
              type="text"
              id="dispatchPickup"
              name="dispatchPickup"
              required
            />
          </div>

          <div class="form-group">
            <label for="dispatchDestination">Destination</label>
            <input
              type="text"
              id="dispatchDestination"
              name="dispatchDestination"
              required
            />
          </div>

          <div class="form-group">
            <label for="dispatchDate">Schedule Date</label>
            <input
              type="date"
              id="dispatchDate"
              name="dispatchDate"
              required
            />
          </div>

          <div class="form-group">
            <label for="dispatchTime">Schedule Time</label>
            <input
              type="time"
              id="dispatchTime"
              name="dispatchTime"
              required
            />
          </div>

          <div class="form-group">
            <label for="dispatchPriority">Priority</label>
            <select id="dispatchPriority" name="dispatchPriority" required>
              <option value="">Select priority</option>
              <option value="Emergency">Emergency</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div class="form-group">
            <label for="dispatchStatus">Status</label>
            <select id="dispatchStatus" name="dispatchStatus" required>
              <option value="">Select status</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="En Route">En Route</option>
            </select>
          </div>

          <div class="form-group">
            <label for="dispatchContact">Contact Number</label>
            <input
              type="tel"
              id="dispatchContact"
              name="dispatchContact"
            />
          </div>

          <div class="form-group full-width">
            <label for="dispatchNotes">Notes</label>
            <textarea
              id="dispatchNotes"
              name="dispatchNotes"
              rows="3"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn-outline"
            id="cancelAddDispatch"
          >
            Cancel
          </button>
          <button type="submit" class="btn-primary" id="saveDispatch">
            Save Dispatch
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
