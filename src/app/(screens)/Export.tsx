import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import COLORS from "../../assets/colors";
import AppButton from "../../components/AppButton";
import { Trip } from "../../data/tripdata";
import {
  ExportOptions,
  exportToExcel,
  exportToPDF,
  shareExcelFile,
  sharePDFFile,
} from "../../functions/exportService";
import { tripService } from "../../functions/tripService";

const Export = () => {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<string | null>(
    null
  );
  const [includePhotos, setIncludePhotos] = useState(false);
  const [fetchedTrips, setFetchedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      const { data, error } = await tripService.getAllTrips();
      if (error) {
        console.error("Error fetching trips:", error);
        Alert.alert("Error", "Failed to fetch trips");
      } else {
        setFetchedTrips(data || []);
      }
      setLoading(false);
    };
    fetchTrips();
  }, []);

  const exportFormats = [
    {
      id: "pdf",
      name: "PDF",
      description: "Portable Document Format",
      icon: "document",
      color: COLORS.danger,
    },
    {
      id: "excel",
      name: "Excel",
      description: "Microsoft Excel format (.xlsx)",
      icon: "grid",
      color: COLORS.accent,
      disabled: includePhotos, // Disable if photos are included
    },
  ];

  const exportOptions = [
    {
      id: "7days",
      name: "Last 7 Days",
      description: "Export trips from last 7 days",
      icon: "calendar",
    },
    {
      id: "30days",
      name: "Last 30 Days",
      description: "Export trips from last 30 days",
      icon: "time",
    },
    {
      id: "custom",
      name: "Custom Date Range",
      description: "Select custom date range",
      icon: "calendar-outline",
    },
  ];

  const handleExport = async () => {
    if (!selectedFormat) {
      Alert.alert("Select Format", "Please select an export format");
      return;
    }

    if (!selectedDateRange) {
      Alert.alert("Select Date Range", "Please select a date range");
      return;
    }

    if (selectedDateRange === "custom") {
      Alert.alert(
        "Custom Date Range",
        "Date picker will be implemented in the next update"
      );
      return;
    }

    setExporting(true);

    try {
      const exportOptions: ExportOptions = {
        format: selectedFormat as "excel" | "pdf",
        dateRange: selectedDateRange as "7days" | "30days" | "custom",
        includePhotos,
      };

      let result;
      if (selectedFormat === "excel") {
        result = await exportToExcel(fetchedTrips, exportOptions);
      } else {
        result = await exportToPDF(fetchedTrips, exportOptions);
      }

      if (result.success) {
        Alert.alert("Export Successful", result.message);
      } else {
        Alert.alert("Export Failed", result.message);
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Error", "An unexpected error occurred during export");
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (!selectedFormat) {
      Alert.alert("Select Format", "Please select an export format");
      return;
    }

    if (!selectedDateRange) {
      Alert.alert("Select Date Range", "Please select a date range");
      return;
    }

    if (selectedDateRange === "custom") {
      Alert.alert(
        "Custom Date Range",
        "Date picker will be implemented in the next update"
      );
      return;
    }

    setSharing(true);

    try {
      const exportOptions: ExportOptions = {
        format: selectedFormat as "excel" | "pdf",
        dateRange: selectedDateRange as "7days" | "30days" | "custom",
        includePhotos,
      };

      let result;
      if (selectedFormat === "excel") {
        result = await shareExcelFile(fetchedTrips, exportOptions);
      } else {
        result = await sharePDFFile(fetchedTrips, exportOptions);
      }

      if (result.success) {
        Alert.alert("Share Successful", result.message);
      } else {
        Alert.alert("Share Failed", result.message);
      }
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("Error", "An unexpected error occurred during share");
    } finally {
      setSharing(false);
    }
  };

  const handleDateRangeSelect = (rangeId: string) => {
    setSelectedDateRange(rangeId);
    if (rangeId === "custom") {
      // TODO: Open date picker modal
      Alert.alert("Custom Date Range", "Date picker will be implemented soon");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Export Data</Text>
            <Text style={styles.headerSubtitle}>
              Download your trip history
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 16, color: COLORS.muted }}>
            Loading trips...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Export Data</Text>
          <Text style={styles.headerSubtitle}>Download your trip history</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Overview */}
        <View style={styles.statsCard}>
          <Ionicons name="bar-chart" size={32} color={COLORS.primary} />
          <Text style={styles.statsValue}>{fetchedTrips.length}</Text>
          <Text style={styles.statsLabel}>Total Trips Available</Text>
        </View>

        {/* Export Format Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Format</Text>
          <View style={styles.formatGrid}>
            {exportFormats.map((format) => (
              <TouchableOpacity
                key={format.id}
                style={[
                  styles.formatCard,
                  selectedFormat === format.id && styles.formatCardSelected,
                  format.disabled && styles.formatCardDisabled,
                ]}
                onPress={() => !format.disabled && setSelectedFormat(format.id)}
                activeOpacity={0.7}
                disabled={format.disabled}
              >
                <View
                  style={[
                    styles.formatIcon,
                    { backgroundColor: format.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={format.icon as any}
                    size={28}
                    color={format.disabled ? COLORS.muted : format.color}
                  />
                </View>
                <Text
                  style={[
                    styles.formatName,
                    format.disabled && styles.formatTextDisabled,
                  ]}
                >
                  {format.name}
                </Text>
                <Text
                  style={[
                    styles.formatDescription,
                    format.disabled && styles.formatTextDisabled,
                  ]}
                >
                  {format.description}
                </Text>
                {format.disabled && (
                  <Text style={styles.disabledLabel}>
                    Not available with photos
                  </Text>
                )}
                {selectedFormat === format.id && (
                  <View style={styles.checkmark}>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={COLORS.primary}
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Export Options Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date Range</Text>
          {exportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedDateRange === option.id && styles.optionCardSelected,
              ]}
              onPress={() => handleDateRangeSelect(option.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: COLORS.primary + "20" },
                ]}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionName}>{option.name}</Text>
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>
              {selectedDateRange === option.id && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={COLORS.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Settings</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setIncludePhotos(!includePhotos)}
              activeOpacity={0.7}
            >
              <Ionicons name="image-outline" size={20} color={COLORS.muted} />
              <Text style={styles.settingText}>Include trip photos</Text>
              <View style={styles.toggle}>
                <Ionicons
                  name={includePhotos ? "checkmark-circle" : "ellipse-outline"}
                  size={24}
                  color={includePhotos ? COLORS.success : COLORS.muted}
                />
              </View>
            </TouchableOpacity>
            {includePhotos && (
              <Text style={styles.photoWarning}>
                Note: Excel export is not available when photos are included
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <AppButton
            onPress={handleExport}
            size="lg"
            variant="primary"
            shape="rounded"
            style={styles.exportButton}
            disabled={exporting || sharing}
          >
            {exporting ? (
              <>
                <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                <Text style={{ color: "#fff" }}>Exporting...</Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="download"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                Export to Downloads
              </>
            )}
          </AppButton>

          <AppButton
            onPress={handleShare}
            size="lg"
            variant="outline"
            shape="rounded"
            style={styles.shareButton}
            disabled={exporting || sharing}
          >
            {sharing ? (
              <>
                <ActivityIndicator
                  color={COLORS.primary}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ color: COLORS.primary }}>Sharing...</Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="share-outline"
                  size={20}
                  color={COLORS.primary}
                  style={{ marginRight: 8 }}
                />
                Share File
              </>
            )}
          </AppButton>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.infoText}>
            Export saves to app documents. Share opens native share dialog to
            save anywhere.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

export default Export;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
    color: COLORS.muted,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  formatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  formatCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formatCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "05",
  },
  formatCardDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.card,
  },
  formatTextDisabled: {
    color: COLORS.muted,
  },
  disabledLabel: {
    fontSize: 10,
    color: COLORS.danger,
    marginTop: 4,
    textAlign: "center",
  },
  formatIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  formatName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  formatDescription: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 16,
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "05",
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: COLORS.muted,
  },
  settingsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  toggle: {
    marginLeft: "auto",
  },
  settingDivider: {
    height: 1,
    backgroundColor: COLORS.card,
    marginVertical: 16,
  },
  photoWarning: {
    fontSize: 12,
    color: COLORS.warning,
    marginTop: 12,
    fontStyle: "italic",
  },
  actionButtons: {
    gap: 12,
    marginBottom: 16,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.primary + "10",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
});
