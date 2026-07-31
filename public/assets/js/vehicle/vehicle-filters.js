/* ==========================================
   Vehicle Search & Filters
========================================== */

let vehicleFilterState = null;
let currentSort = "id";
let currentDirection = "asc";

const vehicleSortMap = {
    1: "brand",
    2: "plate_number",
    3: "vehicle_type",
    5: "status",
};

function getVehicleRowText(row, columnIndex, selector) {
  const selectedElement = selector ? row.querySelector(selector) : null;
  const cell = row.children?.[columnIndex];
  const value = selectedElement ? selectedElement.textContent : cell?.textContent;

  return value ? value.trim() : "";
}

function getVehicleFilterLabel(select) {
  if (!select || select.value === "all") return "";

  const option = select.options[select.selectedIndex];

  return (option?.textContent || select.value).trim().toLowerCase();
}

function normalizeVehicleFilterValue(value) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/^on\s*trip$/, "on trip");
}

function getVehicleDataRows(tableBody) {
  if (!tableBody) return [];

  return Array.from(tableBody.querySelectorAll("tr")).filter((row) => {
    const isHelperRow =
      row.classList.contains("helper-row") ||
      row.classList.contains("empty-state") ||
      row.dataset.helperRow === "true" ||
      row.dataset.temporary === "true";

    return (
      !isHelperRow &&
      Boolean(
        row.querySelector(".vehicle-name") ||
          row.querySelector(".vehicle-checkbox"),
      )
    );
  });
}

function renderVehicleFilterRows(matchingRows) {
  if (!vehicleFilterState) return;

  const matchingRowSet = new Set(matchingRows);

  getVehicleDataRows(vehicleFilterState.tableBody).forEach((row) => {
    row.style.display = matchingRowSet.has(row) ? "" : "none";
  });
}

function getVehicleIcon(type){
    switch(type){

        case "Ambulance":
            return "ph-fill ph-ambulance";

        case "Patient Van":
        case "Van":
            return "ph-fill ph-van";

        case "Motorcycle":
            return "ph-fill ph-motorcycle";

        case "SUV":
        case "Car":
            return "ph-fill ph-car";

        default:
            return "ph-fill ph-car";
    }
}

function renderVehicleTable(vehicles) {
    const tableBody = document.getElementById("vehicleTableBody");

    if (!tableBody) return;

    let html = "";

    vehicles.forEach(vehicle => {
      const badgeClass =
      typeof getVehicleStatusClass === "function"
        ? getVehicleStatusClass(vehicle.status)
        : "";
      const vehicleIcon = getVehicleIcon(vehicle.vehicle_type);
      const driverName = vehicle.driver_name ?? "Not Assigned";
      const initials =
          driverName === "Not Assigned"
              ? "  "
              : driverName
                  .split(" ")
                  .map(name => name[0])
                  .join("")
                  .substring(0,2)
                  .toUpperCase();

        html += `
            <tr>

                <td>
                    <input
                        type="checkbox"
                        class="vehicle-checkbox"
                        data-id="${vehicle.id}"
                    >
                </td>

                <td>
                    <div class="vehicle-info">
                        <div class="vehicle-avatar">
                            <i class="${vehicleIcon}"></i>
                        </div>
                        <div>
                            <div class="vehicle-name">
                                ${vehicle.brand} ${vehicle.model}
                            </div>
                            <small>
                                ${vehicle.year_model ?? ""}
                            </small>
                        </div>  
                    </div>
                </td>

                <td>${vehicle.plate_number}</td>

                <td>${vehicle.vehicle_type}</td>

                <td>
                    <div class="driver-info">
                        <div class="driver-avatar">
                            ${initials}
                        </div>
                        <span>
                            ${driverName}
                        </span>
                    </div>
                </td>

                <td>
                    <span class="status-badge ${badgeClass}">
                        ${vehicle.status}
                    </span>
                </td>

                <td>${vehicle.fuel_type}</td>

                <td>${vehicle.last_service ?? "---"}</td>

                <td>
                    <div class="action-buttons">
                        <button
                            class="action-btn view"
                            data-id="${vehicle.id}"
                            title="View">
                            <i class="ph ph-eye"></i>
                        </button>

                        <button
                            class="action-btn edit"
                            data-id="${vehicle.id}"
                            title="Edit">
                            <i class="ph ph-pencil-simple"></i>
                        </button>

                        <button
                            class="action-btn delete"
                            data-id="${vehicle.id}"
                            title="Delete">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </td>

            </tr>
        `;

    });

    tableBody.innerHTML = html;

    if (typeof initVehiclePagination === "function") {
        initVehiclePagination();
    }

    if (typeof refreshVehiclePagination === "function") {
        refreshVehiclePagination({ reset: true });
    }

    if (typeof refreshVehicleBulkState === "function") {
        refreshVehicleBulkState();
    }

}

function applyVehicleFilters() {
    const search = document.getElementById("vehicleSearch").value;
    const type = document.getElementById("vehicleTypeFilter").value;
    const status = document.getElementById("vehicleStatusFilter").value;

    const url =
    `/fleet/search?search=${encodeURIComponent(search)}
    &type=${encodeURIComponent(type)}
    &status=${encodeURIComponent(status)}
    &sort=${currentSort}
    &direction=${currentDirection}`;

    console.log(url);

    fetch(url, {
      headers: {
          "Accept": "application/json"
      }
  })

    .then(response => response.json())
    .then(data => {
        console.log(data);

        renderVehicleTable(data.vehicles);

    })

    .catch(error => {

        console.error(error);

    });

}

function initVehicleFilters() {
  console.log("Vehicle Filters Initialized");

  const tableBody = document.getElementById("vehicleTableBody");
  const searchInput = document.getElementById("vehicleSearch");
  const typeFilter = document.getElementById("vehicleTypeFilter");
  const statusFilter = document.getElementById("vehicleStatusFilter");
  const refreshButton = document.getElementById("refreshVehicles");

  if (!tableBody || tableBody.dataset.vehicleFiltersInitialized === "true") {
    return;
  }

  tableBody.dataset.vehicleFiltersInitialized = "true";
  vehicleFilterState = {
    tableBody,
    searchInput,
    typeFilter,
    statusFilter,
  };

  searchInput?.addEventListener("input", () => {
    console.log("Searching...", searchInput.value);
    applyVehicleFilters({ resetPage: true });

});
  typeFilter?.addEventListener("change", () => {
    applyVehicleFilters({ resetPage: true });
  });
  statusFilter?.addEventListener("change", () => {
    applyVehicleFilters({ resetPage: true });
  });
  refreshButton?.addEventListener("click", () => {
    if (searchInput) {
      searchInput.value = "";
    }

    if (typeFilter) {
      typeFilter.value = "all";
    }

    if (statusFilter) {
      statusFilter.value = "all";
    }

    applyVehicleFilters({ resetPage: true });
  });

  applyVehicleFilters();

  document.querySelectorAll(".sortable").forEach(header => {
      header.addEventListener("click", () => {

          const column = header.dataset.column;
          const sortField = vehicleSortMap[column];

          if (!sortField) return;

          if (currentSort === sortField) {

              currentDirection =
                  currentDirection === "asc"
                      ? "desc"
                      : "asc";

          } else {
              currentSort = sortField;
              currentDirection = "asc";

          }

          applyVehicleFilters();

      });

  });

}

document.addEventListener("DOMContentLoaded", initVehicleFilters);