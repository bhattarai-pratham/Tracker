import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { COLORS } from "../../assets/colors";
import AppButton from "../../components/AppButton";
import {
  ReceiptCategory,
  ReceiptRecord,
  receiptCategories,
  receiptService,
} from "../../functions/receiptService";

type QuickRangeKey = "all" | "today" | "thisWeek" | "thisMonth";

const QUICK_RANGE_OPTIONS: { key: QuickRangeKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "thisWeek", label: "Week" },
  { key: "thisMonth", label: "Month" },
];

const formatDateForDisplay = (value: string): string => {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatForQuery = (date: Date): string => date.toISOString().split("T")[0];

const getRangeForQuickKey = (key: QuickRangeKey) => {
  const now = new Date();
  switch (key) {
    case "all": {
      // Return a very wide range that includes all receipts
      const startDate = new Date(2000, 0, 1); // Jan 1, 2000
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 10); // 10 years in future
      return {
        startDate: formatForQuery(startDate),
        endDate: formatForQuery(endDate),
      };
    }
    case "today": {
      return {
        startDate: formatForQuery(new Date(now.setHours(0, 0, 0, 0))),
        endDate: formatForQuery(new Date(now.setHours(23, 59, 59, 999))),
      };
    }
    case "thisWeek": {
      const start = new Date(now);
      const dayOfWeek = start.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday (0), go back 6 days, else go back (day - 1)
      start.setDate(start.getDate() - daysFromMonday);
      start.setHours(0, 0, 0, 0);
      return {
        startDate: formatForQuery(start),
        endDate: formatForQuery(new Date()),
      };
    }
    case "thisMonth": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: formatForQuery(start),
        endDate: formatForQuery(new Date()),
      };
    }
    default:
      return {
        startDate: formatForQuery(new Date()),
        endDate: formatForQuery(new Date()),
      };
  }
};

const parseAmount = (value: string): number | undefined => {
  if (!value || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const Reciepts = () => {
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ReceiptCategory | ""
  >("");
  const [quickRange, setQuickRange] = useState<QuickRangeKey>("thisMonth");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const activeRange = useMemo(() => {
    const range = getRangeForQuickKey(quickRange);
    console.log("Active range for", quickRange, ":", range);
    return range;
  }, [quickRange]);

  const fetchReceipts = useCallback(
    async (isRefreshing = false) => {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const rangeStart = startDateInput || activeRange.startDate;
        const rangeEnd = endDateInput || activeRange.endDate;

        const { data, error } = await receiptService.queryReceipts({
          search: searchTerm || undefined,
          category: selectedCategory || undefined,
          startDate: rangeStart,
          endDate: rangeEnd,
          minAmount: parseAmount(minAmount),
          maxAmount: parseAmount(maxAmount),
        });

        setReceipts(data ?? []);
        if (error) {
          setError(error.message ?? "Unable to load receipts");
        }
      } catch (fetchError) {
        console.error("receipt fetch failed", fetchError);
        setError("Unable to load receipts");
      } finally {
        if (isRefreshing) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [
      searchTerm,
      selectedCategory,
      startDateInput,
      endDateInput,
      minAmount,
      maxAmount,
      activeRange,
    ]
  );

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const onRefresh = useCallback(() => {
    fetchReceipts(true);
  }, [fetchReceipts]);

  const totalAmount = useMemo(() => {
    return receipts.reduce((sum, receipt) => sum + receipt.total_amount, 0);
  }, [receipts]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setQuickRange("all");
    setStartDateInput("");
    setEndDateInput("");
    setMinAmount("");
    setMaxAmount("");
  };

  const navigateToReceipt = (id: string) => {
    router.push({ pathname: "/[receiptID]", params: { receiptID: id } });
  };

  const renderItem = ({ item }: { item: ReceiptRecord }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
      onPress={() => navigateToReceipt(item.id)}
      accessibilityRole="button"
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.vendor}</Text>
        <Text style={styles.cardDate}>
          {formatDateForDisplay(item.receipt_date)}
        </Text>
      </View>
      <Text style={styles.cardCategory}>{item.category}</Text>
      <View style={styles.amountRow}>
        <View>
          <Text style={styles.amountLabel}>Total</Text>
          <Text style={styles.amountValue}>
            ${item.total_amount.toFixed(2)}
          </Text>
        </View>
        <View>
          <Text style={[styles.amountLabel, { textAlign: "right" }]}>GST</Text>
          <Text style={[styles.amountValue, { textAlign: "right" }]}>
            ${item.gst.toFixed(2)}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Receipts</Text>
        <Text style={styles.subtitle}>
          {receipts.length} receipt{receipts.length === 1 ? "" : "s"} • $
          {totalAmount.toFixed(2)}
        </Text>
      </View>

      <View style={styles.container}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Search vendor, category, description"
            value={searchTerm}
            onChangeText={setSearchTerm}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          <AppButton
            variant="outline"
            size="sm"
            onPress={() => setShowFiltersModal(true)}
            style={styles.filterButton}
          >
            Filters
          </AppButton>
        </View>

        <View style={styles.actionBar}>
          {QUICK_RANGE_OPTIONS.map((option) => (
            <Pressable
              key={option.key}
              style={({ pressed }) => [
                styles.quickButton,
                quickRange === option.key && styles.quickButtonActive,
                pressed && { opacity: 0.6 },
              ]}
              onPress={() => setQuickRange(option.key)}
            >
              <Text
                style={[
                  styles.quickLabel,
                  quickRange === option.key && styles.quickLabelActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Modal
          visible={showFiltersModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowFiltersModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter Receipts</Text>
                <Pressable
                  onPress={() => setShowFiltersModal(false)}
                  style={styles.modalClose}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.filterRow}>
                <View style={styles.filterColumn}>
                  <Text style={styles.filterLabel}>Start Date</Text>
                  <TextInput
                    style={styles.filterInput}
                    placeholder={activeRange.startDate}
                    value={startDateInput}
                    onChangeText={setStartDateInput}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.filterColumn}>
                  <Text style={styles.filterLabel}>End Date</Text>
                  <TextInput
                    style={styles.filterInput}
                    placeholder={activeRange.endDate}
                    value={endDateInput}
                    onChangeText={setEndDateInput}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.filterRow}>
                <View style={styles.filterColumn}>
                  <Text style={styles.filterLabel}>Category</Text>
                  <View style={styles.categoryRow}>
                    <FlatList
                      data={receiptCategories}
                      horizontal
                      keyExtractor={(category) => category}
                      renderItem={({ item }) => (
                        <Pressable
                          onPress={() =>
                            setSelectedCategory((prev) =>
                              prev === item ? "" : item
                            )
                          }
                          style={({ pressed }) => [
                            styles.categoryChip,
                            selectedCategory === item &&
                              styles.categoryChipActive,
                            pressed && { opacity: 0.7 },
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryText,
                              selectedCategory === item &&
                                styles.categoryTextActive,
                            ]}
                          >
                            {item}
                          </Text>
                        </Pressable>
                      )}
                      showsHorizontalScrollIndicator={false}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.filterRow}>
                <View style={styles.filterColumn}>
                  <Text style={styles.filterLabel}>Min Amount</Text>
                  <TextInput
                    style={styles.filterInput}
                    value={minAmount}
                    onChangeText={setMinAmount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.filterColumn}>
                  <Text style={styles.filterLabel}>Max Amount</Text>
                  <TextInput
                    style={styles.filterInput}
                    value={maxAmount}
                    onChangeText={setMaxAmount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <AppButton
                  variant="outline"
                  size="sm"
                  onPress={handleClearFilters}
                  style={styles.modalActionButton}
                >
                  Clear Filters
                </AppButton>
                <AppButton
                  size="sm"
                  onPress={() => setShowFiltersModal(false)}
                  style={styles.modalActionButton}
                >
                  Apply Filters
                </AppButton>
              </View>
            </View>
          </View>
        </Modal>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={receipts}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No receipts found for this filter.
                </Text>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  container: {
    padding: 16,
    paddingBottom: 100,
    height: "100%",
  },
  searchRow: {
    marginBottom: 12,
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  filterButton: {
    borderRadius: 999,
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    gap: 8,
  },
  quickButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.muted,
    flex: 1,
    alignItems: "center",
  },
  quickButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickLabel: {
    color: COLORS.muted,
    fontSize: 14,
  },
  quickLabelActive: {
    color: "#fff",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  filterColumn: {
    flex: 1,
    marginRight: 8,
  },
  filterLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 4,
  },
  filterInput: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    fontSize: 14,
  },
  categoryRow: {
    minHeight: 42,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.muted,
    marginRight: 8,
  },
  categoryChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  categoryTextActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  clearButton: {
    borderRadius: 999,
  },
  rangeNote: {
    fontSize: 12,
    color: COLORS.muted,
    flex: 1,
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  cardDate: {
    fontSize: 12,
    color: COLORS.muted,
  },
  cardCategory: {
    fontSize: 14,
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  amountLabel: {
    fontSize: 12,
    color: COLORS.muted,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  loader: {
    marginTop: 32,
    alignItems: "center",
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: "center",
    marginTop: 8,
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
    maxHeight: "85%",
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
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 16,
  },
  modalActionButton: {
    flex: 1,
    borderRadius: 999,
  },
});

export default Reciepts;
