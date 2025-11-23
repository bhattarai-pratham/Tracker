import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import COLORS from "../../assets/colors";
import { Trip } from "../../data/tripdata";
import { tripService } from "../../functions/tripService";

const Trips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = async () => {
    try {
      setError(null);
      const { data, error } = await tripService.getAllTrips();

      if (error) {
        setError(error.message);
        console.error("Error fetching trips:", error);
      } else {
        setTrips(data || []);
      }
    } catch (err) {
      setError("Failed to fetch trips");
      console.error("Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrips();
  };

  const calculateDistance = (start: string, end: string | null) => {
    if (!end) return "In Progress";
    const distance = Number(end) - Number(start);
    return distance.toFixed(1);
  };

  const calculateDuration = (start: string, end: string | null) => {
    if (!end) return "In Progress";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderTripCard = ({ item }: { item: Trip }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => {
        router.push(`/${item.id}`);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.tripIdContainer}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.muted} />
          <Text style={styles.dateText}>
            {formatDate(item.start_timestamp)}
          </Text>
        </View>
        <View style={styles.badgeRow}>
          <View style={styles.earningsBadge}>
            <Text style={styles.earningsText}>
              ${item.earnings ? item.earnings.toFixed(2) : "0.00"}
            </Text>
          </View>
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>
              {item.ending_odometer
                ? `${calculateDistance(
                    item.starting_odometer,
                    item.ending_odometer
                  )} km`
                : "Active"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="speedometer-outline" size={16} color={COLORS.muted} />
          <Text style={styles.infoLabel}>Start</Text>
          <Text style={styles.infoValue}>{item.starting_odometer}</Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.infoItem}>
          <Ionicons name="speedometer" size={16} color={COLORS.muted} />
          <Text style={styles.infoLabel}>End</Text>
          <Text style={styles.infoValue}>
            {item.ending_odometer || "In Progress"}
          </Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={16} color={COLORS.muted} />
          <Text style={styles.infoLabel}>Duration</Text>
          <Text style={styles.infoValue}>
            {calculateDuration(item.start_timestamp, item.end_timestamp)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.dateRow}>
        <Text style={styles.dateText}>
          {formatTime(item.start_timestamp)} -{" "}
          {item.end_timestamp ? formatTime(item.end_timestamp) : "In Progress"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Trip History</Text>
          <Text style={styles.subtitle}>Loading...</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading trips...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Trip History</Text>
          <Text style={styles.subtitle}>Error loading trips</Text>
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle" size={48} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTrips}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trip History</Text>
        <Text style={styles.subtitle}>{trips.length} trips recorded</Text>
      </View>

      <FlatList
        data={trips}
        renderItem={renderTripCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={64} color={COLORS.muted} />
            <Text style={styles.emptyText}>No trips yet</Text>
            <Text style={styles.emptySubtext}>
              Start your first trip to see it here
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default Trips;

const styles = StyleSheet.create({
  container: {
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
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tripIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tripId: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  earningsBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  earningsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  distanceBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.card,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.card,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.muted,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.danger,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 8,
  },
});
