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

  // Initialize from storage on app launch
  useEffect(() => {
    initializeFromStorage();
  }, []);

  const initializeFromStorage = async () => {
    try {
      console.log("Initializing trip state from storage...");
      const [storedTripId, storedIsActive, storedOdometer, storedTimestamp] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_TRIP_ID),
          AsyncStorage.getItem(STORAGE_KEYS.IS_TRIP_ACTIVE),
          AsyncStorage.getItem(STORAGE_KEYS.STARTING_ODOMETER),
          AsyncStorage.getItem(STORAGE_KEYS.START_TIMESTAMP),
        ]);

      if (storedTripId && storedIsActive === "true") {
        // Verify with Supabase that trip still exists and is incomplete
        const { data, error } = await tripService.getTripByID(storedTripId);

        if (
          !error &&
          data &&
          (!data.end_timestamp || data.end_timestamp === "")
        ) {
          // Trip is valid and incomplete, restore state
          console.log("Restoring active trip:", storedTripId);
          setTripId(storedTripId);
          setIsTripActive(true);
          setStartingOdometer(storedOdometer || undefined);
          setStartTimestamp(storedTimestamp ? new Date(storedTimestamp) : null);
        } else {
          // Trip completed or doesn't exist, clear storage
          console.log("Trip completed or invalid, clearing storage");
          await clearStorage();
        }
      } else {
        console.log("No active trip found in storage");
      }
    } catch (error) {
      console.error("Error initializing from storage:", error);
    }
  };

  const saveToStorage = async () => {
    try {
      console.log("Saving trip state to storage...");
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
      ]);
      console.log("Trip state saved successfully");
    } catch (error) {
      console.error("Error saving to storage:", error);
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
      ]);
      setIsTripActive(false);
      setTripId(undefined);
      setStartingOdometer(undefined);
      setStartTimestamp(null);
      setEndingOdometer(undefined);
      setEndTimestamp(null);
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
