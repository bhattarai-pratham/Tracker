import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
  const [photoUrls, setPhotoUrls] = useState<{
    start: string | null;
    end: string | null;
  }>({ start: null, end: null });
  const [photosLoading, setPhotosLoading] = useState(false);
  const [photosError, setPhotosError] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState<{
    label: string;
    uri: string;
  } | null>(null);

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
        } else if (!data) {
          setError("Trip not found");
        } else {
          setTrip(data);
        }
      } catch (err) {
        setError("Failed to fetch trip");
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripID]);

  useEffect(() => {
    if (!tripID) return;
    let isMounted = true;

    const fetchPhotos = async () => {
      setPhotosLoading(true);
      try {
        const { data, error } = await tripService.getTripPhotoUrls(tripID);
        if (!isMounted) return;

        setPhotoUrls({
          start: data?.startPhotoUrl ?? null,
          end: data?.endPhotoUrl ?? null,
        });
        setPhotosError(error ? "Unable to load photos" : null);
      } catch (err) {
        if (!isMounted) return;
        setPhotosError("Unable to load photos");
      } finally {
        if (isMounted) {
          setPhotosLoading(false);
        }
      }
    };

    fetchPhotos();

    return () => {
      isMounted = false;
    };
  }, [tripID]);

  const calculateDistance = (start: string, end: string) =>
    (Number(end) - Number(start)).toFixed(1);

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
            <Ionicons name="arrow-back" size={24} color={COLORS.primaryLight} />
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
            <Ionicons name="arrow-back" size={24} color={COLORS.primaryLight} />
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

  const isTripActive = !trip.end_timestamp || !trip.ending_odometer;

  const distance = isTripActive
    ? "In Progress"
    : calculateDistance(trip.starting_odometer, trip.ending_odometer!);

  const duration = isTripActive
    ? { hours: 0, minutes: 0, total: 0 }
    : calculateDuration(trip.start_timestamp, trip.end_timestamp!);

  const startDateTime = formatDateTime(trip.start_timestamp);
  const endDateTime = isTripActive ? null : formatDateTime(trip.end_timestamp!);

  const handlePhotoPress = (label: string, uri: string | null) => {
    if (!uri || photosLoading) return;
    setActivePhoto({ label, uri });
  };

  const closePhotoModal = () => setActivePhoto(null);

  const renderPhotoCard = (label: string, uri: string | null) => (
    <View style={styles.photoCard}>
      <Text style={styles.photoLabel}>{label}</Text>
      {photosLoading ? (
        <View style={styles.photoLoader}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : uri ? (
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => handlePhotoPress(label, uri)}
          style={styles.photoTapArea}
        >
          <Image
            source={{ uri }}
            style={styles.photoImage}
            resizeMode="cover"
          />
          <View style={styles.photoHintBadge}>
            <Ionicons name="expand-outline" size={14} color={COLORS.primary} />
            <Text style={styles.photoHintText}>Tap to enlarge</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.photoEmpty}>
          <Ionicons name="image-outline" size={28} color={COLORS.muted} />
          <Text style={styles.photoPlaceholderText}>No photo yet</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primaryLight} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Trip Details</Text>
          <Text style={styles.headerSubtitle}>
            {isTripActive ? "Active Trip" : startDateTime.date}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isTripActive && (
          <View
            style={[styles.mainCard, { backgroundColor: COLORS.warningLight }]}
          >
            <View style={styles.mainCardIcon}>
              <Ionicons name="alert-circle" size={32} color={COLORS.warning} />
            </View>
            <Text style={[styles.mainCardLabel, { color: COLORS.warning }]}>
              Trip In Progress
            </Text>
            <Text style={[styles.mainCardValue, { fontSize: 16 }]}>
              This trip is currently active
            </Text>
          </View>
        )}

        <View style={styles.mainCard}>
          <View style={styles.mainCardIcon}>
            <Ionicons name="navigate" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.mainCardLabel}>Total Distance</Text>
          <Text style={styles.mainCardValue}>
            {isTripActive ? distance : `${distance} km`}
          </Text>
        </View>

        <View style={styles.mainCard}>
          <View style={styles.mainCardIcon}>
            <Ionicons name="time" size={32} color={COLORS.accent} />
          </View>
          <Text style={styles.mainCardLabel}>Duration</Text>
          <Text style={styles.mainCardValue}>
            {isTripActive
              ? "In Progress"
              : `${duration.hours}h ${duration.minutes}m`}
          </Text>
        </View>

        <View
          style={[
            styles.currencyCard,
            { backgroundColor: COLORS.successLight },
          ]}
        >
          <View style={styles.mainCardIcon}>
            <Ionicons name="cash" size={32} color={COLORS.success} />
          </View>
          <Text style={styles.mainCardLabel}>Earnings</Text>
          <Text style={styles.mainCardValue}>
            {trip.earnings ? `$${trip.earnings.toFixed(2)}` : "No data"}
          </Text>
        </View>

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
              <Text style={styles.odometerValue}>
                {trip.ending_odometer || "In Progress"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Timeline</Text>
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

          {!isTripActive && endDateTime && (
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
          )}

          {isTripActive && (
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot}>
                <Ionicons
                  name="radio-button-on"
                  size={24}
                  color={COLORS.warning}
                />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Trip In Progress</Text>
                <Text style={styles.timelineDate}>Not ended yet</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.photoSectionHeader}>
            <Text style={styles.sectionTitle}>Photos</Text>
            {photosLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : null}
          </View>
          {photosError ? (
            <Text style={styles.photoErrorText}>{photosError}</Text>
          ) : null}
          <View style={styles.photoGrid}>
            {renderPhotoCard("Start Photo", photoUrls.start)}
            {renderPhotoCard("End Photo", photoUrls.end)}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={!!activePhoto}
        transparent
        animationType="fade"
        onRequestClose={closePhotoModal}
      >
        <TouchableWithoutFeedback onPress={closePhotoModal}>
          <View style={styles.modalBackdrop}>
            {activePhoto && (
              <View style={styles.modalContent}>
                <Image
                  source={{ uri: activePhoto.uri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <Text style={styles.modalLabel}>{activePhoto.label}</Text>
                <Text style={styles.modalHint}>Tap anywhere to dismiss</Text>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default TripDetail;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: { marginRight: 16 },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: COLORS.primaryLight },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.primaryLight,
    opacity: 0.9,
    marginTop: 2,
  },
  content: { flex: 1, padding: 16 },
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
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.primaryLight,
    fontSize: 16,
    fontWeight: "600",
  },
  mainCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: COLORS.primaryLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 3,
    borderColor: COLORS.cardSelectedStrong,
  },
  currencyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: COLORS.primaryLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 3,
    borderColor: COLORS.successLightStrong,
  },
  mainCardIcon: { marginBottom: 12 },
  mainCardLabel: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: "500",
    marginBottom: 8,
  },
  mainCardValue: { fontSize: 36, fontWeight: "bold", color: COLORS.text },
  section: { marginTop: 24 },
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
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: COLORS.primaryLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 3,
    borderColor: COLORS.cardSelectedStrong,
  },
  odometerIcon: { marginBottom: 8 },
  odometerLabel: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: "500",
    marginBottom: 4,
  },
  odometerValue: { fontSize: 20, fontWeight: "bold", color: COLORS.text },
  arrowContainer: { marginHorizontal: 12 },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  timelineDot: { marginRight: 16 },
  timelineContent: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.primaryLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 3,
    borderColor: COLORS.cardSelectedStrong,
  },
  timelineLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  timelineDate: { fontSize: 14, color: COLORS.text, marginBottom: 4 },
  timelineTime: { fontSize: 14, color: COLORS.muted },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: COLORS.card,
    marginLeft: 11,
    marginVertical: 8,
  },
  photoPlaceholderText: { fontSize: 14, color: COLORS.muted, marginTop: 12 },
  photoSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  photoGrid: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
  },
  photoCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 3,
    borderColor: COLORS.cardSelectedStrong,
    shadowColor: COLORS.primaryLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  photoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.muted,
    marginBottom: 12,
  },
  photoTapArea: {
    position: "relative",
  },
  photoImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
  },
  photoEmpty: {
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.cardSelectedStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cardSelected,
  },
  photoLoader: {
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.cardSelectedStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
  },
  photoErrorText: {
    color: COLORS.danger,
    fontSize: 13,
    marginTop: 8,
  },
  photoHintBadge: {
    position: "absolute",
    right: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  photoHintText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: 420,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "#000",
  },
  modalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  modalHint: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
});
