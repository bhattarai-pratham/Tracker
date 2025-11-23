import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { tripService } from "../functions/tripService";

interface TripContextType {
  is_trip_active: boolean;
  setIsTripActive: (active: boolean) => void;

  tripId: string | undefined;
  setTripId: (id: string | undefined) => void;

  startingOdometer: string | undefined;
  setStartingOdometer: (odometer: string | undefined) => void;

  startTimestamp: Date | null;
  setStartTimestamp: (timestamp: Date | null) => void;

  endingOdometer: string | undefined;
  setEndingOdometer: (odometer: string | undefined) => void;

  endTimestamp: Date | null;
  setEndTimestamp: (timestamp: Date | null) => void;

  earnings: string | undefined;
  setEarnings: (earnings: string | undefined) => void;

  isSaving: boolean;

  startTripPhotoUri: string | null;
  setStartTripPhotoUri: (uri: string | null) => void;
  endTripPhotoUri: string | null;
  setEndTripPhotoUri: (uri: string | null) => void;

  // Storage functions
  saveToStorage: () => Promise<void>;
  clearStorage: () => Promise<void>;
  initializeFromStorage: () => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACTIVE_TRIP_ID: "@trip_active_id",
  IS_TRIP_ACTIVE: "@trip_is_active",
  STARTING_ODOMETER: "@trip_starting_odometer",
  START_TIMESTAMP: "@trip_start_timestamp",
  EARNINGS: "@trip_earnings",
};

export function TripProvider({ children }: { children: ReactNode }) {
  const [is_trip_active, setIsTripActive] = useState(false);
  const [tripId, setTripId] = useState<string | undefined>(undefined);
  const [startingOdometer, setStartingOdometer] = useState<string | undefined>(
    undefined
  );
  const [startTimestamp, setStartTimestamp] = useState<Date | null>(null);
  const [endingOdometer, setEndingOdometer] = useState<string | undefined>(
    undefined
  );
  const [endTimestamp, setEndTimestamp] = useState<Date | null>(null);
  const [earnings, setEarnings] = useState<string | undefined>(undefined);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [startTripPhotoUri, setStartTripPhotoUri] = useState<string | null>(
    null
  );
  const [endTripPhotoUri, setEndTripPhotoUri] = useState<string | null>(null);

  // Initialize from storage on app launch
  useEffect(() => {
    initializeFromStorage();
  }, []);

  // Auto-save to storage when trip state changes
  useEffect(() => {
    console.log("Auto-save effect triggered:", {
      isInitialized,
      is_trip_active,
      tripId,
      hasAllConditions: isInitialized && is_trip_active && tripId,
    });

    if (isInitialized && is_trip_active && tripId) {
      console.log("Auto-saving trip state to storage...");
      setIsSaving(true);
      saveToStorage().finally(() => {
        console.log("Auto-save completed, setting isSaving to false");
        setIsSaving(false);
      });
    }
  }, [
    is_trip_active,
    tripId,
    startingOdometer,
    startTimestamp,
    earnings,
    isInitialized,
  ]);

  const initializeFromStorage = async () => {
    try {
      console.log("Initializing trip state from storage...");
      const [
        storedTripId,
        storedIsActive,
        storedOdometer,
        storedTimestamp,
        storedEarnings,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_TRIP_ID),
        AsyncStorage.getItem(STORAGE_KEYS.IS_TRIP_ACTIVE),
        AsyncStorage.getItem(STORAGE_KEYS.STARTING_ODOMETER),
        AsyncStorage.getItem(STORAGE_KEYS.START_TIMESTAMP),
        AsyncStorage.getItem(STORAGE_KEYS.EARNINGS),
      ]);

      if (storedTripId && storedIsActive === "true") {
        // Verify with Supabase that trip still exists and is incomplete
        console.log("Verifying stored trip with Supabase:", storedTripId);
        const { data, error } = await tripService.getTripByID(storedTripId);

        console.log("Supabase verification result:", {
          found: !!data,
          error: error?.message,
          hasEndTimestamp: data?.end_timestamp,
          hasEndingOdometer: data?.ending_odometer,
          endTimestampValue: data?.end_timestamp,
          endingOdometerValue: data?.ending_odometer,
        });

        // If there's a network error, trust AsyncStorage and restore anyway
        if (error) {
          console.log(
            "Network error during verification, trusting AsyncStorage"
          );
          setTripId(storedTripId);
          setIsTripActive(true);
          setStartingOdometer(storedOdometer || undefined);
          setStartTimestamp(storedTimestamp ? new Date(storedTimestamp) : null);
          setEarnings(storedEarnings || undefined);
        } else if (
          data &&
          (data.end_timestamp === null ||
            data.end_timestamp === "" ||
            data.end_timestamp === undefined)
        ) {
          // Trip is valid and incomplete, restore state
          console.log("Restoring active trip:", storedTripId);
          setTripId(storedTripId);
          setIsTripActive(true);
          setStartingOdometer(storedOdometer || undefined);
          setStartTimestamp(storedTimestamp ? new Date(storedTimestamp) : null);
          setEarnings(storedEarnings || undefined);
        } else {
          // Trip completed or doesn't exist in DB, clear storage
          console.log("Trip completed or not found in DB, clearing storage", {
            hasData: !!data,
            endTimestamp: data?.end_timestamp,
          });
          await clearStorage();
        }
      } else {
        console.log("No active trip found in storage");
      }

      setIsInitialized(true);
    } catch (error) {
      console.error("Error initializing from storage:", error);
      setIsInitialized(true);
    }
  };

  const saveToStorage = async () => {
    try {
      console.log("Saving trip state to storage...", {
        tripId,
        is_trip_active,
        startingOdometer,
        startTimestamp: startTimestamp?.toISOString(),
        earnings,
      });
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_TRIP_ID, tripId || ""),
        AsyncStorage.setItem(
          STORAGE_KEYS.IS_TRIP_ACTIVE,
          is_trip_active.toString()
        ),
        AsyncStorage.setItem(
          STORAGE_KEYS.STARTING_ODOMETER,
          startingOdometer || ""
        ),
        AsyncStorage.setItem(
          STORAGE_KEYS.START_TIMESTAMP,
          startTimestamp?.toISOString() || ""
        ),
        AsyncStorage.setItem(STORAGE_KEYS.EARNINGS, earnings || ""),
      ]);
      console.log("Trip state saved successfully");
    } catch (error) {
      console.error("Error saving to storage:", error);
      throw error;
    }
  };

  const clearStorage = async () => {
    try {
      console.log("Clearing trip state from storage...");
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_TRIP_ID),
        AsyncStorage.removeItem(STORAGE_KEYS.IS_TRIP_ACTIVE),
        AsyncStorage.removeItem(STORAGE_KEYS.STARTING_ODOMETER),
        AsyncStorage.removeItem(STORAGE_KEYS.START_TIMESTAMP),
        AsyncStorage.removeItem(STORAGE_KEYS.EARNINGS),
      ]);
      setIsTripActive(false);
      setTripId(undefined);
      setStartingOdometer(undefined);
      setStartTimestamp(null);
      setEndingOdometer(undefined);
      setEndTimestamp(null);
      setEarnings(undefined);
      setStartTripPhotoUri(null);
      setEndTripPhotoUri(null);
      console.log("Trip state cleared successfully");
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  };

  return (
    <TripContext.Provider
      value={{
        is_trip_active,
        setIsTripActive,
        tripId,
        setTripId,
        startingOdometer,
        setStartingOdometer,
        startTimestamp,
        setStartTimestamp,
        endingOdometer,
        setEndingOdometer,
        endTimestamp,
        setEndTimestamp,
        earnings,
        setEarnings,
        isSaving,
        startTripPhotoUri,
        setStartTripPhotoUri,
        endTripPhotoUri,
        setEndTripPhotoUri,
        saveToStorage,
        clearStorage,
        initializeFromStorage,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTripContext() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTripContext must be used within TripProvider");
  }
  return context;
}
