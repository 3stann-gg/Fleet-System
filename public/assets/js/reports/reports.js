/* ==========================================
   Reports page initialization
========================================== */

let reportsPageInitialized = false;

function populateReportVehicleFilter(sources) {
  const select = document.getElementById("reportVehicleFilter");
  if (!select) return;

  const current = select.value || "all";
  const names = Array.from(
    new Set((sources.vehicles || []).map((v) => v.name).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));

  select.innerHTML =
    '<option value="all">All Vehicles</option>' +
    names.map((n) => `<option value="${n}">${n}</option>`).join("");

  if ([...select.options].some((o) => o.value === current)) {
    select.value = current;
  }
}

function populateReportDepartmentFilter(sources) {
  const select = document.getElementById("reportDepartmentFilter");
  if (!select) return;

  const current = select.value || "all";
  const depts = new Set();
  (sources.vehicles || []).forEach((v) => v.department && depts.add(v.department));
  (sources.reservations || []).forEach(
    (r) => r.department && depts.add(r.department),
  );

  const names = Array.from(depts).sort((a, b) => a.localeCompare(b));
  select.innerHTML =
    '<option value="all">All Departments</option>' +
    names.map((n) => `<option value="${n}">${n}</option>`).join("");

  if ([...select.options].some((o) => o.value === current)) {
    select.value = current;
  }
}

function syncCustomDateInputs() {
  const preset = document.getElementById("reportDateRange")?.value;
  const start = document.getElementById("reportStartDate");
  const end = document.getElementById("reportEndDate");
  const wrap = document.getElementById("reportCustomDateWrap");
  const isCustom = preset === "custom";

  if (wrap) wrap.hidden = !isCustom;
  if (start) {
    start.disabled = !isCustom;
    start.required = isCustom;
  }
  if (end) {
    end.disabled = !isCustom;
    end.required = isCustom;
  }
}

function initReportsPage() {
  if (reportsPageInitialized) return;
  if (!document.getElementById("reportsPage")) return;

  reportsPageInitialized = true;

  if (typeof initReportsTable === "function") {
    initReportsTable();
  }

  /* Seed sources once for filter option population */
  if (typeof getAllReportsSourceData === "function") {
    const sources = getAllReportsSourceData();
    populateReportVehicleFilter(sources);
    populateReportDepartmentFilter(sources);
  }

  syncCustomDateInputs();

  const onFilterChange = () => {
    syncCustomDateInputs();
    if (typeof refreshReportsDashboard === "function") {
      refreshReportsDashboard({ resetTablePage: true, reason: "filter" });
    }
  };

  [
    "reportDateRange",
    "reportStartDate",
    "reportEndDate",
    "reportVehicleFilter",
    "reportDepartmentFilter",
    "reportTypeFilter",
  ].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", onFilterChange);
  });

  document.getElementById("refreshReports")?.addEventListener("click", () => {
    if (typeof getAllReportsSourceData === "function") {
      const sources = getAllReportsSourceData();
      populateReportVehicleFilter(sources);
      populateReportDepartmentFilter(sources);
    }
    if (typeof refreshReportsDashboard === "function") {
      refreshReportsDashboard({
        resetTablePage: false,
        refreshSources: true,
        reason: "refresh",
      });
    }
    if (typeof showToast === "function") {
      showToast("Reports refreshed.", "success");
    }
  });

  if (typeof initReportPresets === "function") {
    initReportPresets();
  }

  if (typeof initReportsExport === "function") {
    initReportsExport();
  }

  if (typeof refreshReportsDashboard === "function") {
    refreshReportsDashboard({
      resetTablePage: true,
      refreshSources: true,
      reason: "init",
    });
  }
}

/* Auto-init when DOM is ready (include.js may also call) */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    /* include.js handles after components; keep as fallback for partial loads */
  });
}
