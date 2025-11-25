import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../assets/colors";
import AppButton from "../../components/AppButton";
import { ReceiptRecord, receiptService } from "../../functions/receiptService";

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

const ReceiptDetail = () => {
  const { receiptID } = useLocalSearchParams<{ receiptID: string }>();
  const [receipt, setReceipt] = useState<ReceiptRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!receiptID || Array.isArray(receiptID)) {
      setError("Invalid receipt selected.");
      setLoading(false);
      return;
    }

    let mounted = true;
    const fetchReceipt = async () => {
      setLoading(true);
      const { data, error } = await receiptService.getReceiptById(receiptID);
      if (mounted) {
        setReceipt(data);
        if (error) {
          setError(error.message ?? "Unable to load receipt.");
        }
        setLoading(false);
      }
    };

    fetchReceipt();
    return () => {
      mounted = false;
    };
  }, [receiptID]);

  const summary = useMemo(() => {
    if (!receipt) return null;
    return (
      <View style={styles.summaryRow}>
        <View style={styles.summaryColumn}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(receipt.subtotal)}
          </Text>
        </View>
        <View style={styles.summaryColumn}>
          <Text style={styles.summaryLabel}>GST</Text>
          <Text style={styles.summaryValue}>{formatCurrency(receipt.gst)}</Text>
        </View>
        <View style={styles.summaryColumn}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={[styles.summaryValue, styles.totalValue]}>
            {formatCurrency(receipt.total_amount)}
          </Text>
        </View>
      </View>
    );
  }, [receipt]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!receipt) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>{error ?? "Receipt not found."}</Text>
        <AppButton onPress={() => router.back()} style={styles.backButton}>
          Back to receipts
        </AppButton>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.vendor}>{receipt.vendor}</Text>
        <Text style={styles.category}>{receipt.category}</Text>
        <Text style={styles.date}>{formatDate(receipt.receipt_date)}</Text>

        {receipt.receipt_image_url ? (
          <Image
            source={{ uri: receipt.receipt_image_url }}
            style={styles.photo}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>No photo attached</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.sectionValue}>
            {receipt.description ?? "No description"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Receipt Date</Text>
          <Text style={styles.sectionValue}>
            {formatDate(receipt.receipt_date)}
          </Text>
        </View>

        {summary}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Created At</Text>
          <Text style={styles.sectionValue}>{receipt.created_at ?? "N/A"}</Text>
        </View>
        <AppButton
          onPress={() => router.back()}
          variant="outline"
          style={styles.backButton}
        >
          Back to receipts
        </AppButton>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: COLORS.background,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  vendor: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 16,
  },
  category: {
    fontSize: 14,
    color: COLORS.primary,
    marginVertical: 4,
  },
  date: {
    fontSize: 12,
    color: COLORS.muted,
  },
  photo: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    marginTop: 16,
  },
  photoPlaceholder: {
    width: "100%",
    height: 180,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.muted,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  photoPlaceholderText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  section: {
    marginTop: 18,
    padding: 12,
    backgroundColor: COLORS.card,
    borderRadius: 14,
  },
  sectionLabel: {
    fontSize: 12,
    color: COLORS.muted,
  },
  sectionValue: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  summaryColumn: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.muted,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  totalValue: {
    color: COLORS.primaryDark,
  },
  backButton: {
    marginTop: 16,
    borderRadius: 999,
  },
});

export default ReceiptDetail;
