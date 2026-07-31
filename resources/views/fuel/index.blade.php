@extends('layouts.app')

@section('title', 'Fuel Management | HIMS Fleet')

@section('content')

        <section class="page-wrapper">
          <div class="vehicle-page fuel-page">
            <div class="page-header">
              <div>
                <h1>Fuel Management</h1>
                <p>
                  Track fuel usage, costs, refueling activity, and vehicle
                  consumption.
                </p>
              </div>

              <button type="button" id="addFuelBtn" class="btn-primary">
                <i class="ph ph-plus"></i>
                Add Fuel Record
              </button>
            </div>

            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="ph-fill ph-gas-pump"></i>
                </div>
                <div class="stat-content">
                  <h3 id="totalFuelRecords">0</h3>
                  <p>Total Fuel Records</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon success">
                  <i class="ph-fill ph-drop"></i>
                </div>
                <div class="stat-content">
                  <h3 id="totalFuelConsumed">0.00 L</h3>
                  <p>Total Fuel Consumed</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon warning">
                  <i class="ph-fill ph-currency-circle-dollar"></i>
                </div>
                <div class="stat-content">
                  <h3 id="totalFuelCost">₱0.00</h3>
                  <p>Total Fuel Cost</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <i class="ph-fill ph-chart-line-up"></i>
                </div>
                <div class="stat-content">
                  <h3 id="averageCostPerLiter">₱0.00/L</h3>
                  <p>Average Cost per Liter</p>
                </div>
              </div>
            </div>

            <div class="toolbar">
              <div class="toolbar-left">
                <div class="search-box">
                  <i class="ph ph-magnifying-glass"></i>
                  <input
                    type="text"
                    id="fuelSearch"
                    placeholder="Search by record number, vehicle, plate, driver, station, or receipt"
                    aria-label="Search fuel records"
                  />
                </div>

                <select
                  class="filter-select"
                  id="fuelVehicleFilter"
                  aria-label="Filter fuel records by vehicle"
                >
                  <option value="all">All Vehicles</option>
                  <option value="Ambulance 01">Ambulance 01</option>
                  <option value="Ambulance 03">Ambulance 03</option>
                  <option value="Patient Van 02">Patient Van 02</option>
                  <option value="Service Vehicle 04">Service Vehicle 04</option>
                  <option value="Van 02">Van 02</option>
                  <option value="Van 05">Van 05</option>
                  <option value="SUV 03">SUV 03</option>
                </select>

                <select
                  class="filter-select"
                  id="fuelTypeFilter"
                  aria-label="Filter fuel records by fuel type"
                >
                  <option value="all">All Fuel Types</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Gasoline">Gasoline</option>
                  <option value="Premium Gasoline">Premium Gasoline</option>
                </select>

                <input
                  type="date"
                  class="filter-select"
                  id="fuelDateFilter"
                  aria-label="Filter fuel records by refueling date"
                />
              </div>

              <div class="toolbar-right">
                <button type="button" class="btn-outline" id="refreshFuel">
                  <i class="ph ph-arrows-clockwise"></i>
                  Refresh
                </button>
              </div>
            </div>

            <div class="bulk-toolbar" id="fuelBulkToolbar">
              <span id="fuelSelectedCount">0 fuel records selected</span>
              <div>
                <button type="button" class="btn-outline" id="clearFuelSelection">
                  Clear
                </button>
                <button
                  type="button"
                  id="deleteSelectedFuel"
                  class="btn-danger"
                  aria-label="Delete selected fuel records"
                >
                  <i class="ph ph-trash"></i>
                  Delete Selected
                </button>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <div>
                  <h3>Fuel Records</h3>
                  <p class="card-subtitle">
                    View and manage all hospital fleet fuel transactions.
                  </p>
                </div>
                <div class="card-actions">
                  <div class="export-dropdown">
                    <button
                      type="button"
                      class="btn-outline export-menu-toggle"
                      id="fuelExportMenuToggle"
                      aria-haspopup="menu"
                      aria-expanded="false"
                      aria-controls="fuelExportMenu"
                    >
                      <i class="ph ph-export" aria-hidden="true"></i>
                      Export
                      <i class="ph ph-caret-down export-menu-chevron" aria-hidden="true"></i>
                    </button>
                    <div
                      class="export-menu"
                      id="fuelExportMenu"
                      role="menu"
                      hidden
                      aria-label="Export fuel records"
                    >
                      <button
                        type="button"
                        class="export-menu-item"
                        role="menuitem"
                        id="printFuel"
                      >
                        <i class="ph ph-printer" aria-hidden="true"></i>
                        Print
                      </button>
                      <button
                        type="button"
                        class="export-menu-item"
                        role="menuitem"
                        id="exportFuelPDF"
                      >
                        <i class="ph ph-file-pdf" aria-hidden="true"></i>
                        Export PDF
                      </button>
                      <button
                        type="button"
                        class="export-menu-item"
                        role="menuitem"
                        id="exportFuel"
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
                          id="selectAllFuel"
                          aria-label="Select all visible fuel records"
                        />
                      </th>
                      <th class="sortable" data-column="1">
                        Fuel Record No.
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>
                      <th class="sortable" data-column="2">
                        Date
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>
                      <th class="sortable" data-column="3">
                        Vehicle
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>
                      <th>Plate No.</th>
                      <th>Driver</th>
                      <th class="sortable" data-column="6">
                        Fuel Type
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>
                      <th class="sortable" data-column="7">
                        Quantity
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>
                      <th>Cost / L</th>
                      <th class="sortable" data-column="9">
                        Total Cost
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>
                      <th class="sortable" data-column="10">
                        Odometer
                        <i class="ph ph-caret-up-down sort-icon"></i>
                      </th>
                      <th>Fuel Station</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody id="fuelTableBody">
                    <tr
                      data-fuel-id="fuel-2026-0001"
                      data-fuel-number="FUEL-2026-0001"
                      data-refuel-date="2026-07-10"
                      data-refuel-time="08:30"
                      data-plate="ABC-1003"
                      data-driver="Juan Dela Cruz"
                      data-fuel-type="Diesel"
                      data-quantity="45.50"
                      data-cost-per-liter="72.50"
                      data-total-cost="3298.75"
                      data-odometer="48230"
                      data-station="Petron Hospital Depot"
                      data-receipt="RCP-78421"
                      data-payment="Fleet Card"
                      data-notes="Morning top-up before ambulance runs"
                    >
                      <td>
                        <input
                          type="checkbox"
                          class="fuel-checkbox"
                          aria-label="Select fuel record"
                        />
                      </td>
                      <td><span class="fuel-number">FUEL-2026-0001</span></td>
                      <td><span class="fuel-date">Jul 10, 2026</span></td>
                      <td><span class="fuel-vehicle">Ambulance 03</span></td>
                      <td><span class="fuel-plate">ABC-1003</span></td>
                      <td><span class="fuel-driver">Juan Dela Cruz</span></td>
                      <td><span class="fuel-type">Diesel</span></td>
                      <td><span class="fuel-quantity">45.50 L</span></td>
                      <td><span class="fuel-cost-per-liter">₱72.50</span></td>
                      <td><span class="fuel-total-cost">₱3,298.75</span></td>
                      <td><span class="fuel-odometer">48,230 km</span></td>
                      <td><span class="fuel-station">Petron Hospital Depot</span></td>
                      <td>
                        <div class="action-buttons">
                          <button type="button" class="action-btn view-fuel" aria-label="View FUEL-2026-0001">
                            <i class="ph ph-eye"></i>
                          </button>
                          <button type="button" class="action-btn edit-fuel" aria-label="Edit FUEL-2026-0001">
                            <i class="ph ph-pencil-simple"></i>
                          </button>
                          <button type="button" class="action-btn delete-fuel" aria-label="Delete FUEL-2026-0001">
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      data-fuel-id="fuel-2026-0002"
                      data-fuel-number="FUEL-2026-0002"
                      data-refuel-date="2026-07-11"
                      data-refuel-time="14:15"
                      data-plate="GHI-4004"
                      data-driver="Maria Santos"
                      data-fuel-type="Gasoline"
                      data-quantity="32.00"
                      data-cost-per-liter="68.90"
                      data-total-cost="2204.80"
                      data-odometer="21560"
                      data-station="Shell Medical Hub"
                      data-receipt="RCP-78455"
                      data-payment="Company Account"
                      data-notes=""
                    >
                      <td>
                        <input
                          type="checkbox"
                          class="fuel-checkbox"
                          aria-label="Select fuel record"
                        />
                      </td>
                      <td><span class="fuel-number">FUEL-2026-0002</span></td>
                      <td><span class="fuel-date">Jul 11, 2026</span></td>
                      <td><span class="fuel-vehicle">Service Vehicle 04</span></td>
                      <td><span class="fuel-plate">GHI-4004</span></td>
                      <td><span class="fuel-driver">Maria Santos</span></td>
                      <td><span class="fuel-type">Gasoline</span></td>
                      <td><span class="fuel-quantity">32.00 L</span></td>
                      <td><span class="fuel-cost-per-liter">₱68.90</span></td>
                      <td><span class="fuel-total-cost">₱2,204.80</span></td>
                      <td><span class="fuel-odometer">21,560 km</span></td>
                      <td><span class="fuel-station">Shell Medical Hub</span></td>
                      <td>
                        <div class="action-buttons">
                          <button type="button" class="action-btn view-fuel" aria-label="View FUEL-2026-0002">
                            <i class="ph ph-eye"></i>
                          </button>
                          <button type="button" class="action-btn edit-fuel" aria-label="Edit FUEL-2026-0002">
                            <i class="ph ph-pencil-simple"></i>
                          </button>
                          <button type="button" class="action-btn delete-fuel" aria-label="Delete FUEL-2026-0002">
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      data-fuel-id="fuel-2026-0003"
                      data-fuel-number="FUEL-2026-0003"
                      data-refuel-date="2026-07-12"
                      data-refuel-time="09:45"
                      data-plate="JKL-2002"
                      data-driver="Pedro Reyes"
                      data-fuel-type="Diesel"
                      data-quantity="50.00"
                      data-cost-per-liter="73.25"
                      data-total-cost="3662.50"
                      data-odometer="33410"
                      data-station="Caltex Fleet Center"
                      data-receipt="RCP-78502"
                      data-payment="Fleet Card"
                      data-notes="Full tank for patient transport schedule"
                    >
                      <td>
                        <input
                          type="checkbox"
                          class="fuel-checkbox"
                          aria-label="Select fuel record"
                        />
                      </td>
                      <td><span class="fuel-number">FUEL-2026-0003</span></td>
                      <td><span class="fuel-date">Jul 12, 2026</span></td>
                      <td><span class="fuel-vehicle">Van 02</span></td>
                      <td><span class="fuel-plate">JKL-2002</span></td>
                      <td><span class="fuel-driver">Pedro Reyes</span></td>
                      <td><span class="fuel-type">Diesel</span></td>
                      <td><span class="fuel-quantity">50.00 L</span></td>
                      <td><span class="fuel-cost-per-liter">₱73.25</span></td>
                      <td><span class="fuel-total-cost">₱3,662.50</span></td>
                      <td><span class="fuel-odometer">33,410 km</span></td>
                      <td><span class="fuel-station">Caltex Fleet Center</span></td>
                      <td>
                        <div class="action-buttons">
                          <button type="button" class="action-btn view-fuel" aria-label="View FUEL-2026-0003">
                            <i class="ph ph-eye"></i>
                          </button>
                          <button type="button" class="action-btn edit-fuel" aria-label="Edit FUEL-2026-0003">
                            <i class="ph ph-pencil-simple"></i>
                          </button>
                          <button type="button" class="action-btn delete-fuel" aria-label="Delete FUEL-2026-0003">
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      data-fuel-id="fuel-2026-0004"
                      data-fuel-number="FUEL-2026-0004"
                      data-refuel-date="2026-07-13"
                      data-refuel-time="16:20"
                      data-plate="ABC-1001"
                      data-driver="Ana Lopez"
                      data-fuel-type="Premium Gasoline"
                      data-quantity="28.75"
                      data-cost-per-liter="79.90"
                      data-total-cost="2297.13"
                      data-odometer="51200"
                      data-station="Petron Hospital Depot"
                      data-receipt=""
                      data-payment="Cash"
                      data-notes="Emergency unit refuel"
                    >
                      <td>
                        <input
                          type="checkbox"
                          class="fuel-checkbox"
                          aria-label="Select fuel record"
                        />
                      </td>
                      <td><span class="fuel-number">FUEL-2026-0004</span></td>
                      <td><span class="fuel-date">Jul 13, 2026</span></td>
                      <td><span class="fuel-vehicle">Ambulance 01</span></td>
                      <td><span class="fuel-plate">ABC-1001</span></td>
                      <td><span class="fuel-driver">Ana Lopez</span></td>
                      <td><span class="fuel-type">Premium Gasoline</span></td>
                      <td><span class="fuel-quantity">28.75 L</span></td>
                      <td><span class="fuel-cost-per-liter">₱79.90</span></td>
                      <td><span class="fuel-total-cost">₱2,297.13</span></td>
                      <td><span class="fuel-odometer">51,200 km</span></td>
                      <td><span class="fuel-station">Petron Hospital Depot</span></td>
                      <td>
                        <div class="action-buttons">
                          <button type="button" class="action-btn view-fuel" aria-label="View FUEL-2026-0004">
                            <i class="ph ph-eye"></i>
                          </button>
                          <button type="button" class="action-btn edit-fuel" aria-label="Edit FUEL-2026-0004">
                            <i class="ph ph-pencil-simple"></i>
                          </button>
                          <button type="button" class="action-btn delete-fuel" aria-label="Delete FUEL-2026-0004">
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      data-fuel-id="fuel-2026-0005"
                      data-fuel-number="FUEL-2026-0005"
                      data-refuel-date="2026-07-14"
                      data-refuel-time="11:05"
                      data-plate="DEF-2002"
                      data-driver="Carlos Rivera"
                      data-fuel-type="Diesel"
                      data-quantity="40.00"
                      data-cost-per-liter="72.80"
                      data-total-cost="2912.00"
                      data-odometer="19880"
                      data-station="Shell Medical Hub"
                      data-receipt="RCP-78610"
                      data-payment="Fleet Card"
                      data-notes=""
                    >
                      <td>
                        <input
                          type="checkbox"
                          class="fuel-checkbox"
                          aria-label="Select fuel record"
                        />
                      </td>
                      <td><span class="fuel-number">FUEL-2026-0005</span></td>
                      <td><span class="fuel-date">Jul 14, 2026</span></td>
                      <td><span class="fuel-vehicle">Patient Van 02</span></td>
                      <td><span class="fuel-plate">DEF-2002</span></td>
                      <td><span class="fuel-driver">Carlos Rivera</span></td>
                      <td><span class="fuel-type">Diesel</span></td>
                      <td><span class="fuel-quantity">40.00 L</span></td>
                      <td><span class="fuel-cost-per-liter">₱72.80</span></td>
                      <td><span class="fuel-total-cost">₱2,912.00</span></td>
                      <td><span class="fuel-odometer">19,880 km</span></td>
                      <td><span class="fuel-station">Shell Medical Hub</span></td>
                      <td>
                        <div class="action-buttons">
                          <button type="button" class="action-btn view-fuel" aria-label="View FUEL-2026-0005">
                            <i class="ph ph-eye"></i>
                          </button>
                          <button type="button" class="action-btn edit-fuel" aria-label="Edit FUEL-2026-0005">
                            <i class="ph ph-pencil-simple"></i>
                          </button>
                          <button type="button" class="action-btn delete-fuel" aria-label="Delete FUEL-2026-0005">
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="table-footer">
              <div id="fuelPaginationInfo">
                Showing <strong>1–5</strong> of <strong>5</strong> fuel records
              </div>
              <div class="pagination" id="fuelPagination">
                <button type="button" aria-label="Previous page">
                  <i class="ph ph-caret-left"></i>
                </button>
                <button type="button" class="active" aria-label="Page 1">1</button>
                <button type="button" aria-label="Next page">
                  <i class="ph ph-caret-right"></i>
                </button>
              </div>
            </div>
          </div>
        </section>

    <div id="add-fuel-modal"></div>
    <div id="view-fuel-modal"></div>
    <div id="edit-fuel-modal"></div>
    <div id="delete-fuel-modal"></div>

    <script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js"></script>

    <script src="{{ asset('assets/js/core/toast.js') }}"></script>
    <script src="{{ asset('assets/js/core/auth.js') }}"></script>
    <script src="{{ asset('assets/js/core/main.js') }}"></script>
    <script src="{{ asset('assets/js/components/dropdown.js') }}"></script>
    <script src="{{ asset('assets/js/fuel/fuel-modal.js') }}"></script>
    <script src="{{ asset('assets/js/fuel/fuel-add.js') }}"></script>
    <script src="{{ asset('assets/js/fuel/fuel-view.js') }}"></script>
    <script src="{{ asset('assets/js/fuel/fuel-edit.js') }}"></script>
    <script src="{{ asset('assets/js/fuel/fuel-delete.js') }}"></script>
    <script src="{{ asset('assets/js/fuel/fuel-statistics.js') }}"></script>
    <script src="{{ asset('assets/js/fuel/fuel-sort.js') }}"></script>
    <script src="{{ asset('assets/js/fuel/fuel-pagination.js') }}"></script>
    <script src="{{ asset('assets/js/fuel/fuel-search.js') }}"></script>
    <script src="{{ asset('assets/js/fuel/fuel-bulk.js') }}"></script>
    <script src="{{ asset('assets/js/fuel/fuel-export.js') }}"></script>
    <script src="{{ asset('assets/js/fuel/fuel-print') }}"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>

@endsection