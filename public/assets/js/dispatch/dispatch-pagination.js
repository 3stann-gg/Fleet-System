let dispatchPaginationInitialized = false;

const DISPATCH_ROWS_PER_PAGE = 10;

let dispatchCurrentPage = 1;

function getMatchingDispatchRows(tableBody) {
  return Array.from(tableBody.querySelectorAll("tr")).filter((row) => {
    if (row.classList.contains("dispatch-no-results")) {
      return false;
    }

    const isReal =
      row.querySelector(".dispatch-number") !== null ||
      row.querySelector(".dispatch-checkbox") !== null;

    if (!isReal) {
      return false;
    }

    return row.dataset.dispatchMatchesFilter !== "false";
  });
}

function getTotalDispatchPages(matchingCount) {
  return Math.max(1, Math.ceil(matchingCount / DISPATCH_ROWS_PER_PAGE));
}

function buildDispatchPaginationControls(paginationEl, totalPages) {
  paginationEl.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.setAttribute("aria-label", "Previous page");
  prevBtn.innerHTML = '<i class="ph ph-caret-left"></i>';
  prevBtn.dataset.dispatchPaginationAction = "prev";
  paginationEl.appendChild(prevBtn);

  for (let page = 1; page <= totalPages; page++) {
    const pageBtn = document.createElement("button");
    pageBtn.type = "button";
    pageBtn.textContent = String(page);
    pageBtn.setAttribute("aria-label", "Page " + page);
    pageBtn.dataset.dispatchPaginationAction = "page";
    pageBtn.dataset.dispatchPage = String(page);
    paginationEl.appendChild(pageBtn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.setAttribute("aria-label", "Next page");
  nextBtn.innerHTML = '<i class="ph ph-caret-right"></i>';
  nextBtn.dataset.dispatchPaginationAction = "next";
  paginationEl.appendChild(nextBtn);
}

function initDispatchPagination() {
  if (dispatchPaginationInitialized) {
    return;
  }
  dispatchPaginationInitialized = true;

  const refreshBtn = document.getElementById("refreshDispatches");

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      dispatchCurrentPage = 1;
      updateDispatchPagination();
    });
  }

  const paginationEl = document.getElementById("dispatchPagination");

  if (paginationEl) {
    paginationEl.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-dispatch-pagination-action]");
      if (!btn) {
        return;
      }

      const tableBody = document.getElementById("dispatchTableBody");
      if (!tableBody) {
        return;
      }

      const matchingRows = getMatchingDispatchRows(tableBody);
      const totalPages = getTotalDispatchPages(matchingRows.length);

      const action = btn.dataset.dispatchPaginationAction;

      if (action === "prev") {
        if (dispatchCurrentPage > 1) {
          dispatchCurrentPage--;
        }
      } else if (action === "next") {
        if (dispatchCurrentPage < totalPages) {
          dispatchCurrentPage++;
        }
      } else if (action === "page") {
        const targetPage = Number(btn.dataset.dispatchPage);
        if (!Number.isNaN(targetPage)) {
          dispatchCurrentPage = targetPage;
        }
      }

      updateDispatchPagination();
    });
  }

  updateDispatchPagination();
}

function updateDispatchPagination() {
  const tableBody = document.getElementById("dispatchTableBody");
  const paginationEl = document.getElementById("dispatchPagination");
  const infoEl = document.getElementById("dispatchPaginationInfo");

  if (!tableBody || !paginationEl || !infoEl) {
    return;
  }

  const matchingRows = getMatchingDispatchRows(tableBody);
  const totalMatching = matchingRows.length;
  const totalPages = getTotalDispatchPages(totalMatching);

  if (dispatchCurrentPage > totalPages) {
    dispatchCurrentPage = totalPages;
  }
  if (dispatchCurrentPage < 1) {
    dispatchCurrentPage = 1;
  }

  if (totalMatching === 0) {
    paginationEl.style.display = "none";
    infoEl.innerHTML =
      "Showing <strong>0–0</strong> of <strong>0</strong> dispatches";

    matchingRows.forEach((row) => {
      row.style.display = "none";
    });

    return;
  }

  paginationEl.style.display = "";

  const start = (dispatchCurrentPage - 1) * DISPATCH_ROWS_PER_PAGE;
  const end = Math.min(start + DISPATCH_ROWS_PER_PAGE, totalMatching);

  matchingRows.forEach((row, index) => {
    row.style.display = index >= start && index < end ? "" : "none";
  });

  infoEl.innerHTML =
    "Showing <strong>" +
    (start + 1) +
    "–" +
    end +
    "</strong> of <strong>" +
    totalMatching +
    "</strong> dispatches";

  buildDispatchPaginationControls(paginationEl, totalPages);

  const prevBtn = paginationEl.querySelector('[data-dispatch-pagination-action="prev"]');
  const nextBtn = paginationEl.querySelector('[data-dispatch-pagination-action="next"]');

  if (prevBtn) {
    prevBtn.disabled = dispatchCurrentPage === 1;
  }
  if (nextBtn) {
    nextBtn.disabled = dispatchCurrentPage === totalPages;
  }

  paginationEl
    .querySelectorAll('[data-dispatch-pagination-action="page"]')
    .forEach((pageBtn) => {
      const page = Number(pageBtn.dataset.dispatchPage);
      if (page === dispatchCurrentPage) {
        pageBtn.classList.add("active");
      } else {
        pageBtn.classList.remove("active");
      }
    });
}
