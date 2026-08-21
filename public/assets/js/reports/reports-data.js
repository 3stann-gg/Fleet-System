/* ==========================================
   Reports Data Adapters

   Real Laravel / MySQL sources:
   - Vehicles
   - Drivers
   - Reservations
   - Dispatch
   - Maintenance
   - Fuel Logs

   No sample operational data.
========================================== */

/* ==========================================
   COMMON HELPERS
========================================== */

function getReportVehicleLabel(vehicle) {
    if (!vehicle) {
        return "";
    }

    const brandModel = [vehicle.brand, vehicle.model]
        .filter(Boolean)
        .map((value) => String(value).trim())
        .filter(Boolean)
        .join(" ")
        .trim();

    const type = String(vehicle.vehicle_type || vehicle.type || "").trim();

    if (brandModel && type) {
        return `${brandModel} - ${type}`;
    }

    return brandModel || type || vehicle.vehicle_name || vehicle.name || "";
}

function getReportDriverLabel(driver) {
    if (!driver) {
        return "";
    }

    const fullName = [driver.first_name, driver.last_name]
        .filter(Boolean)
        .map((value) => String(value).trim())
        .filter(Boolean)
        .join(" ")
        .trim();

    return fullName || driver.name || "";
}

function normalizeReportDate(value) {
    if (!value) {
        return "";
    }
    return String(value).slice(0, 10);
}

async function fetchReportsJson(url) {
    const response = await fetch(url, {
        headers: {
            Accept: "application/json",
        },
        credentials: "same-origin",
    });
    let data = null;
    try {
        data = await response.json();
    } catch {
        data = null;
    }
    if (!response.ok) {
        throw new Error(data?.message || `Unable to load ${url}.`);
    }

    return data;
}

/* ==========================================
   VEHICLES
========================================== */
async function getVehicleReportData() {
    const data = await fetchReportsJson("/fleet");
    const vehicles = Array.isArray(data?.vehicles)
        ? data.vehicles
        : Array.isArray(data)
          ? data
          : [];
    return vehicles.map((vehicle) => ({
        id: String(vehicle.id ?? ""),
        name: getReportVehicleLabel(vehicle),
        plateNumber: vehicle.plate_number || "",
        type: vehicle.vehicle_type || vehicle.type || "",
        status: vehicle.status || "",
        department: vehicle.department || vehicle.department_name || "",
        capacity: Number(vehicle.capacity) || 0,
        raw: vehicle,
    }));
}

/* ==========================================
   DRIVERS
========================================== */
async function getDriverReportData() {
    const data = await fetchReportsJson("/drivers");
    const drivers = Array.isArray(data?.drivers)
        ? data.drivers
        : Array.isArray(data)
          ? data
          : [];
    return drivers.map((driver) => {
        const assignedVehicle =
            driver.vehicle || driver.assigned_vehicle || null;
        return {
            id: String(driver.id ?? ""),
            name: getReportDriverLabel(driver),
            status: driver.status || "",
            assignedVehicle: assignedVehicle
                ? getReportVehicleLabel(assignedVehicle)
                : driver.assigned_vehicle_name || "",
            raw: driver,
        };
    });
}

/* ==========================================
   RESERVATIONS
========================================== */
async function getReservationReportData() {
    const data = await fetchReportsJson("/reservation");
    const reservations = Array.isArray(data?.reservations)
        ? data.reservations
        : Array.isArray(data)
          ? data
          : [];
    return reservations.map((reservation) => {
        const vehicle = reservation.vehicle || null;
        const routePlan =
            reservation.route_plan || reservation.routePlan || null;
        return {
            id: String(reservation.id ?? ""),
            reservationNumber:
                reservation.reservation_number || String(reservation.id || ""),
            date: normalizeReportDate(reservation.schedule_date),
            vehicleId:
                reservation.vehicle_id != null
                    ? String(reservation.vehicle_id)
                    : "",
            vehicleName: getReportVehicleLabel(vehicle),
            /*
        |--------------------------------------------------------------------------
        | Requester
        |--------------------------------------------------------------------------
        |
        | Current Reservation model may not have a generic requester field.
        | Use patient/requester-related fields only when actually available.
        |
        */
            requester:
                reservation.requester_name ||
                reservation.patient_name ||
                reservation.requested_by ||
                "—",
            department:
                reservation.department ||
                routePlan?.department ||
                vehicle?.department ||
                null,
            purpose: reservation.purpose || routePlan?.purpose || "",
            status: reservation.status || "",
            raw: reservation,
        };
    });
}

/* ==========================================
   DISPATCH
========================================== */
async function getDispatchReportData() {
    const data = await fetchReportsJson("/dispatch");
    const dispatches = Array.isArray(data?.dispatches)
        ? data.dispatches
        : Array.isArray(data)
          ? data
          : [];
    return dispatches.map((dispatch) => {
        const reservation = dispatch.reservation || null;
        const vehicle = reservation?.vehicle || dispatch.vehicle || null;
        const driver = reservation?.driver || dispatch.driver || null;
        const routePlan =
            reservation?.route_plan ||
            reservation?.routePlan ||
            dispatch.route_plan ||
            dispatch.routePlan ||
            null;
        const distance =
            routePlan?.estimated_distance ?? dispatch.distance ?? null;
        const duration = routePlan?.estimated_time ?? dispatch.duration ?? null;
        return {
            id: String(dispatch.id ?? ""),
            tripNumber: dispatch.dispatch_number || String(dispatch.id || ""),
            date: normalizeReportDate(dispatch.dispatch_date),
            vehicleId: vehicle?.id != null ? String(vehicle.id) : "",
            vehicleName: getReportVehicleLabel(vehicle),
            driverId: driver?.id != null ? String(driver.id) : "",
            driverName: getReportDriverLabel(driver),
            origin: routePlan?.origin || reservation?.pickup_location || "",
            destination:
                routePlan?.destination || reservation?.destination || "",
            status: dispatch.trip_status || "",
            distance: distance != null ? Number(distance) : 0,
            duration: duration != null ? Number(duration) : 0,
            department:
                routePlan?.department ||
                reservation?.department ||
                vehicle?.department ||
                null,
            raw: dispatch,
        };
    });
}

/* ==========================================
   MAINTENANCE
========================================== */

async function getMaintenanceReportData() {
    const data = await fetchReportsJson("/maintenance");
    const maintenances = Array.isArray(data?.maintenances)
        ? data.maintenances
        : [];
    return maintenances.map((maintenance) => {
        const vehicle = maintenance.vehicle || null;
        return {
            id: String(maintenance.id ?? ""),

            maintenanceNumber:
                maintenance.maintenance_number || String(maintenance.id || ""),
            date: normalizeReportDate(maintenance.maintenance_date),
            completionDate: normalizeReportDate(maintenance.completion_date),
            vehicleId:
                maintenance.vehicle_id != null
                    ? String(maintenance.vehicle_id)
                    : "",
            vehicleName: getReportVehicleLabel(vehicle),
            type: maintenance.maintenance_type || "",
            status: maintenance.status || "",
            cost: maintenance.cost != null ? Number(maintenance.cost) : null,
            /*
        |--------------------------------------------------------------------------
        | Current Maintenance schema has technician, not service_provider.
        |--------------------------------------------------------------------------
        */
            serviceProvider: maintenance.technician || "",
            department: vehicle?.department || null,
            raw: maintenance,
        };
    });
}

/* ==========================================
   FUEL
========================================== */

async function getFuelReportData() {
    const data = await fetchReportsJson("/fuel-records");
    const fuelLogs = Array.isArray(data?.fuelLogs) ? data.fuelLogs : [];
    return fuelLogs.map((fuel) => {
        const vehicle = fuel.vehicle || null;
        const driver = fuel.driver || null;
        return {
            id: String(fuel.id ?? ""),
            fuelRecordNumber: fuel.fuel_number || String(fuel.id || ""),
            date: normalizeReportDate(fuel.date),
            vehicleId: fuel.vehicle_id != null ? String(fuel.vehicle_id) : "",
            vehicleName: getReportVehicleLabel(vehicle),
            driverId: fuel.driver_id != null ? String(fuel.driver_id) : "",
            driverName: getReportDriverLabel(driver),
            fuelType: fuel.fuel_type || "",
            quantity: Number(fuel.fuel_amount) || 0,
            costPerLiter: Number(fuel.cost_per_liter) || 0,
            totalCost: Number(fuel.cost) || 0,
            odometer: Number(fuel.odometer) || 0,
            station: fuel.fuel_station || "",
            department: vehicle?.department || null,
            raw: fuel,
        };
    });
}

/* ==========================================
   LOAD ALL REPORT SOURCES
========================================== */

async function getAllReportsSourceData() {
    const [vehicles, reservations, dispatches, drivers, maintenance, fuel] =
        await Promise.all([
            getVehicleReportData(),
            getReservationReportData(),
            getDispatchReportData(),
            getDriverReportData(),
            getMaintenanceReportData(),
            getFuelReportData(),
        ]);

    return {
        vehicles,
        reservations,
        dispatches,
        drivers,
        maintenance,
        fuel,
    };
}
