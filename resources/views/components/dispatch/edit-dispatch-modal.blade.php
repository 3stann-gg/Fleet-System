<div
  id="editDispatchModal"
  class="modal-overlay"
  role="dialog"
  aria-modal="true"
  aria-labelledby="editDispatchModalTitle"
  aria-describedby="editDispatchModalDescription"
>
  <div class="custom-modal">
    <div class="modal-header">
      <div>
        <h2 id="editDispatchModalTitle">Edit Dispatch</h2>

        <p id="editDispatchModalDescription">
          Update hospital transport dispatch information.
        </p>
      </div>

      <button
        type="button"
        class="modal-close"
        id="closeEditDispatchModal"
        aria-label="Close edit dispatch modal"
      >
        <i class="ph ph-x"></i>
      </button>
    </div>

    <div class="modal-body">
      <form id="editDispatchForm">
        <div class="form-grid">
          <div class="form-group">
            <label for="editDispatchNumber">Dispatch Number *</label>
            <input
              type="text"
              id="editDispatchNumber"
              name="editDispatchNumber"
              required
            />
          </div>

          <div class="form-group">
            <label for="editDispatchReservation">Reservation *</label>
            <input
              type="text"
              id="editDispatchReservation"
              name="editDispatchReservation"
              required
            />
          </div>

          <div class="form-group">
            <label for="editDispatchPatient">Patient Name *</label>
            <input
              type="text"
              id="editDispatchPatient"
              name="editDispatchPatient"
              required
            />
          </div>

          <div class="form-group">
            <label for="editDispatchRequestType">Request Type *</label>
            <select
              id="editDispatchRequestType"
              name="editDispatchRequestType"
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
            <label for="editDispatchVehicle">Vehicle *</label>
            <select
              id="editDispatchVehicle"
              name="editDispatchVehicle"
              required
            >
              <option value="">Select vehicle</option>
              <option value="Ambulance 01">Ambulance 01</option>
              <option value="Patient Van-02">Patient Van-02</option>
              <option value="SUV-03">SUV-03</option>
              <option value="Car-04">Car-04</option>
              <option value="Van-05">Van-05</option>
            </select>
          </div>

          <div class="form-group">
            <label for="editDispatchDriver">Driver *</label>
            <select
              id="editDispatchDriver"
              name="editDispatchDriver"
              required
            >
              <option value="">Select driver</option>
              <option value="Maria Santos">Maria Santos</option>
              <option value="Juan Dela Cruz">Juan Dela Cruz</option>
              <option value="Ana Gonzales">Ana Gonzales</option>
              <option value="Roberto Banaag">Roberto Banaag</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>

          <div class="form-group">
            <label for="editDispatchPickup">Pickup Location *</label>
            <input
              type="text"
              id="editDispatchPickup"
              name="editDispatchPickup"
              required
            />
          </div>

          <div class="form-group">
            <label for="editDispatchDestination">Destination *</label>
            <input
              type="text"
              id="editDispatchDestination"
              name="editDispatchDestination"
              required
            />
          </div>

          <div class="form-group">
            <label for="editDispatchDate">Schedule Date *</label>
            <input
              type="date"
              id="editDispatchDate"
              name="editDispatchDate"
              required
            />
          </div>

          <div class="form-group">
            <label for="editDispatchTime">Schedule Time *</label>
            <input
              type="time"
              id="editDispatchTime"
              name="editDispatchTime"
              required
            />
          </div>

          <div class="form-group">
            <label for="editDispatchPriority">Priority *</label>
            <select
              id="editDispatchPriority"
              name="editDispatchPriority"
              required
            >
              <option value="">Select priority</option>
              <option value="Emergency">Emergency</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div class="form-group">
            <label for="editDispatchStatus">Status *</label>
            <select
              id="editDispatchStatus"
              name="editDispatchStatus"
              required
            >
              <option value="">Select status</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="En Route">En Route</option>
              <option value="Arrived">Arrived</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div class="form-group">
            <label for="editDispatchContact">Contact Number</label>
            <input
              type="tel"
              id="editDispatchContact"
              name="editDispatchContact"
            />
          </div>

          <div class="form-group full-width">
            <label for="editDispatchNotes">Notes</label>
            <textarea
              id="editDispatchNotes"
              name="editDispatchNotes"
              rows="4"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn-outline"
            id="cancelEditDispatch"
          >
            Cancel
          </button>

          <button type="submit" class="btn-primary" id="updateDispatchBtn">
            Update Dispatch
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
