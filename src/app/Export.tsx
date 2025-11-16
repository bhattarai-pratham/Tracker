import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../assets/colors";
import AppButton from "../components/AppButton";
import { tripData } from "../data/tripdata";

const Export = () => {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  const exportFormats = [
    {
      id: "csv",
      name: "CSV",
      description: "Comma-separated values for Excel",
      icon: "document-text",
      color: COLORS.success,
    },
    {
      id: "json",
      name: "JSON",
      description: "JavaScript Object Notation",
      icon: "code-slash",
      color: COLORS.primary,
    },
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
    },
  ];

  const exportOptions = [
    {
      id: "all",
      name: "All Trips",
      description: `Export all ${tripData.length} trips`,
      icon: "albums",
    },
    {
      id: "recent",
      name: "Recent Trips",
      description: "Export trips from last 30 days",
      icon: "time",
    },
    {
      id: "custom",
      name: "Custom Range",
      description: "Select date range to export",
      icon: "calendar",
    },
  ];

  const handleExport = () => {
    if (!selectedFormat) {
      Alert.alert("Select Format", "Please select an export format");
      return;
    }

    Alert.alert(
      "Export Successful",
      `Your trip data has been exported as ${selectedFormat.toUpperCase()}`,
      [
        {
          text: "OK",
          onPress: () => {
            console.log(`Exported as ${selectedFormat}`);
            // Here you would implement actual export logic
          },
        },
      ]
    );
  };

  const handleShare = () => {
    Alert.alert("Share", "Share functionality coming soon");
  };

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
          <Text style={styles.statsValue}>{tripData.length}</Text>
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
                ]}
                onPress={() => setSelectedFormat(format.id)}
                activeOpacity={0.7}
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
                    color={format.color}
                  />
                </View>
                <Text style={styles.formatName}>{format.name}</Text>
                <Text style={styles.formatDescription}>
                  {format.description}
                </Text>
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
          <Text style={styles.sectionTitle}>Export Options</Text>
          {exportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
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
              <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Settings</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <Ionicons name="image-outline" size={20} color={COLORS.muted} />
              <Text style={styles.settingText}>Include trip photos</Text>
              <View style={styles.toggle}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={COLORS.success}
                />
              </View>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.settingRow}>
              <Ionicons
                name="analytics-outline"
                size={20}
                color={COLORS.muted}
              />
              <Text style={styles.settingText}>Include statistics</Text>
              <View style={styles.toggle}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={COLORS.success}
                />
              </View>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.settingRow}>
              <Ionicons name="map-outline" size={20} color={COLORS.muted} />
              <Text style={styles.settingText}>Include map data</Text>
              <View style={styles.toggle}>
                <Ionicons
                  name="ellipse-outline"
                  size={24}
                  color={COLORS.muted}
                />
              </View>
            </View>
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
          >
            <>
              <Ionicons
                name="download"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              Export Data
            </>
          </AppButton>

          <AppButton
            onPress={handleShare}
            size="lg"
            variant="outline"
            shape="rounded"
            style={styles.shareButton}
          >
            <>
              <Ionicons
                name="share-social"
                size={20}
                color={COLORS.primary}
                style={{ marginRight: 8 }}
              />
              Share
            </>
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
            Exported files will be saved to your device's Downloads folder
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
