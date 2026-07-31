/* ==========================================
   Maintenance Excel Export
   Exports all rows matching Search + Filters,
   in current sort order, ignoring pagination.
========================================== */

function getMaintenanceExportRows() {
  const tableBody = document.getElementById("maintenanceTableBody");

  if (!tableBody) return [];

  const rows =
    typeof getMaintenanceDataRows === "function"
      ? getMaintenanceDataRows(tableBody)
      : Array.from(tableBody.querySelectorAll("tr")).filter((row) => {
          const isHelper =
            row.classList.contains("maintenance-no-results") ||
            row.classList.contains("helper-row") ||
            row.classList.contains("empty-state") ||
            row.dataset.helperRow === "true";

          return (
            !isHelper &&
            Boolean(
              row.querySelector(".maintenance-number") ||
                row.querySelector(".maintenance-checkbox") ||
                row.querySelector(".maintenance-vehicle"),
            )
          );
        });

  /* DOM order already reflects active sort; pagination only toggles display */
  return rows.filter((row) => row.dataset.matchesFilter !== "false");
}

function getMaintenanceExportText(row, selector) {
  const element = selector ? row.querySelector(selector) : null;
  const value = element ? element.textContent : "";

  return value ? value.trim() : "";
}

function getMaintenanceExportCost(row) {
  const raw = row.dataset.cost;

  if (raw != null && String(raw).trim() !== "") {
    const parsed = Number.parseFloat(String(raw).replace(/[^\d.-]/g, ""));
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  const display = getMaintenanceExportText(row, ".maintenance-cost");
  const fromDisplay = Number.parseFloat(display.replace(/[^\d.-]/g, ""));

  return Number.isNaN(fromDisplay) ? display : fromDisplay;
}

function getMaintenanceExportData(row) {
  return {
    number: getMaintenanceExportText(row, ".maintenance-number"),
    vehicle: getMaintenanceExportText(row, ".maintenance-vehicle"),
    serviceType: getMaintenanceExportText(row, ".maintenance-service-type"),
    technician: getMaintenanceExportText(row, ".maintenance-technician"),
    scheduledDate: getMaintenanceExportText(row, ".maintenance-scheduled-date"),
    completionDate: getMaintenanceExportText(
      row,
      ".maintenance-completion-date",
    ),
    cost: getMaintenanceExportCost(row),
    priority: getMaintenanceExportText(row, ".maintenance-priority"),
    status: getMaintenanceExportText(row, ".status-badge"),
    description: (row.dataset.description || "").trim(),
    partsUsed: (row.dataset.partsUsed || "").trim(),
    notes: (row.dataset.notes || "").trim(),
    odometer: (row.dataset.odometer || "").trim(),
  };
}

function getMaintenanceExportDateStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMaintenanceExportFilename() {
  return `maintenance-records-${getMaintenanceExportDateStamp()}.xlsx`;
}

function getMaintenancePdfFilename() {
  return `maintenance-records-${getMaintenanceExportDateStamp()}.pdf`;
}

function formatMaintenanceExportCostDisplay(cost) {
  if (typeof cost === "number" && !Number.isNaN(cost)) {
    return `₱${cost.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return cost == null ? "" : String(cost);
}

function showMaintenanceExportToast(message, type) {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else if (
    typeof window !== "undefined" &&
    typeof window.showToast === "function"
  ) {
    window.showToast(message, type);
  }
}

function buildMaintenanceExportSheetData(rows) {
  const headers = [
    "Maintenance No.",
    "Vehicle",
    "Service Type",
    "Technician / Workshop",
    "Scheduled Date",
    "Completion Date",
    "Cost",
    "Priority",
    "Status",
    "Odometer",
    "Description",
    "Parts Used",
    "Notes",
  ];

  const body = rows.map((row) => {
    const record = getMaintenanceExportData(row);

    return [
      record.number,
      record.vehicle,
      record.serviceType,
      record.technician,
      record.scheduledDate,
      record.completionDate,
      record.cost,
      record.priority,
      record.status,
      record.odometer,
      record.description,
      record.partsUsed,
      record.notes,
    ];
  });

  return [headers, ...body];
}

function exportMaintenanceToExcel() {
  const xlsx = window.XLSX;

  if (!xlsx?.utils) {
    showMaintenanceExportToast("Excel export is unavailable.", "error");
    return;
  }

  const rows = getMaintenanceExportRows();

  if (rows.length === 0) {
    showMaintenanceExportToast(
      "No maintenance records available to export.",
      "warning",
    );
    return;
  }

  try {
    const data = buildMaintenanceExportSheetData(rows);
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet(data);

    xlsx.utils.book_append_sheet(workbook, worksheet, "Maintenance Records");
    xlsx.writeFile(workbook, getMaintenanceExportFilename());
    showMaintenanceExportToast(
      "Maintenance records exported successfully.",
      "success",
    );
  } catch (error) {
    console.error("Maintenance Excel export failed:", error);
    showMaintenanceExportToast(
      "Unable to export maintenance records.",
      "error",
    );
  }
}

function initMaintenanceExcelExport() {
  const exportButton = document.getElementById("exportMaintenance");

  if (
    !exportButton ||
    exportButton.dataset.maintenanceExcelExportInitialized === "true"
  ) {
    return;
  }

  exportButton.dataset.maintenanceExcelExportInitialized = "true";
  exportButton.type = "button";

  exportButton.addEventListener("click", (event) => {
    event.preventDefault();
    exportMaintenanceToExcel();
  });
}

/** Alias matching other module naming */
function initMaintenanceExport() {
  initMaintenanceExcelExport();
}

/* ==========================================
   Maintenance PDF Export
========================================== */

function exportMaintenanceToPdf() {
  const jsPDF = window.jspdf?.jsPDF;

  if (!jsPDF) {
    showMaintenanceExportToast("PDF export is unavailable.", "error");
    return;
  }

  const rows = getMaintenanceExportRows();

  if (rows.length === 0) {
    showMaintenanceExportToast(
      "No maintenance records available to export.",
      "warning",
    );
    return;
  }

  try {
    const pdfDocument = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    if (typeof pdfDocument.autoTable !== "function") {
      showMaintenanceExportToast("PDF export is unavailable.", "error");
      return;
    }

    const generatedAt = new Date();
    const generatedDate = generatedAt.toLocaleDateString();
    const generatedTime = generatedAt.toLocaleTimeString();

    pdfDocument.setFontSize(16);
    pdfDocument.setTextColor(0, 168, 107);
    pdfDocument.text("Hospital Information Management System", 14, 14);

    pdfDocument.setFontSize(11);
    pdfDocument.setTextColor(0, 0, 0);
    pdfDocument.text("Fleet & Transportation Management", 14, 21);

    pdfDocument.setFontSize(14);
    pdfDocument.text("Maintenance Records Report", 14, 30);

    pdfDocument.setFontSize(9);
    pdfDocument.text(`Generated Date: ${generatedDate}`, 14, 38);
    pdfDocument.text(`Generated Time: ${generatedTime}`, 14, 43);
    pdfDocument.text(`Total Exported Records: ${rows.length}`, 14, 48);

    const body = rows.map((row) => {
      const record = getMaintenanceExportData(row);

      return [
        record.number,
        record.vehicle,
        record.serviceType,
        record.technician,
        record.scheduledDate,
        record.completionDate,
        formatMaintenanceExportCostDisplay(record.cost),
        record.priority,
        record.status,
        record.notes || record.description || "",
      ];
    });

    pdfDocument.autoTable({
      head: [
        [
          "Maintenance No.",
          "Vehicle",
          "Service Type",
          "Technician / Workshop",
          "Scheduled Date",
          "Completion Date",
          "Cost",
          "Priority",
          "Status",
          "Notes",
        ],
      ],
      body,
      startY: 54,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak",
        valign: "top",
      },
      headStyles: {
        fillColor: [0, 168, 107],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      margin: { top: 16, right: 12, bottom: 14, left: 12 },
      showHead: "everyPage",
      didDrawPage: (data) => {
        const pageSize = pdfDocument.internal.pageSize;
        const pageHeight = pageSize.height
          ? pageSize.height
          : pageSize.getHeight();
        const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
        const pageNumber = pdfDocument.internal.getNumberOfPages();

        pdfDocument.setFontSize(8);
        pdfDocument.setTextColor(100);
        pdfDocument.text(
          `Page ${pageNumber}`,
          pageWidth - 12,
          pageHeight - 8,
          { align: "right" },
        );
      },
    });

    pdfDocument.save(getMaintenancePdfFilename());
    showMaintenanceExportToast(
      "Maintenance PDF exported successfully.",
      "success",
    );
  } catch (error) {
    console.error("Maintenance PDF export failed:", error);
    showMaintenanceExportToast(
      "Unable to export maintenance report.",
      "error",
    );
  }
}

function initMaintenancePDFExport() {
  const exportButton = document.getElementById("exportMaintenancePDF");

  if (
    !exportButton ||
    exportButton.dataset.maintenancePdfExportInitialized === "true"
  ) {
    return;
  }

  exportButton.dataset.maintenancePdfExportInitialized = "true";
  exportButton.type = "button";

  exportButton.addEventListener("click", (event) => {
    event.preventDefault();
    exportMaintenanceToPdf();
  });
}
