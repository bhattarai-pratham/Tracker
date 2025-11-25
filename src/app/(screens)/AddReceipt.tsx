import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../assets/colors";
import { ScanReceiptIcon } from "../../assets/Icons";
import AppButton from "../../components/AppButton";
import TripPhotoCapture from "../../components/TripPhotoCapture";
import {
  ReceiptCategory,
  receiptCategories,
  receiptService,
} from "../../functions/receiptService";

const AddReceipt = () => {
  const [receiptPhotoUri, setReceiptPhotoUri] = useState<string | null>(null);
  const [vendor, setVendor] = useState("");
  const [category, setCategory] = useState<ReceiptCategory | "">("");
  const [description, setDescription] = useState("");
  const [receiptDate, setReceiptDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [amountMode, setAmountMode] = useState<"total" | "subtotal">("total");
  const [totalAmount, setTotalAmount] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [canNavigateAway, setCanNavigateAway] = useState(false);

  // Track if user has made any changes for back confirmation
  useEffect(() => {
    const hasChanges =
      receiptPhotoUri !== null ||
      vendor.trim() !== "" ||
      category !== "" ||
      description.trim() !== "" ||
      totalAmount !== "" ||
      subtotal !== "";
    setHasUnsavedChanges(hasChanges);
  }, [receiptPhotoUri, vendor, category, description, totalAmount, subtotal]);

  // Intercept hardware back button on Android
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (canNavigateAway) {
          return false; // Allow default back behavior
        }
        if (hasUnsavedChanges) {
          Alert.alert(
            "Discard Receipt?",
            "You have unsaved changes. Are you sure you want to go back?",
            [
              { text: "Stay", style: "cancel" },
              {
                text: "Discard",
                style: "destructive",
                onPress: () => {
                  setCanNavigateAway(true);
                  // Use setTimeout to allow state update before navigation
                  setTimeout(() => router.back(), 0);
                },
              },
            ]
          );
          return true; // Prevent default back behavior
        }
        return false; // No changes, allow default back
      }
    );

    return () => backHandler.remove();
  }, [hasUnsavedChanges, canNavigateAway]);

  // Validate date format
  const isValidDate = (dateString: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  // Sanitize and validate amount input
  const sanitizeAmount = (value: string): string => {
    // Remove whitespace and ensure valid decimal format
    const cleaned = value.trim().replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      // Multiple decimal points, keep only first
      return parts[0] + "." + parts.slice(1).join("");
    }
    if (parts.length === 2 && parts[1].length > 2) {
      // Limit to 2 decimal places
      return parts[0] + "." + parts[1].substring(0, 2);
    }
    return cleaned;
  };

  const handleAmountChange = (value: string, mode: "total" | "subtotal") => {
    const sanitized = sanitizeAmount(value);
    const numValue = parseFloat(sanitized);

    // Reject if negative or exceeds reasonable limit (10 million)
    if (
      sanitized &&
      !isNaN(numValue) &&
      (numValue < 0 || numValue > 10000000)
    ) {
      return;
    }

    if (mode === "total") {
      setTotalAmount(sanitized);
    } else {
      setSubtotal(sanitized);
    }
  };

  const handleModeSwitch = (newMode: "total" | "subtotal") => {
    if (newMode === amountMode) return;

    // Preserve computed values when switching modes
    if (newMode === "total" && subtotal) {
      const sub = parseFloat(subtotal);
      if (!isNaN(sub) && sub > 0) {
        const total = sub * 1.1;
        setTotalAmount(total.toFixed(2));
        setSubtotal("");
      }
    } else if (newMode === "subtotal" && totalAmount) {
      const total = parseFloat(totalAmount);
      if (!isNaN(total) && total > 0) {
        const sub = total / 1.1;
        setSubtotal(sub.toFixed(2));
        setTotalAmount("");
      }
    }

    setAmountMode(newMode);
  };

  const handleRetakePhoto = () => {
    if (
      vendor.trim() ||
      category ||
      description.trim() ||
      totalAmount ||
      subtotal
    ) {
      Alert.alert(
        "Retake Photo?",
        "Retaking the photo will clear all entered data. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Retake",
            style: "destructive",
            onPress: () => {
              setReceiptPhotoUri(null);
              setVendor("");
              setCategory("");
              setDescription("");
              setTotalAmount("");
              setSubtotal("");
            },
          },
        ]
      );
    } else {
      setReceiptPhotoUri(null);
    }
  };

  const handleBackPress = () => {
    if (hasUnsavedChanges && !canNavigateAway) {
      Alert.alert(
        "Discard Receipt?",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Stay", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              setCanNavigateAway(true);
              setTimeout(() => router.back(), 0);
            },
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const computedValues = React.useMemo(() => {
    if (amountMode === "total" && totalAmount) {
      const total = parseFloat(totalAmount);
      if (!isNaN(total) && total > 0) {
        const gst = total / 11;
        const sub = total - gst;
        return {
          subtotal: sub.toFixed(2),
          gst: gst.toFixed(2),
          total: total.toFixed(2),
        };
      }
    } else if (amountMode === "subtotal" && subtotal) {
      const sub = parseFloat(subtotal);
      if (!isNaN(sub) && sub > 0) {
        const gst = sub * 0.1;
        const total = sub + gst;
        return {
          subtotal: sub.toFixed(2),
          gst: gst.toFixed(2),
          total: total.toFixed(2),
        };
      }
    }
    return { subtotal: "0.00", gst: "0.00", total: "0.00" };
  }, [amountMode, totalAmount, subtotal]);

  const hasValidAmount =
    (amountMode === "total" && totalAmount && parseFloat(totalAmount) > 0) ||
    (amountMode === "subtotal" && subtotal && parseFloat(subtotal) > 0);

  const isSaveDisabled =
    isLoading ||
    !receiptPhotoUri ||
    !vendor.trim() ||
    !category ||
    !hasValidAmount;

  const handleSaveReceipt = async () => {
    if (!receiptPhotoUri) {
      Alert.alert("Photo Required", "Please capture a receipt photo first.");
      return;
    }

    const trimmedVendor = vendor.trim();
    if (!trimmedVendor) {
      Alert.alert("Vendor Required", "Please enter a vendor name.");
      return;
    }

    if (trimmedVendor.length > 100) {
      Alert.alert(
        "Vendor Too Long",
        "Vendor name must be 100 characters or less."
      );
      return;
    }

    if (!category) {
      Alert.alert("Category Required", "Please select a receipt category.");
      return;
    }

    if (!isValidDate(receiptDate)) {
      Alert.alert(
        "Invalid Date",
        "Please enter a valid date in YYYY-MM-DD format."
      );
      return;
    }

    const selectedDate = new Date(receiptDate);
    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);

    if (selectedDate > oneYearFromNow) {
      Alert.alert(
        "Invalid Date",
        "Receipt date cannot be more than one year in the future."
      );
      return;
    }

    if (description.trim().length > 500) {
      Alert.alert(
        "Description Too Long",
        "Description must be 500 characters or less."
      );
      return;
    }

    if (!hasValidAmount) {
      Alert.alert(
        "Amount Required",
        "Please enter a valid total or subtotal amount."
      );
      return;
    }

    setIsLoading(true);

    try {
      // Generate unique ID with timestamp + random component to avoid collisions
      const receiptId = `receipt_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Create receipt record with timeout
      const createPromise = receiptService.createReceipt({
        id: receiptId,
        receiptDate: receiptDate,
        category: category as ReceiptCategory,
        vendor: trimmedVendor,
        description: description.trim() || undefined,
        totalAmount:
          amountMode === "total" ? parseFloat(totalAmount) : undefined,
        subtotal: amountMode === "subtotal" ? parseFloat(subtotal) : undefined,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 30000)
      );

      const { error: createError } = (await Promise.race([
        createPromise,
        timeoutPromise,
      ])) as Awaited<ReturnType<typeof receiptService.createReceipt>>;

      if (createError) {
        console.error("Error creating receipt:", createError);
        Alert.alert(
          "Error",
          "Failed to create receipt. Please check your connection and try again."
        );
        setIsLoading(false);
        return;
      }

      // Upload photo with timeout
      const uploadPromise = receiptService.uploadReceiptPhoto({
        receiptId,
        fileUri: receiptPhotoUri,
      });

      const { error: uploadError } = (await Promise.race([
        uploadPromise,
        timeoutPromise,
      ])) as Awaited<ReturnType<typeof receiptService.uploadReceiptPhoto>>;

      if (uploadError) {
        console.error("Error uploading receipt photo:", uploadError);
        // Receipt was created successfully, photo failed
        setCanNavigateAway(true);
        Alert.alert(
          "Partial Success",
          "Receipt was saved but the photo couldn't be uploaded. The receipt is still available in your list.",
          [
            {
              text: "OK",
              onPress: () => {
                setIsLoading(false);
                router.back();
              },
            },
          ]
        );
        return;
      }

      setIsLoading(false);
      setHasUnsavedChanges(false);
      setCanNavigateAway(true);

      Alert.alert(
        "Receipt Saved",
        `Vendor: ${trimmedVendor}\nCategory: ${category}\nTotal: $${computedValues.total}\nGST: $${computedValues.gst}`,
        [
          {
            text: "OK",
            onPress: () => {
              console.log("Receipt created successfully:", receiptId);
              router.back();
            },
          },
        ]
      );
    } catch (err) {
      console.error("Unexpected error:", err);
      const errorMessage =
        err instanceof Error && err.message === "Request timeout"
          ? "Request timed out. Please check your connection and try again."
          : "An unexpected error occurred. Please try again.";
      Alert.alert("Error", errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
        onTouchStart={() => {
          Keyboard.dismiss();
        }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {!receiptPhotoUri ? (
            <Text style={styles.title}>Add Receipt</Text>
          ) : (
            <View style={styles.headerRow}>
              <AppButton
                onPress={handleBackPress}
                variant="outline"
                size="sm"
                style={styles.cancelButton}
              >
                ← Cancel
              </AppButton>
              <Text style={styles.titleCentered}>Add Receipt</Text>
              <View style={styles.headerSpacer} />
            </View>
          )}

          {!receiptPhotoUri ? (
            <View style={styles.photoSection}>
              <ScanReceiptIcon size={300} color="#0ea5a4" />
              <Text style={styles.photoLabel}>
                First, capture a photo of your receipt
              </Text>
              <TripPhotoCapture
                phase="start"
                photoUri={receiptPhotoUri}
                onPhotoCaptured={setReceiptPhotoUri}
                buttonDisabled={isLoading}
                helperText="Take a clear photo of the entire receipt."
              />
            </View>
          ) : (
            <>
              <View style={styles.photoPreview}>
                <Image
                  source={{ uri: receiptPhotoUri }}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
                <Pressable
                  onPress={handleRetakePhoto}
                  style={styles.photoRemove}
                >
                  <Text style={styles.photoRemoveText}>✕ Retake Photo</Text>
                </Pressable>
              </View>
              <View style={styles.formContainer}>
                <Text style={styles.label}>Vendor *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., BP, Coles, AutoPro"
                  value={vendor}
                  onChangeText={setVendor}
                  editable={!isLoading}
                  maxLength={100}
                />

                <Text style={styles.label}>Category *</Text>
                <Pressable
                  onPress={() => setShowCategoryModal(true)}
                  style={styles.categoryButton}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      !category && styles.categoryPlaceholder,
                    ]}
                  >
                    {category || "Select a category"}
                  </Text>
                </Pressable>

                <Text style={styles.label}>Receipt Date</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  placeholder="YYYY-MM-DD"
                  value={receiptDate}
                  onChangeText={setReceiptDate}
                  keyboardType="numeric"
                  editable={false}
                  selectTextOnFocus={false}
                  maxLength={10}
                />

                <Text style={styles.label}>Description (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g., Regular unleaded fuel, oil change"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  editable={!isLoading}
                  maxLength={500}
                />
                {description.length > 450 && (
                  <Text style={styles.hintText}>
                    {500 - description.length} characters remaining
                  </Text>
                )}

                <Text style={styles.label}>Amount Entry Mode</Text>
                <View style={styles.modeToggle}>
                  <Pressable
                    onPress={() => handleModeSwitch("total")}
                    style={[
                      styles.modeButton,
                      amountMode === "total" && styles.modeButtonActive,
                    ]}
                    disabled={isLoading}
                  >
                    <Text
                      style={[
                        styles.modeButtonText,
                        amountMode === "total" && styles.modeButtonTextActive,
                      ]}
                    >
                      Total Amount
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setAmountMode("subtotal")}
                    style={[
                      styles.modeButton,
                      amountMode === "subtotal" && styles.modeButtonActive,
                    ]}
                    disabled={isLoading}
                  >
                    <Text
                      style={[
                        styles.modeButtonText,
                        amountMode === "subtotal" &&
                          styles.modeButtonTextActive,
                      ]}
                    >
                      Subtotal
                    </Text>
                  </Pressable>
                </View>

                {amountMode === "total" ? (
                  <>
                    <Text style={styles.label}>Total Amount (inc GST) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0.00"
                      value={totalAmount}
                      onChangeText={(value) =>
                        handleAmountChange(value, "total")
                      }
                      keyboardType="decimal-pad"
                      editable={!isLoading}
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.label}>Subtotal (ex GST) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0.00"
                      value={subtotal}
                      onChangeText={(value) =>
                        handleAmountChange(value, "subtotal")
                      }
                      keyboardType="decimal-pad"
                      editable={!isLoading}
                    />
                  </>
                )}

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Breakdown</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal (ex GST):</Text>
                    <Text style={styles.summaryValue}>
                      ${computedValues.subtotal}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>GST (10%):</Text>
                    <Text style={styles.summaryValue}>
                      ${computedValues.gst}
                    </Text>
                  </View>
                  <View style={[styles.summaryRow, styles.summaryTotal]}>
                    <Text style={styles.summaryTotalLabel}>
                      Total (inc GST):
                    </Text>
                    <Text style={styles.summaryTotalValue}>
                      ${computedValues.total}
                    </Text>
                  </View>
                </View>

                <AppButton
                  onPress={handleSaveReceipt}
                  size="md"
                  variant="primary"
                  shape="rounded"
                  style={styles.saveButton}
                  disabled={isSaveDisabled}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    "Save Receipt"
                  )}
                </AppButton>
              </View>
            </>
          )}
        </ScrollView>

        <Modal
          visible={showCategoryModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Category</Text>
                <Pressable
                  onPress={() => setShowCategoryModal(false)}
                  style={styles.modalClose}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </Pressable>
              </View>
              <ScrollView>
                {receiptCategories.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryModal(false);
                    }}
                    style={({ pressed }) => [
                      styles.categoryItem,
                      category === cat && styles.categoryItemActive,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryItemText,
                        category === cat && styles.categoryItemTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddReceipt;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 20,
    textAlign: "center",
  },
  titleCentered: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  cancelButton: {
    minWidth: 90,
  },
  headerSpacer: {
    minWidth: 90,
  },
  photoSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
    width: "100%",
    paddingHorizontal: 16,
  },

  photoLabel: {
    fontSize: 16,
    color: COLORS.muted,
    marginBottom: 16,
    textAlign: "center",
  },
  photoPreview: {
    width: "100%",
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: 200,
    backgroundColor: COLORS.card,
  },
  photoRemove: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: COLORS.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  photoRemoveText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  formContainer: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.muted,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: COLORS.text,
  },
  inputDisabled: {
    backgroundColor: COLORS.card, // soft grey
    opacity: 0.4, // dimmed look
  },

  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: COLORS.muted,
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
  },
  categoryButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  categoryPlaceholder: {
    color: COLORS.muted,
  },
  modeToggle: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.muted,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeButtonText: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: "600",
  },
  modeButtonTextActive: {
    color: "#fff",
  },
  summaryCard: {
    backgroundColor: COLORS.primaryLight,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.muted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: COLORS.muted,
    paddingTop: 12,
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  backButton: {
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.muted,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.danger,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 20,
    color: COLORS.muted,
  },
  categoryItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.card,
  },
  categoryItemActive: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  categoryItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  categoryItemTextActive: {
    color: COLORS.primaryDark,
    fontWeight: "600",
  },
});
