/* ==========================================
   Dashboard interactions — navigation only
   No CRUD duplication, no fabricated analytics
========================================== */

let dashboardInitialized = false;

const DASHBOARD_ROUTES = {
    dashboard: "/dashboard",
    vehicles: "/fleet",
    reservations: "/reservation",
    dispatch: "/dispatch",
    drivers: "/driver",
    maintenance: "/maintenance",
    fuel: "/fuel",
    routes: "/route-planning",
    cost: "/cost-analysis",
    reports: "/reports",
    settings: "/settings",
};

function dashboardToast(message, type) {
    if (typeof ensureToastHost === "function") ensureToastHost();
    if (typeof showToast === "function") {
        showToast(message, type || "info");
    }
}

function dashboardGo(url) {
    if (!url) return;
    window.location.href = url;
}

function updateDashboardDateLabel() {
    const el = document.getElementById("dashboardDateLabel");
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function makeDashboardItemInteractive(el, label, onActivate) {
    if (!el || el.dataset.dashInteractive === "true") return;
    el.dataset.dashInteractive = "true";
    el.classList.add("dashboard-interactive");
    if (!el.getAttribute("tabindex")) el.setAttribute("tabindex", "0");
    if (!el.getAttribute("role")) el.setAttribute("role", "link");
    if (label && !el.getAttribute("aria-label")) {
        el.setAttribute("aria-label", label);
    }
    el.addEventListener("click", (e) => {
        if (e.target.closest("button, a")) return;
        onActivate();
    });
    el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onActivate();
        }
    });
}

function initDashboardHeaderControls() {
    /* Date is informational; keep live calendar date */
    updateDashboardDateLabel();
}

function initDashboardChartControls() {
    const periodBtn = document.querySelector(".dashboard-chart .btn-filter");

    if (!periodBtn || periodBtn.dataset.dashBound === "true") {
        return;
    }
    periodBtn.dataset.dashBound = "true";
    periodBtn.title = "Current week fleet activity";
    periodBtn.addEventListener("click", (e) => {
        e.preventDefault();
        dashboardToast(
            "Fleet Activity shows this week’s sample view. Open Reports for full analytics.",
            "info",
        );
    });
}

function initDashboardVehicleStatus() {
    const viewAll = document.querySelector(
        ".dashboard-section .analytics-card .btn-filter",
    );
    /* First "View All" in fleet status vehicle card */
    document.querySelectorAll(".dashboard-page .btn-filter").forEach((btn) => {
        if (btn.dataset.dashBound === "true") return;
        const label = (btn.textContent || "").replace(/\s+/g, " ").trim();
        if (label === "View All") {
            btn.dataset.dashBound = "true";
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                dashboardGo(DASHBOARD_ROUTES.vehicles);
            });
        } else if (label === "Overview") {
            btn.dataset.dashBound = "true";
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                dashboardToast(
                    "Live map is not connected. Opening Dispatch for active trips.",
                    "info",
                );
                setTimeout(() => dashboardGo(DASHBOARD_ROUTES.dispatch), 250);
            });
        }
    });

    document.querySelectorAll(".dashboard-page .table-btn").forEach((btn) => {
        if (btn.dataset.dashBound === "true") return;
        btn.dataset.dashBound = "true";
        const row = btn.closest("tr");
        const vehicleName = row?.querySelector("td")?.textContent?.trim() || "";
        btn.setAttribute(
            "aria-label",
            vehicleName
                ? "View " + vehicleName + " in Vehicles"
                : "View vehicle",
        );
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            dashboardGo(DASHBOARD_ROUTES.vehicles);
        });
    });
}

function initDashboardDispatchQueue() {
    document
        .querySelectorAll(".dashboard-page .dispatch-item")
        .forEach((item) => {
            const title =
                item.querySelector("strong")?.textContent?.trim() ||
                "Dispatch item";
            makeDashboardItemInteractive(
                item,
                "Open Dispatch: " + title,
                () => {
                    dashboardGo(DASHBOARD_ROUTES.dispatch);
                },
            );
        });

    const badge = document.querySelector(
        ".dashboard-page .dispatch-card .badge-green",
    );
    if (badge && badge.dataset.dashBound !== "true") {
        badge.dataset.dashBound = "true";
        badge.setAttribute("role", "link");
        badge.setAttribute("tabindex", "0");
        badge.setAttribute("aria-label", "View active dispatches");
        badge.classList.add("dashboard-interactive");
        const go = () => dashboardGo(DASHBOARD_ROUTES.dispatch);
        badge.addEventListener("click", go);
        badge.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                go();
            }
        });
    }
}

function initDashboardMaintenanceAlerts() {
    document
        .querySelectorAll(".dashboard-page .maintenance-item")
        .forEach((item) => {
            const title =
                item.querySelector("strong")?.textContent?.trim() ||
                "Maintenance alert";
            makeDashboardItemInteractive(
                item,
                "Open Maintenance: " + title,
                () => {
                    dashboardGo(DASHBOARD_ROUTES.maintenance);
                },
            );
        });
}

function initDashboardActivity() {
    document
        .querySelectorAll(".dashboard-page .activity-item")
        .forEach((item) => {
            const text =
                item.querySelector("strong")?.textContent?.trim() || "Activity";
            const href = item.dataset.href || "";

            if (!href) {
                return;
            }
            makeDashboardItemInteractive(
                item,
                "Open related module: " + text,
                () => {
                    dashboardGo(href);
                },
            );
        });
}

/**
 * KPI cards are not visually button-like; leave non-interactive
 * per design guidance unless future design adds affordances.
 */
function initDashboardKpiCards() {
    /* intentional no-op: plain metric cards */
}

function initDashboardPage() {
    if (dashboardInitialized) return;
    if (!document.querySelector(".dashboard-page")) return;
    dashboardInitialized = true;

    try {
        if (typeof ensureToastHost === "function") ensureToastHost();
        if (
            typeof initToast === "function" &&
            typeof window.showToast !== "function"
        ) {
            initToast();
        }

        initDashboardHeaderControls();
        initDashboardChartControls();
        initDashboardVehicleStatus();
        initDashboardDispatchQueue();
        initDashboardMaintenanceAlerts();
        initDashboardActivity();
        initDashboardKpiCards();
    } catch (error) {
        console.error("Dashboard init failed:", error);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDashboardPage);
} else {
    initDashboardPage();
}