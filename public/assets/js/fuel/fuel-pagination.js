/* ==========================================
   Fuel Pagination
========================================== */

const fuelRowsPerPage = 5;
let fuelPaginationState = null;

function updateFuelPaginationInfo(info, start, end, total) {
  if (!info) return;

  const range = document.createElement("strong");
  const totalCount = document.createElement("strong");
  range.textContent = `${start}–${end}`;
  totalCount.textContent = String(total);

  info.replaceChildren(
    document.createTextNode("Showing "),
    range,
    document.createTextNode(" of "),
    totalCount,
    document.createTextNode(" fuel records"),
  );
}

function getFuelVisiblePages(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set([1, totalPages, currentPage]);
  for (let offset = -1; offset <= 1; offset += 1) {
    const page = currentPage + offset;
    if (page > 1 && page < totalPages) pages.add(page);
  }
  return Array.from(pages).sort((a, b) => a - b);
}

function createFuelPaginationButton({
  label,
  ariaLabel,
  iconClass,
  disabled = false,
  active = false,
  pageAction,
  pageNumber,
}) {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", ariaLabel);
  button.disabled = disabled;

  if (pageAction) button.dataset.fuelPage = pageAction;
  if (pageNumber != null) button.dataset.pageNumber = String(pageNumber);

  if (active) {
    button.classList.add("active");
    button.setAttribute("aria-current", "page");
  }

  if (iconClass) {
    const icon = document.createElement("i");
    icon.className = iconClass;
    icon.setAttribute("aria-hidden", "true");
    button.appendChild(icon);
  } else {
    button.textContent = String(label);
  }

  return button;
}

function buildFuelPaginationControls(totalPages) {
  const { pagination, currentPage } = fuelPaginationState;
  if (!pagination) return;

  const fragment = document.createDocumentFragment();

  fragment.appendChild(
    createFuelPaginationButton({
      ariaLabel: "Previous page",
      iconClass: "ph ph-caret-left",
      disabled: currentPage === 1 || totalPages === 0,
      pageAction: "prev",
    }),
  );

  const visiblePages = getFuelVisiblePages(currentPage, totalPages);
  let previousPage = 0;

  visiblePages.forEach((page) => {
    if (previousPage && page - previousPage > 1) {
      const ellipsis = document.createElement("button");
      ellipsis.type = "button";
      ellipsis.textContent = "…";
      ellipsis.disabled = true;
      ellipsis.setAttribute("aria-hidden", "true");
      ellipsis.setAttribute("tabindex", "-1");
      fragment.appendChild(ellipsis);
    }

    fragment.appendChild(
      createFuelPaginationButton({
        label: page,
        ariaLabel: `Page ${page}`,
        active: page === currentPage,
        pageAction: "page",
        pageNumber: page,
      }),
    );

    previousPage = page;
  });

  fragment.appendChild(
    createFuelPaginationButton({
      ariaLabel: "Next page",
      iconClass: "ph ph-caret-right",
      disabled: totalPages === 0 || currentPage === totalPages,
      pageAction: "next",
    }),
  );

  pagination.replaceChildren(fragment);
}

function applyFuelPagination({
  matchingRows = [],
  allRows = [],
  resetPage = false,
} = {}) {
  if (!fuelPaginationState) {
    allRows.forEach((row) => {
      row.style.display =
        row.dataset.matchesFilter !== "false" ? "" : "none";
    });
    if (typeof updateFuelNoResultsRow === "function") {
      updateFuelNoResultsRow(
        document.getElementById("fuelTableBody"),
        matchingRows.length === 0,
      );
    }
    return false;
  }

  const { tableBody, info } = fuelPaginationState;
  const total = matchingRows.length;
  const totalPages = Math.ceil(total / fuelRowsPerPage) || 0;

  if (resetPage) {
    fuelPaginationState.currentPage = 1;
  }

  if (totalPages === 0) {
    fuelPaginationState.currentPage = 1;
  } else {
    fuelPaginationState.currentPage = Math.min(
      Math.max(fuelPaginationState.currentPage, 1),
      totalPages,
    );
  }

  const currentPage = fuelPaginationState.currentPage;
  const startIndex = (currentPage - 1) * fuelRowsPerPage;
  const endIndex = startIndex + fuelRowsPerPage;
  const start = total === 0 ? 0 : startIndex + 1;
  const end = Math.min(endIndex, total);

  allRows.forEach((row) => {
    row.style.display = "none";
  });

  matchingRows.slice(startIndex, endIndex).forEach((row) => {
    row.style.display = "";
  });

  if (typeof updateFuelNoResultsRow === "function") {
    updateFuelNoResultsRow(tableBody, total === 0);
  }

  updateFuelPaginationInfo(info, start, end, total);

  const last = fuelPaginationState.lastRendered || {};
  const controlsChanged =
    last.currentPage !== currentPage ||
    last.totalPages !== totalPages ||
    last.rowsPerPage !== fuelRowsPerPage;

  if (controlsChanged) {
    buildFuelPaginationControls(totalPages);
    fuelPaginationState.lastRendered = {
      currentPage,
      totalPages,
      rowsPerPage: fuelRowsPerPage,
    };
  }

  return true;
}

function initFuelPagination() {
  const tableBody = document.getElementById("fuelTableBody");
  const pagination = document.getElementById("fuelPagination");
  const info = document.getElementById("fuelPaginationInfo");

  if (!tableBody || !pagination) return false;
  if (tableBody.dataset.fuelPaginationInitialized === "true") return true;

  tableBody.dataset.fuelPaginationInitialized = "true";

  fuelPaginationState = {
    tableBody,
    pagination,
    info,
    currentPage: 1,
    rowsPerPage: fuelRowsPerPage,
    lastRendered: null,
  };

  pagination.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-fuel-page]");
    if (!button || button.disabled || !fuelPaginationState) return;

    const action = button.dataset.fuelPage;
    const totalPages = fuelPaginationState.lastRendered?.totalPages || 0;

    if (action === "prev") {
      if (fuelPaginationState.currentPage <= 1) return;
      fuelPaginationState.currentPage -= 1;
    } else if (action === "next") {
      if (
        totalPages === 0 ||
        fuelPaginationState.currentPage >= totalPages
      ) {
        return;
      }
      fuelPaginationState.currentPage += 1;
    } else if (action === "page") {
      const page = Number(button.dataset.pageNumber);
      if (!page || page === fuelPaginationState.currentPage) return;
      fuelPaginationState.currentPage = page;
    } else {
      return;
    }

    if (
      typeof isFuelTableRefreshing === "function" &&
      isFuelTableRefreshing()
    ) {
      return;
    }

    if (typeof refreshFuelTable === "function") {
      refreshFuelTable({ resetPage: false });
    }
  });

  return true;
}
