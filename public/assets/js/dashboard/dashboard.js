/* ==========================================
   Dashboard interactions — navigation only
   No CRUD duplication, no fabricated analytics
========================================== */

//   RBAC
function getDashboardPermissions() {
    return window.FLEET_RBAC?.dashboard || {};
}
function canDashboardOpen(permission) {
    return getDashboardPermissions()?.[permission] === true;
}

let dashboardFleetMap = null;
let dashboardDispatchMarkerLayer = null;

function getDashboardMapDispatches() {
    return Array.isArray(window.DASHBOARD_MAP_DISPATCHES)
        ? window.DASHBOARD_MAP_DISPATCHES
        : [];
}
function escapeDashboardMapHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

const DASHBOARD_GEOCODE_CACHE_KEY = "himsFleetDashboardGeocodeCache";

function readDashboardGeocodeCache() {
    try {
        return JSON.parse(
            sessionStorage.getItem(DASHBOARD_GEOCODE_CACHE_KEY) || "{}",
        );
    } catch {
        return {};
    }
}

function writeDashboardGeocodeCache(cache) {
    try {
        sessionStorage.setItem(
            DASHBOARD_GEOCODE_CACHE_KEY,
            JSON.stringify(cache),
        );
    } catch {
        // Ignore storage failure.
    }
}
async function geocodeDashboardLocation(address) {
    const normalized = String(address || "").trim();
    if (!normalized) {
        return null;
    }
    const cache = readDashboardGeocodeCache();
    const cacheKey = normalized.toLowerCase();
    if (cache[cacheKey]) {
        return cache[cacheKey];
    }
    const query = encodeURIComponent(`${normalized}, Philippines`);
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ph&q=${query}`,
        {
            headers: {
                Accept: "application/json",
            },
        },
    );
    if (!response.ok) {
        return null;
    }
    const results = await response.json();
    if (!Array.isArray(results) || results.length === 0) {
        return null;
    }
    const result = {
        lat: Number(results[0].lat),
        lng: Number(results[0].lon),
        displayName: results[0].display_name || normalized,
    };
    if (!Number.isFinite(result.lat) || !Number.isFinite(result.lng)) {
        return null;
    }
    cache[cacheKey] = result;
    writeDashboardGeocodeCache(cache);
    return result;
}

async function loadDashboardDispatchMarkers() {
    if (!dashboardFleetMap || typeof L === "undefined") {
        return;
    }
    const dispatches = getDashboardMapDispatches();
    if (dashboardDispatchMarkerLayer) {
        dashboardDispatchMarkerLayer.clearLayers();
    } else {
        dashboardDispatchMarkerLayer = L.layerGroup().addTo(dashboardFleetMap);
    }
    if (!dispatches.length) {
        return;
    }
    /*
    |--------------------------------------------------------------------------
    | Keep public geocoding usage light
    |--------------------------------------------------------------------------
    |
    | Dashboard queue is intentionally limited.
    |--------------------------------------------------------------------------
    */
    const dispatchesToMap = dispatches.slice(0, 5);
    const bounds = [];
    for (const dispatch of dispatchesToMap) {
        const pickup = await geocodeDashboardLocation(dispatch.pickup);
        /*
        |--------------------------------------------------------------------------
        | Small delay between uncached public geocoding requests
        |--------------------------------------------------------------------------
        */
        if (pickup) {
            const pickupMarker = L.marker([pickup.lat, pickup.lng]).addTo(
                dashboardDispatchMarkerLayer,
            ).bindPopup(`
                        <strong>
                            ${escapeDashboardMapHtml(
                                dispatch.dispatch_number || "Dispatch",
                            )}
                        </strong>
                        <br>
                        <strong>Pickup:</strong>
                        ${escapeDashboardMapHtml(dispatch.pickup || "—")}
                        <br>
                        <strong>Status:</strong>
                        ${escapeDashboardMapHtml(dispatch.status || "—")}
                        ${
                            dispatch.vehicle
                                ? `
                                    <br>
                                    <strong>Vehicle:</strong>
                                    ${escapeDashboardMapHtml(dispatch.vehicle)}
                                `
                                : ""
                        }
                        ${
                            dispatch.driver
                                ? `
                                    <br>
                                    <strong>Driver:</strong>
                                    ${escapeDashboardMapHtml(dispatch.driver)}
                                `
                                : ""
                        }
                    `);
            bounds.push([pickup.lat, pickup.lng]);
        }
        await dashboardSleep(1100);
        const destination = await geocodeDashboardLocation(
            dispatch.destination,
        );
        if (destination) {
            L.marker([destination.lat, destination.lng]).addTo(
                dashboardDispatchMarkerLayer,
            ).bindPopup(`
                    <strong>
                        ${escapeDashboardMapHtml(
                            dispatch.dispatch_number || "Dispatch",
                        )}
                    </strong>
                    <br>
                    <strong>Destination:</strong>
                    ${escapeDashboardMapHtml(dispatch.destination || "—")}
                `);
            bounds.push([destination.lat, destination.lng]);
        }
    }
    await dashboardSleep(1100);
    if (bounds.length > 0) {
        dashboardFleetMap.fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: 14,
        });
    }
}
function dashboardSleep(ms) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

function initDashboardFleetMap() {
    const mapElement = document.getElementById("fleetOperationsMap");
    if (!mapElement) {
        return;
    }
    if (typeof L === "undefined") {
        console.error("Leaflet is not available on the dashboard.");

        return;
    }
    if (dashboardFleetMap) {
        dashboardFleetMap.invalidateSize();
        return;
    }
    /*
    |--------------------------------------------------------------------------
    | Tala Hospital base location
    |--------------------------------------------------------------------------
    |
    | Replace these coordinates with the exact Tala Hospital coordinates
    | once confirmed.
    |
    */
    const hospitalLatitude = 14.7707;
    const hospitalLongitude = 121.0659;

    dashboardFleetMap = L.map("fleetOperationsMap", {
        zoomControl: true,
        scrollWheelZoom: false,
    }).setView([hospitalLatitude, hospitalLongitude], 15);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(dashboardFleetMap);

    const hospitalMarker = L.marker([
        hospitalLatitude,
        hospitalLongitude,
    ]).addTo(dashboardFleetMap).bindPopup(`
            <strong>Tala Hospital / DJNRMHS</strong>
            <br>
            Dr. Uyguangco Avenue, Tala, Caloocan
        `);

    hospitalMarker.openPopup();
    /*
    |--------------------------------------------------------------------------
    | Fix map sizing after card/layout rendering
    |--------------------------------------------------------------------------
    */
    window.setTimeout(() => {
        dashboardFleetMap?.invalidateSize();
    }, 150);

    loadDashboardDispatchMarkers().catch((error) => {
        console.error("Unable to load dashboard dispatch markers:", error);
    });
}

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
            "Fleet Activity shows this week’s dispatch activity. Open Reports for detailed analytics.",
            "info",
        );
    });
}

function initDashboardVehicleStatus() {
    document.querySelectorAll(".dashboard-page .btn-filter").forEach((btn) => {
        if (btn.dataset.dashBound === "true") {
            return;
        }
        const label = (btn.textContent || "").replace(/\s+/g, " ").trim();
        if (label === "View All") {
            btn.dataset.dashBound = "true";

            if (!canDashboardOpen("canOpenVehicles")) {
                btn.hidden = true;
                return;
            }
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                dashboardGo(DASHBOARD_ROUTES.vehicles);
            });
        } else if (label === "Dispatches") {
            btn.dataset.dashBound = "true";
            if (!canDashboardOpen("canOpenDispatch")) {
                btn.hidden = true;
                return;
            }
            btn.addEventListener("click", (e) => {
                e.preventDefault();

                dashboardGo(DASHBOARD_ROUTES.dispatch);
            });
        }
    });
    document.querySelectorAll(".dashboard-page .table-btn").forEach((btn) => {
        if (btn.dataset.dashBound === "true") {
            return;
        }
        btn.dataset.dashBound = "true";
        if (!canDashboardOpen("canOpenVehicles")) {
            btn.hidden = true;
            return;
        }
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
    if (!canDashboardOpen("canOpenDispatch")) {
        return;
    }
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
    if (!canDashboardOpen("canOpenMaintenance")) {
        return;
    }
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

function canOpenDashboardActivityHref(href) {
    if (!href) {
        return false;
    }
    if (href.startsWith(DASHBOARD_ROUTES.vehicles)) {
        return canDashboardOpen("canOpenVehicles");
    }
    if (href.startsWith(DASHBOARD_ROUTES.dispatch)) {
        return canDashboardOpen("canOpenDispatch");
    }
    if (href.startsWith(DASHBOARD_ROUTES.maintenance)) {
        return canDashboardOpen("canOpenMaintenance");
    }
    return true;
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
            if (!canOpenDashboardActivityHref(href)) {
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
        initDashboardFleetMap();
    } catch (error) {
        console.error("Dashboard init failed:", error);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDashboardPage);
} else {
    initDashboardPage();
}