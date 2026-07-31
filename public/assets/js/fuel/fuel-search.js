/* ==========================================
   Fuel Search + Filters + Table Pipeline
   Single entry: refreshFuelTable(options)
========================================== */

const FUEL_TABLE_COLUMN_COUNT = 13;

let fuelSearchState = null;
let isRefreshingFuelTable = false;
let fuelNextOriginalOrder = 0;

function isFuelTableRefreshing() {
  return isRefreshingFuelTable;
}

function getFuelDataRows(tableBody) {
  if (!tableBody) return [];

  return Array.from(tableBody.children).filter((row) => {
    if (row.tagName !== "TR") return false;

    const isHelper =
      row.classList.contains("fuel-no-results") ||
      row.classList.contains("helper-row") ||
      row.classList.contains("empty-state") ||
      row.dataset.helperRow === "true";

    if (isHelper) return false;

    return Boolean(
      row.querySelector(".fuel-number") ||
        row.querySelector(".fuel-checkbox") ||
        row.dataset.fuelId ||
        row.dataset.fuelNumber,
    );
  });
}

function getFuelCellText(row, selector) {
  const el = row.querySelector(selector);
  return el ? el.textContent.trim() : "";
}

function ensureFuelOriginalOrder(row) {
  if (
    row.dataset.fuelSortIndex == null ||
    row.dataset.fuelSortIndex === ""
  ) {
    row.dataset.fuelSortIndex = String(fuelNextOriginalOrder);
    fuelNextOriginalOrder += 1;
  }
  return Number(row.dataset.fuelSortIndex) || 0;
}

function buildFuelRowMeta(row) {
  const number = getFuelCellText(row, ".fuel-number");
  const dateDisplay = getFuelCellText(row, ".fuel-date");
  const vehicle = getFuelCellText(row, ".fuel-vehicle");
  const plate = getFuelCellText(row, ".fuel-plate");
  const driver = getFuelCellText(row, ".fuel-driver");
  const fuelType = getFuelCellText(row, ".fuel-type");
  const quantityDisplay = getFuelCellText(row, ".fuel-quantity");
  const totalCostDisplay = getFuelCellText(row, ".fuel-total-cost");
  const odometerDisplay = getFuelCellText(row, ".fuel-odometer");
  const station = getFuelCellText(row, ".fuel-station");

  const refuelDate = (row.dataset.refuelDate || "").trim();
  const quantity = (row.dataset.quantity || "").trim();
  const totalCost = (row.dataset.totalCost || "").trim();
  const odometer = (row.dataset.odometer || "").trim();
  const receipt = (row.dataset.receipt || "").trim();

  const searchableText = [
    number,
    dateDisplay,
    vehicle,
    plate,
    driver,
    fuelType,
    quantityDisplay,
    totalCostDisplay,
    odometerDisplay,
    station,
    receipt,
    row.dataset.notes,
    row.dataset.payment,
    refuelDate,
  ]
    .map((v) => (v ? String(v).trim() : ""))
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  return {
    row,
    originalOrder: ensureFuelOriginalOrder(row),
    searchableText,
    number,
    vehicle: vehicle.toLowerCase(),
    vehicleRaw: vehicle,
    fuelType: fuelType.toLowerCase(),
    fuelTypeRaw: fuelType,
    refuelDate,
    quantity,
    totalCost,
    odometer,
    plate,
    driver,
    station,
  };
}

function getFuelFilterSelectValue(select) {
  if (!select) return "";
  const value = (select.value || "").trim();
  if (!value || value.toLowerCase() === "all") return "";
  return value.toLowerCase();
}

function updateFuelNoResultsRow(tableBody, shouldShow) {
  if (!tableBody) return;

  const existing = tableBody.querySelector(".fuel-no-results");
  if (!shouldShow) {
    existing?.remove();
    return;
  }
  if (existing) return;

  const row = document.createElement("tr");
  const cell = document.createElement("td");
  row.className = "fuel-no-results";
  row.dataset.helperRow = "true";
  cell.colSpan = FUEL_TABLE_COLUMN_COUNT;
  cell.textContent = "No fuel records found.";
  row.appendChild(cell);
  tableBody.appendChild(row);
}

function ensureFuelSearchState() {
  const tableBody = document.getElementById("fuelTableBody");
  if (!tableBody) return null;

  if (fuelSearchState?.tableBody === tableBody) {
    return fuelSearchState;
  }

  fuelSearchState = {
    tableBody,
    searchInput: document.getElementById("fuelSearch"),
    vehicleFilter: document.getElementById("fuelVehicleFilter"),
    typeFilter: document.getElementById("fuelTypeFilter"),
    dateFilter: document.getElementById("fuelDateFilter"),
  };

  return fuelSearchState;
}

/**
 * Single Fuel table pipeline.
 * @param {{ resetPage?: boolean, refreshStatistics?: boolean, reason?: string }} [options]
 */
function refreshFuelTable(options = {}) {
  if (isRefreshingFuelTable) {
    return [];
  }

  const resetPage = options.resetPage === true;
  const refreshStatistics = options.refreshStatistics === true;

  isRefreshingFuelTable = true;

  try {
    const state = ensureFuelSearchState();
    if (!state?.tableBody) return [];

    const { tableBody, searchInput, vehicleFilter, typeFilter, dateFilter } =
      state;

    const searchQuery = (searchInput?.value || "").trim().toLowerCase();
    const vehicleValue = getFuelFilterSelectValue(vehicleFilter);
    const typeValue = getFuelFilterSelectValue(typeFilter);
    const dateValue = (dateFilter?.value || "").trim();

    const allRows = getFuelDataRows(tableBody);
    const metas = allRows.map(buildFuelRowMeta);
    const matchingMetas = [];
    const nonMatchingMetas = [];

    metas.forEach((meta) => {
      const matchesSearch =
        !searchQuery || meta.searchableText.includes(searchQuery);
      const matchesVehicle =
        !vehicleValue || meta.vehicle === vehicleValue;
      const matchesType = !typeValue || meta.fuelType === typeValue;
      const matchesDate = !dateValue || meta.refuelDate === dateValue;
      const isMatch =
        matchesSearch && matchesVehicle && matchesType && matchesDate;

      meta.row.dataset.matchesFilter = String(isMatch);

      if (isMatch) {
        matchingMetas.push(meta);
      } else {
        nonMatchingMetas.push(meta);
      }
    });

    if (typeof sortFuelRowMetas === "function") {
      sortFuelRowMetas(matchingMetas, nonMatchingMetas);
    } else {
      const byOriginal = (a, b) => a.originalOrder - b.originalOrder;
      matchingMetas.sort(byOriginal);
      nonMatchingMetas.sort(byOriginal);
    }

    if (typeof applyFuelRowOrder === "function") {
      applyFuelRowOrder(tableBody, matchingMetas, nonMatchingMetas);
    }

    const matchingRows = matchingMetas.map((meta) => meta.row);

    if (typeof applyFuelPagination === "function") {
      applyFuelPagination({
        matchingRows,
        allRows: getFuelDataRows(tableBody),
        resetPage,
      });
    } else {
      allRows.forEach((row) => {
        row.style.display =
          row.dataset.matchesFilter !== "false" ? "" : "none";
      });
      updateFuelNoResultsRow(tableBody, matchingRows.length === 0);
    }

    if (refreshStatistics && typeof updateFuelStatistics === "function") {
      updateFuelStatistics();
    }

    if (typeof syncFuelSelectionUI === "function") {
      syncFuelSelectionUI();
    }

    return matchingRows;
  } catch (error) {
    console.error("refreshFuelTable failed:", error);
    return [];
  } finally {
    queueMicrotask(() => {
      isRefreshingFuelTable = false;
    });
  }
}

function resetFuelFilters() {
  const state = ensureFuelSearchState();
  if (!state) return [];

  if (state.searchInput) state.searchInput.value = "";
  if (state.vehicleFilter) state.vehicleFilter.value = "all";
  if (state.typeFilter) state.typeFilter.value = "all";
  if (state.dateFilter) state.dateFilter.value = "";

  return refreshFuelTable({ resetPage: true });
}

function initFuelSearch() {
  const tableBody = document.getElementById("fuelTableBody");
  if (!tableBody) return;
  if (tableBody.dataset.fuelSearchInitialized === "true") return;

  tableBody.dataset.fuelSearchInitialized = "true";
  ensureFuelSearchState();

  getFuelDataRows(tableBody).forEach((row) => {
    ensureFuelOriginalOrder(row);
  });

  const { searchInput, vehicleFilter, typeFilter, dateFilter } =
    fuelSearchState;
  const refreshButton = document.getElementById("refreshFuel");

  searchInput?.addEventListener("input", () => {
    refreshFuelTable({ resetPage: true });
  });

  vehicleFilter?.addEventListener("change", () => {
    refreshFuelTable({ resetPage: true });
  });

  typeFilter?.addEventListener("change", () => {
    refreshFuelTable({ resetPage: true });
  });

  dateFilter?.addEventListener("change", () => {
    refreshFuelTable({ resetPage: true });
  });

  refreshButton?.addEventListener("click", () => {
    resetFuelFilters();
  });
}
