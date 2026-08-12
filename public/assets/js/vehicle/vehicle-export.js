/* ==========================================
Vehicle Export Reports
========================================== */

function getVehicleReportRows() {
    const tableBody = document.getElementById("vehicleTableBody");

    if (!tableBody) return [];

    const rows =
        typeof getVehicleDataRows === "function"
            ? getVehicleDataRows(tableBody)
            : Array.from(tableBody.querySelectorAll("tr")).filter((row) => {
                  return Boolean(
                      row.querySelector(".vehicle-name") ||
                      row.querySelector(".vehicle-checkbox"),
                  );
              });

    return rows.filter((row) => row.dataset.vehicleMatchesFilter !== "false");
}

function getVehicleReportText(row, selector) {
    const element = selector ? row.querySelector(selector) : null;

    return element ? element.textContent.trim() : "";
}

function getVehicleReportData(row) {
    const brand = row.dataset.brand?.trim() || "";
    const model = row.dataset.model?.trim() || "";

    const vehicleName =
        [brand, model].filter(Boolean).join(" ") || "Not provided";

    return {
        vehicle: vehicleName,

        plate: row.dataset.plateNumber?.trim() || "Not provided",

        type: row.dataset.vehicleType?.trim() || "Not provided",

        driver: row.dataset.driverName?.trim() || "Not Assigned",

        status: row.dataset.status?.trim() || "Not provided",

        fuelType: row.dataset.fuelType?.trim() || "Not provided",

        lastService: row.dataset.lastService?.trim() || "Not provided",

        notes: row.dataset.notes?.trim() || "Not provided",
    };
}

function showVehicleReportToast(message, type) {
    if (typeof window.showToast === "function") {
        window.showToast(message, type);
    }
}

function initVehicleExport() {
    const exportButton = document.getElementById("exportVehicles");

    if (
        !exportButton ||
        exportButton.dataset.vehicleExportInitialized === "true"
    ) {
        return;
    }

    exportButton.dataset.vehicleExportInitialized = "true";

    exportButton.addEventListener("click", () => {
        const xlsx = window.XLSX;

        if (!xlsx?.utils) {
            showVehicleReportToast("Excel export is unavailable.", "error");
            return;
        }

        const headers = [
            "Vehicle",
            "Plate Number",
            "Vehicle Type",
            "Driver",
            "Status",
            "Fuel Type",
            "Last Service",
            "Notes",
        ];

        const data = getVehicleReportRows().map((row) => {
            const vehicle = getVehicleReportData(row);

            return [
                vehicle.vehicle,
                vehicle.plate,
                vehicle.type,
                vehicle.driver,
                vehicle.status,
                vehicle.fuelType,
                vehicle.lastService,
                vehicle.notes,
            ];
        });

        if (data.length === 0) {
            showVehicleReportToast("There are no vehicles to export.", "error");
            return;
        }

        try {
            const workbook = xlsx.utils.book_new();

            const worksheet = xlsx.utils.aoa_to_sheet([headers, ...data]);

            /*
             * Excel column widths
             * Same wider style used by the other reports.
             */
            worksheet["!cols"] = [
                { wch: 24 }, // Vehicle
                { wch: 18 }, // Plate Number
                { wch: 18 }, // Vehicle Type
                { wch: 22 }, // Driver
                { wch: 16 }, // Status
                { wch: 16 }, // Fuel Type
                { wch: 18 }, // Last Service
                { wch: 35 }, // Notes
            ];

            xlsx.utils.book_append_sheet(workbook, worksheet, "Fleet Vehicles");

            xlsx.writeFile(workbook, "HIMS_Vehicle_Report.xlsx");

            showVehicleReportToast(
                "Vehicle report exported to Excel successfully.",
                "success",
            );
        } catch (error) {
            console.error("VEHICLE EXCEL EXPORT ERROR:", error);

            showVehicleReportToast(
                "Unable to export vehicles to Excel.",
                "error",
            );
        }
    });
}

function initVehiclePDFExport() {
    const exportButton = document.getElementById("exportPDF");

    if (
        !exportButton ||
        exportButton.dataset.vehiclePdfExportInitialized === "true"
    ) {
        return;
    }

    exportButton.dataset.vehiclePdfExportInitialized = "true";

    exportButton.addEventListener("click", () => {
        const jsPDF = window.jspdf?.jsPDF;

        if (!jsPDF) {
            showVehicleReportToast("PDF export is unavailable.", "error");
            return;
        }

        try {
            const pdfDocument = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a4",
            });

            if (typeof pdfDocument.autoTable !== "function") {
                showVehicleReportToast("PDF export is unavailable.", "error");
                return;
            }

            pdfDocument.setFontSize(16);
            pdfDocument.text("Hospital Information Management System", 14, 15);

            pdfDocument.setFontSize(11);
            pdfDocument.text("Fleet & Transportation Management", 14, 22);

            pdfDocument.setFontSize(14);
            pdfDocument.text("Vehicle Report", 14, 29);

            pdfDocument.setFontSize(9);
            pdfDocument.text(
                `Generated: ${new Date().toLocaleString()}`,
                14,
                36,
            );

            const rows = getVehicleReportRows().map((row) => {
                const vehicle = getVehicleReportData(row);

                return [
                    vehicle.vehicle,
                    vehicle.plate,
                    vehicle.type,
                    vehicle.driver,
                    vehicle.status,
                    vehicle.fuelType,
                    vehicle.lastService,
                    vehicle.notes,
                ];
            });

            if (rows.length === 0) {
                showVehicleReportToast(
                    "There are no vehicles to export.",
                    "error",
                );
                return;
            }

            pdfDocument.autoTable({
                head: [
                    [
                        "Vehicle",
                        "Plate Number",
                        "Vehicle Type",
                        "Driver",
                        "Status",
                        "Fuel Type",
                        "Last Service",
                        "Notes",
                    ],
                ],

                body: rows,

                startY: 42,

                theme: "grid",

                styles: {
                    fontSize: 7,
                    cellPadding: 2.5,
                    overflow: "linebreak",
                },

                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontStyle: "bold",
                },

                columnStyles: {
                    0: { cellWidth: 32 },
                    1: { cellWidth: 25 },
                    2: { cellWidth: 25 },
                    3: { cellWidth: 32 },
                    4: { cellWidth: 22 },
                    5: { cellWidth: 23 },
                    6: { cellWidth: 25 },
                    7: { cellWidth: 58 },
                },

                margin: {
                    left: 10,
                    right: 10,
                },
            });

            pdfDocument.save("HIMS_Vehicle_Report.pdf");

            showVehicleReportToast(
                "Vehicle report exported to PDF successfully.",
                "success",
            );
        } catch (error) {
            console.error("VEHICLE PDF EXPORT ERROR:", error);

            showVehicleReportToast(
                "Unable to export the Vehicle report to PDF.",
                "error",
            );
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initVehicleExport();
    initVehiclePDFExport();
});