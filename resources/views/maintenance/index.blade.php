@extends('layouts.app')

@section('title', 'Maintenance Management | HIMS Fleet')

@section('content')

        <section class="page-wrapper">
          <div class="vehicle-page">
            <!-- Header -->
            <div class="page-header">
              <div>
                <h1>Maintenance Management</h1>

                <p>
                  Schedule, monitor, and manage preventive and corrective
                  maintenance for hospital fleet vehicles.
                </p>
              </div>

              <button type="button" id="addMaintenanceBtn" class="btn-primary">
                <i class="ph ph-plus"></i>
                Add Maintenance
              </button>
            </div>

            <!-- Maintenance Statistics -->
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="ph-fill ph-wrench"></i>
                </div>

                <div class="stat-content">
                  <h3 id="totalMaintenance">0</h3>

                  <p>Total Maintenance</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon warning">
                  <i class="ph-fill ph-clock"></i>
                </div>

                <div class="stat-content">
                  <h3 id="scheduledMaintenance">0</h3>

                  <p>Scheduled</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon success">
                  <i class="ph-fill ph-spinner"></i>
                </div>

                <div class="stat-content">
                  <h3 id="inProgressMaintenance">0</h3>

                  <p>In Progress</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <i class="ph-fill ph-check-square"></i>
                </div>

                <div class="stat-content">
                  <h3 id="completedMaintenance">0</h3>

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
                    id="maintenanceSearch"
                    placeholder="Search by maintenance number, vehicle, service type, technician, or workshop"
                    aria-label="Search maintenance records"
                  />
                </div>

                <select
                  class="filter-select"
                  id="maintenanceStatusFilter"
                  aria-label="Filter maintenance by status"
                >
                  <option value="all">All Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <select
                  class="filter-select"
                  id="maintenanceTypeFilter"
                  aria-label="Filter maintenance by service type"
                >
                  <option value="all">All Service Types</option>
                  <option value="Preventive Maintenance">
                    Preventive Maintenance
                  </option>
                  <option value="Corrective Repair">Corrective Repair</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Oil Change">Oil Change</option>
                  <option value="Tire Service">Tire Service</option>
                  <option value="Brake Service">Brake Service</option>
                  <option value="Engine Service">Engine Service</option>
                  <option value="Electrical Service">Electrical Service</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  type="date"
                  class="filter-select"
                  id="maintenanceDateFilter"
                  aria-label="Filter maintenance by scheduled date"
                />
              </div>

              <div class="toolbar-right">
                <button
                  type="button"
                  class="btn-outline"
                  id="refreshMaintenance"
                >
                  <i class="ph ph-arrows-clockwise"></i>
                  Refresh
                </button>
              </div>
            </div>

            <!-- Bulk Toolbar -->
            <div class="bulk-toolbar" id="maintenanceBulkToolbar">
              <span id="maintenanceSelectedCount">0 maintenance selected</span>

              <div>
                <button
                  type="button"
                  class="btn-outline"
                  id="clearMaintenanceSelection"
                >
                  Clear
                </button>

                <button
                  type="button"
                  id="deleteSelectedMaintenance"
                  class="btn-danger"
                  aria-label="Delete selected maintenance records"
                >
                  <i class="ph ph-trash"></i>
                  Delete Selected
                </button>
              </div>
            </div>

            <!-- Maintenance Table -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h3>Maintenance List</h3>

                  <p class="card-subtitle">
                    View and manage all hospital fleet maintenance records.
                  </p>
                </div>

                <div class="card-actions">
                  <div class="export-dropdown">
                    <button
                      type="button"
                      class="btn-outline export-menu-toggle"
                      id="maintenanceExportMenuToggle"
                      aria-haspopup="menu"
                      aria-expanded="false"
                      aria-controls="maintenanceExportMenu"
                    >
                      <i class="ph ph-export" aria-hidden="true"></i>
                      Export
                      <i class="ph ph-caret-down export-menu-chevron" aria-hidden="true"></i>
                    </button>

                    <div
                      class="export-menu"
                      id="maintenanceExportMenu"
                      role="menu"
                      hidden
                      aria-label="Export maintenance list"
                    >
                      <button
                        type="button"
                        class="export-menu-item"
                        role="menuitem"
                        id="printMaintenance"
                      >
                        <i class="ph ph-printer" aria-hidden="true"></i>
                        Print
                      </button>

                      <button
                        type="button"
                        class="export-menu-item"
                        role="menuitem"
                        id="exportMaintenancePDF"
                      >
                        <i class="ph ph-file-pdf" aria-hidden="true"></i>
                        Export PDF
                      </button>

                      <button
                        type="button"
                        class="export-menu-item"
                        role="menuitem"
                        id="exportMaintenance"
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
                          id="selectAllMaintenance"
                          aria-label="Select all visible maintenance records"
                        />
                      </th>

                      <th class="sortable" data-column="1">
                        Maintenance No.
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="2">
                        Vehicle
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="3">
                        Service Type
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="4">
                        Technician / Workshop
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="5">
                        Scheduled Date
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="6">
                        Completion Date
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="7">
                        Cost
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="8">
                        Priority
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="9">
                        Status
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody id="maintenanceTableBody">
                    <tr
                      data-scheduled-date="2026-07-20"
                      data-completion-date=""
                      data-priority="High"
                      data-odometer="48230"
                      data-description="Scheduled 5,000 km preventive maintenance for Ambulance 01"
                      data-parts-used="Engine oil, oil filter, air filter"
                      data-notes="Routine fleet inspection"
                    >
                      <td>
                        <input
                          type="checkbox"
                          class="maintenance-checkbox"
                          aria-label="Select MNT-2026-001"
                        />
                      </td>

                      <td>
                        <span class="maintenance-number">MNT-2026-001</span>
                      </td>

                      <td>
                        <span class="maintenance-vehicle">Ambulance 01</span>
                      </td>

                      <td>
                        <span class="maintenance-service-type"
                          >Preventive Maintenance</span
                        >
                      </td>

                      <td>
                        <span class="maintenance-technician"
                          >Engr. Ramon Cruz / Central Garage</span
                        >
                      </td>

                      <td>
                        <span class="maintenance-scheduled-date"
                          >Jul 20, 2026</span
                        >
                      </td>

                      <td>
                        <span class="maintenance-completion-date">—</span>
                      </td>

                      <td>
                        <span class="maintenance-cost">₱3,500.00</span>
                      </td>

                      <td>
                        <span class="maintenance-priority">High</span>
                      </td>

                      <td>
                        <span class="status-badge scheduled">Scheduled</span>
                      </td>

                      <td>
                        <div class="action-buttons">
                          <button
                            type="button"
                            class="action-btn view-maintenance"
                            aria-label="View MNT-2026-001"
                          >
                            <i class="ph ph-eye"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn edit-maintenance"
                            aria-label="Edit MNT-2026-001"
                          >
                            <i class="ph ph-pencil-simple"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn delete-maintenance"
                            aria-label="Delete MNT-2026-001"
                          >
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      data-scheduled-date="2026-07-18"
                      data-completion-date=""
                      data-priority="Emergency"
                      data-odometer="61240"
                      data-description="Brake pad replacement and rotor resurfacing for Patient Van 02"
                      data-parts-used="Brake pads, brake fluid"
                      data-notes="Grinding noise reported by driver"
                    >
                      <td>
                        <input
                          type="checkbox"
                          class="maintenance-checkbox"
                          aria-label="Select MNT-2026-002"
                        />
                      </td>

                      <td>
                        <span class="maintenance-number">MNT-2026-002</span>
                      </td>

                      <td>
                        <span class="maintenance-vehicle">Patient Van 02</span>
                      </td>

                      <td>
                        <span class="maintenance-service-type"
                          >Brake Service</span
                        >
                      </td>

                      <td>
                        <span class="maintenance-technician"
                          >Engr. Paolo Reyes / North Workshop</span
                        >
                      </td>

                      <td>
                        <span class="maintenance-scheduled-date"
                          >Jul 18, 2026</span
                        >
                      </td>

                      <td>
                        <span class="maintenance-completion-date">—</span>
                      </td>

                      <td>
                        <span class="maintenance-cost">₱2,800.00</span>
                      </td>

                      <td>
                        <span class="maintenance-priority">Emergency</span>
                      </td>

                      <td>
                        <span class="status-badge pending">In Progress</span>
                      </td>

                      <td>
                        <div class="action-buttons">
                          <button
                            type="button"
                            class="action-btn view-maintenance"
                            aria-label="View MNT-2026-002"
                          >
                            <i class="ph ph-eye"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn edit-maintenance"
                            aria-label="Edit MNT-2026-002"
                          >
                            <i class="ph ph-pencil-simple"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn delete-maintenance"
                            aria-label="Delete MNT-2026-002"
                          >
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      data-scheduled-date="2026-07-10"
                      data-completion-date="2026-07-12"
                      data-priority="Normal"
                      data-odometer="73910"
                      data-description="Engine overheating diagnostic and coolant system repair for SUV 03"
                      data-parts-used="Thermostat, radiator cap, coolant"
                      data-notes="Overheating on long trips"
                    >
                      <td>
                        <input
                          type="checkbox"
                          class="maintenance-checkbox"
                          aria-label="Select MNT-2026-003"
                        />
                      </td>

                      <td>
                        <span class="maintenance-number">MNT-2026-003</span>
                      </td>

                      <td>
                        <span class="maintenance-vehicle">SUV 03</span>
                      </td>

                      <td>
                        <span class="maintenance-service-type"
                          >Engine Service</span
                        >
                      </td>

                      <td>
                        <span class="maintenance-technician"
                          >Engr. Ramon Cruz / Central Garage</span
                        >
                      </td>

                      <td>
                        <span class="maintenance-scheduled-date"
                          >Jul 10, 2026</span
                        >
                      </td>

                      <td>
                        <span class="maintenance-completion-date"
                          >Jul 12, 2026</span
                        >
                      </td>

                      <td>
                        <span class="maintenance-cost">₱7,200.00</span>
                      </td>

                      <td>
                        <span class="maintenance-priority">Normal</span>
                      </td>

                      <td>
                        <span class="status-badge completed">Completed</span>
                      </td>

                      <td>
                        <div class="action-buttons">
                          <button
                            type="button"
                            class="action-btn view-maintenance"
                            aria-label="View MNT-2026-003"
                          >
                            <i class="ph ph-eye"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn edit-maintenance"
                            aria-label="Edit MNT-2026-003"
                          >
                            <i class="ph ph-pencil-simple"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn delete-maintenance"
                            aria-label="Delete MNT-2026-003"
                          >
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      data-scheduled-date="2026-07-15"
                      data-completion-date="2026-07-15"
                      data-priority="Low"
                      data-odometer="33480"
                      data-description="Routine oil change and lubrication for Service Vehicle 04"
                      data-parts-used="Engine oil, oil filter"
                      data-notes="Quarterly service"
                    >
                      <td>
                        <input
                          type="checkbox"
                          class="maintenance-checkbox"
                          aria-label="Select MNT-2026-004"
                        />
                      </td>

                      <td>
                        <span class="maintenance-number">MNT-2026-004</span>
                      </td>

                      <td>
                        <span class="maintenance-vehicle"
                          >Service Vehicle 04</span
                        >
                      </td>

                      <td>
                        <span class="maintenance-service-type">Oil Change</span>
                      </td>

                      <td>
                        <span class="maintenance-technician"
                          >Engr. Paolo Reyes / North Workshop</span
                        >
                      </td>

                      <td>
                        <span class="maintenance-scheduled-date"
                          >Jul 15, 2026</span
                        >
                      </td>

                      <td>
                        <span class="maintenance-completion-date"
                          >Jul 15, 2026</span
                        >
                      </td>

                      <td>
                        <span class="maintenance-cost">₱1,250.00</span>
                      </td>

                      <td>
                        <span class="maintenance-priority">Low</span>
                      </td>

                      <td>
                        <span class="status-badge completed">Completed</span>
                      </td>

                      <td>
                        <div class="action-buttons">
                          <button
                            type="button"
                            class="action-btn view-maintenance"
                            aria-label="View MNT-2026-004"
                          >
                            <i class="ph ph-eye"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn edit-maintenance"
                            aria-label="Edit MNT-2026-004"
                          >
                            <i class="ph ph-pencil-simple"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn delete-maintenance"
                            aria-label="Delete MNT-2026-004"
                          >
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      data-scheduled-date="2026-07-22"
                      data-completion-date=""
                      data-priority="Normal"
                      data-odometer="58760"
                      data-description="Annual safety and emissions inspection for Van 05"
                      data-parts-used=""
                      data-notes="Pending clearance from LTO"
                    >
                      <td>
                        <input
                          type="checkbox"
                          class="maintenance-checkbox"
                          aria-label="Select MNT-2026-005"
                        />
                      </td>

                      <td>
                        <span class="maintenance-number">MNT-2026-005</span>
                      </td>

                      <td>
                        <span class="maintenance-vehicle">Van 05</span>
                      </td>

                      <td>
                        <span class="maintenance-service-type">Inspection</span>
                      </td>

                      <td>
                        <span class="maintenance-technician"
                          >Engr. Ramon Cruz / Central Garage</span
                        >
                      </td>

                      <td>
                        <span class="maintenance-scheduled-date"
                          >Jul 22, 2026</span
                        >
                      </td>

                      <td>
                        <span class="maintenance-completion-date">—</span>
                      </td>

                      <td>
                        <span class="maintenance-cost">₱950.00</span>
                      </td>

                      <td>
                        <span class="maintenance-priority">Normal</span>
                      </td>

                      <td>
                        <span class="status-badge cancelled">Cancelled</span>
                      </td>

                      <td>
                        <div class="action-buttons">
                          <button
                            type="button"
                            class="action-btn view-maintenance"
                            aria-label="View MNT-2026-005"
                          >
                            <i class="ph ph-eye"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn edit-maintenance"
                            aria-label="Edit MNT-2026-005"
                          >
                            <i class="ph ph-pencil-simple"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn delete-maintenance"
                            aria-label="Delete MNT-2026-005"
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
              <div id="maintenancePaginationInfo">
                Showing <strong>1–5</strong> of <strong>5</strong> maintenance
                records
              </div>

              <div class="pagination" id="maintenancePagination">
                <button type="button" aria-label="Previous page">
                  <i class="ph ph-caret-left"></i>
                </button>

                <button type="button" class="active" aria-label="Page 1">
                  1
                </button>

                <button type="button" aria-label="Next page">
                  <i class="ph ph-caret-right"></i>
                </button>
              </div>
            </div>
          </div>
        </section>

    <div id="add-maintenance-modal"></div>
    <div id="view-maintenance-modal"></div>
    <div id="edit-maintenance-modal"></div>
    <div id="delete-maintenance-modal"></div>

    <!-- Export dependencies -->
    <script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js"></script>

    <!-- Components -->

    <!-- Main JS -->
    @push('scripts')
    
  
    <script src="{{ asset('assets/js/components/dropdown.js') }}"></script>
    <script src="{{ asset('assets/js/maintenance/maintenance-modal.js') }}"></script>
    <script src="{{ asset('assets/js/maintenance/maintenance-add.js') }}"></script>
    <script src="{{ asset('assets/js/maintenance/maintenance-view.js') }}"></script>
    <script src="{{ asset('assets/js/maintenance/maintenance-edit.js') }}"></script>
    <script src="{{ asset('assets/js/maintenance/maintenance-delete.js') }}"></script>
    <script src="{{ asset('assets/js/maintenance/maintenance-search.js') }}"></script>
    <script src="{{ asset('assets/js/maintenance/maintenance-statistics.js') }}"></script>
    <script src="{{ asset('assets/js/maintenance/maintenance-sort.js') }}"></script>
    <script src="{{ asset('assets/js/maintenance/maintenance-pagination.js') }}"></script>
    <script src="{{ asset('assets/js/maintenance/maintenance-bulk.js') }}"></script>
    <script src="{{ asset('assets/js/maintenance/maintenance-export.js') }}"></script>
    <script src="{{ asset('assets/js/maintenance/maintenance-print.js') }}"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>

    @endpush

@endsection