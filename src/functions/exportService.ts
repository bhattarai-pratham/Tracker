import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import { Trip } from "../data/tripdata";

export interface ExportOptions {
  format: "excel" | "pdf";
  dateRange: "7days" | "30days" | "custom";
  customStartDate?: Date;
  customEndDate?: Date;
  includePhotos?: boolean;
}

export interface FormattedTrip {
  id: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  startingOdometer: string;
  endingOdometer: string;
  distance: string;
  duration: string;
  earnings: string;
}

export interface ExportSummary {
  exportDate: string;
  dateRangeLabel: string;
  totalTrips: number;
  totalDistance: string;
  avgDistance: string;
  totalDuration: string;
  avgDuration: string;
  totalEarnings: string;
  avgEarnings: string;
}

// Filter trips by date range
export const filterTripsByDateRange = (
  trips: Trip[],
  options: ExportOptions
): Trip[] => {
  const now = new Date();
  let startDate: Date;

  switch (options.dateRange) {
    case "7days":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30days":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "custom":
      startDate = options.customStartDate || now;
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const endDate = options.customEndDate || now;

  return trips.filter((trip) => {
    const tripDate = new Date(trip.start_timestamp);
    return tripDate >= startDate && tripDate <= endDate;
  });
};

// Format date to readable string
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Format time to readable string
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Calculate duration in hours and minutes
const calculateDuration = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const durationMs = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

// Format trip data for export
export const formatTripDataForExport = (trips: Trip[]): FormattedTrip[] => {
  return trips.map((trip) => {
    const distance = (
      Number(trip.ending_odometer) - Number(trip.starting_odometer)
    ).toFixed(1);

    return {
      id: trip.id,
      startDate: formatDate(trip.start_timestamp),
      startTime: formatTime(trip.start_timestamp),
      endDate: formatDate(trip.end_timestamp),
      endTime: formatTime(trip.end_timestamp),
      startingOdometer: trip.starting_odometer,
      endingOdometer: trip.ending_odometer,
      distance: `${distance} km`,
      duration: calculateDuration(trip.start_timestamp, trip.end_timestamp),
      earnings: trip.earnings ? `$${trip.earnings.toFixed(2)}` : "No data",
    };
  });
};

// Calculate summary statistics
export const calculateSummary = (
  trips: Trip[],
  options: ExportOptions
): ExportSummary => {
  const totalTrips = trips.length;

  const totalDistance = trips.reduce((sum, trip) => {
    return (
      sum + (Number(trip.ending_odometer) - Number(trip.starting_odometer))
    );
  }, 0);

  const totalDurationMs = trips.reduce((sum, trip) => {
    const start = new Date(trip.start_timestamp).getTime();
    const end = new Date(trip.end_timestamp).getTime();
    return sum + (end - start);
  }, 0);

  const avgDistance = totalTrips > 0 ? totalDistance / totalTrips : 0;
  const avgDurationMs = totalTrips > 0 ? totalDurationMs / totalTrips : 0;

  const totalHours = Math.floor(totalDurationMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor(
    (totalDurationMs % (1000 * 60 * 60)) / (1000 * 60)
  );

  const avgHours = Math.floor(avgDurationMs / (1000 * 60 * 60));
  const avgMinutes = Math.floor(
    (avgDurationMs % (1000 * 60 * 60)) / (1000 * 60)
  );

  const totalEarnings = trips.reduce((sum, trip) => {
    return sum + (trip.earnings || 0);
  }, 0);

  const avgEarnings = totalTrips > 0 ? totalEarnings / totalTrips : 0;

  let dateRangeLabel = "";
  switch (options.dateRange) {
    case "7days":
      dateRangeLabel = "Last 7 Days";
      break;
    case "30days":
      dateRangeLabel = "Last 30 Days";
      break;
    case "custom":
      dateRangeLabel = `${formatDate(
        options.customStartDate?.toISOString() || ""
      )} - ${formatDate(options.customEndDate?.toISOString() || "")}`;
      break;
  }

  return {
    exportDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    dateRangeLabel,
    totalTrips,
    totalDistance: `${totalDistance.toFixed(1)} km`,
    avgDistance: `${avgDistance.toFixed(1)} km`,
    totalDuration: `${totalHours}h ${totalMinutes}m`,
    avgDuration: `${avgHours}h ${avgMinutes}m`,
    totalEarnings: `$${totalEarnings.toFixed(2)}`,
    avgEarnings: `$${avgEarnings.toFixed(2)}`,
  };
};

// Generate filename
export const generateFileName = (
  format: "excel" | "pdf",
  dateRange: string
): string => {
  const timestamp = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const extension = format === "excel" ? "xlsx" : "pdf";
  return `trips_export_${format}_${dateRange}_${timestamp}.${extension}`;
};

// Export to Excel (saves to Downloads folder)
export const exportToExcel = async (
  trips: Trip[],
  options: ExportOptions
): Promise<{ success: boolean; message: string; filePath?: string }> => {
  try {
    // Filter trips
    const filteredTrips = filterTripsByDateRange(trips, options);

    if (filteredTrips.length === 0) {
      return {
        success: false,
        message: "No trips found in the selected date range",
      };
    }

    // Format data
    const formattedTrips = formatTripDataForExport(filteredTrips);
    const summary = calculateSummary(filteredTrips, options);

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create Trip Data sheet
    const tripData = formattedTrips.map((trip) => ({
      "Trip ID": trip.id,
      "Start Date": trip.startDate,
      "Start Time": trip.startTime,
      "End Date": trip.endDate,
      "End Time": trip.endTime,
      "Starting Odometer": trip.startingOdometer,
      "Ending Odometer": trip.endingOdometer,
      Distance: trip.distance,
      Duration: trip.duration,
      "Earnings (AUD)": trip.earnings,
    }));

    const wsTrips = XLSX.utils.json_to_sheet(tripData);
    XLSX.utils.book_append_sheet(wb, wsTrips, "Trip Data");

    // Create Summary sheet
    const summaryData = [
      ["Trip Export Summary"],
      [],
      ["Export Date", summary.exportDate],
      ["Date Range", summary.dateRangeLabel],
      [],
      ["Total Trips", summary.totalTrips],
      ["Total Distance", summary.totalDistance],
      ["Average Distance", summary.avgDistance],
      ["Total Duration", summary.totalDuration],
      ["Average Duration", summary.avgDuration],
      ["Total Earnings", summary.totalEarnings],
      ["Average Earnings", summary.avgEarnings],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    // Write to file in Documents directory (iOS/Android accessible location)
    const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
    const fileName = generateFileName("excel", options.dateRange);
    const file = new File(Paths.document, fileName);

    await file.write(wbout);

    return {
      success: true,
      message: `Excel file saved successfully: ${fileName}`,
      filePath: file.uri,
    };
  } catch (error) {
    console.error("Excel export error:", error);
    return {
      success: false,
      message: `Export failed: ${error}`,
    };
  }
};

// Share Excel file via native share dialog
export const shareExcelFile = async (
  trips: Trip[],
  options: ExportOptions
): Promise<{ success: boolean; message: string; filePath?: string }> => {
  try {
    // Filter trips
    const filteredTrips = filterTripsByDateRange(trips, options);

    if (filteredTrips.length === 0) {
      return {
        success: false,
        message: "No trips found in the selected date range",
      };
    }

    // Format data
    const formattedTrips = formatTripDataForExport(filteredTrips);
    const summary = calculateSummary(filteredTrips, options);

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create Trip Data sheet
    const tripData = formattedTrips.map((trip) => ({
      "Trip ID": trip.id,
      "Start Date": trip.startDate,
      "Start Time": trip.startTime,
      "End Date": trip.endDate,
      "End Time": trip.endTime,
      "Starting Odometer": trip.startingOdometer,
      "Ending Odometer": trip.endingOdometer,
      Distance: trip.distance,
      Duration: trip.duration,
      "Earnings (AUD)": trip.earnings,
    }));

    const wsTrips = XLSX.utils.json_to_sheet(tripData);
    XLSX.utils.book_append_sheet(wb, wsTrips, "Trip Data");

    // Create Summary sheet
    const summaryData = [
      ["Trip Export Summary"],
      [],
      ["Export Date", summary.exportDate],
      ["Date Range", summary.dateRangeLabel],
      [],
      ["Total Trips", summary.totalTrips],
      ["Total Distance", summary.totalDistance],
      ["Average Distance", summary.avgDistance],
      ["Total Duration", summary.totalDuration],
      ["Average Duration", summary.avgDuration],
      ["Total Earnings", summary.totalEarnings],
      ["Average Earnings", summary.avgEarnings],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    // Write to file
    const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
    const fileName = generateFileName("excel", options.dateRange);
    const file = new File(Paths.cache, fileName);

    await file.write(wbout);

    // Share file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri);
    }

    return {
      success: true,
      message: "Excel file shared successfully",
      filePath: file.uri,
    };
  } catch (error) {
    console.error("Excel share error:", error);
    return {
      success: false,
      message: `Share failed: ${error}`,
    };
  }
};

// Export to PDF (saves to Downloads folder)
export const exportToPDF = async (
  trips: Trip[],
  options: ExportOptions
): Promise<{ success: boolean; message: string; filePath?: string }> => {
  try {
    // Filter trips
    const filteredTrips = filterTripsByDateRange(trips, options);

    if (filteredTrips.length === 0) {
      return {
        success: false,
        message: "No trips found in the selected date range",
      };
    }

    // Format data
    const formattedTrips = formatTripDataForExport(filteredTrips);
    const summary = calculateSummary(filteredTrips, options);

    // Generate HTML
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Trip Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #4A90E2;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              color: #4A90E2;
              font-size: 28px;
            }
            .header p {
              margin: 5px 0;
              color: #666;
            }
            .summary {
              background: #f5f5f5;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .summary h2 {
              margin-top: 0;
              color: #4A90E2;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .summary-item {
              display: flex;
              justify-content: space-between;
              padding: 10px;
              background: white;
              border-radius: 4px;
            }
            .summary-label {
              font-weight: bold;
              color: #666;
            }
            .summary-value {
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background: #4A90E2;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
            }
            tr:nth-child(even) {
              background: #f9f9f9;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #999;
              font-size: 12px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Trip Report</h1>
            <p>Generated on ${summary.exportDate}</p>
            <p>${summary.dateRangeLabel}</p>
          </div>

          <div class="summary">
            <h2>Summary Statistics</h2>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">Total Trips:</span>
                <span class="summary-value">${summary.totalTrips}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Total Distance:</span>
                <span class="summary-value">${summary.totalDistance}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Average Distance:</span>
                <span class="summary-value">${summary.avgDistance}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Total Duration:</span>
                <span class="summary-value">${summary.totalDuration}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Total Earnings:</span>
                <span class="summary-value">${summary.totalEarnings}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Average Earnings:</span>
                <span class="summary-value">${summary.avgEarnings}</span>
              </div>
            </div>
          </div>

          <h2>Trip Details</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Start Odo</th>
                <th>End Odo</th>
                <th>Distance</th>
                <th>Duration</th>
                <th>Earnings</th>
              </tr>
            </thead>
            <tbody>
              ${formattedTrips
                .map(
                  (trip) => `
                <tr>
                  <td>${trip.startDate}</td>
                  <td>${trip.startTime}</td>
                  <td>${trip.endTime}</td>
                  <td>${trip.startingOdometer}</td>
                  <td>${trip.endingOdometer}</td>
                  <td>${trip.distance}</td>
                  <td>${trip.duration}</td>
                  <td>${trip.earnings}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated by Trip Tracker App</p>
          </div>
        </body>
      </html>
    `;

    // Generate PDF to Documents directory (iOS/Android accessible location)
    const fileName = generateFileName("pdf", options.dateRange);
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // Copy to Documents folder with proper filename
    const documentsFile = new File(Paths.document, fileName);
    const tempFile = new File(uri);

    await tempFile.copy(documentsFile);

    return {
      success: true,
      message: `PDF saved successfully: ${fileName}`,
      filePath: documentsFile.uri,
    };
  } catch (error) {
    console.error("PDF export error:", error);
    return {
      success: false,
      message: `Export failed: ${error}`,
    };
  }
};

// Share PDF file via native share dialog
export const sharePDFFile = async (
  trips: Trip[],
  options: ExportOptions
): Promise<{ success: boolean; message: string; filePath?: string }> => {
  try {
    // Filter trips
    const filteredTrips = filterTripsByDateRange(trips, options);

    if (filteredTrips.length === 0) {
      return {
        success: false,
        message: "No trips found in the selected date range",
      };
    }

    // Format data
    const formattedTrips = formatTripDataForExport(filteredTrips);
    const summary = calculateSummary(filteredTrips, options);

    // Generate HTML
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Trip Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #4A90E2;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              color: #4A90E2;
              font-size: 28px;
            }
            .header p {
              margin: 5px 0;
              color: #666;
            }
            .summary {
              background: #f5f5f5;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .summary h2 {
              margin-top: 0;
              color: #4A90E2;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .summary-item {
              display: flex;
              justify-content: space-between;
              padding: 10px;
              background: white;
              border-radius: 4px;
            }
            .summary-label {
              font-weight: bold;
              color: #666;
            }
            .summary-value {
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background: #4A90E2;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
            }
            tr:nth-child(even) {
              background: #f9f9f9;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #999;
              font-size: 12px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Trip Report</h1>
            <p>Generated on ${summary.exportDate}</p>
            <p>${summary.dateRangeLabel}</p>
          </div>

          <div class="summary">
            <h2>Summary Statistics</h2>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">Total Trips:</span>
                <span class="summary-value">${summary.totalTrips}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Total Distance:</span>
                <span class="summary-value">${summary.totalDistance}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Average Distance:</span>
                <span class="summary-value">${summary.avgDistance}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Total Duration:</span>
                <span class="summary-value">${summary.totalDuration}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Total Earnings:</span>
                <span class="summary-value">${summary.totalEarnings}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Average Earnings:</span>
                <span class="summary-value">${summary.avgEarnings}</span>
              </div>
            </div>
          </div>

          <h2>Trip Details</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Start Odo</th>
                <th>End Odo</th>
                <th>Distance</th>
                <th>Duration</th>
                <th>Earnings</th>
              </tr>
            </thead>
            <tbody>
              ${formattedTrips
                .map(
                  (trip) => `
                <tr>
                  <td>${trip.startDate}</td>
                  <td>${trip.startTime}</td>
                  <td>${trip.endTime}</td>
                  <td>${trip.startingOdometer}</td>
                  <td>${trip.endingOdometer}</td>
                  <td>${trip.distance}</td>
                  <td>${trip.duration}</td>
                  <td>${trip.earnings}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated by Trip Tracker App</p>
          </div>
        </body>
      </html>
    `;

    // Generate PDF
    const { uri } = await Print.printToFileAsync({ html });

    // Share file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }

    return {
      success: true,
      message: "PDF shared successfully",
      filePath: uri,
    };
  } catch (error) {
    console.error("PDF share error:", error);
    return {
      success: false,
      message: `Share failed: ${error}`,
    };
  }
};
