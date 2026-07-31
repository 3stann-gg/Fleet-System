/* ==========================================
   Route Planning store + localStorage persistence
========================================== */

const HIMS_FLEET_ROUTES_KEY = "himsFleetRoutes";
const HIMS_FLEET_ROUTE_TEMPLATES_KEY = "himsFleetRouteTemplates";
const ROUTE_TEMPLATES_MAX = 30;

const ROUTE_VEHICLES = [
  "Ambulance 01",
  "Ambulance 03",
  "Patient Van 02",
  "Service Vehicle 04",
  "Van 02",
  "Van 05",
  "SUV 03",
];

const ROUTE_DRIVERS = [
  "Juan Dela Cruz",
  "Maria Santos",
  "Pedro Reyes",
  "Ana Lopez",
  "Carlos Rivera",
];

const ROUTE_DEPARTMENTS = [
  "Emergency",
  "Outpatient",
  "Laboratory",
  "Facilities",
  "Admin",
  "Logistics",
];

/** @type {Array<Object>} */
let routePlanningRecords = [];

function cloneRouteRecord(record) {
  return {
    ...record,
    stops: Array.isArray(record.stops) ? record.stops.slice() : [],
    statusHistory: Array.isArray(record.statusHistory)
      ? record.statusHistory.map((h) => ({ ...h }))
      : [],
  };
}

function normalizeRouteRecord(raw, index) {
  if (!raw || typeof raw !== "object") return null;

  const now = new Date().toISOString();
  const id =
    String(raw.id || "").trim() ||
    "route-migrated-" + index + "-" + Date.now().toString(36);
  const status = String(raw.status || "Draft").trim() || "Draft";
  const createdAt = raw.createdAt || now;
  const updatedAt = raw.updatedAt || createdAt;

  let statusHistory = Array.isArray(raw.statusHistory)
    ? raw.statusHistory
        .filter((h) => h && h.status)
        .map((h) => ({
          status: String(h.status),
          at: h.at || createdAt,
          note: h.note ? String(h.note) : "",
        }))
    : [];

  if (statusHistory.length === 0) {
    statusHistory = [{ status, at: createdAt, note: "Created" }];
  }

  return {
    id,
    routeNumber: String(raw.routeNumber || "RTE-UNKNOWN").trim(),
    origin: String(raw.origin || "").trim(),
    destination: String(raw.destination || "").trim(),
    stops: Array.isArray(raw.stops)
      ? raw.stops.map((s) => String(s || "").trim()).filter(Boolean)
      : [],
    vehicle: String(raw.vehicle || "").trim(),
    driver: String(raw.driver || "").trim(),
    priority: String(raw.priority || "Medium").trim(),
    department: String(raw.department || "").trim(),
    purpose: String(raw.purpose || "").trim(),
    estimatedDistance: Number(raw.estimatedDistance) || 0,
    estimatedTravelTime: String(raw.estimatedTravelTime || "").trim(),
    estimatedTravelTimeMinutes: Number(raw.estimatedTravelTimeMinutes) || 0,
    optimizationStrategy: String(raw.optimizationStrategy || "").trim(),
    optimizationScore:
      raw.optimizationScore == null ? null : Number(raw.optimizationScore),
    status,
    departureDate: String(raw.departureDate || "").trim(),
    departureTime: String(raw.departureTime || "").trim(),
    notes: String(raw.notes || "").trim(),
    createdAt,
    updatedAt,
    statusHistory,
    _order: raw._order != null ? Number(raw._order) : index,
  };
}

function persistRoutePlanningRecords() {
  try {
    const payload = routePlanningRecords.map((r) => {
      const clone = cloneRouteRecord(r);
      delete clone._order;
      return clone;
    });
    localStorage.setItem(HIMS_FLEET_ROUTES_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error("Unable to persist routes:", error);
    return false;
  }
}

function loadRoutePlanningFromStorage() {
  try {
    const raw = localStorage.getItem(HIMS_FLEET_ROUTES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed
      .map((item, index) => normalizeRouteRecord(item, index))
      .filter(Boolean);
  } catch (error) {
    console.error("Malformed himsFleetRoutes storage:", error);
    return null;
  }
}

function getAllRouteRecords(options = {}) {
  const includeArchived = options.includeArchived === true;
  return routePlanningRecords
    .filter((r) => includeArchived || r.status !== "Archived")
    .map(cloneRouteRecord);
}

function getRouteRecordById(id) {
  const key = String(id || "").trim();
  const found = routePlanningRecords.find((r) => r.id === key);
  return found ? cloneRouteRecord(found) : null;
}

function appendStatusHistory(record, status, note) {
  const history = Array.isArray(record.statusHistory)
    ? record.statusHistory.slice()
    : [];
  const last = history[history.length - 1];
  if (last && last.status === status && !note) {
    return history;
  }
  history.push({
    status,
    at: new Date().toISOString(),
    note: note || "",
  });
  return history;
}

function upsertRouteRecord(record, options = {}) {
  const index = routePlanningRecords.findIndex((r) => r.id === record.id);
  const next = cloneRouteRecord(record);

  if (!Array.isArray(next.statusHistory) || next.statusHistory.length === 0) {
    next.statusHistory = [
      {
        status: next.status || "Draft",
        at: next.createdAt || new Date().toISOString(),
        note: "Created",
      },
    ];
  }

  if (index >= 0) {
    const prev = routePlanningRecords[index];
    if (prev.status !== next.status) {
      next.statusHistory = appendStatusHistory(
        { statusHistory: prev.statusHistory },
        next.status,
        options.statusNote || "Status changed",
      );
    } else {
      next.statusHistory = prev.statusHistory
        ? prev.statusHistory.map((h) => ({ ...h }))
        : next.statusHistory;
    }
    if (options.forceHistoryNote) {
      next.statusHistory = appendStatusHistory(
        next,
        next.status,
        options.forceHistoryNote,
      );
    }
    routePlanningRecords[index] = next;
  } else {
    if (!next.statusHistory.length) {
      next.statusHistory = [
        {
          status: next.status || "Draft",
          at: next.createdAt || new Date().toISOString(),
          note: "Created",
        },
      ];
    }
    routePlanningRecords.unshift(next);
  }

  persistRoutePlanningRecords();
  return cloneRouteRecord(next);
}

function removeRouteRecord(id) {
  const key = String(id || "").trim();
  const before = routePlanningRecords.length;
  routePlanningRecords = routePlanningRecords.filter((r) => r.id !== key);
  if (routePlanningRecords.length < before) {
    persistRoutePlanningRecords();
    return true;
  }
  return false;
}

function archiveRouteRecord(id) {
  const existing = getRouteRecordById(id);
  if (!existing) return null;
  return upsertRouteRecord(
    {
      ...existing,
      status: "Archived",
      updatedAt: new Date().toISOString(),
    },
    { statusNote: "Archived" },
  );
}

function restoreRouteRecord(id) {
  const existing = getRouteRecordById(id);
  if (!existing || existing.status !== "Archived") return null;
  return upsertRouteRecord(
    {
      ...existing,
      status: "Planned",
      updatedAt: new Date().toISOString(),
    },
    { statusNote: "Restored from archive" },
  );
}

function duplicateRouteRecord(id) {
  const existing = getRouteRecordById(id);
  if (!existing) return null;
  const now = new Date().toISOString();
  return upsertRouteRecord({
    ...existing,
    id: generateRouteInternalId(),
    routeNumber: generateRouteNumber(),
    status: "Draft",
    createdAt: now,
    updatedAt: now,
    statusHistory: [{ status: "Draft", at: now, note: "Duplicated from " + existing.routeNumber }],
    _order: undefined,
  });
}

function generateRouteInternalId() {
  return (
    "route-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}

function generateRouteNumber() {
  const year = new Date().getFullYear();
  let maxSeq = 0;
  routePlanningRecords.forEach((r) => {
    const match = String(r.routeNumber || "").match(/RTE-(\d{4})-(\d+)/i);
    if (match) {
      const seq = Number.parseInt(match[2], 10);
      if (!Number.isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }
  });
  return "RTE-" + year + "-" + String(maxSeq + 1).padStart(4, "0");
}

/**
 * Simulated route optimization (frontend only — not live maps/traffic).
 */
function simulateRouteOptimization(input) {
  const stops = Array.isArray(input.stops)
    ? input.stops.filter((s) => String(s || "").trim())
    : [];
  const stopCount = stops.length;
  const priority = String(input.priority || "Medium");

  const seed =
    String(input.origin || "").length * 7 +
    String(input.destination || "").length * 11 +
    stopCount * 13 +
    priority.length * 3;

  let distance = 4 + (seed % 28) + stopCount * 2.4;
  distance = Math.round(distance * 10) / 10;

  let strategy = "Balanced";
  let score = 78;
  let speedKmh = 28;

  if (priority === "Emergency") {
    strategy = "Fastest";
    speedKmh = 42;
    score = 94;
    distance = Math.round(distance * 0.92 * 10) / 10;
  } else if (priority === "High") {
    strategy = "Shortest";
    speedKmh = 34;
    score = 88;
    distance = Math.round(distance * 0.96 * 10) / 10;
  } else if (priority === "Low") {
    strategy = "Economy";
    speedKmh = 24;
    score = 72;
    distance = Math.round(distance * 1.05 * 10) / 10;
  }

  const hours = distance / speedKmh;
  const totalMinutes = Math.max(8, Math.round(hours * 60) + stopCount * 4);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const travelLabel =
    h > 0 ? h + "h " + String(m).padStart(2, "0") + "m" : m + " min";

  const recommendedVehicle =
    input.vehicle ||
    (priority === "Emergency" || priority === "High"
      ? "Ambulance 01"
      : "Van 02");
  const recommendedDriver =
    input.driver ||
    (priority === "Emergency" ? "Juan Dela Cruz" : "Pedro Reyes");

  return {
    estimatedDistance: distance,
    estimatedTravelTimeMinutes: totalMinutes,
    estimatedTravelTime: travelLabel,
    optimizationStrategy: strategy,
    optimizationScore: score,
    recommendedVehicle,
    recommendedDriver,
    stopCount,
    isSimulated: true,
  };
}

function getRouteSampleSeed() {
  return [
    {
      id: "route-sample-001",
      routeNumber: "RTE-2026-0001",
      origin: "Emergency Room",
      destination: "Imaging Center",
      stops: ["Triage Desk"],
      vehicle: "Ambulance 03",
      driver: "Juan Dela Cruz",
      priority: "Emergency",
      department: "Emergency",
      purpose: "Critical patient transfer",
      estimatedDistance: 4.2,
      estimatedTravelTime: "12 min",
      estimatedTravelTimeMinutes: 12,
      optimizationStrategy: "Fastest",
      optimizationScore: 94,
      status: "Ready For Dispatch",
      departureDate: "2026-07-20",
      departureTime: "09:00",
      notes: "Priority corridor preferred",
      createdAt: "2026-07-18T08:00:00.000Z",
      updatedAt: "2026-07-18T08:30:00.000Z",
      statusHistory: [
        { status: "Draft", at: "2026-07-18T08:00:00.000Z", note: "Created" },
        {
          status: "Planned",
          at: "2026-07-18T08:15:00.000Z",
          note: "Optimized",
        },
        {
          status: "Ready For Dispatch",
          at: "2026-07-18T08:30:00.000Z",
          note: "Approved",
        },
      ],
    },
    {
      id: "route-sample-002",
      routeNumber: "RTE-2026-0002",
      origin: "Main Lobby",
      destination: "Outpatient Clinic",
      stops: ["Pharmacy", "Lab Reception"],
      vehicle: "Van 02",
      driver: "Pedro Reyes",
      priority: "Medium",
      department: "Outpatient",
      purpose: "Clinic shuttle",
      estimatedDistance: 6.5,
      estimatedTravelTime: "28 min",
      estimatedTravelTimeMinutes: 28,
      optimizationStrategy: "Balanced",
      optimizationScore: 78,
      status: "Planned",
      departureDate: "2026-07-19",
      departureTime: "14:00",
      notes: "",
      createdAt: "2026-07-17T10:00:00.000Z",
      updatedAt: "2026-07-17T10:00:00.000Z",
      statusHistory: [
        { status: "Draft", at: "2026-07-17T09:45:00.000Z", note: "Created" },
        { status: "Planned", at: "2026-07-17T10:00:00.000Z", note: "Saved" },
      ],
    },
    {
      id: "route-sample-003",
      routeNumber: "RTE-2026-0003",
      origin: "Ward B",
      destination: "Dialysis Center",
      stops: [],
      vehicle: "Patient Van 02",
      driver: "Carlos Rivera",
      priority: "High",
      department: "Outpatient",
      purpose: "Scheduled dialysis transport",
      estimatedDistance: 3.1,
      estimatedTravelTime: "15 min",
      estimatedTravelTimeMinutes: 15,
      optimizationStrategy: "Shortest",
      optimizationScore: 88,
      status: "Ready For Dispatch",
      departureDate: "2026-07-21",
      departureTime: "07:30",
      notes: "Wheelchair required",
      createdAt: "2026-07-16T09:00:00.000Z",
      updatedAt: "2026-07-16T11:00:00.000Z",
      statusHistory: [
        { status: "Draft", at: "2026-07-16T09:00:00.000Z", note: "Created" },
        {
          status: "Ready For Dispatch",
          at: "2026-07-16T11:00:00.000Z",
          note: "Ready",
        },
      ],
    },
    {
      id: "route-sample-004",
      routeNumber: "RTE-2026-0004",
      origin: "Facilities Dock",
      destination: "Supplier Depot",
      stops: ["Loading Bay A"],
      vehicle: "Service Vehicle 04",
      driver: "Maria Santos",
      priority: "Low",
      department: "Facilities",
      purpose: "Supply run",
      estimatedDistance: 9.5,
      estimatedTravelTime: "42 min",
      estimatedTravelTimeMinutes: 42,
      optimizationStrategy: "Economy",
      optimizationScore: 72,
      status: "Draft",
      departureDate: "2026-07-22",
      departureTime: "10:00",
      notes: "Non-urgent",
      createdAt: "2026-07-15T14:00:00.000Z",
      updatedAt: "2026-07-15T14:00:00.000Z",
      statusHistory: [
        { status: "Draft", at: "2026-07-15T14:00:00.000Z", note: "Created" },
      ],
    },
    {
      id: "route-sample-005",
      routeNumber: "RTE-2026-0005",
      origin: "Laboratory",
      destination: "Satellite Clinic",
      stops: ["Cold Storage"],
      vehicle: "Van 05",
      driver: "Ana Lopez",
      priority: "High",
      department: "Laboratory",
      purpose: "Sample courier",
      estimatedDistance: 14.2,
      estimatedTravelTime: "38 min",
      estimatedTravelTimeMinutes: 38,
      optimizationStrategy: "Shortest",
      optimizationScore: 86,
      status: "Planned",
      departureDate: "2026-07-19",
      departureTime: "11:15",
      notes: "Temperature-controlled bag",
      createdAt: "2026-07-14T08:30:00.000Z",
      updatedAt: "2026-07-14T09:00:00.000Z",
      statusHistory: [
        { status: "Draft", at: "2026-07-14T08:30:00.000Z", note: "Created" },
        { status: "Planned", at: "2026-07-14T09:00:00.000Z", note: "Saved" },
      ],
    },
  ];
}

function seedRoutePlanningSampleData() {
  const stored = loadRoutePlanningFromStorage();
  if (stored && stored.length > 0) {
    routePlanningRecords = stored;
    return;
  }

  routePlanningRecords = getRouteSampleSeed().map((r, i) =>
    normalizeRouteRecord(r, i),
  );
  persistRoutePlanningRecords();
}

/* ---------- Templates ---------- */

function readRouteTemplates() {
  try {
    const raw = localStorage.getItem(HIMS_FLEET_ROUTE_TEMPLATES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t) => t && typeof t === "object" && t.id && t.name)
      .map((t) => ({
        id: String(t.id),
        name: String(t.name),
        origin: String(t.origin || ""),
        destination: String(t.destination || ""),
        stops: Array.isArray(t.stops) ? t.stops.map(String) : [],
        priority: String(t.priority || "Medium"),
        department: String(t.department || ""),
        purpose: String(t.purpose || ""),
        recommendedVehicle: String(t.recommendedVehicle || ""),
        optimizationStrategy: String(t.optimizationStrategy || ""),
        createdAt: t.createdAt || new Date().toISOString(),
        updatedAt: t.updatedAt || t.createdAt || new Date().toISOString(),
      }));
  } catch (error) {
    console.error("Malformed route templates storage:", error);
    return [];
  }
}

function writeRouteTemplates(list) {
  try {
    localStorage.setItem(
      HIMS_FLEET_ROUTE_TEMPLATES_KEY,
      JSON.stringify(list.slice(0, ROUTE_TEMPLATES_MAX)),
    );
    return true;
  } catch (error) {
    console.error("Unable to save route templates:", error);
    return false;
  }
}
