<div
  class="modal-overlay"
  id="addReservationModal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="addReservationModalTitle"
>
  <div class="custom-modal">
    <!-- Header -->
    <div class="modal-header">
      <div>
        <h2 id="addReservationModalTitle">Add New Reservation</h2>
        <p>Create a hospital transport reservation request.</p>
      </div>

      <button
        type="button"
        class="modal-close"
        id="closeAddReservationModal"
        aria-label="Close add reservation modal"
      >
        <i class="ph ph-x"></i>
      </button>
    </div>

    <!-- Body -->
    <div class="modal-body">
      <form id="reservationForm" class="reservation-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="reservationNumber">Reservation Number *</label>
            <input
              type="text"
              id="reservationNumber"
              placeholder="RES-2026-001"
              required
            />
          </div>

          <div class="form-group">
            <label for="reservationPatient">Patient Name *</label>
            <input
              type="text"
              id="reservationPatient"
              required
            />
          </div>

          <div class="form-group">
            <label for="reservationType">Request Type *</label>
            <select id="reservationType" required>
              <option value="">Select Request Type</option>
              <option value="Patient Transport">Patient Transport</option>
              <option value="Emergency Transfer">Emergency Transfer</option>
              <option value="Medical Appointment">Medical Appointment</option>
              <option value="Laboratory Transport">Laboratory Transport</option>
              <option value="Staff Transport">Staff Transport</option>
              <option value="Supply Delivery">Supply Delivery</option>
            </select>
          </div>

          <div class="form-group">
            <label for="reservationVehicle">Vehicle *</label>
            <select id="reservationVehicle" required>
              <option value="">Select Vehicle</option>
              <option value="Ambulance 01">Ambulance 01</option>
              <option value="Patient Van 02">Patient Van 02</option>
              <option value="Service Vehicle 01">Service Vehicle 01</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>

          <div class="form-group">
            <label for="reservationDriver">Driver *</label>
            <select id="reservationDriver" required>
              <option value="">Select Driver</option>
              <option value="Juan Dela Cruz">Juan Dela Cruz</option>
              <option value="Maria Reyes">Maria Reyes</option>
              <option value="Carlos Mendoza">Carlos Mendoza</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>

          <div class="form-group">
            <label for="reservationPickup">Pickup Location *</label>
            <input
              type="text"
              id="reservationPickup"
              required
            />
          </div>

          <div class="form-group">
            <label for="reservationDestination">Destination *</label>
            <input
              type="text"
              id="reservationDestination"
              required
            />
          </div>

          <div class="form-group">
            <label for="reservationDate">Schedule Date *</label>
            <input
              type="date"
              id="reservationDate"
              required
            />
          </div>

          <div class="form-group">
            <label for="reservationTime">Schedule Time *</label>
            <input
              type="time"
              id="reservationTime"
              required
            />
          </div>

          <div class="form-group">
            <label for="reservationPriority">Priority *</label>
            <select id="reservationPriority" required>
              <option value="">Select Priority</option>
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          <div class="form-group">
            <label for="reservationStatus">Status *</label>
            <select id="reservationStatus" required>
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div class="form-group">
            <label for="reservationContact">Contact Number</label>
            <input
              type="tel"
              id="reservationContact"
            />
          </div>

          <div class="form-group full-width">
            <label for="reservationNotes">Notes</label>
            <textarea
              id="reservationNotes"
              rows="4"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-outline" id="cancelAddReservation">
            Cancel
          </button>

          <button type="submit" class="btn-primary" id="saveReservationBtn">
            Save Reservation
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
