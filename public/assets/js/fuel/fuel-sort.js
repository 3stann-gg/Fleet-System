/* ==========================================
   Fuel Table Sorting
========================================== */

const FUEL_SORT_CONFIG = {
  1: { type: "text", field: "number" },
  2: { type: "date", field: "refuelDate" },
  3: { type: "text", field: "vehicleRaw" },
  6: { type: "text", field: "fuelTypeRaw" },
  7: { type: "number", field: "quantity" },
  9: { type: "number", field: "totalCost" },
  10: { type: "number", field: "odometer" },
};

let fuelSortState = null;

function parseFuelSortNumber(value) {
  if (value == null || value === "") return Number.NaN;
  const cleaned = String(value).replace(/[^\d.-]/g, "");
  if (!cleaned) return Number.NaN;
  return Number.parseFloat(cleaned);
}

function parseFuelSortDate(value) {
  if (value == null || value === "") return Number.NaN;
  const raw = String(value).trim();
  if (!raw || raw === "—") return Number.NaN;
  const time = Date.parse(raw);
  return Number.isNaN(time) ? Number.NaN : time;
}

function compareFuelMetaValues(aMeta, bMeta, columnIndex, direction) {
  const config = FUEL_SORT_CONFIG[columnIndex];
  if (!config || !aMeta || !bMeta) return 0;

  const aRaw = aMeta[config.field] != null ? aMeta[config.field] : "";
  const bRaw = bMeta[config.field] != null ? bMeta[config.field] : "";
  const dir = direction === "desc" ? -1 : 1;

  if (config.type === "number") {
    const aNum = parseFuelSortNumber(aRaw);
    const bNum = parseFuelSortNumber(bRaw);
    const aEmpty = Number.isNaN(aNum);
    const bEmpty = Number.isNaN(bNum);
    if (aEmpty && bEmpty) return 0;
    if (aEmpty) return 1;
    if (bEmpty) return -1;
    if (aNum === bNum) return 0;
    return aNum < bNum ? -dir : dir;
  }

  if (config.type === "date") {
    const aTime = parseFuelSortDate(aRaw);
    const bTime = parseFuelSortDate(bRaw);
    const aEmpty = Number.isNaN(aTime);
    const bEmpty = Number.isNaN(bTime);
    if (aEmpty && bEmpty) return 0;
    if (aEmpty) return 1;
    if (bEmpty) return -1;
    if (aTime === bTime) return 0;
    return aTime < bTime ? -dir : dir;
  }

  return (
    String(aRaw).localeCompare(String(bRaw), undefined, {
      sensitivity: "base",
      numeric: true,
    }) * dir
  );
}

function clearFuelSortIndicators(headers) {
  headers.forEach((th) => {
    th.removeAttribute("aria-sort");
    const icon = th.querySelector(".sort-icon");
    if (icon) icon.className = "ph ph-caret-up-down sort-icon";
  });
}

function setFuelSortIndicator(th, direction) {
  if (!th) return;
  if (!direction) {
    th.removeAttribute("aria-sort");
    const icon = th.querySelector(".sort-icon");
    if (icon) icon.className = "ph ph-caret-up-down sort-icon";
    return;
  }

  th.setAttribute(
    "aria-sort",
    direction === "asc" ? "ascending" : "descending",
  );
  const icon = th.querySelector(".sort-icon");
  if (icon) {
    icon.className =
      direction === "asc"
        ? "ph ph-caret-up sort-icon"
        : "ph ph-caret-down sort-icon";
  }
}

function updateFuelSortIndicators() {
  if (!fuelSortState) return;
  const { activeColumn, activeDirection, headers } = fuelSortState;
  clearFuelSortIndicators(headers);
  if (activeColumn && activeDirection) {
    const activeHeader = headers.find(
      (th) => Number(th.dataset.column) === activeColumn,
    );
    setFuelSortIndicator(activeHeader, activeDirection);
  }
}

function sortFuelRowMetas(matchingMetas, nonMatchingMetas) {
  const byOriginal = (a, b) => a.originalOrder - b.originalOrder;

  if (!fuelSortState?.activeColumn || !fuelSortState?.activeDirection) {
    matchingMetas.sort(byOriginal);
    nonMatchingMetas.sort(byOriginal);
    return;
  }

  const { activeColumn, activeDirection } = fuelSortState;
  const byActive = (a, b) =>
    compareFuelMetaValues(a, b, activeColumn, activeDirection);

  matchingMetas.sort(byActive);
  nonMatchingMetas.sort(byActive);
}

function applyFuelRowOrder(tableBody, matchingMetas, nonMatchingMetas) {
  if (!tableBody) return false;

  const desired = [...matchingMetas, ...nonMatchingMetas].map((m) => m.row);
  const current = getFuelDataRows(tableBody);

  const sameOrder =
    desired.length === current.length &&
    desired.every((row, index) => row === current[index]);

  if (sameOrder) {
    updateFuelSortIndicators();
    return false;
  }

  const fragment = document.createDocumentFragment();
  desired.forEach((row) => fragment.appendChild(row));

  const emptyRow = tableBody.querySelector(".fuel-no-results");
  if (emptyRow) fragment.appendChild(emptyRow);

  tableBody.appendChild(fragment);
  updateFuelSortIndicators();
  return true;
}

function cycleFuelSortDirection(current) {
  if (current === "asc") return "desc";
  if (current === "desc") return null;
  return "asc";
}

function initFuelSorting() {
  const tableBody = document.getElementById("fuelTableBody");
  if (!tableBody) return;
  if (tableBody.dataset.fuelSortingInitialized === "true") return;

  tableBody.dataset.fuelSortingInitialized = "true";

  const table = tableBody.closest("table");
  if (!table) return;

  const headers = Array.from(
    table.querySelectorAll("th.sortable[data-column]"),
  ).filter((th) => FUEL_SORT_CONFIG[Number(th.dataset.column)]);

  if (headers.length === 0) return;

  fuelSortState = {
    activeColumn: null,
    activeDirection: null,
    headers,
  };

  headers.forEach((th) => {
    th.style.cursor = "pointer";
    th.tabIndex = 0;

    const activate = () => {
      const column = Number(th.dataset.column);
      if (!FUEL_SORT_CONFIG[column]) return;

      if (fuelSortState.activeColumn === column) {
        fuelSortState.activeDirection = cycleFuelSortDirection(
          fuelSortState.activeDirection,
        );
        if (!fuelSortState.activeDirection) {
          fuelSortState.activeColumn = null;
        }
      } else {
        fuelSortState.activeColumn = column;
        fuelSortState.activeDirection = "asc";
      }

      if (typeof refreshFuelTable === "function") {
        refreshFuelTable({ resetPage: false });
      }
    };

    th.addEventListener("click", activate);
    th.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });
}
