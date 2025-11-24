import { router } from "expo-router";
import { useState } from "react";
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
import { tripService } from "../../functions/tripService";

const EndTrip = () => {
  const {
    is_trip_active,
    tripId,
    startingOdometer,
    endingOdometer,
    setEndingOdometer,
    setEndTimestamp,
    earnings,
    setEarnings,
    clearStorage,
    endTripPhotoUri,
    setEndTripPhotoUri,
  } = useTripContext();

  const [isLoading, setIsLoading] = useState(false);

  const attemptPhotoUpload = async (): Promise<boolean> => {
    if (!tripId || !endTripPhotoUri) {
      return false;
    }

    try {
      const { error } = await tripService.uploadTripPhoto({
        tripId,
        phase: "end",
        fileUri: endTripPhotoUri,
      });

      if (!error) {
        return true;
      }

      console.error("End photo upload error", error);
    } catch (uploadError) {
      console.error("Unexpected end photo upload error", uploadError);
    }

    return await new Promise((resolve) => {
      Alert.alert(
        "Upload Failed",
        "We couldn't upload your end photo. Check your connection and try again.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "Retry",
            onPress: async () => {
              const success = await attemptPhotoUpload();
              resolve(success);
            },
          },
        ]
      );
    });
  };

  const hasValidEndingOdometer =
    typeof endingOdometer === "string" &&
    endingOdometer.trim().length > 0 &&
    !isNaN(Number(endingOdometer));

  const endingGreaterThanStart =
    hasValidEndingOdometer &&
    startingOdometer &&
    !isNaN(Number(startingOdometer))
      ? Number(endingOdometer) > Number(startingOdometer)
      : true;

  const isEndDisabled =
    isLoading ||
    !is_trip_active ||
    !tripId ||
    !hasValidEndingOdometer ||
    !endingGreaterThanStart ||
    !endTripPhotoUri;

  const handleTripStatusChange = async () => {
    if (!endingOdometer || isNaN(Number(endingOdometer))) {
      Alert.alert("Invalid Input", "Please enter a valid odometer reading");
      return;
    }

    if (!is_trip_active) {
      Alert.alert("No Active Trip", "There is no active trip to end.");
      return;
    }

    if (!tripId) {
      Alert.alert("Error", "Trip ID is missing. Please start a new trip.");
      return;
    }

    // Validate ending odometer is greater than starting
    if (
      startingOdometer &&
      Number(endingOdometer) <= Number(startingOdometer)
    ) {
      Alert.alert(
        "Invalid Input",
        "Ending odometer must be greater than starting odometer"
      );
      return;
    }

    if (!endTripPhotoUri) {
      Alert.alert(
        "Photo Required",
        "Please capture an end-of-trip photo before ending your trip."
      );
      return;
    }

    setIsLoading(true);

    try {
      const newEndTimestamp = new Date();

      const photoUploaded = await attemptPhotoUpload();
      if (!photoUploaded) {
        setIsLoading(false);
        return;
      }

      // Update trip in Supabase
      const { data, error } = await tripService.updateTripEnd(tripId, {
        ending_odometer: endingOdometer,
        end_timestamp: newEndTimestamp.toISOString(),
        earnings: earnings ? parseFloat(earnings) : undefined,
      });

      if (error) {
        console.error("Error updating trip:", error);
        Alert.alert(
          "Error",
          "Failed to end trip. Please check your connection and try again."
        );
        setIsLoading(false);
        return;
      }

      // Update context state
      setEndingOdometer(endingOdometer);
      setEndTimestamp(newEndTimestamp);

      // Clear storage and reset state
      await clearStorage();

      setEndTripPhotoUri(null);

      setIsLoading(false);

      Alert.alert(
        "Trip Ended",
        `Trip ID: ${tripId}\nEnding Odometer: ${endingOdometer}\nEnd Time: ${newEndTimestamp.toLocaleString(
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
              console.log("Trip ended successfully:", data);
              router.back();
            },
          },
        ]
      );
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
        <Text style={styles.title}>End Trip</Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Ending Odometer Reading</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter odometer reading"
            keyboardType="numeric"
            value={endingOdometer}
            onChangeText={setEndingOdometer}
          />

          <Text style={styles.label}>Earnings (AUD)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter earnings (e.g., 125.50)"
            keyboardType="decimal-pad"
            value={earnings}
            onChangeText={setEarnings}
          />

          <Text style={styles.label}>Timestamp</Text>
          <Text style={styles.timestampText}>
            {new Date().toLocaleString()}
          </Text>

          <TripPhotoCapture
            phase="end"
            photoUri={endTripPhotoUri}
            onPhotoCaptured={setEndTripPhotoUri}
            buttonDisabled={isLoading}
            helperText="Grab a quick end-of-trip photo before finishing."
          />

          <AppButton
            onPress={handleTripStatusChange}
            size="md"
            variant="danger"
            shape="rounded"
            style={styles.endButton}
            disabled={isEndDisabled}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : "End Trip"}
          </AppButton>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default EndTrip;

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
  endButton: {
    marginTop: 12,
  },
});
