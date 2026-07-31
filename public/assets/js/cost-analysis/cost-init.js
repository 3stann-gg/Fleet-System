/* ==========================================
   Cost Analysis page initialization
========================================== */

let costAnalysisPageInitialized = false;

function syncCostCustomDates() {
  const preset = document.getElementById("costDateRange")?.value;
  const wrap = document.getElementById("costCustomDateWrap");
  const start = document.getElementById("costStartDate");
  const end = document.getElementById("costEndDate");
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

function initCostAnalysisPage() {
  if (costAnalysisPageInitialized) return;
  if (!document.getElementById("costAnalysisPage")) return;
  costAnalysisPageInitialized = true;

  if (typeof initCostTable === "function") {
    initCostTable();
  }

  if (typeof initCostBudgetControls === "function") {
    initCostBudgetControls();
  }

  if (typeof initCostAnalysisPresets === "function") {
    initCostAnalysisPresets();
  }

  if (typeof initCostAnalysisExport === "function") {
    initCostAnalysisExport();
  }

  syncCostCustomDates();

  const onFilter = () => {
    syncCostCustomDates();
    if (typeof refreshCostAnalysis === "function") {
      refreshCostAnalysis({ resetTablePage: true, reason: "filter" });
    }
  };

  [
    "costDateRange",
    "costStartDate",
    "costEndDate",
    "costVehicleFilter",
    "costDepartmentFilter",
    "costCategoryFilter",
    "costAnalysisView",
  ].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", onFilter);
  });

  document.getElementById("refreshCostAnalysis")?.addEventListener("click", () => {
    if (typeof refreshCostAnalysis === "function") {
      refreshCostAnalysis({
        resetTablePage: false,
        refreshSources: true,
        reason: "refresh",
      });
    }
    if (typeof showToast === "function") {
      showToast("Cost analysis refreshed.", "success");
    }
  });

  if (typeof refreshCostAnalysis === "function") {
    refreshCostAnalysis({
      resetTablePage: true,
      refreshSources: true,
      reason: "init",
    });
  }
}
