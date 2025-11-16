import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import AppButton from "../components/AppButton";
import { useTripContext } from "../context/TripContext";
import { router } from "expo-router";
import COLORS from "../assets/colors";

import { generateTripId } from "../functions/Helpers";

const StartTrip = () => {
  const {
    startingOdometer,
    setIsTripActive,
    setStartTimestamp,
    is_trip_active,
    setTripId,
    setStartingOdometer,
  } = useTripContext();

  const handleTripStatusChange = () => {
    if (!startingOdometer || isNaN(Number(startingOdometer))) {
      Alert.alert("Invalid Input", "Please enter a valid odometer reading");
      return;
    }
    if (is_trip_active) {
      Alert.alert("Trip Already Active", "You have already started a trip.");
      return;
    }

    const newTripID = generateTripId();
    const newStartTimestamp = new Date();

    setStartingOdometer(startingOdometer);
    setTripId(newTripID);
    setStartTimestamp(newStartTimestamp);

    setIsTripActive(true);

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
            console.log(
              "Trip started - ID:",
              newTripID,
              "Starting Odometer:",
              startingOdometer,
              "Start Time:",
              newStartTimestamp.toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            );
            router.back();
          },
        },
      ]
    );
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
          >
            Start Trip
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
