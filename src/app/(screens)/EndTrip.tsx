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
import COLORS from "../../assets/colors";
import AppButton from "../../components/AppButton";
import { useTripContext } from "../../context/TripContext";
import { tripService } from "../../functions/tripService";

const EndTrip = () => {
  const {
    setIsTripActive,
    is_trip_active,
    tripId,
    startingOdometer,
    endingOdometer,
    setEndingOdometer,
    setEndTimestamp,
    earnings,
    setEarnings,
    clearStorage,
  } = useTripContext();

  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);

    try {
      const newEndTimestamp = new Date();

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

  const handleTakePicture = () => {
    Alert.alert("Camera", "Take picture button pressed");
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

          <AppButton
            onPress={handleTakePicture}
            size="md"
            variant="outline"
            shape="rounded"
            style={styles.pictureButton}
          >
            Take Picture
          </AppButton>

          <AppButton
            onPress={handleTripStatusChange}
            size="md"
            variant="danger"
            shape="rounded"
            style={styles.endButton}
            disabled={isLoading}
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
