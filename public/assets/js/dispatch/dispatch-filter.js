let dispatchFilterInitialized = false;

const DISPATCH_NO_RESULTS_CLASS = "dispatch-no-results";

function getRealDispatchRows(tableBody) {
  return Array.from(tableBody.querySelectorAll("tr")).filter((row) => {
    return (
      row.querySelector(".dispatch-number") ||
      row.querySelector(".dispatch-checkbox")
    );
  });
}

function removeDispatchNoResults(tableBody) {
  const helper = tableBody.querySelector("tr." + DISPATCH_NO_RESULTS_CLASS);
  if (helper) {
    helper.remove();
  }
}

function addDispatchNoResults(tableBody) {
  if (tableBody.querySelector("tr." + DISPATCH_NO_RESULTS_CLASS)) {
    return;
  }

  const tr = document.createElement("tr");
  tr.className = DISPATCH_NO_RESULTS_CLASS;

  const td = document.createElement("td");
  td.setAttribute("colspan", "11");
  td.textContent = "No dispatch records found.";

  tr.appendChild(td);
  tableBody.appendChild(tr);
}

function applyDispatchFilters() {
  const tableBody = document.getElementById("dispatchTableBody");
  if (!tableBody) {
    return;
  }

  const searchInput = document.getElementById("dispatchSearch");
  const statusFilter = document.getElementById("dispatchStatusFilter");
  const priorityFilter = document.getElementById("dispatchPriorityFilter");
  const dateFilter = document.getElementById("dispatchDateFilter");

  const searchTerm = (searchInput?.value || "").trim().toLowerCase();
  const statusValue = statusFilter?.value || "all";
  const priorityValue = priorityFilter?.value || "all";
  const dateValue = (dateFilter?.value || "").trim();

  const rows = getRealDispatchRows(tableBody);

  let matchCount = 0;

  rows.forEach((row) => {
    const dispatchNumber =
      row.querySelector(".dispatch-number")?.textContent?.trim() || "";
    const reservationNumber =
      row.querySelector(".dispatch-reservation-number")?.textContent?.trim() ||
      "";
    const patientName =
      row.querySelector(".dispatch-patient-name")?.textContent?.trim() || "";
    const requestType =
      row.querySelector(".dispatch-request-type")?.textContent?.trim() ||
      row.dataset.requestType ||
      "";
    const vehicle =
      row.querySelector(".dispatch-vehicle")?.textContent?.trim() || "";
    const driver =
      row.querySelector(".dispatch-driver")?.textContent?.trim() || "";
    const pickup = row.dataset.pickup || "";
    const destination = row.dataset.destination || "";

    const searchHaystack = [
      dispatchNumber,
      reservationNumber,
      patientName,
      requestType,
      vehicle,
      driver,
      pickup,
      destination,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      searchTerm === "" || searchHaystack.includes(searchTerm);

    const statusBadge = row.querySelector(".status-badge");
    const rowStatus = statusBadge?.textContent?.trim() || "";
    const matchesStatus =
      statusValue === "all" || rowStatus === statusValue;

    const rowPriority =
      row.querySelector(".dispatch-priority")?.textContent?.trim() ||
      row.dataset.priority ||
      "";
    const matchesPriority =
      priorityValue === "all" || rowPriority === priorityValue;

    const rowDate = (row.dataset.scheduleDate || "").trim();
    const matchesDate = dateValue === "" || rowDate === dateValue;

    const matches =
      matchesSearch && matchesStatus && matchesPriority && matchesDate;

    row.dataset.dispatchMatchesFilter = matches ? "true" : "false";

    if (matches) {
      matchCount++;
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });

  if (matchCount === 0) {
    addDispatchNoResults(tableBody);
  } else {
    removeDispatchNoResults(tableBody);
  }

  if (typeof updateDispatchPagination === "function") {
    updateDispatchPagination();
  }
}

function initDispatchFilters() {
  if (dispatchFilterInitialized) {
    return;
  }
  dispatchFilterInitialized = true;

  const searchInput = document.getElementById("dispatchSearch");
  const statusFilter = document.getElementById("dispatchStatusFilter");
  const priorityFilter = document.getElementById("dispatchPriorityFilter");
  const dateFilter = document.getElementById("dispatchDateFilter");
  const refreshBtn = document.getElementById("refreshDispatches");

  if (searchInput) {
    searchInput.addEventListener("input", applyDispatchFilters);
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", applyDispatchFilters);
  }

  if (priorityFilter) {
    priorityFilter.addEventListener("change", applyDispatchFilters);
  }

  if (dateFilter) {
    dateFilter.addEventListener("change", applyDispatchFilters);
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
      }
      if (statusFilter) {
        statusFilter.value = "all";
      }
      if (priorityFilter) {
        priorityFilter.value = "all";
      }
      if (dateFilter) {
        dateFilter.value = "";
      }

      const tableBody = document.getElementById("dispatchTableBody");
      if (tableBody) {
        getRealDispatchRows(tableBody).forEach((row) => {
          row.dataset.dispatchMatchesFilter = "true";
          row.style.display = "";
        });
        removeDispatchNoResults(tableBody);
      }

      if (typeof updateDispatchPagination === "function") {
        updateDispatchPagination();
      }

      if (typeof updateDispatchStatistics === "function") {
        updateDispatchStatistics();
      }
    });
  }
}
