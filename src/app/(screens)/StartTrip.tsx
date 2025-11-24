import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { COLORS } from "../../assets/colors";
import AppButton from "../../components/AppButton";
import TripPhotoCapture from "../../components/TripPhotoCapture";
import { useTripContext } from "../../context/TripContext";
import { generateTripId } from "../../functions/Helpers";
import { tripService } from "../../functions/tripService";

const StartTrip = () => {
  const {
    startingOdometer,
    setIsTripActive,
    setStartTimestamp,
    is_trip_active,
    setTripId,
    setStartingOdometer,
    isSaving,
    startTripPhotoUri,
    setStartTripPhotoUri,
  } = useTripContext();

  const [isLoading, setIsLoading] = useState(false);
  const [pendingTripData, setPendingTripData] = useState<{
    newTripID: string;
    startingOdometer: string;
    newStartTimestamp: Date;
  } | null>(null);

  // Watch for when saving is complete
  useEffect(() => {
    console.log("StartTrip save watch:", {
      hasPendingData: !!pendingTripData,
      isSaving,
      isLoading,
    });

    if (pendingTripData && !isSaving) {
      // Data has been saved to storage, show success alert
      const { newTripID, startingOdometer, newStartTimestamp } =
        pendingTripData;
      setPendingTripData(null);
      setIsLoading(false);
      setStartTripPhotoUri(null);

      Alert.alert(
        "Trip Started",
        `Trip ID: ${newTripID}\nStarting Odometer: ${startingOdometer}\nStart Time: ${newStartTimestamp.toLocaleString(
          "en-US",
          {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }
        )}`,
        [
          {
            text: "OK",
            onPress: () => {
              console.log("Trip started and saved successfully");
              router.back();
            },
          },
        ]
      );
    }
  }, [isSaving, pendingTripData, isLoading, setStartTripPhotoUri]);

  // Safety timeout - prevent infinite loading
  useEffect(() => {
    if (isLoading && pendingTripData) {
      const timeout = setTimeout(() => {
        console.warn("Save timeout reached - forcing completion");
        const { newTripID, startingOdometer, newStartTimestamp } =
          pendingTripData;

        setIsLoading(false);
        setPendingTripData(null);
        setStartTripPhotoUri(null);

        Alert.alert(
          "Trip Started",
          `Trip ID: ${newTripID}\nStarting Odometer: ${startingOdometer}\nStart Time: ${newStartTimestamp.toLocaleString(
            "en-US",
            {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }
          )}`,
          [
            {
              text: "OK",
              onPress: () => {
                console.log("Trip started (timeout fallback)");
                router.back();
              },
            },
          ]
        );
      }, 5000); // 5 second safety timeout

      return () => clearTimeout(timeout);
    }
  }, [isLoading, pendingTripData, setStartTripPhotoUri]);

  const attemptPhotoUpload = async (tripId: string): Promise<boolean> => {
    if (!startTripPhotoUri) {
      return false;
    }

    try {
      const { error } = await tripService.uploadTripPhoto({
        tripId,
        phase: "start",
        fileUri: startTripPhotoUri,
      });

      if (!error) {
        return true;
      }

      console.error("Start photo upload error", error);
    } catch (uploadError) {
      console.error("Unexpected upload error", uploadError);
    }

    return await new Promise((resolve) => {
      Alert.alert(
        "Upload Failed",
        "We couldn't upload your start photo. Check your connection and try again.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "Retry",
            onPress: async () => {
              const success = await attemptPhotoUpload(tripId);
              resolve(success);
            },
          },
        ]
      );
    });
  };

  const hasValidOdometer =
    typeof startingOdometer === "string" &&
    startingOdometer.trim().length > 0 &&
    !isNaN(Number(startingOdometer));

  const isStartDisabled =
    isLoading ||
    isSaving ||
    is_trip_active ||
    !hasValidOdometer ||
    !startTripPhotoUri;

  const handleTripStatusChange = async () => {
    if (!startingOdometer || isNaN(Number(startingOdometer))) {
      Alert.alert("Invalid Input", "Please enter a valid odometer reading");
      return;
    }
    if (is_trip_active) {
      Alert.alert("Trip Already Active", "You have already started a trip.");
      return;
    }
    if (!startTripPhotoUri) {
      Alert.alert(
        "Photo Required",
        "Please capture a start photo before starting your trip."
      );
      return;
    }

    setIsLoading(true);

    try {
      const newTripID = generateTripId();
      const newStartTimestamp = new Date();

      const photoUploaded = await attemptPhotoUpload(newTripID);
      if (!photoUploaded) {
        setIsLoading(false);
        return;
      }

      // Create trip in Supabase
      const { error } = await tripService.createTrip({
        id: newTripID,
        starting_odometer: startingOdometer,
        start_timestamp: newStartTimestamp.toISOString(),
      });

      if (error) {
        console.error("Error creating trip:", error);
        Alert.alert(
          "Error",
          "Failed to create trip. Please check your connection and try again."
        );
        setIsLoading(false);
        return;
      }

      // Update context state
      setStartingOdometer(startingOdometer);
      setTripId(newTripID);
      setStartTimestamp(newStartTimestamp);
      setIsTripActive(true);

      // Store trip data and keep loading until save completes
      setPendingTripData({
        newTripID,
        startingOdometer,
        newStartTimestamp,
      });

      // Don't set isLoading to false here - wait for auto-save to complete
    } catch (err) {
      console.error("Unexpected error:", err);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      onTouchStart={() => {
        Keyboard.dismiss();
      }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Start Trip</Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Starting Odometer Reading</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter odometer reading"
            keyboardType="numeric"
            value={startingOdometer}
            onChangeText={setStartingOdometer}
          />

          <TripPhotoCapture
            phase="start"
            photoUri={startTripPhotoUri}
            onPhotoCaptured={setStartTripPhotoUri}
            buttonDisabled={isLoading || isSaving}
            helperText="Take a quick photo of your vehicle before starting."
          />

          <AppButton
            onPress={handleTripStatusChange}
            size="md"
            variant="primary"
            shape="rounded"
            style={styles.startButton}
            disabled={isStartDisabled}
          >
            {isLoading || isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              "Start Trip"
            )}
          </AppButton>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default StartTrip;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 30,
    textAlign: "center",
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
  },
  timestampText: {
    fontSize: 16,
    color: COLORS.muted,
    padding: 12,
    backgroundColor: COLORS.card,
    borderRadius: 10,
  },
  pictureButton: {
    marginTop: 20,
  },
  startButton: {
    marginTop: 12,
  },
});
