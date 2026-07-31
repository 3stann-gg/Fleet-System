@extends('layouts.app')

@section('title', 'Fleet Dashboard | HIMS Fleet')

@section('content')

        <section class="page-wrapper">
          <div class="dashboard dashboard-page">
            <!-- Executive header -->
            <header class="dashboard-header">
              <div class="dashboard-header-main">
                <p class="dashboard-kicker">Hospital Operations</p>
                <h1>Fleet Dashboard</h1>
                <p class="dashboard-lead">
                  Live overview of vehicle availability, active dispatches, and
                  maintenance status for Tala Hospital fleet operations.
                </p>
              </div>
              <div class="dashboard-header-aside">
                <p class="dashboard-date" id="dashboardDateLabel">
                  Monday, July 13, 2026
                </p>
                <p class="dashboard-identity">Tala Hospital · HIMS Fleet</p>
              </div>
            </header>

            <!-- Overview banner -->
            <section class="dashboard-banner" aria-label="Hospital fleet overview">
              <div class="dashboard-banner-item">
                <span class="dashboard-banner-label">Facility</span>
                <strong>Tala Hospital</strong>
              </div>
              <div class="dashboard-banner-item">
                <span class="dashboard-banner-label">Unit</span>
                <strong>Fleet &amp; Transportation</strong>
              </div>
              <div class="dashboard-banner-item">
                <span class="dashboard-banner-label">Shift focus</span>
                <strong>Operations monitoring</strong>
              </div>
              <div class="dashboard-banner-item">
                <span class="dashboard-banner-label">Status</span>
                <strong class="dashboard-banner-status">Operational</strong>
              </div>
            </section>

            <!-- Primary KPIs -->
            <section class="dashboard-section" aria-labelledby="kpiSectionTitle">
              <div class="dashboard-section-header">
                <div>
                  <h2 id="kpiSectionTitle" class="dashboard-section-title">
                    Primary indicators
                  </h2>
                  <p class="dashboard-section-desc">
                    Current fleet capacity and workload at a glance.
                  </p>
                </div>
              </div>

              <div class="stats-grid dashboard-kpi-grid">
                <article class="stat-card dashboard-kpi">
                  <div class="stat-icon" aria-hidden="true">
                    <i class="ph-fill ph-ambulance"></i>
                  </div>
                  <div class="stat-content">
                    <span class="kpi-label">Available Vehicles</span>
                    <h2 class="kpi-value">28</h2>
                    <div class="kpi-meta">
                      <span class="kpi-trend kpi-trend--steady">Stable</span>
                      <span class="kpi-support">Ready for assignment</span>
                    </div>
                  </div>
                </article>

                <article class="stat-card dashboard-kpi">
                  <div class="stat-icon" aria-hidden="true">
                    <i class="ph-fill ph-truck"></i>
                  </div>
                  <div class="stat-content">
                    <span class="kpi-label">Active Dispatches</span>
                    <h2 class="kpi-value">14</h2>
                    <div class="kpi-meta">
                      <span class="kpi-trend kpi-trend--up">In progress</span>
                      <span class="kpi-support">Trips currently running</span>
                    </div>
                  </div>
                </article>

                <article class="stat-card dashboard-kpi">
                  <div class="stat-icon" aria-hidden="true">
                    <i class="ph-fill ph-user"></i>
                  </div>
                  <div class="stat-content">
                    <span class="kpi-label">Drivers On Duty</span>
                    <h2 class="kpi-value">18</h2>
                    <div class="kpi-meta">
                      <span class="kpi-trend kpi-trend--steady">On shift</span>
                      <span class="kpi-support">Active driver pool</span>
                    </div>
                  </div>
                </article>

                <article class="stat-card dashboard-kpi">
                  <div class="stat-icon" aria-hidden="true">
                    <i class="ph-fill ph-gas-pump"></i>
                  </div>
                  <div class="stat-content">
                    <span class="kpi-label">Fuel Efficiency</span>
                    <h2 class="kpi-value">92%</h2>
                    <div class="kpi-meta">
                      <span class="kpi-trend kpi-trend--steady">Within target</span>
                      <span class="kpi-support">Fleet efficiency index</span>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <!-- Operational analytics -->
            <section class="dashboard-section" aria-labelledby="opsSectionTitle">
              <div class="dashboard-section-header">
                <div>
                  <h2 id="opsSectionTitle" class="dashboard-section-title">
                    Operational analytics
                  </h2>
                  <p class="dashboard-section-desc">
                    Weekly activity trend and today’s dispatch queue.
                  </p>
                </div>
              </div>

              <div class="dashboard-grid">
                <div class="card dashboard-chart analytics-card">
                  <div class="card-header">
                    <div>
                      <h3>Fleet Activity</h3>
                      <p class="card-subtitle">Trip volume for the current week</p>
                    </div>
                    <button type="button" class="btn-filter">
                      This Week
                      <i class="ph ph-caret-down" aria-hidden="true"></i>
                    </button>
                  </div>
                  <div
                    class="chart-placeholder"
                    role="img"
                    aria-label="Bar chart placeholder for weekly fleet activity"
                  >
                    <div class="bar" style="--bar-h: 65%"></div>
                    <div class="bar" style="--bar-h: 85%"></div>
                    <div class="bar" style="--bar-h: 45%"></div>
                    <div class="bar" style="--bar-h: 95%"></div>
                    <div class="bar" style="--bar-h: 75%"></div>
                    <div class="bar" style="--bar-h: 55%"></div>
                    <div class="bar" style="--bar-h: 90%"></div>
                  </div>
                  <div class="chart-legend" aria-hidden="true">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span>
                    <span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                </div>

                <div class="card dispatch-card analytics-card">
                  <div class="card-header">
                    <div>
                      <h3>Today’s Dispatch Queue</h3>
                      <p class="card-subtitle">Priority trips awaiting completion</p>
                    </div>
                    <span class="badge-green">8 Active</span>
                  </div>
                  <div class="dispatch-list">
                    <div class="dispatch-item">
                      <div class="dispatch-dot green" aria-hidden="true"></div>
                      <div class="dispatch-body">
                        <div class="dispatch-row">
                          <strong>Emergency Patient Transfer</strong>
                          <span class="status-chip status-chip--success">Active</span>
                        </div>
                        <small>Ambulance 03 · Juan Dela Cruz</small>
                      </div>
                    </div>
                    <div class="dispatch-item">
                      <div class="dispatch-dot yellow" aria-hidden="true"></div>
                      <div class="dispatch-body">
                        <div class="dispatch-row">
                          <strong>Laboratory Sample Delivery</strong>
                          <span class="status-chip status-chip--warning">En route</span>
                        </div>
                        <small>Van 02 · Maria Santos</small>
                      </div>
                    </div>
                    <div class="dispatch-item">
                      <div class="dispatch-dot red" aria-hidden="true"></div>
                      <div class="dispatch-body">
                        <div class="dispatch-row">
                          <strong>Vehicle Maintenance Pickup</strong>
                          <span class="status-chip status-chip--danger">Urgent</span>
                        </div>
                        <small>Service Vehicle 01</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Fleet status -->
            <section class="dashboard-section" aria-labelledby="statusSectionTitle">
              <div class="dashboard-section-header">
                <div>
                  <h2 id="statusSectionTitle" class="dashboard-section-title">
                    Fleet status
                  </h2>
                  <p class="dashboard-section-desc">
                    Vehicle readiness and maintenance alerts.
                  </p>
                </div>
              </div>

              <div class="dashboard-grid">
                <div class="card analytics-card">
                  <div class="card-header">
                    <div>
                      <h3>Vehicle Status</h3>
                      <p class="card-subtitle">Selected units currently monitored</p>
                    </div>
                    <button type="button" class="btn-filter">View All</button>
                  </div>
                  <div class="table-responsive">
                    <table class="fleet-table">
                      <thead>
                        <tr>
                          <th scope="col">Vehicle</th>
                          <th scope="col">Driver</th>
                          <th scope="col">Status</th>
                          <th scope="col">Fuel</th>
                          <th scope="col"><span class="visually-hidden">Actions</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Ambulance-01</td>
                          <td>Juan Dela Cruz</td>
                          <td><span class="status available">Available</span></td>
                          <td>85%</td>
                          <td>
                            <button type="button" class="table-btn">View</button>
                          </td>
                        </tr>
                        <tr>
                          <td>Van-02</td>
                          <td>Maria Santos</td>
                          <td><span class="status trip">On Trip</span></td>
                          <td>62%</td>
                          <td>
                            <button type="button" class="table-btn">View</button>
                          </td>
                        </tr>
                        <tr>
                          <td>SUV-03</td>
                          <td>Pedro Cruz</td>
                          <td><span class="status maintenance">Maintenance</span></td>
                          <td>40%</td>
                          <td>
                            <button type="button" class="table-btn">View</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="card analytics-card">
                  <div class="card-header">
                    <div>
                      <h3>Maintenance Alerts</h3>
                      <p class="card-subtitle">Service items requiring attention</p>
                    </div>
                  </div>
                  <div class="maintenance-list">
                    <div class="maintenance-item critical">
                      <div class="maintenance-icon" aria-hidden="true">
                        <i class="ph-fill ph-warning-circle"></i>
                      </div>
                      <div class="maintenance-body">
                        <div class="dispatch-row">
                          <strong>Oil Change Due</strong>
                          <span class="status-chip status-chip--danger">Critical</span>
                        </div>
                        <small>Ambulance-01</small>
                      </div>
                    </div>
                    <div class="maintenance-item warning">
                      <div class="maintenance-icon" aria-hidden="true">
                        <i class="ph-fill ph-wrench"></i>
                      </div>
                      <div class="maintenance-body">
                        <div class="dispatch-row">
                          <strong>Brake Inspection</strong>
                          <span class="status-chip status-chip--warning">Due soon</span>
                        </div>
                        <small>Van-02</small>
                      </div>
                    </div>
                    <div class="maintenance-item success">
                      <div class="maintenance-icon" aria-hidden="true">
                        <i class="ph-fill ph-shield-check"></i>
                      </div>
                      <div class="maintenance-body">
                        <div class="dispatch-row">
                          <strong>Insurance Updated</strong>
                          <span class="status-chip status-chip--success">Complete</span>
                        </div>
                        <small>SUV-03</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Activity -->
            <section class="dashboard-section" aria-labelledby="activitySectionTitle">
              <div class="dashboard-section-header">
                <div>
                  <h2 id="activitySectionTitle" class="dashboard-section-title">
                    Coverage &amp; activity
                  </h2>
                  <p class="dashboard-section-desc">
                    Operations map placeholder and recent system activity.
                  </p>
                </div>
              </div>

              <div class="dashboard-grid">
                <div class="card analytics-card">
                  <div class="card-header">
                    <div>
                      <h3>Fleet Operations Map</h3>
                      <p class="card-subtitle">Vehicle location overview</p>
                    </div>
                    <button type="button" class="btn-filter">Overview</button>
                  </div>
                  <div class="map-placeholder">
                    <i class="ph-fill ph-map-trifold" aria-hidden="true"></i>
                    <h4>Map not connected</h4>
                    <p>
                      Live vehicle tracking is not enabled in this frontend build.
                      Dispatch and vehicle lists remain available above.
                    </p>
                  </div>
                </div>

                <div class="card analytics-card">
                  <div class="card-header">
                    <div>
                      <h3>Recent Activity</h3>
                      <p class="card-subtitle">Latest operational events</p>
                    </div>
                  </div>
                  <div class="activity-list">
                    <div class="activity-item">
                      <div class="activity-icon success" aria-hidden="true">
                        <i class="ph-fill ph-check-circle"></i>
                      </div>
                      <div class="activity-body">
                        <strong>Ambulance-01 dispatched</strong>
                        <small>2 minutes ago</small>
                      </div>
                    </div>
                    <div class="activity-item">
                      <div class="activity-icon primary" aria-hidden="true">
                        <i class="ph-fill ph-car"></i>
                      </div>
                      <div class="activity-body">
                        <strong>Vehicle returned to hospital</strong>
                        <small>15 minutes ago</small>
                      </div>
                    </div>
                    <div class="activity-item">
                      <div class="activity-icon warning" aria-hidden="true">
                        <i class="ph-fill ph-user"></i>
                      </div>
                      <div class="activity-body">
                        <strong>Driver Ana logged in</strong>
                        <small>30 minutes ago</small>
                      </div>
                    </div>
                    <div class="activity-item">
                      <div class="activity-icon danger" aria-hidden="true">
                        <i class="ph-fill ph-warning-circle"></i>
                      </div>
                      <div class="activity-body">
                        <strong>Maintenance alert created</strong>
                        <small>1 hour ago</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>

    @push('scripts')
    
    <script src="{{ asset('assets/js/core/pending-action.js') }}"></script>
    <script src="{{ asset('assets/js/components/navbar.js') }}"></script>
    <script src="{{ asset('assets/js/dashboard/dashboard.js') }}"></script>

    @endpush
    
@endsection