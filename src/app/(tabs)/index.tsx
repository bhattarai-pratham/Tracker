import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../assets/colors";
import { Trip } from "../../data/tripdata";
import { tripService } from "../../functions/tripService";

const { width } = Dimensions.get("window");

export default function Dashboard() {
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

  // Calculate KPIs (same logic as before)
  const calculateKPIs = () => {
    const completedTrips = trips.filter(
      (trip) => trip.end_timestamp && trip.ending_odometer
    );
    if (completedTrips.length === 0)
      return {
        totalTrips: 0,
        totalDistance: "0.0",
        avgDistance: "0.0",
        totalDurationHours: "0.0",
        avgDurationHours: "0.0",
        longestTrip: "0.0",
        shortestTrip: "0.0",
        thisWeekTrips: 0,
        thisMonthTrips: 0,
        currentOdometer: "0",
        avgSpeed: "0.0",
        totalEarnings: "0.00",
        avgEarningsPerTrip: "0.00",
        earningsPerHour: "0.00",
        earningsPerKm: "0.00",
        todayEarnings: "0.00",
        weekEarnings: "0.00",
        monthEarnings: "0.00",
      };

    const totalTrips = completedTrips.length;
    const totalDistance = completedTrips.reduce(
      (sum, trip) =>
        sum + (Number(trip.ending_odometer) - Number(trip.starting_odometer)),
      0
    );
    const avgDistance = totalDistance / totalTrips;

    const totalDuration = completedTrips.reduce((sum, trip) => {
      const start = new Date(trip.start_timestamp).getTime();
      const end = new Date(trip.end_timestamp!).getTime();
      return sum + (end - start);
    }, 0);
    const totalDurationHours = totalDuration / (1000 * 60 * 60);
    const avgDurationHours = totalDurationHours / totalTrips;

    const longestTrip = completedTrips.reduce((max, trip) => {
      const distance =
        Number(trip.ending_odometer) - Number(trip.starting_odometer);
      return distance > max ? distance : max;
    }, 0);
    const shortestTrip = completedTrips.reduce((min, trip) => {
      const distance =
        Number(trip.ending_odometer) - Number(trip.starting_odometer);
      return distance < min ? distance : min;
    }, Infinity);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekTrips = completedTrips.filter((trip) => {
      const tripDate = new Date(trip.start_timestamp);
      return tripDate >= weekAgo && tripDate <= now;
    }).length;

    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thisMonthTrips = completedTrips.filter((trip) => {
      const tripDate = new Date(trip.start_timestamp);
      return tripDate >= monthAgo && tripDate <= now;
    }).length;

    const latestTrip = trips[0];
    const currentOdometer =
      latestTrip?.ending_odometer && latestTrip.ending_odometer !== "0"
        ? latestTrip.ending_odometer
        : latestTrip?.starting_odometer || "0";

    const avgSpeed = totalDistance / totalDurationHours;
    const totalEarnings = completedTrips.reduce(
      (sum, trip) => sum + (trip.earnings || 0),
      0
    );
    const avgEarningsPerTrip = totalEarnings / totalTrips;
    const earningsPerHour = totalEarnings / totalDurationHours;
    const earningsPerKm = totalEarnings / totalDistance;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEarnings = completedTrips
      .filter((trip) => {
        const d = new Date(trip.start_timestamp);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      })
      .reduce((sum, trip) => sum + (trip.earnings || 0), 0);
    const weekEarnings = completedTrips
      .filter((trip) => {
        const d = new Date(trip.start_timestamp);
        return d >= weekAgo && d <= now;
      })
      .reduce((sum, trip) => sum + (trip.earnings || 0), 0);
    const monthEarnings = completedTrips
      .filter((trip) => {
        const d = new Date(trip.start_timestamp);
        return d >= monthAgo && d <= now;
      })
      .reduce((sum, trip) => sum + (trip.earnings || 0), 0);

    return {
      totalTrips,
      totalDistance: totalDistance.toFixed(1),
      avgDistance: avgDistance.toFixed(1),
      totalDurationHours: totalDurationHours.toFixed(1),
      avgDurationHours: avgDurationHours.toFixed(1),
      longestTrip: longestTrip.toFixed(1),
      shortestTrip: shortestTrip.toFixed(1),
      thisWeekTrips,
      thisMonthTrips,
      currentOdometer,
      avgSpeed: avgSpeed.toFixed(1),
      totalEarnings: totalEarnings.toFixed(2),
      avgEarningsPerTrip: avgEarningsPerTrip.toFixed(2),
      earningsPerHour: earningsPerHour.toFixed(2),
      earningsPerKm: earningsPerKm.toFixed(2),
      todayEarnings: todayEarnings.toFixed(2),
      weekEarnings: weekEarnings.toFixed(2),
      monthEarnings: monthEarnings.toFixed(2),
    };
  };

  const kpis = calculateKPIs();

  if (loading)
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>Loading...</Text>
          </View>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => router.push("/Export")}
          >
            <Ionicons name="download-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </View>
    );

  if (error)
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>Error loading data</Text>
          </View>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => router.push("/Export")}
          >
            <Ionicons name="download-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle" size={64} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Your trip statistics</Text>
        </View>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => router.push("/Export")}
        >
          <Ionicons name="download-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Primary Stats */}
        <View style={styles.primaryRow}>
          <View
            style={[
              styles.primaryCard,
              { backgroundColor: COLORS.primaryLightStrong },
            ]}
          >
            <Ionicons name="car" size={32} color={COLORS.primaryDark} />
            <Text style={[styles.primaryValue, { color: COLORS.primaryDark }]}>
              {kpis.totalTrips}
            </Text>
            <Text style={[styles.primaryLabel, { color: COLORS.primaryDark }]}>
              Total Trips
            </Text>
          </View>

          <View
            style={[
              styles.primaryCard,
              { backgroundColor: COLORS.accentLightStrong },
            ]}
          >
            <Ionicons name="speedometer" size={32} color={COLORS.accent} />
            <Text style={[styles.primaryValue, { color: COLORS.accent }]}>
              {kpis.currentOdometer}
            </Text>
            <Text style={[styles.primaryLabel, { color: COLORS.accent }]}>
              Current Odometer
            </Text>
          </View>
        </View>

        {/* Distance Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distance Analytics</Text>
          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: COLORS.primaryLighter },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: COLORS.primaryLight },
                ]}
              >
                <Ionicons name="navigate" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>{kpis.totalDistance} km</Text>
              <Text style={styles.statLabel}>Total Distance</Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: COLORS.successLighter },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: COLORS.successLight },
                ]}
              >
                <Ionicons name="analytics" size={24} color={COLORS.success} />
              </View>
              <Text style={styles.statValue}>{kpis.avgDistance} km</Text>
              <Text style={styles.statLabel}>Avg Per Trip</Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: COLORS.warningLighter },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: COLORS.warningLight },
                ]}
              >
                <Ionicons name="trending-up" size={24} color={COLORS.warning} />
              </View>
              <Text style={styles.statValue}>{kpis.longestTrip} km</Text>
              <Text style={styles.statLabel}>Longest Trip</Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: COLORS.dangerLighter },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: COLORS.dangerLight },
                ]}
              >
                <Ionicons
                  name="trending-down"
                  size={24}
                  color={COLORS.danger}
                />
              </View>
              <Text style={styles.statValue}>{kpis.shortestTrip} km</Text>
              <Text style={styles.statLabel}>Shortest Trip</Text>
            </View>
          </View>
        </View>

        {/* Time Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Analytics</Text>
          <View style={styles.timeRow}>
            <View
              style={[
                styles.timeCard,
                { backgroundColor: COLORS.primaryLighter },
              ]}
            >
              <Ionicons name="time" size={28} color={COLORS.primary} />
              <Text style={styles.timeValue}>{kpis.totalDurationHours}h</Text>
              <Text style={styles.timeLabel}>Total Duration</Text>
            </View>
            <View
              style={[
                styles.timeCard,
                { backgroundColor: COLORS.accentLighter },
              ]}
            >
              <Ionicons name="timer" size={28} color={COLORS.accent} />
              <Text style={styles.timeValue}>{kpis.avgDurationHours}h</Text>
              <Text style={styles.timeLabel}>Avg Duration</Text>
            </View>
          </View>
        </View>

        {/* Earnings Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings Analytics</Text>
          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: COLORS.successLighter },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: COLORS.successLight },
                ]}
              >
                <Ionicons name="cash" size={24} color={COLORS.success} />
              </View>
              <Text style={styles.statValue}>${kpis.totalEarnings}</Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: COLORS.primaryLighter },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: COLORS.primaryLight },
                ]}
              >
                <Ionicons name="wallet" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>${kpis.avgEarningsPerTrip}</Text>
              <Text style={styles.statLabel}>Avg Per Trip</Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: COLORS.accentLighter },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: COLORS.accentLight },
                ]}
              >
                <Ionicons name="time" size={24} color={COLORS.accent} />
              </View>
              <Text style={styles.statValue}>${kpis.earningsPerHour}</Text>
              <Text style={styles.statLabel}>Per Hour</Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: COLORS.warningLighter },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: COLORS.warningLight },
                ]}
              >
                <Ionicons name="navigate" size={24} color={COLORS.warning} />
              </View>
              <Text style={styles.statValue}>${kpis.earningsPerKm}</Text>
              <Text style={styles.statLabel}>Per Km</Text>
            </View>
          </View>
        </View>

        {/* Earnings by Period */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings by Period</Text>
          <View style={styles.earningsColumn}>
            <View
              style={[
                styles.activityCard,
                { backgroundColor: COLORS.successLighter },
              ]}
            >
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: COLORS.success },
                ]}
              >
                <Ionicons name="today" size={20} color="#fff" />
              </View>
              <Text style={styles.activityValue}>${kpis.todayEarnings}</Text>
              <Text style={styles.activityLabel}>Today</Text>
            </View>

            <View
              style={[
                styles.activityCard,
                { backgroundColor: COLORS.primaryLighter },
              ]}
            >
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: COLORS.primary },
                ]}
              >
                <Ionicons name="calendar" size={20} color="#fff" />
              </View>
              <Text style={styles.activityValue}>${kpis.weekEarnings}</Text>
              <Text style={styles.activityLabel}>This Week</Text>
            </View>

            <View
              style={[
                styles.activityCard,
                { backgroundColor: COLORS.accentLighter },
              ]}
            >
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: COLORS.accent },
                ]}
              >
                <Ionicons name="calendar-outline" size={20} color="#fff" />
              </View>
              <Text style={styles.activityValue}>${kpis.monthEarnings}</Text>
              <Text style={styles.activityLabel}>This Month</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityRow}>
            <View
              style={[
                styles.activityCard,
                { backgroundColor: COLORS.primaryLighter },
              ]}
            >
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: COLORS.primary },
                ]}
              >
                <Ionicons name="calendar" size={20} color="#fff" />
              </View>
              <Text style={styles.activityValue}>{kpis.thisWeekTrips}</Text>
              <Text style={styles.activityLabel}>This Week</Text>
            </View>

            <View
              style={[
                styles.activityCard,
                { backgroundColor: COLORS.accentLighter },
              ]}
            >
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: COLORS.accent },
                ]}
              >
                <Ionicons name="calendar-outline" size={20} color="#fff" />
              </View>
              <Text style={styles.activityValue}>{kpis.thisMonthTrips}</Text>
              <Text style={styles.activityLabel}>This Month</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flex: 1 },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 14, color: "#fff", opacity: 0.9 },
  exportButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1 },
  scrollContent: { padding: 16 },
  primaryRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  primaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryValue: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
  },
  primaryLabel: { fontSize: 14, opacity: 0.9 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: { fontSize: 12, color: COLORS.muted, textAlign: "center" },
  timeRow: { flexDirection: "row", gap: 12 },
  timeCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 4,
  },
  timeLabel: { fontSize: 11, color: COLORS.muted, textAlign: "center" },
  activityRow: { flexDirection: "row", gap: 12 },
  earningsColumn: { flexDirection: "column", gap: 12 },
  activityCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  activityValue: {
    fontSize: 25,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  activityLabel: { fontSize: 13, color: COLORS.muted },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: { marginTop: 16, fontSize: 16, color: COLORS.muted },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.danger,
    textAlign: "center",
  },
});
