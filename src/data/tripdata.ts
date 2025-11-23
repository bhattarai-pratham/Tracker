export interface Trip {
  id: string;
  starting_odometer: string;
  start_timestamp: string;
  ending_odometer: string | null;
  end_timestamp: string | null;
  earnings?: number | null;
  created_at?: string;
}
