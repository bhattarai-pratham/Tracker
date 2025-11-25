import { router, Stack, usePathname } from "expo-router";
import { StyleSheet, View } from "react-native";
import { EndTripIcon, StartTripIcon } from "../assets/Icons";
import AppButton from "../components/AppButton";
import { TripProvider, useTripContext } from "../context/TripContext";

const RootLayoutContent = () => {
  const { is_trip_active } = useTripContext();
  const pathname = usePathname();

  console.log("Current pathname:", pathname);

  const isOnReceiptsTab = pathname.includes("Reciepts");

  const shouldHideButton =
    pathname.includes("StartTrip") ||
    pathname.includes("EndTrip") ||
    pathname.includes("AddReceipt") ||
    pathname.includes("Export") ||
    pathname.includes("receiptID") ||
    pathname.includes("tripID") ||
    (pathname.match(/\/[^/]+$/) &&
      pathname !== "/" &&
      !pathname.includes("(tabs)") &&
      !pathname.includes("Reciepts"));

  const handleButtonPress = () => {
    if (isOnReceiptsTab) {
      router.push("/(screens)/AddReceipt");
    } else if (!is_trip_active) {
      router.push("/(screens)/StartTrip");
    } else {
      router.push("/(screens)/EndTrip");
    }
  };

  const getButtonVariant = () => {
    if (isOnReceiptsTab) return "primary";
    return is_trip_active ? "danger" : "primary";
  };

  const getButtonIcon = () => {
    if (isOnReceiptsTab) {
      return <StartTripIcon />;
    }
    return is_trip_active ? <EndTripIcon /> : <StartTripIcon />;
  };

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(screens)" />
      </Stack>
      {!shouldHideButton && (
        <View style={styles.buttonContainer}>
          <AppButton
            onPress={handleButtonPress}
            size="lg"
            variant={getButtonVariant()}
            shape="circle"
            style={styles.button}
          >
            {getButtonIcon()}
          </AppButton>
        </View>
      )}
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
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    height: 70,
    width: 70,
    borderRadius: 35,
    backgroundColor: "#0ea5a4", // default primary color
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0ea5a4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
});
