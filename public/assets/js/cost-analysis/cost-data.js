/* ==========================================
   Cost Analysis adapters
   Priority: localStorage → shared sample seed (Reports) → empty
   Does not mutate source records. Does not invent trip costs.
========================================== */

const COST_SAMPLE = {
  vehicles: [
    { id: "v1", name: "Ambulance 01", plateNumber: "ABC-1001", type: "Ambulance", status: "Available", department: "Emergency" },
    { id: "v2", name: "Ambulance 03", plateNumber: "ABC-1003", type: "Ambulance", status: "On Trip", department: "Emergency" },
    { id: "v3", name: "Patient Van 02", plateNumber: "DEF-2002", type: "Patient Van", status: "Available", department: "Outpatient" },
    { id: "v4", name: "Service Vehicle 04", plateNumber: "GHI-4004", type: "Service Vehicle", status: "Maintenance", department: "Facilities" },
    { id: "v5", name: "Van 02", plateNumber: "JKL-2002", type: "Van", status: "Reserved", department: "Logistics" },
    { id: "v6", name: "Van 05", plateNumber: "JKL-2005", type: "Van", status: "Available", department: "Logistics" },
    { id: "v7", name: "SUV 03", plateNumber: "MNO-3003", type: "SUV", status: "Out of Service", department: "Admin" },
  ],
  fuel: [
    { id: "f1", fuelRecordNumber: "FUEL-2026-0001", date: "2026-07-10", vehicleName: "Ambulance 03", vehicleId: "v2", driverName: "Juan Dela Cruz", fuelType: "Diesel", quantity: 45.5, costPerLiter: 72.5, totalCost: 3298.75, station: "Petron Hospital Depot", status: "Completed" },
    { id: "f2", fuelRecordNumber: "FUEL-2026-0002", date: "2026-07-11", vehicleName: "Service Vehicle 04", vehicleId: "v4", driverName: "Maria Santos", fuelType: "Gasoline", quantity: 32.0, costPerLiter: 68.9, totalCost: 2204.8, station: "Shell Medical Hub", status: "Completed" },
    { id: "f3", fuelRecordNumber: "FUEL-2026-0003", date: "2026-07-12", vehicleName: "Van 02", vehicleId: "v5", driverName: "Pedro Reyes", fuelType: "Diesel", quantity: 50.0, costPerLiter: 73.25, totalCost: 3662.5, station: "Caltex Fleet Center", status: "Completed" },
    { id: "f4", fuelRecordNumber: "FUEL-2026-0004", date: "2026-07-13", vehicleName: "Ambulance 01", vehicleId: "v1", driverName: "Ana Lopez", fuelType: "Premium Gasoline", quantity: 28.75, costPerLiter: 79.9, totalCost: 2297.13, station: "Petron Hospital Depot", status: "Completed" },
    { id: "f5", fuelRecordNumber: "FUEL-2026-0005", date: "2026-07-14", vehicleName: "Patient Van 02", vehicleId: "v3", driverName: "Carlos Rivera", fuelType: "Diesel", quantity: 40.0, costPerLiter: 72.8, totalCost: 2912.0, station: "Shell Medical Hub", status: "Completed" },
    { id: "f6", fuelRecordNumber: "FUEL-2026-0006", date: "2026-06-20", vehicleName: "Van 05", vehicleId: "v6", driverName: "Pedro Reyes", fuelType: "Diesel", quantity: 42.0, costPerLiter: 71.5, totalCost: 3003.0, station: "Petron Hospital Depot", status: "Completed" },
    { id: "f7", fuelRecordNumber: "FUEL-2026-0007", date: "2026-06-05", vehicleName: "Ambulance 03", vehicleId: "v2", driverName: "Juan Dela Cruz", fuelType: "Diesel", quantity: 48.0, costPerLiter: 70.0, totalCost: 3360.0, station: "Caltex Fleet Center", status: "Completed" },
    { id: "f8", fuelRecordNumber: "FUEL-2026-0008", date: "2026-05-18", vehicleName: "SUV 03", vehicleId: "v7", driverName: "Maria Santos", fuelType: "Premium Gasoline", quantity: 35.0, costPerLiter: 78.0, totalCost: 2730.0, station: "Shell Medical Hub", status: "Completed" },
  ],
  maintenance: [
    { id: "m1", maintenanceNumber: "MNT-2026-001", date: "2026-07-20", vehicleName: "Ambulance 01", vehicleId: "v1", type: "Preventive Maintenance", status: "Scheduled", cost: 4500, serviceProvider: "Central Garage" },
    { id: "m2", maintenanceNumber: "MNT-2026-002", date: "2026-07-12", vehicleName: "Service Vehicle 04", vehicleId: "v4", type: "Corrective Repair", status: "In Progress", cost: 8200, serviceProvider: "Fleet Motors" },
    { id: "m3", maintenanceNumber: "MNT-2026-003", date: "2026-07-05", vehicleName: "Van 02", vehicleId: "v5", type: "Oil Change", status: "Completed", cost: 1800, serviceProvider: "Central Garage" },
    { id: "m4", maintenanceNumber: "MNT-2026-004", date: "2026-06-18", vehicleName: "Ambulance 03", vehicleId: "v2", type: "Brake Service", status: "Completed", cost: 5600, serviceProvider: "Fleet Motors" },
    { id: "m5", maintenanceNumber: "MNT-2026-005", date: "2026-06-02", vehicleName: "Patient Van 02", vehicleId: "v3", type: "Inspection", status: "Completed", cost: 950, serviceProvider: "Central Garage" },
    { id: "m6", maintenanceNumber: "MNT-2026-006", date: "2026-05-14", vehicleName: "SUV 03", vehicleId: "v7", type: "Engine Service", status: "Completed", cost: 12500, serviceProvider: "AutoCare PH" },
    { id: "m7", maintenanceNumber: "MNT-2026-007", date: "2026-07-22", vehicleName: "Van 05", vehicleId: "v6", type: "Tire Service", status: "Scheduled", cost: 3200, serviceProvider: "Central Garage" },
    { id: "m8", maintenanceNumber: "MNT-2026-008", date: "2026-04-20", vehicleName: "Ambulance 01", vehicleId: "v1", type: "Electrical Service", status: "Completed", cost: 4100, serviceProvider: "Fleet Motors" },
  ],
  dispatches: [
    { id: "t1", tripNumber: "DSP-2026-001", date: "2026-07-20", vehicleName: "Ambulance 03", vehicleId: "v2", driverName: "Juan Dela Cruz", origin: "Emergency Room", destination: "Imaging Center", status: "Ongoing", distance: 4.2 },
    { id: "t2", tripNumber: "DSP-2026-002", date: "2026-07-18", vehicleName: "Van 02", vehicleId: "v5", driverName: "Pedro Reyes", origin: "Main Lobby", destination: "Outpatient Clinic", status: "Completed", distance: 6.5 },
    { id: "t3", tripNumber: "DSP-2026-003", date: "2026-07-15", vehicleName: "Patient Van 02", vehicleId: "v3", driverName: "Carlos Rivera", origin: "Ward B", destination: "Dialysis Center", status: "Completed", distance: 3.1 },
    { id: "t4", tripNumber: "DSP-2026-004", date: "2026-07-12", vehicleName: "Ambulance 01", vehicleId: "v1", driverName: "Ana Lopez", origin: "ER", destination: "Trauma Center", status: "Completed", distance: 12.4 },
    { id: "t6", tripNumber: "DSP-2026-006", date: "2026-06-22", vehicleName: "Ambulance 03", vehicleId: "v2", driverName: "Juan Dela Cruz", origin: "ER", destination: "City Hospital", status: "Completed", distance: 18.0 },
  ],
};

function costClone(list) {
  return (list || []).map((item) => ({ ...item }));
}

function costReadStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function getCostVehicleData() {
  return costClone(costReadStorage("himsFleetVehicles") || COST_SAMPLE.vehicles);
}

function getCostFuelData() {
  return costClone(costReadStorage("himsFleetFuel") || COST_SAMPLE.fuel);
}

function getCostMaintenanceData() {
  return costClone(
    costReadStorage("himsFleetMaintenance") || COST_SAMPLE.maintenance,
  );
}

function getCostTripData() {
  /* Trips have distance/status only — no monetary cost field in current modules */
  return costClone(
    costReadStorage("himsFleetDispatches") || COST_SAMPLE.dispatches,
  );
}

function getCostReservationData() {
  return costClone(costReadStorage("himsFleetReservations") || []);
}

function getCostRouteData() {
  return costClone(costReadStorage("himsFleetRoutes") || []);
}

function vehicleLookupMap(vehicles) {
  const map = new Map();
  (vehicles || []).forEach((v) => {
    map.set(v.id, v);
    map.set(v.name, v);
  });
  return map;
}

/**
 * Normalize all supported monetary cost records.
 * Fuel + Maintenance only (valid totalCost/cost fields).
 * Trip Operations / Reservation Operations omitted unless monetary fields exist.
 */
function normalizeCostRecords(sources) {
  const vehicles = sources.vehicles || [];
  const vmap = vehicleLookupMap(vehicles);
  const records = [];

  (sources.fuel || []).forEach((f) => {
    const total = Number(f.totalCost);
    if (Number.isNaN(total)) return;
    const v = vmap.get(f.vehicleId) || vmap.get(f.vehicleName) || {};
    records.push({
      id: "fuel-" + (f.id || f.fuelRecordNumber),
      referenceNumber: f.fuelRecordNumber || f.id || "",
      date: f.date || "",
      category: "Fuel",
      subcategory: f.fuelType || "",
      vehicleId: f.vehicleId || v.id || "",
      vehicleName: f.vehicleName || v.name || "",
      plateNumber: v.plateNumber || "",
      vehicleType: v.type || "",
      driverId: f.driverId || "",
      driverName: f.driverName || "",
      department: v.department || null,
      sourceModule: "Fuel",
      sourceRecordId: f.id || "",
      description: (f.fuelType || "Fuel") + (f.station ? " @ " + f.station : ""),
      quantity: Number(f.quantity) || 0,
      unitCost: Number(f.costPerLiter) || 0,
      totalCost: total,
      distance: null,
      status: f.status || "Completed",
    });
  });

  (sources.maintenance || []).forEach((m) => {
    const total = Number(m.cost);
    if (Number.isNaN(total)) return;
    const v = vmap.get(m.vehicleId) || vmap.get(m.vehicleName) || {};
    records.push({
      id: "mnt-" + (m.id || m.maintenanceNumber),
      referenceNumber: m.maintenanceNumber || m.id || "",
      date: m.date || "",
      category: "Maintenance",
      subcategory: m.type || "",
      vehicleId: m.vehicleId || v.id || "",
      vehicleName: m.vehicleName || v.name || "",
      plateNumber: v.plateNumber || "",
      vehicleType: v.type || "",
      driverId: "",
      driverName: "",
      department: v.department || null,
      sourceModule: "Maintenance",
      sourceRecordId: m.id || "",
      description:
        (m.type || "Maintenance") +
        (m.serviceProvider ? " — " + m.serviceProvider : ""),
      quantity: 1,
      unitCost: total,
      totalCost: total,
      distance: null,
      status: m.status || "",
    });
  });

  /* Trip Operations: only if a real cost field exists on the record */
  (sources.dispatches || []).forEach((t) => {
    const total = Number(t.totalCost ?? t.cost ?? t.tripCost);
    if (Number.isNaN(total) || t.totalCost == null && t.cost == null && t.tripCost == null) {
      return;
    }
    const v = vmap.get(t.vehicleId) || vmap.get(t.vehicleName) || {};
    records.push({
      id: "trip-" + (t.id || t.tripNumber),
      referenceNumber: t.tripNumber || t.id || "",
      date: t.date || "",
      category: "Trip Operations",
      subcategory: t.status || "",
      vehicleId: t.vehicleId || v.id || "",
      vehicleName: t.vehicleName || v.name || "",
      plateNumber: v.plateNumber || "",
      vehicleType: v.type || "",
      driverId: t.driverId || "",
      driverName: t.driverName || "",
      department: t.department || v.department || null,
      sourceModule: "Dispatch",
      sourceRecordId: t.id || "",
      description:
        (t.origin || "") +
        (t.destination ? " → " + t.destination : ""),
      quantity: 1,
      unitCost: total,
      totalCost: total,
      distance: Number(t.distance) || null,
      status: t.status || "",
    });
  });

  return records;
}

function loadCostAnalysisSources() {
  return {
    vehicles: getCostVehicleData(),
    fuel: getCostFuelData(),
    maintenance: getCostMaintenanceData(),
    dispatches: getCostTripData(),
    reservations: getCostReservationData(),
    routes: getCostRouteData(),
  };
}
