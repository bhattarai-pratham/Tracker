import { Trip } from "../data/tripdata";
import { supabase } from "./supabase";

export const tripService = {
  async getAllTrips(): Promise<{ data: Trip[] | null; error: any }> {
    console.log("Fetching all trips from Supabase...");
    const { data, error } = await supabase
      .from("trips_dummy")
      .select("*")
      .order("start_timestamp", { ascending: false });

    console.log("Number of trips:", data?.length || 0);

    return { data, error };
  },

  async getTripByID(id: string): Promise<{ data: Trip | null; error: any }> {
    const { data, error } = await supabase
      .from("trips_dummy")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  async createTrip(tripData: {
    id: string;
    starting_odometer: string;
    start_timestamp: string;
  }): Promise<{ data: Trip | null; error: any }> {
    console.log("Creating new trip:", tripData);
    const { data, error } = await supabase
      .from("trips_dummy")
      .insert([
        {
          id: tripData.id,
          starting_odometer: tripData.starting_odometer,
          start_timestamp: tripData.start_timestamp,
          // Set to null - will be updated when trip ends
          ending_odometer: null,
          end_timestamp: null,
          earnings: null,
        },
      ])
      .select()
      .single();

    console.log("Create trip response:", { data, error });
    return { data, error };
  },

  async updateTripEnd(
    tripId: string,
    endData: {
      ending_odometer: string;
      end_timestamp: string;
      earnings?: number;
    }
  ): Promise<{ data: Trip | null; error: any }> {
    console.log("Updating trip end:", { tripId, endData });
    const { data, error } = await supabase
      .from("trips_dummy")
      .update({
        ending_odometer: endData.ending_odometer,
        end_timestamp: endData.end_timestamp,
        earnings: endData.earnings,
      })
      .eq("id", tripId)
      .select()
      .single();

    console.log("Update trip response:", { data, error });
    return { data, error };
  },

  async getActiveTripId(): Promise<{ data: Trip | null; error: any }> {
    console.log("Checking for active trip...");
    const { data, error } = await supabase
      .from("trips_dummy")
      .select("*")
      .or("end_timestamp.is.null,end_timestamp.eq.")
      .order("start_timestamp", { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log("Active trip check:", { data, error });
    return { data, error };
  },
};
