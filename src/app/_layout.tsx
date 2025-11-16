import { useContext, useState } from "react";
import { router, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import AppButton from "../components/AppButton";
import { EndTripIcon, StartTripIcon } from "../assets/Icons";
import { TripProvider, useTripContext } from "../context/TripContext";

const RootLayoutContent = () => {
  const { is_trip_active } = useTripContext();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="StartTrip"
          options={{
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="EndTrip"
          options={{
            presentation: "modal",
          }}
        />
      </Stack>
      <View style={styles.buttonContainer}>
        <AppButton
          onPress={() => {
            if (!is_trip_active) {
              router.push("/StartTrip");
            } else {
              router.push("/EndTrip");
            }
          }}
          size="lg"
          variant={is_trip_active ? "danger" : "primary"}
          shape="circle"
          style={styles.button}
        >
          {is_trip_active ? <EndTripIcon /> : <StartTripIcon />}
        </AppButton>
      </View>
    </>
  );
};

const RootLayout = () => {
  return (
    <TripProvider>
      <RootLayoutContent />
    </TripProvider>
  );
};

export default RootLayout;

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    bottom: 100,
    right: 30,
  },
  button: {
    height: 70,
    width: 70,
  },
});
