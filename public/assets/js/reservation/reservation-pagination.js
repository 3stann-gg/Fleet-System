const RESERVATION_ROWS_PER_PAGE = 10;

let reservationPaginationInitialized = false;
let reservationCurrentPage = 1;

function getRealReservationRows(tableBody) {
  return Array.from(tableBody.querySelectorAll("tr")).filter((row) => {
    if (
      row.id === "reservation-no-results" ||
      row.classList.contains("reservation-no-results")
    ) {
      return false;
    }

    const isReal =
      row.querySelector(".reservation-number") ||
      row.querySelector(".reservation-checkbox");

    return Boolean(isReal);
  });
}

function getMatchingReservationRows(tableBody) {
  return getRealReservationRows(tableBody).filter(
    (row) => row.dataset.reservationMatchesFilter !== "false",
  );
}

function renderReservationPaginationButtons(paginationEl, pageCount) {
  paginationEl.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.setAttribute("aria-label", "Previous page");
  prevBtn.innerHTML = '<i class="ph ph-caret-left"></i>';
  prevBtn.disabled = reservationCurrentPage <= 1;
  prevBtn.addEventListener("click", () => {
    if (reservationCurrentPage > 1) {
      reservationCurrentPage -= 1;
      updateReservationPagination();
    }
  });
  paginationEl.appendChild(prevBtn);

  for (let page = 1; page <= pageCount; page++) {
    const pageBtn = document.createElement("button");
    pageBtn.type = "button";
    pageBtn.textContent = String(page);
    pageBtn.setAttribute("aria-label", "Page " + page);
    if (page === reservationCurrentPage) {
      pageBtn.classList.add("active");
    }
    pageBtn.addEventListener("click", () => {
      reservationCurrentPage = page;
      updateReservationPagination();
    });
    paginationEl.appendChild(pageBtn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.setAttribute("aria-label", "Next page");
  nextBtn.innerHTML = '<i class="ph ph-caret-right"></i>';
  nextBtn.disabled = reservationCurrentPage >= pageCount;
  nextBtn.addEventListener("click", () => {
    if (reservationCurrentPage < pageCount) {
      reservationCurrentPage += 1;
      updateReservationPagination();
    }
  });
  paginationEl.appendChild(nextBtn);
}

function updateReservationPagination() {
  const tableBody = document.getElementById("reservationTableBody");
  const paginationEl = document.getElementById("reservationPagination");
  const infoEl = document.getElementById("reservationPaginationInfo");

  if (!tableBody || !paginationEl || !infoEl) {
    return;
  }

  const visibleRows = getMatchingReservationRows(tableBody);
  const total = visibleRows.length;
  const pageCount = Math.max(1, Math.ceil(total / RESERVATION_ROWS_PER_PAGE));

  if (reservationCurrentPage > pageCount) {
    reservationCurrentPage = pageCount;
  }
  if (reservationCurrentPage < 1) {
    reservationCurrentPage = 1;
  }

  const start = (reservationCurrentPage - 1) * RESERVATION_ROWS_PER_PAGE;
  const end = Math.min(start + RESERVATION_ROWS_PER_PAGE, total);

  const allReal = getRealReservationRows(tableBody);
  allReal.forEach((row) => {
    row.style.display = "none";
  });

  visibleRows.forEach((row, index) => {
    row.style.display = index >= start && index < end ? "" : "none";
  });

  if (total === 0) {
    infoEl.innerHTML =
      "Showing <strong>0–0</strong> of <strong>0</strong> reservations";
    paginationEl.style.display = "none";
  } else {
    const from = start + 1;
    const to = end;
    infoEl.innerHTML =
      "Showing <strong>" +
      from +
      "–" +
      to +
      "</strong> of <strong>" +
      total +
      "</strong> reservations";
    paginationEl.style.display = "";
  }

  renderReservationPaginationButtons(paginationEl, pageCount);
}

function initReservationPagination() {
  if (reservationPaginationInitialized) {
    return;
  }

  const tableBody = document.getElementById("reservationTableBody");
  const searchInput = document.getElementById("reservationSearch");
  const statusFilter = document.getElementById("reservationStatusFilter");
  const dateFilter = document.getElementById("reservationDateFilter");
  const refreshBtn = document.getElementById("refreshReservations");

  if (
    !tableBody ||
    !searchInput ||
    !statusFilter ||
    !dateFilter ||
    !refreshBtn
  ) {
    return;
  }

  reservationPaginationInitialized = true;

  searchInput.addEventListener("input", updateReservationPagination);
  statusFilter.addEventListener("change", updateReservationPagination);
  dateFilter.addEventListener("change", updateReservationPagination);

  refreshBtn.addEventListener("click", () => {
    reservationCurrentPage = 1;
    updateReservationPagination();
  });

  const observer = new MutationObserver(updateReservationPagination);
  observer.observe(tableBody, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  updateReservationPagination();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initReservationPagination);
} else {
  initReservationPagination();
}
