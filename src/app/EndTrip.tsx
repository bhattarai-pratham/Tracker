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

const EndTrip = () => {
  const {
    setIsTripActive,
    is_trip_active,
    setStartingOdometer,
    tripId,
    setTripId,
    endingOdometer,
    setEndingOdometer,
    setEndTimestamp,
    setStartTimestamp,
  } = useTripContext();

  const handleTripStatusChange = () => {
    if (!endingOdometer || isNaN(Number(endingOdometer))) {
      Alert.alert("Invalid Input", "Please enter a valid odometer reading");
      return;
    }

    if (!is_trip_active) {
      Alert.alert("No Active Trip", "There is no active trip to end.");
      return;
    }

    const newEndTimestamp = new Date();

    setEndingOdometer(endingOdometer);
    setEndTimestamp(newEndTimestamp);

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
            {
              console.log(
                "Trip ended - ID:",
                tripId,
                "Ending Odometer:",
                endingOdometer,
                "End Time:",
                newEndTimestamp.toLocaleString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              );
              setIsTripActive(false);
              resetAllValues();
              router.back();
            }
          },
        },
      ]
    );
  };

  const resetAllValues = () => {
    setTripId(undefined);
    setStartingOdometer(undefined);
    setEndingOdometer(undefined);
    setIsTripActive(false);
    setEndTimestamp(null);
    setStartTimestamp(null);
    console.log("Trip data reset.");
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
          >
            End Trip
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
