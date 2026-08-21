/* ==========================================
   Cost Analysis page initialization
========================================== */

let costAnalysisPageInitialized = false;

/* ==========================================
   CUSTOM DATE RANGE
========================================== */

function syncCostCustomDates() {
    const preset = document.getElementById("costDateRange")?.value;
    const wrap = document.getElementById("costCustomDateWrap");
    const start = document.getElementById("costStartDate");
    const end = document.getElementById("costEndDate");
    const isCustom = preset === "custom";

    if (wrap) {
        wrap.hidden = !isCustom;
    }
    if (start) {
        start.disabled = !isCustom;
        start.required = isCustom;
    }
    if (end) {
        end.disabled = !isCustom;
        end.required = isCustom;
    }
}

/* ==========================================
   REFRESH BUTTON STATE
========================================== */

function setCostRefreshLoading(loading) {
    const button = document.getElementById("refreshCostAnalysis");
    if (!button) {
        return;
    }
    button.disabled = loading;
    button.innerHTML = loading
        ? `
            <i class="ph ph-spinner"></i>
            Refreshing...
        `
        : `
            <i class="ph ph-arrows-clockwise"></i>
            Refresh
        `;
}

/* ==========================================
   PAGE INITIALIZATION
========================================== */

async function initCostAnalysisPage() {
    if (costAnalysisPageInitialized) {
        return;
    }
    if (!document.getElementById("costAnalysisPage")) {
        return;
    }

    costAnalysisPageInitialized = true;

    /*
    |--------------------------------------------------------------------------
    | Initialize Components
    |--------------------------------------------------------------------------
    */

    if (typeof initCostTable === "function") {
        initCostTable();
    }
    if (typeof initCostBudgetControls === "function") {
        await initCostBudgetControls();
    }
    if (typeof initCostAnalysisPresets === "function") {
        initCostAnalysisPresets();
    }
    if (typeof initCostAnalysisExport === "function") {
        initCostAnalysisExport();
    }

    syncCostCustomDates();

    /*
    |--------------------------------------------------------------------------
    | Main Analysis Filters
    |--------------------------------------------------------------------------
    */

    const onFilter = async () => {
        syncCostCustomDates();

        if (typeof refreshCostAnalysis !== "function") {
            return;
        }

        await refreshCostAnalysis({
            resetTablePage: true,
            reason: "filter",
        });
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

    /*
    |--------------------------------------------------------------------------
    | Manual Refresh
    |--------------------------------------------------------------------------
    */

    document
        .getElementById("refreshCostAnalysis")
        ?.addEventListener("click", async () => {
            if (typeof refreshCostAnalysis !== "function") {
                return;
            }
            setCostRefreshLoading(true);
            try {
                await refreshCostAnalysis({
                    resetTablePage: false,
                    refreshSources: true,
                    reason: "refresh",
                });
                if (typeof showToast === "function") {
                    showToast("Cost analysis refreshed.", "success");
                }
            } catch (error) {
                console.error("Unable to refresh Cost Analysis:", error);

                if (typeof showToast === "function") {
                    showToast(
                        error.message || "Unable to refresh Cost Analysis.",
                        "error",
                    );
                }
            } finally {
                setCostRefreshLoading(false);
            }
        });

    /*
    |--------------------------------------------------------------------------
    | Initial Database Load
    |--------------------------------------------------------------------------
    */

    if (typeof refreshCostAnalysis === "function") {
        setCostRefreshLoading(true);

        try {
            await refreshCostAnalysis({
                resetTablePage: true,
                refreshSources: true,
                reason: "init",
            });
        } catch (error) {
            console.error("Unable to initialize Cost Analysis:", error);

            if (typeof showToast === "function") {
                showToast(
                    error.message || "Unable to load Cost Analysis data.",
                    "error",
                );
            }
        } finally {
            setCostRefreshLoading(false);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initCostAnalysisPage();
});
