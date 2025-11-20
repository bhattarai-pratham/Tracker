import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import COLORS from "../../assets/colors";
import { Trip } from "../../data/tripdata";
import { tripService } from "../../functions/tripService";

const TripDetail = () => {
  const { tripID } = useLocalSearchParams<{ tripID: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      if (!tripID) {
        setError("No trip ID provided");
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const { data, error } = await tripService.getTripByID(tripID);

        if (error) {
          setError(error.message);
          console.error("Error fetching trip:", error);
        } else if (!data) {
          setError("Trip not found");
        } else {
          setTrip(data);
        }
      } catch (err) {
        setError("Failed to fetch trip");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripID]);

  const calculateDistance = (start: string, end: string) => {
    return (Number(end) - Number(start)).toFixed(1);
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes, total: durationMs };
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
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
            <Text style={styles.headerTitle}>Trip Details</Text>
            <Text style={styles.headerSubtitle}>Loading...</Text>
          </View>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading trip details...</Text>
        </View>
      </View>
    );
  }

  if (error || !trip) {
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
            <Text style={styles.headerTitle}>Trip Details</Text>
            <Text style={styles.headerSubtitle}>Error</Text>
          </View>
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle" size={64} color={COLORS.danger} />
          <Text style={styles.errorText}>{error || "Trip not found"}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const distance = calculateDistance(
    trip.starting_odometer,
    trip.ending_odometer
  );
  const duration = calculateDuration(trip.start_timestamp, trip.end_timestamp);
  const startDateTime = formatDateTime(trip.start_timestamp);
  const endDateTime = formatDateTime(trip.end_timestamp);

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
          <Text style={styles.headerTitle}>Trip Details</Text>
          <Text style={styles.headerSubtitle}>{startDateTime.date}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Distance Card */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardIcon}>
            <Ionicons name="navigate" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.mainCardLabel}>Total Distance</Text>
          <Text style={styles.mainCardValue}>{distance} km</Text>
        </View>

        {/* Duration Card */}
        <View style={[styles.mainCard, { backgroundColor: COLORS.card }]}>
          <View style={styles.mainCardIcon}>
            <Ionicons name="time" size={32} color={COLORS.accent} />
          </View>
          <Text style={styles.mainCardLabel}>Duration</Text>
          <Text style={styles.mainCardValue}>
            {duration.hours}h {duration.minutes}m
          </Text>
        </View>

        {/* Odometer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Odometer Readings</Text>
          <View style={styles.odometerContainer}>
            <View style={styles.odometerCard}>
              <View style={styles.odometerIcon}>
                <Ionicons
                  name="speedometer-outline"
                  size={24}
                  color={COLORS.success}
                />
              </View>
              <Text style={styles.odometerLabel}>Starting</Text>
              <Text style={styles.odometerValue}>{trip.starting_odometer}</Text>
            </View>

            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={24} color={COLORS.muted} />
            </View>

            <View style={styles.odometerCard}>
              <View style={styles.odometerIcon}>
                <Ionicons name="speedometer" size={24} color={COLORS.danger} />
              </View>
              <Text style={styles.odometerLabel}>Ending</Text>
              <Text style={styles.odometerValue}>{trip.ending_odometer}</Text>
            </View>
          </View>
        </View>

        {/* Timeline Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Timeline</Text>

          {/* Start Time */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineDot}>
              <Ionicons name="play-circle" size={24} color={COLORS.success} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Trip Started</Text>
              <Text style={styles.timelineDate}>{startDateTime.date}</Text>
              <Text style={styles.timelineTime}>{startDateTime.time}</Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          {/* End Time */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineDot}>
              <Ionicons name="stop-circle" size={24} color={COLORS.danger} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Trip Ended</Text>
              <Text style={styles.timelineDate}>{endDateTime.date}</Text>
              <Text style={styles.timelineTime}>{endDateTime.time}</Text>
            </View>
          </View>
        </View>

        {/* Photo Section Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <View style={styles.photoPlaceholder}>
            <Ionicons name="images-outline" size={48} color={COLORS.muted} />
            <Text style={styles.photoPlaceholderText}>No photos yet</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

export default TripDetail;

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
    padding: 16,
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
  mainCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainCardIcon: {
    marginBottom: 12,
  },
  mainCardLabel: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: "500",
    marginBottom: 8,
  },
  mainCardValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.text,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  odometerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  odometerCard: {
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
  odometerIcon: {
    marginBottom: 8,
  },
  odometerLabel: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: "500",
    marginBottom: 4,
  },
  odometerValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  arrowContainer: {
    marginHorizontal: 12,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timelineDot: {
    marginRight: 16,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  timelineDate: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 14,
    color: COLORS.muted,
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: COLORS.card,
    marginLeft: 11,
    marginVertical: 8,
  },
  photoPlaceholder: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 12,
  },
});
