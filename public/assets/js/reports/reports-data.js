/* ==========================================
   Reports data adapters + demo Fleet datasets
   Priority: localStorage (if present) → in-memory sample
   Does not mutate source module state.
========================================== */

const REPORTS_SAMPLE_SEED = {
  vehicles: [
    { id: "v1", name: "Ambulance 01", plateNumber: "ABC-1001", type: "Ambulance", status: "Available", department: "Emergency", capacity: 2 },
    { id: "v2", name: "Ambulance 03", plateNumber: "ABC-1003", type: "Ambulance", status: "On Trip", department: "Emergency", capacity: 2 },
    { id: "v3", name: "Patient Van 02", plateNumber: "DEF-2002", type: "Patient Van", status: "Available", department: "Outpatient", capacity: 8 },
    { id: "v4", name: "Service Vehicle 04", plateNumber: "GHI-4004", type: "Service Vehicle", status: "Maintenance", department: "Facilities", capacity: 4 },
    { id: "v5", name: "Van 02", plateNumber: "JKL-2002", type: "Van", status: "Reserved", department: "Logistics", capacity: 10 },
    { id: "v6", name: "Van 05", plateNumber: "JKL-2005", type: "Van", status: "Available", department: "Logistics", capacity: 10 },
    { id: "v7", name: "SUV 03", plateNumber: "MNO-3003", type: "SUV", status: "Out of Service", department: "Admin", capacity: 5 },
  ],
  drivers: [
    { id: "d1", name: "Juan Dela Cruz", status: "Active", assignedVehicle: "Ambulance 03" },
    { id: "d2", name: "Maria Santos", status: "Active", assignedVehicle: "Service Vehicle 04" },
    { id: "d3", name: "Pedro Reyes", status: "Active", assignedVehicle: "Van 02" },
    { id: "d4", name: "Ana Lopez", status: "On Leave", assignedVehicle: "Ambulance 01" },
    { id: "d5", name: "Carlos Rivera", status: "Active", assignedVehicle: "Patient Van 02" },
  ],
  reservations: [
    { id: "r1", reservationNumber: "RES-2026-001", date: "2026-07-15", vehicleName: "Ambulance 01", vehicleId: "v1", requester: "Dr. Santos", department: "Emergency", purpose: "Patient transfer", status: "Approved" },
    { id: "r2", reservationNumber: "RES-2026-002", date: "2026-07-16", vehicleName: "Van 02", vehicleId: "v5", requester: "Nurse Reyes", department: "Outpatient", purpose: "Clinic shuttle", status: "Pending" },
    { id: "r3", reservationNumber: "RES-2026-003", date: "2026-07-10", vehicleName: "Patient Van 02", vehicleId: "v3", requester: "Admin Cruz", department: "Admin", purpose: "Staff transport", status: "Completed" },
    { id: "r4", reservationNumber: "RES-2026-004", date: "2026-06-28", vehicleName: "SUV 03", vehicleId: "v7", requester: "HR Office", department: "Admin", purpose: "Meeting", status: "Cancelled" },
    { id: "r5", reservationNumber: "RES-2026-005", date: "2026-07-18", vehicleName: "Van 05", vehicleId: "v6", requester: "Lab Unit", department: "Laboratory", purpose: "Sample courier", status: "Approved" },
    { id: "r6", reservationNumber: "RES-2026-006", date: "2026-07-05", vehicleName: "Ambulance 03", vehicleId: "v2", requester: "ER Desk", department: "Emergency", purpose: "Emergency standby", status: "Completed" },
    { id: "r7", reservationNumber: "RES-2026-007", date: "2026-05-12", vehicleName: "Service Vehicle 04", vehicleId: "v4", requester: "Facilities", department: "Facilities", purpose: "Supply run", status: "Completed" },
    { id: "r8", reservationNumber: "RES-2026-008", date: "2026-07-19", vehicleName: "Ambulance 01", vehicleId: "v1", requester: "ICU", department: "Emergency", purpose: "Inter-facility", status: "Pending" },
  ],
  dispatches: [
    { id: "t1", tripNumber: "DSP-2026-001", date: "2026-07-20", vehicleName: "Ambulance 03", vehicleId: "v2", driverName: "Juan Dela Cruz", driverId: "d1", origin: "Emergency Room", destination: "Imaging Center", status: "Ongoing", distance: 4.2, duration: 25 },
    { id: "t2", tripNumber: "DSP-2026-002", date: "2026-07-18", vehicleName: "Van 02", vehicleId: "v5", driverName: "Pedro Reyes", driverId: "d3", origin: "Main Lobby", destination: "Outpatient Clinic", status: "Completed", distance: 6.5, duration: 40 },
    { id: "t3", tripNumber: "DSP-2026-003", date: "2026-07-15", vehicleName: "Patient Van 02", vehicleId: "v3", driverName: "Carlos Rivera", driverId: "d5", origin: "Ward B", destination: "Dialysis Center", status: "Completed", distance: 3.1, duration: 20 },
    { id: "t4", tripNumber: "DSP-2026-004", date: "2026-07-12", vehicleName: "Ambulance 01", vehicleId: "v1", driverName: "Ana Lopez", driverId: "d4", origin: "ER", destination: "Trauma Center", status: "Completed", distance: 12.4, duration: 55 },
    { id: "t5", tripNumber: "DSP-2026-005", date: "2026-07-08", vehicleName: "Van 05", vehicleId: "v6", driverName: "Pedro Reyes", driverId: "d3", origin: "Pharmacy", destination: "Warehouse", status: "Cancelled", distance: 0, duration: 0 },
    { id: "t6", tripNumber: "DSP-2026-006", date: "2026-06-22", vehicleName: "Ambulance 03", vehicleId: "v2", driverName: "Juan Dela Cruz", driverId: "d1", origin: "ER", destination: "City Hospital", status: "Completed", distance: 18.0, duration: 70 },
    { id: "t7", tripNumber: "DSP-2026-007", date: "2026-06-10", vehicleName: "Service Vehicle 04", vehicleId: "v4", driverName: "Maria Santos", driverId: "d2", origin: "Facilities", destination: "Supplier Depot", status: "Completed", distance: 9.5, duration: 45 },
    { id: "t8", tripNumber: "DSP-2026-008", date: "2026-05-30", vehicleName: "Patient Van 02", vehicleId: "v3", driverName: "Carlos Rivera", driverId: "d5", origin: "OPD", destination: "Satellite Clinic", status: "Completed", distance: 14.2, duration: 60 },
    { id: "t9", tripNumber: "DSP-2026-009", date: "2026-07-03", vehicleName: "Van 02", vehicleId: "v5", driverName: "Pedro Reyes", driverId: "d3", origin: "Admin", destination: "City Hall", status: "Completed", distance: 7.8, duration: 35 },
    { id: "t10", tripNumber: "DSP-2026-010", date: "2026-04-15", vehicleName: "Ambulance 01", vehicleId: "v1", driverName: "Juan Dela Cruz", driverId: "d1", origin: "ER", destination: "Imaging", status: "Completed", distance: 2.5, duration: 15 },
    { id: "t11", tripNumber: "DSP-2026-011", date: "2026-07-17", vehicleName: "SUV 03", vehicleId: "v7", driverName: "Maria Santos", driverId: "d2", origin: "Admin", destination: "Partner Clinic", status: "Completed", distance: 11.0, duration: 50 },
    { id: "t12", tripNumber: "DSP-2026-012", date: "2026-03-08", vehicleName: "Van 05", vehicleId: "v6", driverName: "Carlos Rivera", driverId: "d5", origin: "Lab", destination: "Lab Annex", status: "Completed", distance: 5.0, duration: 28 },
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
  fuel: [
    { id: "f1", fuelRecordNumber: "FUEL-2026-0001", date: "2026-07-10", vehicleName: "Ambulance 03", vehicleId: "v2", driverName: "Juan Dela Cruz", driverId: "d1", fuelType: "Diesel", quantity: 45.5, costPerLiter: 72.5, totalCost: 3298.75, odometer: 48230, station: "Petron Hospital Depot" },
    { id: "f2", fuelRecordNumber: "FUEL-2026-0002", date: "2026-07-11", vehicleName: "Service Vehicle 04", vehicleId: "v4", driverName: "Maria Santos", driverId: "d2", fuelType: "Gasoline", quantity: 32.0, costPerLiter: 68.9, totalCost: 2204.8, odometer: 21560, station: "Shell Medical Hub" },
    { id: "f3", fuelRecordNumber: "FUEL-2026-0003", date: "2026-07-12", vehicleName: "Van 02", vehicleId: "v5", driverName: "Pedro Reyes", driverId: "d3", fuelType: "Diesel", quantity: 50.0, costPerLiter: 73.25, totalCost: 3662.5, odometer: 33410, station: "Caltex Fleet Center" },
    { id: "f4", fuelRecordNumber: "FUEL-2026-0004", date: "2026-07-13", vehicleName: "Ambulance 01", vehicleId: "v1", driverName: "Ana Lopez", driverId: "d4", fuelType: "Premium Gasoline", quantity: 28.75, costPerLiter: 79.9, totalCost: 2297.13, odometer: 51200, station: "Petron Hospital Depot" },
    { id: "f5", fuelRecordNumber: "FUEL-2026-0005", date: "2026-07-14", vehicleName: "Patient Van 02", vehicleId: "v3", driverName: "Carlos Rivera", driverId: "d5", fuelType: "Diesel", quantity: 40.0, costPerLiter: 72.8, totalCost: 2912.0, odometer: 19880, station: "Shell Medical Hub" },
    { id: "f6", fuelRecordNumber: "FUEL-2026-0006", date: "2026-06-20", vehicleName: "Van 05", vehicleId: "v6", driverName: "Pedro Reyes", driverId: "d3", fuelType: "Diesel", quantity: 42.0, costPerLiter: 71.5, totalCost: 3003.0, odometer: 30100, station: "Petron Hospital Depot" },
    { id: "f7", fuelRecordNumber: "FUEL-2026-0007", date: "2026-06-05", vehicleName: "Ambulance 03", vehicleId: "v2", driverName: "Juan Dela Cruz", driverId: "d1", fuelType: "Diesel", quantity: 48.0, costPerLiter: 70.0, totalCost: 3360.0, odometer: 47000, station: "Caltex Fleet Center" },
    { id: "f8", fuelRecordNumber: "FUEL-2026-0008", date: "2026-05-18", vehicleName: "SUV 03", vehicleId: "v7", driverName: "Maria Santos", driverId: "d2", fuelType: "Premium Gasoline", quantity: 35.0, costPerLiter: 78.0, totalCost: 2730.0, odometer: 22000, station: "Shell Medical Hub" },
  ],
};

function cloneReportRecords(list) {
  return (list || []).map((item) => ({ ...item }));
}

function readReportsLocalStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function getVehicleReportData() {
  const stored = readReportsLocalStorage("himsFleetVehicles");
  return cloneReportRecords(stored || REPORTS_SAMPLE_SEED.vehicles);
}

function getReservationReportData() {
  const stored = readReportsLocalStorage("himsFleetReservations");
  return cloneReportRecords(stored || REPORTS_SAMPLE_SEED.reservations);
}

function getDispatchReportData() {
  const stored = readReportsLocalStorage("himsFleetDispatches");
  return cloneReportRecords(stored || REPORTS_SAMPLE_SEED.dispatches);
}

function getDriverReportData() {
  const stored = readReportsLocalStorage("himsFleetDrivers");
  return cloneReportRecords(stored || REPORTS_SAMPLE_SEED.drivers);
}

function getMaintenanceReportData() {
  const stored = readReportsLocalStorage("himsFleetMaintenance");
  return cloneReportRecords(stored || REPORTS_SAMPLE_SEED.maintenance);
}

function getFuelReportData() {
  const stored = readReportsLocalStorage("himsFleetFuel");
  return cloneReportRecords(stored || REPORTS_SAMPLE_SEED.fuel);
}

function getAllReportsSourceData() {
  return {
    vehicles: getVehicleReportData(),
    reservations: getReservationReportData(),
    dispatches: getDispatchReportData(),
    drivers: getDriverReportData(),
    maintenance: getMaintenanceReportData(),
    fuel: getFuelReportData(),
  };
}
