let reservationFiltersInitialized = false;

function initReservationFilters() {
  if (reservationFiltersInitialized) return;

  const searchInput = document.getElementById("reservationSearch");
  const statusFilter = document.getElementById("reservationStatusFilter");
  const dateFilter = document.getElementById("reservationDateFilter");
  const refreshButton = document.getElementById("refreshReservations");
  const tableBody = document.getElementById("reservationTableBody");

  if (!searchInput || !statusFilter || !dateFilter || !refreshButton || !tableBody) {
    return;
  }

  reservationFiltersInitialized = true;

  const getRowText = (row, selector) => {
    const el = row.querySelector(selector);
    return el ? el.textContent.trim() : "";
  };

  const removeNoResultsRow = () => {
    const existing = tableBody.querySelector("tr.reservation-no-results");
    if (existing) existing.remove();
  };

  const addNoResultsRow = () => {
    if (tableBody.querySelector("tr.reservation-no-results")) return;
    const tr = document.createElement("tr");
    tr.className = "reservation-no-results";
    const td = document.createElement("td");
    td.colSpan = 10;
    td.textContent = "No reservations found.";
    tr.appendChild(td);
    tableBody.appendChild(tr);
  };

  const applyFilters = () => {
    const term = searchInput.value.trim().toLowerCase();
    const statusValue = statusFilter.value;
    const dateValue = dateFilter.value;

    const rows = Array.from(
      tableBody.querySelectorAll("tr:not(.reservation-no-results)"),
    );

    let matchCount = 0;

    rows.forEach((row) => {
      const isReal =
        row.querySelector(".reservation-number") ||
        row.querySelector(".reservation-checkbox");

      if (!isReal) {
        return;
      }

      const number = getRowText(row, ".reservation-number").toLowerCase();
      const patient = getRowText(row, ".patient-name").toLowerCase();
      const vehicle = getRowText(row, ".reservation-vehicle").toLowerCase();
      const driver = getRowText(row, ".reservation-driver").toLowerCase();
      const pickup = getRowText(row, ".reservation-pickup").toLowerCase();
      const destination = getRowText(row, ".reservation-destination").toLowerCase();

      const matchesSearch =
        term === "" ||
        number.includes(term) ||
        patient.includes(term) ||
        vehicle.includes(term) ||
        driver.includes(term) ||
        pickup.includes(term) ||
        destination.includes(term);

      const rowStatus = getRowText(row, ".status-badge");
      const matchesStatus =
        statusValue === "all" || rowStatus === statusValue;

      const rowDate = row.dataset.scheduleDate || "";
      const matchesDate = dateValue === "" || rowDate === dateValue;

      const matches = matchesSearch && matchesStatus && matchesDate;
      row.dataset.reservationMatchesFilter = matches ? "true" : "false";
      if (matches) {
        matchCount++;
      }
    });

    if (matchCount === 0) {
      addNoResultsRow();
    } else {
      removeNoResultsRow();
    }

    if (typeof updateReservationPagination === "function") {
      updateReservationPagination();
    }
  };

  searchInput.addEventListener("input", applyFilters);
  statusFilter.addEventListener("change", applyFilters);
  dateFilter.addEventListener("change", applyFilters);

  refreshButton.addEventListener("click", () => {
    searchInput.value = "";
    statusFilter.value = "all";
    dateFilter.value = "";

    const rows = Array.from(
      tableBody.querySelectorAll("tr:not(.reservation-no-results)"),
    );
    rows.forEach((row) => {
      const isReal =
        row.querySelector(".reservation-number") ||
        row.querySelector(".reservation-checkbox");
      if (!isReal) {
        return;
      }
      row.dataset.reservationMatchesFilter = "true";
    });

    removeNoResultsRow();

    if (typeof updateReservationPagination === "function") {
      updateReservationPagination();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initReservationFilters);
} else {
  initReservationFilters();
}
