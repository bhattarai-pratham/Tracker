import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
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
  exportToPDF,
  sharePDFFile,
} from "../../functions/exportService";
import { tripService } from "../../functions/tripService";

const getDefaultCustomStartDate = (): Date => {
  const start = new Date();
  start.setDate(start.getDate() - 7);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getDefaultCustomEndDate = (): Date => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end;
};

const formatCustomDisplayDate = (date: Date | null): string => {
  if (!date) return "Select Date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const Export = () => {
  const [selectedDateRange, setSelectedDateRange] = useState<string | null>(
    null
  );
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState<
    "start" | "end" | null
  >(null);
  const [includePhotos, setIncludePhotos] = useState(false);
  const [fetchedTrips, setFetchedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);

  const isCustomRangeComplete = Boolean(customStartDate && customEndDate);

  const getCustomRangeWarning = () => {
    if (selectedDateRange !== "custom") return null;
    if (!customStartDate || !customEndDate) {
      return "Please choose both start and end dates.";
    }
    if (customStartDate > customEndDate) {
      return "Start date must be before or equal to end date.";
    }
    return null;
  };

  const customRangeWarningMessage = getCustomRangeWarning();

  const handleCustomDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    const field = showCustomDatePicker;
    if (event.type === "dismissed") {
      setShowCustomDatePicker(null);
      return;
    }
    if (!selectedDate || !field) {
      return;
    }

    if (field === "start") {
      const adjustedStart = new Date(selectedDate);
      adjustedStart.setHours(0, 0, 0, 0);
      setCustomStartDate(adjustedStart);
      if (customEndDate && adjustedStart > customEndDate) {
        const sameDayEnd = new Date(adjustedStart);
        sameDayEnd.setHours(23, 59, 59, 999);
        setCustomEndDate(sameDayEnd);
      }
    }

    if (field === "end") {
      const adjustedEnd = new Date(selectedDate);
      adjustedEnd.setHours(23, 59, 59, 999);
      setCustomEndDate(adjustedEnd);
    }

    if (Platform.OS !== "ios") {
      setShowCustomDatePicker(null);
    }
  };

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

  const exportOptions = [
    {
      id: "thisWeek",
      name: "This Week",
      description: "Export trips from the start of this week",
      icon: "calendar",
    },
    {
      id: "lastWeek",
      name: "Last Week",
      description: "Export trips from the previous week",
      icon: "return-down-forward",
    },
    {
      id: "thisMonth",
      name: "This Month",
      description: "Export trips from the start of this month",
      icon: "calendar-number",
    },
    {
      id: "lastMonth",
      name: "Last Month",
      description: "Export trips from the previous month",
      icon: "calendar-outline",
    },
    {
      id: "custom",
      name: "Custom Date Range",
      description: "Select custom date range",
      icon: "calendar-outline",
    },
  ];

  const handleExport = async () => {
    if (!selectedDateRange) {
      Alert.alert("Select Date Range", "Please select a date range");
      return;
    }

    if (selectedDateRange === "custom") {
      const warning = getCustomRangeWarning();
      if (warning) {
        Alert.alert("Custom Date Range", warning);
        return;
      }
    }

    setExporting(true);

    try {
      const exportOptions: ExportOptions = {
        dateRange: selectedDateRange as ExportOptions["dateRange"],
        includePhotos,
        customStartDate: customStartDate || undefined,
        customEndDate: customEndDate || undefined,
      };

      const result = await exportToPDF(fetchedTrips, exportOptions);

      Alert.alert(
        result.success ? "Export Successful" : "Export Failed",
        result.message
      );
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Error", "An unexpected error occurred during export");
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (!selectedDateRange) {
      Alert.alert("Select Date Range", "Please select a date range");
      return;
    }

    if (selectedDateRange === "custom") {
      const warning = getCustomRangeWarning();
      if (warning) {
        Alert.alert("Custom Date Range", warning);
        return;
      }
    }

    setSharing(true);

    try {
      const exportOptions: ExportOptions = {
        dateRange: selectedDateRange as ExportOptions["dateRange"],
        includePhotos,
        customStartDate: customStartDate || undefined,
        customEndDate: customEndDate || undefined,
      };

      const result = await sharePDFFile(fetchedTrips, exportOptions);

      Alert.alert(
        result.success ? "Share Successful" : "Share Failed",
        result.message
      );
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
      if (!customStartDate) {
        setCustomStartDate(getDefaultCustomStartDate());
      }
      if (!customEndDate) {
        setCustomEndDate(getDefaultCustomEndDate());
      }
    } else {
      setCustomStartDate(null);
      setCustomEndDate(null);
      setShowCustomDatePicker(null);
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

        {/* Export Format Note */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.infoText}>
            Exported documents will always be in PDF format.
          </Text>
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
                  { backgroundColor: COLORS.primaryLight },
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
          {selectedDateRange === "custom" && (
            <View style={styles.customRangeContainer}>
              <Text style={styles.customRangeLabel}>Custom range</Text>
              <View style={styles.customDateRow}>
                <TouchableOpacity
                  style={styles.customDateButton}
                  onPress={() => setShowCustomDatePicker("start")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.customDateTitle}>Start Date</Text>
                  <Text style={styles.customDateValue}>
                    {formatCustomDisplayDate(customStartDate)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.customDateButton}
                  onPress={() => setShowCustomDatePicker("end")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.customDateTitle}>End Date</Text>
                  <Text style={styles.customDateValue}>
                    {formatCustomDisplayDate(customEndDate)}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.customRangeSummaryRow}>
                <Text style={styles.customRangeSummaryText}>
                  {isCustomRangeComplete
                    ? `${formatCustomDisplayDate(
                        customStartDate
                      )} - ${formatCustomDisplayDate(customEndDate)}`
                    : "Choose both dates to see the range."}
                </Text>
                {customRangeWarningMessage && (
                  <Text style={styles.customRangeWarningText}>
                    {customRangeWarningMessage}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>

        {showCustomDatePicker &&
          (Platform.OS === "ios" ? (
            <View style={styles.inlineDatePickerWrapper}>
              <Text style={styles.inlineDatePickerTitle}>
                Select {showCustomDatePicker === "start" ? "start" : "end"} date
              </Text>
              <DateTimePicker
                value={
                  showCustomDatePicker === "start"
                    ? customStartDate || new Date()
                    : customEndDate || new Date()
                }
                mode="date"
                display="spinner"
                maximumDate={
                  showCustomDatePicker === "start"
                    ? customEndDate || new Date()
                    : new Date()
                }
                minimumDate={
                  showCustomDatePicker === "end"
                    ? customStartDate || undefined
                    : undefined
                }
                onChange={handleCustomDateChange}
              />
              <View style={styles.inlineDatePickerActions}>
                <TouchableOpacity
                  style={styles.inlineDatePickerButton}
                  onPress={() => setShowCustomDatePicker(null)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.inlineDatePickerButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <DateTimePicker
              value={
                showCustomDatePicker === "start"
                  ? customStartDate || new Date()
                  : customEndDate || new Date()
              }
              mode="date"
              display="default"
              maximumDate={
                showCustomDatePicker === "start"
                  ? customEndDate || new Date()
                  : new Date()
              }
              minimumDate={
                showCustomDatePicker === "end"
                  ? customStartDate || undefined
                  : undefined
              }
              onChange={handleCustomDateChange}
            />
          ))}

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
  formatNotice: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formatNoticeText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
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
    backgroundColor: COLORS.primaryLight,
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
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    marginBottom: 18,
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
  customRangeContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customRangeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  customDateRow: {
    flexDirection: "row",
    gap: 12,
  },
  customDateButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  customDateTitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 4,
  },
  customDateValue: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  customRangeSummaryRow: {
    marginTop: 12,
  },
  customRangeSummaryText: {
    fontSize: 14,
    color: COLORS.muted,
  },
  customRangeWarningText: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.danger,
  },
  inlineDatePickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inlineDatePickerTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    color: COLORS.text,
  },
  inlineDatePickerActions: {
    marginTop: 12,
    alignItems: "flex-end",
  },
  inlineDatePickerButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  inlineDatePickerButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
