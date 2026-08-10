@extends('layouts.app')

@section('title', 'Dispatch Management | HIMS Fleet')

@section('content')

        <section class="page-wrapper">
          <div class="vehicle-page">
            <!-- Header -->
            <div class="page-header">
              <div>
                <h1>Dispatch Management</h1>

                <p>
                  Assign vehicles and drivers, monitor active trips, and manage
                  hospital transport operations.
                </p>
              </div>

              <button type="button" id="createDispatchBtn" class="btn-primary">
                <i class="ph ph-plus"></i>
                Create Dispatch
              </button>
            </div>

            <!-- Dispatch Statistics -->
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="ph-fill ph-stack"></i>
                </div>

                <div class="stat-content">
                  <h3 id="totalDispatches">89</h3>

                  <p>Total Dispatches</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon warning">
                  <i class="ph-fill ph-clock"></i>
                </div>

                <div class="stat-content">
                  <h3 id="pendingDispatches">12</h3>

                  <p>Pending Dispatch</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon success">
                  <i class="ph-fill ph-car"></i>
                </div>

                <div class="stat-content">
                  <h3 id="activeDispatches">18</h3>

                  <p>Active Trips</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <i class="ph-fill ph-check-square"></i>
                </div>

                <div class="stat-content">
                  <h3 id="completedDispatches">59</h3>

                  <p>Completed Trips</p>
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
                    id="dispatchSearch"
                    placeholder="Search by dispatch number, reservation, patient, vehicle, driver, pickup, or destination"
                    aria-label="Search dispatches"
                  />
                </div>

                <select
                  class="filter-select"
                  id="dispatchStatusFilter"
                  aria-label="Filter dispatches by status"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="En Route">En Route</option>
                  <option value="Arrived">Arrived</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <select
                  class="filter-select"
                  id="dispatchPriorityFilter"
                  aria-label="Filter dispatches by priority"
                >
                  <option value="all">All Priorities</option>
                  <option value="Emergency">Emergency</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>

                <input
                  type="date"
                  class="filter-select"
                  id="dispatchDateFilter"
                  aria-label="Filter dispatches by schedule date"
                />
              </div>

              <div class="toolbar-right">
                <button
                  type="button"
                  class="btn-outline"
                  id="refreshDispatches"
                >
                  <i class="ph ph-arrows-clockwise"></i>
                  Refresh
                </button>
              </div>
            </div>

            <!-- Bulk Toolbar -->
            <div class="bulk-toolbar" id="dispatchBulkToolbar">
              <span id="dispatchSelectedCount">0 dispatches selected</span>

              <div>
                <button
                  type="button"
                  class="btn-outline"
                  id="clearDispatchSelection"
                >
                  Clear
                </button>

                <button
                  type="button"
                  id="deleteSelectedDispatches"
                  class="btn-danger"
                >
                  <i class="ph ph-trash"></i>
                  Delete Selected
                </button>
              </div>
            </div>

            <!-- Dispatch Table -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h3>Dispatch List</h3>

                  <p class="card-subtitle">
                    View and manage all hospital transport dispatches.
                  </p>
                </div>

                <div class="card-actions">
                  <div class="export-dropdown">
                    <button
                      type="button"
                      class="btn-outline export-menu-toggle"
                      id="dispatchExportMenuToggle"
                      aria-haspopup="menu"
                      aria-expanded="false"
                      aria-controls="dispatchExportMenu"
                    >
                      <i class="ph ph-export" aria-hidden="true"></i>
                      Export
                      <i class="ph ph-caret-down export-menu-chevron" aria-hidden="true"></i>
                    </button>

                    <div
                      class="export-menu"
                      id="dispatchExportMenu"
                      role="menu"
                      hidden
                      aria-label="Export dispatch list"
                    >
                      <button
                        type="button"
                        class="export-menu-item"
                        role="menuitem"
                        id="printDispatches"
                      >
                        <i class="ph ph-printer" aria-hidden="true"></i>
                        Print
                      </button>

                      <button
                        type="button"
                        class="export-menu-item"
                        role="menuitem"
                        id="exportDispatchPDF"
                      >
                        <i class="ph ph-file-pdf" aria-hidden="true"></i>
                        Export PDF
                      </button>

                      <button
                        type="button"
                        class="export-menu-item"
                        role="menuitem"
                        id="exportDispatches"
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
                          id="selectAllDispatches"
                          aria-label="Select all visible dispatches"
                        />
                      </th>

                      <th class="sortable" data-column="1">
                        Dispatch No.
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="2">
                        Reservation No.
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="3">
                        Patient / Request
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="4">
                        Vehicle
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="5">
                        Driver
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th>Route</th>

                      <th class="sortable" data-column="6">
                        Schedule
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="7">
                        Priority
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="8">
                        Status
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody id="dispatchTableBody">
                    <tr
                      data-pickup="Emergency Room"
                      data-destination="Imaging Center"
                      data-schedule-date="2026-07-20"
                      data-schedule-time="9:00 AM"
                      data-priority="Emergency"
                      data-contact="+63 917 555 0101"
                      data-notes="Critical patient transfer"
                    >
                      <td>
                        <input
                          type="checkbox"
                          class="dispatch-checkbox"
                          aria-label="Select DSP-2026-001"
                        />
                      </td>

                      <td>
                        <span class="dispatch-number">DSP-2026-001</span>
                      </td>

                      <td>
                        <span class="dispatch-reservation-number"
                          >RES-2026-001</span
                        >
                      </td>

                      <td>
                        <div class="dispatch-patient-info">
                          <div class="dispatch-patient-name">
                            Juan Dela Cruz
                          </div>

                          <div class="dispatch-request-type">
                            Emergency Transfer
                          </div>
                        </div>
                      </td>

                      <td>
                        <span class="dispatch-vehicle">Ambulance 01</span>
                      </td>

                      <td>
                        <span class="dispatch-driver">Maria Santos</span>
                      </td>

                      <td>
                        <span class="dispatch-route"
                          >Emergency Room → Imaging Center</span
                        >
                      </td>

                      <td>
                        <span class="dispatch-schedule"
                          >Jul 20, 2026, 9:00 AM</span
                        >
                      </td>

                      <td>
                        <span class="dispatch-priority">Emergency</span>
                      </td>

                      <td>
                        <span class="status-badge trip">En Route</span>
                      </td>

                      <td>
                        <div class="action-buttons">
                          <button
                            type="button"
                            class="action-btn view-dispatch"
                            aria-label="View DSP-2026-001"
                          >
                            <i class="ph ph-eye"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn edit-dispatch"
                            aria-label="Edit DSP-2026-001"
                          >
                            <i class="ph ph-pencil-simple"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn delete-dispatch"
                            aria-label="Delete DSP-2026-001"
                          >
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      data-pickup="Room 412"
                      data-destination="Cardiology"
                      data-schedule-date="2026-07-20"
                      data-schedule-time="10:30 AM"
                      data-priority="High"
                      data-contact="+63 917 555 0144"
                      data-notes="Wheelchair assistance required"
                    >
                      <td>
                        <input
                          type="checkbox"
                          class="dispatch-checkbox"
                          aria-label="Select DSP-2026-002"
                        />
                      </td>

                      <td>
                        <span class="dispatch-number">DSP-2026-002</span>
                      </td>

                      <td>
                        <span class="dispatch-reservation-number"
                          >RES-2026-002</span
                        >
                      </td>

                      <td>
                        <div class="dispatch-patient-info">
                          <div class="dispatch-patient-name">
                            Maria Reyes
                          </div>

                          <div class="dispatch-request-type">
                            Patient Transport
                          </div>
                        </div>
                      </td>

                      <td>
                        <span class="dispatch-vehicle">Patient Van-02</span>
                      </td>

                      <td>
                        <span class="dispatch-driver">Juan Dela Cruz</span>
                      </td>

                      <td>
                        <span class="dispatch-route"
                          >Room 412 → Cardiology</span
                        >
                      </td>

                      <td>
                        <span class="dispatch-schedule"
                          >Jul 20, 2026, 10:30 AM</span
                        >
                      </td>

                      <td>
                        <span class="dispatch-priority">High</span>
                      </td>

                      <td>
                        <span class="status-badge scheduled"
                          >Assigned</span
                        >
                      </td>

                      <td>
                        <div class="action-buttons">
                          <button
                            type="button"
                            class="action-btn view-dispatch"
                            aria-label="View DSP-2026-002"
                          >
                            <i class="ph ph-eye"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn edit-dispatch"
                            aria-label="Edit DSP-2026-002"
                          >
                            <i class="ph ph-pencil-simple"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn delete-dispatch"
                            aria-label="Delete DSP-2026-002"
                          >
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      data-pickup="Main Lobby"
                      data-destination="Rehabilitation Center"
                      data-schedule-date="2026-07-21"
                      data-schedule-time="08:15 AM"
                      data-priority="Normal"
                      data-contact="+63 917 555 0218"
                      data-notes="Regular appointment transport"
                    >
                      <td>
                        <input
                          type="checkbox"
                          class="dispatch-checkbox"
                          aria-label="Select DSP-2026-003"
                        />
                      </td>

                      <td>
                        <span class="dispatch-number">DSP-2026-003</span>
                      </td>

                      <td>
                        <span class="dispatch-reservation-number"
                          >RES-2026-003</span
                        >
                      </td>

                      <td>
                        <div class="dispatch-patient-info">
                          <div class="dispatch-patient-name">
                            Carlo Mendoza
                          </div>

                          <div class="dispatch-request-type">
                            Medical Appointment
                          </div>
                        </div>
                      </td>

                      <td>
                        <span class="dispatch-vehicle">SUV-03</span>
                      </td>

                      <td>
                        <span class="dispatch-driver">Ana Gonzales</span>
                      </td>

                      <td>
                        <span class="dispatch-route"
                          >Main Lobby → Rehabilitation Center</span
                        >
                      </td>

                      <td>
                        <span class="dispatch-schedule"
                          >Jul 21, 2026, 08:15 AM</span
                        >
                      </td>

                      <td>
                        <span class="dispatch-priority">Normal</span>
                      </td>

                      <td>
                        <span class="status-badge pending">Pending</span>
                      </td>

                      <td>
                        <div class="action-buttons">
                          <button
                            type="button"
                            class="action-btn view-dispatch"
                            aria-label="View DSP-2026-003"
                          >
                            <i class="ph ph-eye"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn edit-dispatch"
                            aria-label="Edit DSP-2026-003"
                          >
                            <i class="ph ph-pencil-simple"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn delete-dispatch"
                            aria-label="Delete DSP-2026-003"
                          >
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      data-pickup="Ward 5B"
                      data-destination="Home - Brgy. San Jose"
                      data-schedule-date="2026-07-19"
                      data-schedule-time="02:45 PM"
                      data-priority="Low"
                      data-contact="+63 917 555 0312"
                      data-notes="Discharge follow-up"
                    >
                      <td>
                        <input
                          type="checkbox"
                          class="dispatch-checkbox"
                          aria-label="Select DSP-2026-004"
                        />
                      </td>

                      <td>
                        <span class="dispatch-number">DSP-2026-004</span>
                      </td>

                      <td>
                        <span class="dispatch-reservation-number"
                          >RES-2026-004</span
                        >
                      </td>

                      <td>
                        <div class="dispatch-patient-info">
                          <div class="dispatch-patient-name">
                            Liza Pascual
                          </div>

                          <div class="dispatch-request-type">
                            Discharge Follow-up
                          </div>
                        </div>
                      </td>

                      <td>
                        <span class="dispatch-vehicle">Car-04</span>
                      </td>

                      <td>
                        <span class="dispatch-driver">Roberto Banaag</span>
                      </td>

                      <td>
                        <span class="dispatch-route"
                          >Ward 5B → Home - Brgy. San Jose</span
                        >
                      </td>

                      <td>
                        <span class="dispatch-schedule"
                          >Jul 19, 2026, 02:45 PM</span
                        >
                      </td>

                      <td>
                        <span class="dispatch-priority">Low</span>
                      </td>

                      <td>
                        <span class="status-badge completed"
                          >Completed</span
                        >
                      </td>

                      <td>
                        <div class="action-buttons">
                          <button
                            type="button"
                            class="action-btn view-dispatch"
                            aria-label="View DSP-2026-004"
                          >
                            <i class="ph ph-eye"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn edit-dispatch"
                            aria-label="Edit DSP-2026-004"
                          >
                            <i class="ph ph-pencil-simple"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn delete-dispatch"
                            aria-label="Delete DSP-2026-004"
                          >
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      data-pickup="ER - Gate 2"
                      data-destination="Pathology Lab"
                      data-schedule-date="2026-07-20"
                      data-schedule-time="04:00 PM"
                      data-priority="Normal"
                      data-contact=""
                      data-notes=""
                    >
                      <td>
                        <input
                          type="checkbox"
                          class="dispatch-checkbox"
                          aria-label="Select DSP-2026-005"
                        />
                      </td>

                      <td>
                        <span class="dispatch-number">DSP-2026-005</span>
                      </td>

                      <td>
                        <span class="dispatch-reservation-number"
                          >RES-2026-005</span
                        >
                      </td>

                      <td>
                        <div class="dispatch-patient-info">
                          <div class="dispatch-patient-name">
                            Elena Torres
                          </div>

                          <div class="dispatch-request-type">
                            Supply Delivery
                          </div>
                        </div>
                      </td>

                      <td>
                        <span class="dispatch-vehicle">Van-05</span>
                      </td>

                      <td>
                        <span class="dispatch-driver">Unassigned</span>
                      </td>

                      <td>
                        <span class="dispatch-route"
                          >ER - Gate 2 → Pathology Lab</span
                        >
                      </td>

                      <td>
                        <span class="dispatch-schedule"
                          >Jul 20, 2026, 04:00 PM</span
                        >
                      </td>

                      <td>
                        <span class="dispatch-priority">Normal</span>
                      </td>

                      <td>
                        <span class="status-badge approved">Arrived</span>
                      </td>

                      <td>
                        <div class="action-buttons">
                          <button
                            type="button"
                            class="action-btn view-dispatch"
                            aria-label="View DSP-2026-005"
                          >
                            <i class="ph ph-eye"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn edit-dispatch"
                            aria-label="Edit DSP-2026-005"
                          >
                            <i class="ph ph-pencil-simple"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn delete-dispatch"
                            aria-label="Delete DSP-2026-005"
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
              <div id="dispatchPaginationInfo">
                Showing <strong>1–5</strong> of <strong>89</strong> dispatches
              </div>

              <div class="pagination" id="dispatchPagination">
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
      
    @include('components.dispatch.add-dispatch-modal')
    @include('components.dispatch.view-dispatch-modal')
    @include('components.dispatch.edit-dispatch-modal')
    @include('components.dispatch.delete-dispatch-modal')

    <!-- Export dependencies -->
    <script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js"></script>

    <!-- Main JS -->
    @push('scripts')

    <script src="{{ asset('assets/js/components/dropdown.js') }}"></script>
    <script src="{{ asset('assets/js/dispatch/dispatch-modal.js') }}"></script>
    <script src="{{ asset('assets/js/dispatch/dispatch-add.js') }}"></script>
    <script src="{{ asset('assets/js/dispatch/dispatch-view.js') }}"></script>
    <script src="{{ asset('assets/js/dispatch/dispatch-edit.js') }}"></script>
    <script src="{{ asset('assets/js/dispatch/dispatch-delete.js') }}"></script>
    <script src="{{ asset('assets/js/dispatch/dispatch-filter.js') }}"></script>
    <script src="{{ asset('assets/js/dispatch/dispatch-table.js') }}"></script>
    <script src="{{ asset('assets/js/dispatch/dispatch-stats.js') }}"></script>
    <script src="{{ asset('assets/js/dispatch/dispatch-sort.js') }}"></script>
    <script src="{{ asset('assets/js/dispatch/dispatch-pagination.js') }}"></script>
    <script src="{{ asset('assets/js/dispatch/dispatch-export.js') }}"></script>
    <script src="{{ asset('assets/js/dispatch/dispatch-print.js') }}"></script>
    <script src="{{ asset('assets/js/dispatch/dispatch-bulk.js') }}"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>

    @endpush

@endsection
