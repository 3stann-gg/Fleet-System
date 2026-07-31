/* ==========================================
   Fuel Excel + PDF Export
   Processed dataset: Search + Filters + Sort, no pagination
========================================== */

function getFuelExportRows() {
  const tableBody = document.getElementById("fuelTableBody");
  if (!tableBody) return [];

  const rows =
    typeof getFuelDataRows === "function"
      ? getFuelDataRows(tableBody)
      : Array.from(tableBody.querySelectorAll("tr")).filter((row) => {
          const isHelper =
            row.classList.contains("fuel-no-results") ||
            row.classList.contains("helper-row") ||
            row.classList.contains("empty-state") ||
            row.dataset.helperRow === "true";
          return (
            !isHelper &&
            Boolean(
              row.querySelector(".fuel-number") ||
                row.dataset.fuelId ||
                row.dataset.fuelNumber,
            )
          );
        });

  return rows.filter((row) => row.dataset.matchesFilter !== "false");
}

/** Alias for shared processed output access */
function getProcessedFuelRecords(options = {}) {
  const includePagination = options.includePagination === true;
  if (includePagination) {
    const tableBody = document.getElementById("fuelTableBody");
    if (!tableBody || typeof getFuelDataRows !== "function") return [];
    return getFuelDataRows(tableBody).filter(
      (row) =>
        row.dataset.matchesFilter !== "false" && row.style.display !== "none",
    );
  }
  return getFuelExportRows();
}

function getFuelExportText(row, selector) {
  const element = selector ? row.querySelector(selector) : null;
  const value = element ? element.textContent : "";
  return value ? value.trim() : "";
}

function getFuelExportNumber(row, datasetKey, selector) {
  const raw = row.dataset[datasetKey];
  if (raw != null && String(raw).trim() !== "") {
    const parsed = Number.parseFloat(String(raw).replace(/[^\d.-]/g, ""));
    if (!Number.isNaN(parsed)) return parsed;
  }
  const display = getFuelExportText(row, selector);
  const fromDisplay = Number.parseFloat(display.replace(/[^\d.-]/g, ""));
  return Number.isNaN(fromDisplay) ? display : fromDisplay;
}

function getFuelExportData(row) {
  return {
    number: getFuelExportText(row, ".fuel-number"),
    date: getFuelExportText(row, ".fuel-date"),
    time: (row.dataset.refuelTime || "").trim(),
    vehicle: getFuelExportText(row, ".fuel-vehicle"),
    plate: getFuelExportText(row, ".fuel-plate"),
    driver: getFuelExportText(row, ".fuel-driver"),
    fuelType: getFuelExportText(row, ".fuel-type"),
    quantity: getFuelExportNumber(row, "quantity", ".fuel-quantity"),
    costPerLiter: getFuelExportNumber(
      row,
      "costPerLiter",
      ".fuel-cost-per-liter",
    ),
    totalCost: getFuelExportNumber(row, "totalCost", ".fuel-total-cost"),
    odometer: getFuelExportNumber(row, "odometer", ".fuel-odometer"),
    station: getFuelExportText(row, ".fuel-station"),
    receipt: (row.dataset.receipt || "").trim(),
    payment: (row.dataset.payment || "").trim(),
    notes: (row.dataset.notes || "").trim(),
  };
}

function getFuelExportDateStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getFuelExportFilename() {
  return `fuel-records-${getFuelExportDateStamp()}.xlsx`;
}

function getFuelPdfFilename() {
  return `fuel-records-${getFuelExportDateStamp()}.pdf`;
}

function formatFuelExportCurrency(value) {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return `₱${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return value == null ? "" : String(value);
}

function formatFuelExportQuantity(value) {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return (
      value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " L"
    );
  }
  return value == null ? "" : String(value);
}

function getFuelExportSummary(rows) {
  let liters = 0;
  let cost = 0;

  rows.forEach((row) => {
    const record = getFuelExportData(row);
    const q =
      typeof record.quantity === "number"
        ? record.quantity
        : Number.parseFloat(record.quantity);
    const c =
      typeof record.totalCost === "number"
        ? record.totalCost
        : Number.parseFloat(record.totalCost);
    if (!Number.isNaN(q)) liters += q;
    if (!Number.isNaN(c)) cost += c;
  });

  const avg = liters > 0 ? cost / liters : 0;

  return {
    totalRecords: rows.length,
    totalLiters: liters,
    totalCost: cost,
    averagePerLiter: avg,
  };
}

function showFuelExportToast(message, type) {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else if (
    typeof window !== "undefined" &&
    typeof window.showToast === "function"
  ) {
    window.showToast(message, type);
  }
}

function buildFuelExportSheetData(rows) {
  const headers = [
    "Fuel Record No.",
    "Date",
    "Time",
    "Vehicle",
    "Plate No.",
    "Driver",
    "Fuel Type",
    "Quantity (L)",
    "Cost per Liter",
    "Total Cost",
    "Odometer",
    "Fuel Station",
    "Receipt / Reference No.",
    "Payment Method",
    "Notes",
  ];

  const body = rows.map((row) => {
    const record = getFuelExportData(row);
    return [
      record.number,
      record.date,
      record.time,
      record.vehicle,
      record.plate,
      record.driver,
      record.fuelType,
      typeof record.quantity === "number" ? record.quantity : record.quantity,
      typeof record.costPerLiter === "number"
        ? record.costPerLiter
        : record.costPerLiter,
      typeof record.totalCost === "number" ? record.totalCost : record.totalCost,
      typeof record.odometer === "number" ? record.odometer : record.odometer,
      record.station,
      record.receipt,
      record.payment,
      record.notes,
    ];
  });

  return [headers, ...body];
}

function exportFuelToExcel() {
  const xlsx = window.XLSX;

  if (!xlsx?.utils) {
    showFuelExportToast("Excel export is unavailable.", "error");
    return;
  }

  const rows = getFuelExportRows();

  if (rows.length === 0) {
    showFuelExportToast("No fuel records available to export.", "warning");
    return;
  }

  try {
    const data = buildFuelExportSheetData(rows);
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Fuel Records");
    xlsx.writeFile(workbook, getFuelExportFilename());
    showFuelExportToast("Fuel records exported successfully.", "success");
  } catch (error) {
    console.error("Fuel Excel export failed:", error);
    showFuelExportToast("Unable to export fuel records.", "error");
  }
}

function exportFuelToPdf() {
  const jsPDF = window.jspdf?.jsPDF;

  if (!jsPDF) {
    showFuelExportToast("PDF export is unavailable.", "error");
    return;
  }

  const rows = getFuelExportRows();

  if (rows.length === 0) {
    showFuelExportToast("No fuel records available to export.", "warning");
    return;
  }

  try {
    const pdfDocument = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    if (typeof pdfDocument.autoTable !== "function") {
      showFuelExportToast("PDF export is unavailable.", "error");
      return;
    }

    const generatedAt = new Date();
    const generatedDate = generatedAt.toLocaleDateString();
    const generatedTime = generatedAt.toLocaleTimeString();
    const summary = getFuelExportSummary(rows);

    pdfDocument.setFontSize(16);
    pdfDocument.setTextColor(0, 168, 107);
    pdfDocument.text("Hospital Information Management System", 14, 14);

    pdfDocument.setFontSize(11);
    pdfDocument.setTextColor(0, 0, 0);
    pdfDocument.text("Fleet & Transportation Management", 14, 21);

    pdfDocument.setFontSize(14);
    pdfDocument.text("Fuel Records Report", 14, 30);

    pdfDocument.setFontSize(9);
    pdfDocument.text(`Generated Date: ${generatedDate}`, 14, 38);
    pdfDocument.text(`Generated Time: ${generatedTime}`, 14, 43);
    pdfDocument.text(`Total Exported Records: ${summary.totalRecords}`, 14, 48);
    pdfDocument.text(
      `Total Fuel Consumed: ${formatFuelExportQuantity(summary.totalLiters)}`,
      14,
      53,
    );
    pdfDocument.text(
      `Total Fuel Cost: ${formatFuelExportCurrency(summary.totalCost)}`,
      14,
      58,
    );
    pdfDocument.text(
      `Average Cost per Liter: ${formatFuelExportCurrency(summary.averagePerLiter)}/L`,
      14,
      63,
    );

    const body = rows.map((row) => {
      const record = getFuelExportData(row);
      return [
        record.number,
        record.date,
        record.vehicle,
        record.plate,
        record.driver,
        record.fuelType,
        formatFuelExportQuantity(record.quantity),
        formatFuelExportCurrency(record.costPerLiter),
        formatFuelExportCurrency(record.totalCost),
        typeof record.odometer === "number"
          ? record.odometer.toLocaleString()
          : record.odometer,
        record.station,
        record.receipt,
      ];
    });

    pdfDocument.autoTable({
      head: [
        [
          "Fuel Record No.",
          "Date",
          "Vehicle",
          "Plate No.",
          "Driver",
          "Fuel Type",
          "Quantity",
          "Cost / L",
          "Total Cost",
          "Odometer",
          "Fuel Station",
          "Receipt / Ref.",
        ],
      ],
      body,
      startY: 68,
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
        overflow: "linebreak",
        valign: "top",
      },
      headStyles: {
        fillColor: [0, 168, 107],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 7,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      margin: { top: 16, right: 10, bottom: 14, left: 10 },
      showHead: "everyPage",
      didDrawPage: () => {
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

    pdfDocument.save(getFuelPdfFilename());
    showFuelExportToast("Fuel PDF exported successfully.", "success");
  } catch (error) {
    console.error("Fuel PDF export failed:", error);
    showFuelExportToast("Unable to export fuel report.", "error");
  }
}

function initFuelExcelExport() {
  const exportButton = document.getElementById("exportFuel");

  if (
    !exportButton ||
    exportButton.dataset.fuelExcelExportInitialized === "true"
  ) {
    return;
  }

  exportButton.dataset.fuelExcelExportInitialized = "true";
  exportButton.type = "button";

  exportButton.addEventListener("click", (event) => {
    event.preventDefault();
    exportFuelToExcel();
  });
}

function initFuelPDFExport() {
  const exportButton = document.getElementById("exportFuelPDF");

  if (
    !exportButton ||
    exportButton.dataset.fuelPdfExportInitialized === "true"
  ) {
    return;
  }

  exportButton.dataset.fuelPdfExportInitialized = "true";
  exportButton.type = "button";

  exportButton.addEventListener("click", (event) => {
    event.preventDefault();
    exportFuelToPdf();
  });
}

function initFuelExport() {
  initFuelExcelExport();
  initFuelPDFExport();
}
