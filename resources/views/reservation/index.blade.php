@extends('layouts.app')

@section('title', 'Reservation Management | HIMS Fleet')

@section('content')

        <section class="page-wrapper">
          <div class="vehicle-page">
            <!-- Header -->
            <div class="page-header">
              <div>
                <h1>Reservation Management</h1>

                <p>
                  Manage hospital transport reservations, schedules, approvals,
                  and assignments.
                </p>
              </div>

              <button type="button" id="addReservationBtn" class="btn-primary">
                <i class="ph ph-plus"></i>
                Add Reservation
              </button>
            </div>

            <!-- Reservation Statistics -->
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="ph-fill ph-calendar-check"></i>
                </div>

                <div class="stat-content">
                  <h3 id="totalReservations">128</h3>

                  <p>Total Reservations</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon warning">
                  <i class="ph-fill ph-clock"></i>
                </div>

                <div class="stat-content">
                  <h3 id="pendingReservations">23</h3>

                  <p>Pending</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon success">
                  <i class="ph-fill ph-check-circle"></i>
                </div>

                <div class="stat-content">
                  <h3 id="approvedReservations">45</h3>

                  <p>Approved</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <i class="ph-fill ph-check-square"></i>
                </div>

                <div class="stat-content">
                  <h3 id="completedReservations">60</h3>

                  <p>Completed</p>
                </div>
              </div>
            </div>

            <!-- Toolbar -->
            <div class="toolbar">
              <div class="toolbar-left">
                <div class="search-box">
                  <i class="ph ph-magnifying-glass"></i>

                  <input
                    type="text"
                    id="reservationSearch"
                    placeholder="Search by reservation number, patient, vehicle, driver, pickup, or destination"
                    aria-label="Search reservations"
                  />
                </div>

                <select
                  class="filter-select"
                  id="reservationStatusFilter"
                  aria-label="Filter reservations by status"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <input
                  type="date"
                  class="filter-select"
                  id="reservationDateFilter"
                  aria-label="Filter reservations by date"
                />
              </div>

              <div class="toolbar-right">
                <button
                  type="button"
                  class="btn-outline"
                  id="refreshReservations"
                >
                  <i class="ph ph-arrows-clockwise"></i>
                  Refresh
                </button>
              </div>
            </div>

            <!-- Bulk Toolbar -->
            <div class="bulk-toolbar" id="reservationBulkToolbar">
              <span id="reservationSelectedCount">0 reservations selected</span>

              <div>
                <button
                  type="button"
                  class="btn-outline"
                  id="clearReservationSelection"
                >
                  Clear
                </button>

                <button
                  type="button"
                  id="deleteSelectedReservations"
                  class="btn-danger"
                >
                  <i class="ph ph-trash"></i>
                  Delete Selected
                </button>
              </div>
            </div>

            <!-- Reservation Table -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h3>Reservation List</h3>

                  <p class="card-subtitle">
                    View and manage all hospital transport reservations.
                  </p>
                </div>

                <div class="card-actions">
                  <div class="export-dropdown">
                    <button
                      type="button"
                      class="btn-outline export-menu-toggle"
                      id="reservationExportMenuToggle"
                      aria-haspopup="menu"
                      aria-expanded="false"
                      aria-controls="reservationExportMenu"
                    >
                      <i class="ph ph-export" aria-hidden="true"></i>
                      Export
                      <i class="ph ph-caret-down export-menu-chevron" aria-hidden="true"></i>
                    </button>

                    <div
                      class="export-menu"
                      id="reservationExportMenu"
                      role="menu"
                      hidden
                      aria-label="Export reservation list"
                    >
                      <button
                        type="button"
                        class="export-menu-item"
                        role="menuitem"
                        id="printReservations"
                      >
                        <i class="ph ph-printer" aria-hidden="true"></i>
                        Print
                      </button>

                      <button
                        type="button"
                        class="export-menu-item"
                        role="menuitem"
                        id="exportReservationPDF"
                      >
                        <i class="ph ph-file-pdf" aria-hidden="true"></i>
                        Export PDF
                      </button>

                      <button
                        type="button"
                        class="export-menu-item"
                        role="menuitem"
                        id="exportReservations"
                      >
                        <i class="ph ph-file-xls" aria-hidden="true"></i>
                        Export Excel
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="table-responsive">
                <table class="fleet-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          id="selectAllReservations"
                          aria-label="Select all visible reservations"
                        />
                      </th>

                      <th class="sortable" data-column="1">
                        Reservation No.
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="2">
                        Patient
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="3">
                        Vehicle
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="4">
                        Driver
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="5">
                        Pickup
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="6">
                        Destination
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="7">
                        Schedule
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="8">
                        Status
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody id="reservationTableBody">
                    <tr data-schedule-date="2026-07-15">
                      <td>
                        <input
                          type="checkbox"
                          class="reservation-checkbox"
                          aria-label="Select RES-2026-001"
                        />
                      </td>

                      <td>
                        <span class="reservation-number">RES-2026-001</span>
                      </td>

                      <td>
                        <div class="patient-info">
                          <div class="patient-avatar">JD</div>

                          <div>
                            <div class="patient-name">Juan Dela Cruz</div>

                            <small>Emergency Transport</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span class="reservation-vehicle">Ambulance-01</span>
                      </td>

                      <td>
                        <span class="reservation-driver">Maria Santos</span>
                      </td>

                      <td>
                        <span class="reservation-pickup">ER - Ward 3A</span>
                      </td>

                      <td>
                        <span class="reservation-destination">Imaging Center</span>
                      </td>

                      <td>
                        <span class="reservation-schedule">Jul 15, 2026 09:30</span>
                      </td>

                      <td>
                        <span class="status-badge trip">Approved</span>
                      </td>

                      <td>
                        <div class="action-buttons">
                          <button
                            type="button"
                            class="action-btn view-reservation"
                            aria-label="View RES-2026-001"
                          >
                            <i class="ph ph-eye"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn edit-reservation"
                            aria-label="Edit RES-2026-001"
                          >
                            <i class="ph ph-pencil-simple"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn delete-reservation"
                            aria-label="Delete RES-2026-001"
                          >
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr data-schedule-date="2026-07-15">
                      <td>
                        <input
                          type="checkbox"
                          class="reservation-checkbox"
                          aria-label="Select RES-2026-002"
                        />
                      </td>

                      <td>
                        <span class="reservation-number">RES-2026-002</span>
                      </td>

                      <td>
                        <div class="patient-info">
                          <div class="patient-avatar">MR</div>

                          <div>
                            <div class="patient-name">Maria Reyes</div>

                            <small>Patient Transfer</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span class="reservation-vehicle">Patient Van-02</span>
                      </td>

                      <td>
                        <span class="reservation-driver">Juan Dela Cruz</span>
                      </td>

                      <td>
                        <span class="reservation-pickup">Room 412</span>
                      </td>

                      <td>
                        <span class="reservation-destination">Cardiology</span>
                      </td>

                      <td>
                        <span class="reservation-schedule">Jul 15, 2026 11:00</span>
                      </td>

                      <td>
                        <span class="status-badge pending">Pending</span>
                      </td>

                      <td>
                        <div class="action-buttons">
                          <button
                            type="button"
                            class="action-btn view-reservation"
                            aria-label="View RES-2026-002"
                          >
                            <i class="ph ph-eye"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn edit-reservation"
                            aria-label="Edit RES-2026-002"
                          >
                            <i class="ph ph-pencil-simple"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn delete-reservation"
                            aria-label="Delete RES-2026-002"
                          >
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr data-schedule-date="2026-07-16">
                      <td>
                        <input
                          type="checkbox"
                          class="reservation-checkbox"
                          aria-label="Select RES-2026-003"
                        />
                      </td>

                      <td>
                        <span class="reservation-number">RES-2026-003</span>
                      </td>

                      <td>
                        <div class="patient-info">
                          <div class="patient-avatar">CM</div>

                          <div>
                            <div class="patient-name">Carlo Mendoza</div>

                            <small>Scheduled Appointment</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span class="reservation-vehicle">SUV-03</span>
                      </td>

                      <td>
                        <span class="reservation-driver">Ana Gonzales</span>
                      </td>

                      <td>
                        <span class="reservation-pickup">Main Lobby</span>
                      </td>

                      <td>
                        <span class="reservation-destination">Rehabilitation Center</span>
                      </td>

                      <td>
                        <span class="reservation-schedule">Jul 16, 2026 08:15</span>
                      </td>

                      <td>
                        <span class="status-badge scheduled">Scheduled</span>
                      </td>

                      <td>
                        <div class="action-buttons">
                          <button
                            type="button"
                            class="action-btn view-reservation"
                            aria-label="View RES-2026-003"
                          >
                            <i class="ph ph-eye"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn edit-reservation"
                            aria-label="Edit RES-2026-003"
                          >
                            <i class="ph ph-pencil-simple"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn delete-reservation"
                            aria-label="Delete RES-2026-003"
                          >
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr data-schedule-date="2026-07-14">
                      <td>
                        <input
                          type="checkbox"
                          class="reservation-checkbox"
                          aria-label="Select RES-2026-004"
                        />
                      </td>

                      <td>
                        <span class="reservation-number">RES-2026-004</span>
                      </td>

                      <td>
                        <div class="patient-info">
                          <div class="patient-avatar">LP</div>

                          <div>
                            <div class="patient-name">Liza Pascual</div>

                            <small>Discharge Follow-up</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span class="reservation-vehicle">Car-04</span>
                      </td>

                      <td>
                        <span class="reservation-driver">Roberto Banaag</span>
                      </td>

                      <td>
                        <span class="reservation-pickup">Ward 5B</span>
                      </td>

                      <td>
                        <span class="reservation-destination">Home - Brgy. San Jose</span>
                      </td>

                      <td>
                        <span class="reservation-schedule">Jul 14, 2026 14:45</span>
                      </td>

                      <td>
                        <span class="status-badge completed">Completed</span>
                      </td>

                      <td>
                        <div class="action-buttons">
                          <button
                            type="button"
                            class="action-btn view-reservation"
                            aria-label="View RES-2026-004"
                          >
                            <i class="ph ph-eye"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn edit-reservation"
                            aria-label="Edit RES-2026-004"
                          >
                            <i class="ph ph-pencil-simple"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn delete-reservation"
                            aria-label="Delete RES-2026-004"
                          >
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr data-schedule-date="2026-07-15">
                      <td>
                        <input
                          type="checkbox"
                          class="reservation-checkbox"
                          aria-label="Select RES-2026-005"
                        />
                      </td>

                      <td>
                        <span class="reservation-number">RES-2026-005</span>
                      </td>

                      <td>
                        <div class="patient-info">
                          <div class="patient-avatar">ET</div>

                          <div>
                            <div class="patient-name">Elena Torres</div>

                            <small>Laboratory Pickup</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span class="reservation-vehicle">Van-05</span>
                      </td>

                      <td>
                        <span class="reservation-driver">Unassigned</span>
                      </td>

                      <td>
                        <span class="reservation-pickup">ER - Gate 2</span>
                      </td>

                      <td>
                        <span class="reservation-destination">Pathology Lab</span>
                      </td>

                      <td>
                        <span class="reservation-schedule">Jul 15, 2026 16:00</span>
                      </td>

                      <td>
                        <span class="status-badge cancelled">Cancelled</span>
                      </td>

                      <td>
                        <div class="action-buttons">
                          <button
                            type="button"
                            class="action-btn view-reservation"
                            aria-label="View RES-2026-005"
                          >
                            <i class="ph ph-eye"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn edit-reservation"
                            aria-label="Edit RES-2026-005"
                          >
                            <i class="ph ph-pencil-simple"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn delete-reservation"
                            aria-label="Delete RES-2026-005"
                          >
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Pagination -->
            <div class="table-footer">
              <div id="reservationPaginationInfo">
                Showing <strong>1–5</strong> of <strong>128</strong> reservations
              </div>

              <div class="pagination" id="reservationPagination">
                <button type="button" aria-label="Previous page">
                  <i class="ph ph-caret-left"></i>
                </button>

                <button type="button" class="active" aria-label="Page 1">
                  1
                </button>

                <button type="button" aria-label="Page 2">2</button>

                <button type="button" aria-label="Page 3">3</button>

                <button type="button" aria-label="Next page">
                  <i class="ph ph-caret-right"></i>
                </button>
              </div>
            </div>
          </div>
        </section>

    <div id="add-reservation-modal"></div>
    <div id="view-reservation-modal"></div>
    <div id="edit-reservation-modal"></div>
    <div id="delete-reservation-modal"></div>

    <!-- Export dependencies -->
    <script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js"></script>

    <!-- Main JS -->
    @push('scripts')
  
    <script src="{{ asset('assets/js/components/dropdown.js') }}"></script>
    <script src="{{ asset('assets/js/reservation/reservation-modal.js') }}"></script>
    <script src="{{ asset('assets/js/reservation/reservation-add.js') }}"></script>
    <script src="{{ asset('assets/js/reservation/reservation-view.js') }}"></script>
    <script src="{{ asset('assets/js/reservation/reservation-edit.js') }}"></script>
    <script src="{{ asset('assets/js/reservation/reservation-delete.js') }}"></script>
    <script src="{{ asset('assets/js/reservation/reservation-filter.js') }}"></script>
    <script src="{{ asset('assets/js/reservation/reservation-stats.js') }}"></script>
    <script src="{{ asset('assets/js/reservation/reservation-pagination.js') }}"></script>
    <script src="{{ asset('assets/js/reservation/reservation-sort.js') }}"></script>
    <script src="{{ asset('assets/js/reservation/reservation-bulk.js') }}"></script>
    <script src="{{ asset('assets/js/reservation/reservation-export.js') }}"></script>
    <script src="{{ asset('assets/js/reservation/reservation-print.js') }}"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>

    @endpush

@endsection
