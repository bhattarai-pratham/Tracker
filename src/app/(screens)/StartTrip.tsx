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
    saveToStorage,
  } = useTripContext();

  const [isLoading, setIsLoading] = useState(false);

  const handleTripStatusChange = async () => {
    if (!startingOdometer || isNaN(Number(startingOdometer))) {
      Alert.alert("Invalid Input", "Please enter a valid odometer reading");
      return;
    }
    if (is_trip_active) {
      Alert.alert("Trip Already Active", "You have already started a trip.");
      return;
    }

    setIsLoading(true);

    try {
      const newTripID = generateTripId();
      const newStartTimestamp = new Date();

      // Create trip in Supabase
      const { data, error } = await tripService.createTrip({
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

      // Save to AsyncStorage for persistence
      await saveToStorage();

      setIsLoading(false);

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
              console.log("Trip started successfully:", data);
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
            variant="primary"
            shape="rounded"
            style={styles.startButton}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : "Start Trip"}
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
