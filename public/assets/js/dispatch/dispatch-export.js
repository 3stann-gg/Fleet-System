let dispatchExportInitialized = false;

const DISPATCH_EXPORT_COLUMNS = [
  "Dispatch Number",
  "Reservation Number",
  "Patient Name",
  "Request Type",
  "Vehicle",
  "Driver",
  "Pickup",
  "Destination",
  "Schedule",
  "Priority",
  "Status",
  "Contact Number",
  "Notes",
];

function getExportDispatchRows(tableBody) {
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

function readDispatchExportValue(row, className, fallbackAttr) {
  const el = row.querySelector(className);
  if (el && el.textContent.trim() !== "") {
    return el.textContent.trim();
  }
  if (fallbackAttr && row.dataset[fallbackAttr]) {
    return row.dataset[fallbackAttr];
  }
  return "Not provided";
}

function readDispatchExportDataset(row, attr) {
  const value = row.dataset[attr];
  return value && value.trim() !== "" ? value.trim() : "Not provided";
}

function buildDispatchExportData(rows) {
  return rows.map((row) => {
    const requestType =
      row.querySelector(".dispatch-request-type")?.textContent?.trim() ||
      row.dataset.requestType ||
      "";

    const priority =
      row.querySelector(".dispatch-priority")?.textContent?.trim() ||
      row.dataset.priority ||
      "";

    return {
      "Dispatch Number":
        row.querySelector(".dispatch-number")?.textContent?.trim() ||
        "Not provided",
      "Reservation Number":
        row.querySelector(".dispatch-reservation-number")?.textContent?.trim() ||
        "Not provided",
      "Patient Name":
        row.querySelector(".dispatch-patient-name")?.textContent?.trim() ||
        "Not provided",
      "Request Type": requestType.trim() === "" ? "Not provided" : requestType,
      Vehicle:
        row.querySelector(".dispatch-vehicle")?.textContent?.trim() ||
        "Not provided",
      Driver:
        row.querySelector(".dispatch-driver")?.textContent?.trim() ||
        "Not provided",
      Pickup: readDispatchExportDataset(row, "pickup"),
      Destination: readDispatchExportDataset(row, "destination"),
      Schedule:
        row.querySelector(".dispatch-schedule")?.textContent?.trim() ||
        "Not provided",
      Priority: priority.trim() === "" ? "Not provided" : priority,
      Status: row.querySelector(".status-badge")?.textContent?.trim() || "Not provided",
      "Contact Number": readDispatchExportDataset(row, "contact"),
      Notes: readDispatchExportDataset(row, "notes"),
    };
  });
}

function exportDispatchesToExcel() {
  const tableBody = document.getElementById("dispatchTableBody");
  if (!tableBody) {
    return;
  }

  if (typeof XLSX === "undefined") {
    if (typeof showToast === "function") {
      showToast("Excel export library is unavailable.", "error");
    }
    return;
  }

  const rows = getExportDispatchRows(tableBody);
  const data = buildDispatchExportData(rows);

  const worksheet = XLSX.utils.json_to_sheet(data, {
    header: DISPATCH_EXPORT_COLUMNS,
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dispatches");

  XLSX.writeFile(workbook, "HIMS_Dispatch_Report.xlsx");

  if (typeof showToast === "function") {
    showToast(
      "Dispatch report exported to Excel successfully.",
      "success"
    );
  }
}

function exportDispatchesToPDF() {
  if (typeof window.jspdf === "undefined" || typeof window.jspdf.jsPDF === "undefined") {
    if (typeof showToast === "function") {
      showToast("PDF export library is unavailable.", "error");
    }
    return;
  }

  const { jsPDF } = window.jspdf;
  const tableBody = document.getElementById("dispatchTableBody");
  if (!tableBody) {
    return;
  }

  const rows = getExportDispatchRows(tableBody);
  const data = buildDispatchExportData(rows);

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  doc.setFontSize(16);
  doc.text("Hospital Fleet Dispatch Report", 40, 40);

  doc.setFontSize(10);
  const generated = new Date().toLocaleString();
  doc.text("Generated: " + generated, 40, 60);

  doc.autoTable({
    startY: 75,
    head: [DISPATCH_EXPORT_COLUMNS],
    body: data.map((row) => DISPATCH_EXPORT_COLUMNS.map((col) => row[col])),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save("HIMS_Dispatch_Report.pdf");

  if (typeof showToast === "function") {
    showToast(
      "Dispatch report exported to PDF successfully.",
      "success"
    );
  }
}

let dispatchPDFInitialized = false;

function initDispatchPDFExport() {
  if (dispatchPDFInitialized) {
    return;
  }
  dispatchPDFInitialized = true;

  const pdfBtn = document.getElementById("exportDispatchPDF");
  if (pdfBtn) {
    pdfBtn.addEventListener("click", exportDispatchesToPDF);
  }
}

function initDispatchExport() {
  if (dispatchExportInitialized) {
    return;
  }
  dispatchExportInitialized = true;

  const exportBtn = document.getElementById("exportDispatches");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportDispatchesToExcel);
  }

  initDispatchPDFExport();
}
