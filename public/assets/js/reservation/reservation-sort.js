let reservationSortInitialized = false;

function initReservationSorting() {
  if (reservationSortInitialized) return;

  const tableBody = document.getElementById("reservationTableBody");
  if (!tableBody) return;

  reservationSortInitialized = true;

  const sortState = new Map();
  const sortConfig = {
    1: ".reservation-number",
    2: ".patient-name",
    3: ".reservation-vehicle",
    4: ".reservation-driver",
    5: ".reservation-pickup",
    6: ".reservation-destination",
    7: ".reservation-schedule",
    8: ".status-badge",
  };

  const sortableHeaders = Array.from(
    document.querySelectorAll("th.sortable[data-column]")
  );

  sortableHeaders.forEach((th) => {
    const column = th.dataset.column;
    if (!sortConfig[column]) return;

    th.addEventListener("click", () => {
      const current = sortState.get(column) || "asc";
      const next = current === "asc" ? "desc" : "asc";
      sortState.set(column, next);

      const selector = sortConfig[column];
      const rows = Array.from(tableBody.querySelectorAll("tr"));

      const noResultsRow = rows.find(
        (row) =>
          row.id === "reservation-no-results" ||
          row.classList.contains("reservation-no-results")
      );

      const realRows = rows.filter((row) => {
        if (
          row.id === "reservation-no-results" ||
          row.classList.contains("reservation-no-results")
        ) {
          return false;
        }
        return (
          row.querySelector(".reservation-number") ||
          row.querySelector(".reservation-checkbox")
        );
      });

      const matchingRows = realRows.filter(
        (row) => row.dataset.reservationMatchesFilter !== "false"
      );

      const nonMatchingRows = realRows.filter(
        (row) => row.dataset.reservationMatchesFilter === "false"
      );

      matchingRows.sort((a, b) => {
        const aText = (a.querySelector(selector)?.textContent || "").trim();
        const bText = (b.querySelector(selector)?.textContent || "").trim();
        const cmp = aText.localeCompare(bText, undefined, {
          numeric: true,
          sensitivity: "base",
        });
        return next === "asc" ? cmp : -cmp;
      });

      const fragment = document.createDocumentFragment();
      matchingRows.forEach((row) => fragment.appendChild(row));
      nonMatchingRows.forEach((row) => fragment.appendChild(row));

      if (noResultsRow) {
        fragment.appendChild(noResultsRow);
      }

      tableBody.appendChild(fragment);

      sortableHeaders.forEach((h) => {
        const icon = h.querySelector(".sort-icon");
        if (h.dataset.column === column) {
          h.setAttribute(
            "aria-sort",
            next === "asc" ? "ascending" : "descending"
          );
          if (icon) {
            icon.className = next === "asc"
              ? "ph ph-caret-up sort-icon"
              : "ph ph-caret-down sort-icon";
          }
        } else {
          h.removeAttribute("aria-sort");
          if (icon) {
            icon.className = "ph ph-caret-up-down sort-icon";
          }
        }
      });

      if (typeof updateReservationPagination === "function") {
        updateReservationPagination();
      }
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initReservationSorting);
} else {
  initReservationSorting();
}
