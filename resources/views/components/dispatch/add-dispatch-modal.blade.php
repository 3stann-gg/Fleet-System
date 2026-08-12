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
          <!-- Dispatch Number -->
          <div class="form-group">
            <label for="dispatchNumber">Dispatch Number</label>
            <input
              type="text"
              id="dispatchNumber"
              name="dispatchNumber"
              placeholder="DSP-2026-001"
              required
            />
          </div>

          <!-- Reservation -->
          <div class="form-group">
            <label for="dispatchReservation">Reservation</label>

            <select
              id="dispatchReservation"
              name="dispatchReservation"
              required
            >
              <option value="">Select reservation</option>
            </select>
          </div>

          <!-- Patient -->
          <div class="form-group">
            <label for="dispatchPatient">Patient Name</label>
            <input
              type="text"
              id="dispatchPatient"
              name="dispatchPatient"
              readonly
            />
          </div>

          <!-- Request Type -->
          <div class="form-group">
            <label for="dispatchRequestType">Request Type</label>
            <input
              type="text"
              id="dispatchRequestType"
              name="dispatchRequestType"
              readonly
            />
          </div>

          <!-- Vehicle -->
          <div class="form-group">
            <label for="dispatchVehicle">Vehicle</label>
            <input
              type="text"
              id="dispatchVehicle"
              name="dispatchVehicle"
              readonly
              placeholder="Automatically assigned from reservation"
            />
          </div>

          <!-- Driver -->
          <div class="form-group">
            <label for="dispatchDriver">Driver</label>
            <input
              type="text"
              id="dispatchDriver"
              name="dispatchDriver"
              readonly
              placeholder="Automatically assigned from reservation"
            />
          </div>

          <!-- Pickup -->
          <div class="form-group">
            <label for="dispatchPickup">Pickup Location</label>
            <input
              type="text"
              id="dispatchPickup"
              name="dispatchPickup"
              readonly
            />
          </div>

          <!-- Destination -->
          <div class="form-group">
            <label for="dispatchDestination">Destination</label>
            <input
              type="text"
              id="dispatchDestination"
              name="dispatchDestination"
              readonly
            />
          </div>

          <!-- Schedule Date -->
          <div class="form-group">
            <label for="dispatchDate">Schedule Date</label>
            <input
              type="date"
              id="dispatchDate"
              name="dispatchDate"
              readonly
            />
          </div>

          <!-- Schedule Time -->
          <div class="form-group">
            <label for="dispatchTime">Schedule Time</label>
            <input
              type="time"
              id="dispatchTime"
              name="dispatchTime"
              readonly
            />
          </div>

          <!-- Priority -->
          <div class="form-group">
            <label for="dispatchPriority">Priority</label>
            <input
              type="text"
              id="dispatchPriority"
              name="dispatchPriority"
              readonly
            />
          </div>

          <!-- Status -->
          <div class="form-group">
            <label for="dispatchStatus">Status</label>
            <select
              id="dispatchStatus"
              name="dispatchStatus"
              required
            >
              <option value="">Select status</option>
              <!--<option value="Pending">Pending</option>-->
              <option value="Assigned">Assigned</option>
              <option value="En Route">En Route</option>
            </select>
          </div>

          <!-- Contact -->
          <div class="form-group">
            <label for="dispatchContact">Contact Number</label>
            <input
              type="tel"
              id="dispatchContact"
              name="dispatchContact"
              readonly
            />
          </div>

          <!-- Notes -->
          <div class="form-group full-width">
            <label for="dispatchNotes">Notes</label>
            <textarea
              id="dispatchNotes"
              name="dispatchNotes"
              rows="3"
              readonly
            ></textarea>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button
            type="button"
            class="btn-outline"
            id="cancelAddDispatch"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="btn-primary"
            id="saveDispatch"
          >
            Save Dispatch
          </button>

        </div>
      </form>
    </div>
  </div>
</div>
