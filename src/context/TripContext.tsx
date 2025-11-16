import React, { createContext, useContext, useState, ReactNode } from "react";

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
}

const TripContext = createContext<TripContextType | undefined>(undefined);

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
