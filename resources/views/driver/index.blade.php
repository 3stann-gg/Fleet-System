@extends('layouts.app')

@section('title', 'Driver Management | HIMS Fleet')

@section('content')

        <section class="page-wrapper">
          <div class="vehicle-page">
            <!-- Header -->
            <div class="page-header">
              <div>
                <h1>Driver Management</h1>

                <p>Manage hospital fleet drivers, assignments, and availability.</p>
              </div>

              <button type="button" id="addDriverBtn" class="btn-primary">
                <i class="ph ph-plus"></i>
                Add Driver
              </button>
            </div>

            <!-- Driver Statistics -->
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="ph-fill ph-users"></i>
                </div>

                <div class="stat-content">
                  <h3 id="totalDrivers">24</h3>

                  <p>Total Drivers</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon success">
                  <i class="ph-fill ph-check-circle"></i>
                </div>

                <div class="stat-content">
                  <h3 id="availableDrivers">12</h3>

                  <p>Available</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon warning">
                  <i class="ph-fill ph-briefcase"></i>
                </div>

                <div class="stat-content">
                  <h3 id="onDutyDrivers">9</h3>

                  <p>On Duty</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon danger">
                  <i class="ph-fill ph-calendar-x"></i>
                </div>

                <div class="stat-content">
                  <h3 id="onLeaveDrivers">3</h3>

                  <p>On Leave</p>
                </div>
              </div>
            </div>

            <!-- Toolbar -->
            <div class="toolbar">
              <div class="toolbar-left">
                <div class="search-box">
                  <i class="ph ph-magnifying-glass"></i>

                  <input
                    type="search"
                    id="driverSearch"
                    aria-label="Search drivers"
                    placeholder="Search by driver name, employee ID, license number, or contact"
                  />
                </div>

                <select
                  class="filter-select"
                  id="driverStatusFilter"
                  aria-label="Filter drivers by status"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="on-duty">On Duty</option>
                  <option value="on-leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>

                <select
                  class="filter-select"
                  id="driverLicenseFilter"
                  aria-label="Filter drivers by license class"
                >
                  <option value="all">All License Classes</option>
                  <option value="professional">Professional</option>
                  <option value="non-professional">Non-Professional</option>
                </select>
              </div>

              <div class="toolbar-right">
                <button type="button" class="btn-outline" id="refreshDrivers">
                  <i class="ph ph-arrows-clockwise"></i>
                  Refresh
                </button>
              </div>
            </div>

            <!-- Bulk Toolbar -->
            <div class="bulk-toolbar" id="driverBulkToolbar">
              <span id="driverSelectedCount">0 drivers selected</span>

              <div>
                <button
                  type="button"
                  class="btn-outline"
                  id="clearDriverSelection"
                >
                  Clear
                </button>

                <button
                  type="button"
                  id="deleteSelectedDrivers"
                  class="btn-danger"
                >
                  <i class="ph ph-trash"></i>
                  Delete Selected
                </button>
              </div>
            </div>

            <!-- Driver Table -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h3>Driver List</h3>

                  <p class="card-subtitle">
                    View and manage all hospital fleet drivers.
                  </p>
                </div>

                <div class="card-actions">
                  <div class="export-dropdown">
                    <button
                      type="button"
                      class="btn-outline export-menu-toggle"
                      id="driverExportMenuToggle"
                      aria-haspopup="menu"
                      aria-expanded="false"
                      aria-controls="driverExportMenu"
                    >
                      <i class="ph ph-export" aria-hidden="true"></i>
                      Export
                      <i class="ph ph-caret-down export-menu-chevron" aria-hidden="true"></i>
                    </button>

                    <div
                      class="export-menu"
                      id="driverExportMenu"
                      role="menu"
                      hidden
                      aria-label="Export driver list"
                    >
                      <button
                        type="button"
                        class="export-menu-item"
                        role="menuitem"
                        id="printDrivers"
                      >
                        <i class="ph ph-printer" aria-hidden="true"></i>
                        Print
                      </button>

                      <button
                        type="button"
                        class="export-menu-item"
                        role="menuitem"
                        id="exportDriverPDF"
                      >
                        <i class="ph ph-file-pdf" aria-hidden="true"></i>
                        Export PDF
                      </button>

                      <button
                        type="button"
                        class="export-menu-item"
                        role="menuitem"
                        id="exportDrivers"
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
                          id="selectAllDrivers"
                          aria-label="Select all drivers"
                        />
                      </th>

                      <th class="sortable" data-column="1">
                        Driver
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="2">
                        Employee ID
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="3">
                        License No.
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="4">
                        License Class
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="5">
                        Assigned Vehicle
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="6">
                        Status
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th class="sortable" data-column="7">
                        Contact
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>

                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody id="driverTableBody">
                    <tr>
                      <td>
                        <input
                          type="checkbox"
                          class="driver-checkbox"
                          aria-label="Select Juan Dela Cruz"
                        />
                      </td>

                      <td>
                        <div class="driver-info">
                          <div class="driver-avatar">JD</div>

                          <div>
                            <div class="driver-name">Juan Dela Cruz</div>

                            <small>Emergency Transport</small>
                          </div>
                        </div>
                      </td>

                      <td>DRV-001</td>

                      <td class="driver-license">N01-23-456789</td>

                      <td>Professional</td>

                      <td class="driver-assignment">Ambulance-01</td>

                      <td>
                        <span class="status-badge available">Available</span>
                      </td>

                      <td>+63 917 555 0101</td>

                      <td>
                        <div class="action-buttons">
                          <button
                            type="button"
                            class="action-btn view-driver"
                            aria-label="View Juan Dela Cruz"
                          >
                            <i class="ph ph-eye"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn edit-driver"
                            aria-label="Edit Juan Dela Cruz"
                          >
                            <i class="ph ph-pencil-simple"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn delete-driver"
                            aria-label="Delete Juan Dela Cruz"
                          >
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <input
                          type="checkbox"
                          class="driver-checkbox"
                          aria-label="Select Maria Reyes"
                        />
                      </td>

                      <td>
                        <div class="driver-info">
                          <div class="driver-avatar">MR</div>

                          <div>
                            <div class="driver-name">Maria Reyes</div>

                            <small>Patient Transfer</small>
                          </div>
                        </div>
                      </td>

                      <td>DRV-014</td>

                      <td class="driver-license">N02-24-738291</td>

                      <td>Professional</td>

                      <td class="driver-assignment">Patient Van-02</td>

                      <td>
                        <span class="status-badge trip">On Duty</span>
                      </td>

                      <td>+63 917 555 0144</td>

                      <td>
                        <div class="action-buttons">
                          <button
                            type="button"
                            class="action-btn view-driver"
                            aria-label="View Maria Reyes"
                          >
                            <i class="ph ph-eye"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn edit-driver"
                            aria-label="Edit Maria Reyes"
                          >
                            <i class="ph ph-pencil-simple"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn delete-driver"
                            aria-label="Delete Maria Reyes"
                          >
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <input
                          type="checkbox"
                          class="driver-checkbox"
                          aria-label="Select Carlo Mendoza"
                        />
                      </td>

                      <td>
                        <div class="driver-info">
                          <div class="driver-avatar">CM</div>

                          <div>
                            <div class="driver-name">Carlo Mendoza</div>

                            <small>Service Support</small>
                          </div>
                        </div>
                      </td>

                      <td>DRV-021</td>

                      <td class="driver-license">C03-25-194837</td>

                      <td>Non-Professional</td>

                      <td class="driver-assignment">Unassigned</td>

                      <td>
                        <span class="status-badge maintenance">On Leave</span>
                      </td>

                      <td>+63 917 555 0218</td>

                      <td>
                        <div class="action-buttons">
                          <button
                            type="button"
                            class="action-btn view-driver"
                            aria-label="View Carlo Mendoza"
                          >
                            <i class="ph ph-eye"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn edit-driver"
                            aria-label="Edit Carlo Mendoza"
                          >
                            <i class="ph ph-pencil-simple"></i>
                          </button>

                          <button
                            type="button"
                            class="action-btn delete-driver"
                            aria-label="Delete Carlo Mendoza"
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
              <div id="driverPaginationInfo">
                Showing <strong>1–3</strong> of <strong>24</strong> drivers
              </div>

              <div class="pagination" id="driverPagination">
                <button type="button" aria-label="Previous page">
                  <i class="ph ph-caret-left"></i>
                </button>

                <button type="button" class="active" aria-label="Page 1">1</button>

                <button type="button" aria-label="Page 2">2</button>

                <button type="button" aria-label="Page 3">3</button>

                <button type="button" aria-label="Next page">
                  <i class="ph ph-caret-right"></i>
                </button>
              </div>
            </div>
          </div>
        </section>

    <div id="add-driver-modal"></div>
    <div id="view-driver-modal"></div>
    <div id="edit-driver-modal"></div>
    <div id="delete-driver-modal"></div>

    <!-- Export dependencies -->
    <script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js"></script>

    <!-- Main JS -->
    @push('scripts')

    <script src="{{ asset('assets/js/components/dropdown.js') }}"></script>
    <script src="{{ asset('assets/js/driver/driver.js') }}"></script>
    <script src="{{ asset('assets/js/driver/driver-search.js') }}"></script>
    <script src="{{ asset('assets/js/driver/driver-add.js') }}"></script>
    <script src="{{ asset('assets/js/driver/driver-view.js') }}"></script>
    <script src="{{ asset('assets/js/driver/driver-edit.js') }}"></script>
    <script src="{{ asset('assets/js/driver/driver-delete.js') }}"></script>
    <script src="{{ asset('assets/js/driver/driver-filter.js') }}"></script>
    <script src="{{ asset('assets/js/driver/driver-pagination.j') }}"></script>
    <script src="{{ asset('assets/js/driver/driver-sort.js') }}"></script>
    <script src="{{ asset('assets/js/driver/driver-export.js') }}"></script>
    <script src="{{ asset('assets/js/driver/driver-print.js') }}"></script>
    <script src="{{ asset('assets/js/driver/driver-bulk.js') }}"></script>
    <script src="{{ asset('assets/js/driver/driver-stats.js') }}"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>

    @endpush

@endsection
