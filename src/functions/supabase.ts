import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || "";
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseKey || "";

console.log("Supabase Config Check:", {
  hasUrl: !!SUPABASE_URL,
  hasKey: !!SUPABASE_ANON_KEY,
  url: SUPABASE_URL ? SUPABASE_URL.substring(0, 20) + "..." : "MISSING",
  expoConfig: !!Constants.expoConfig,
  extra: !!Constants.expoConfig?.extra,
});

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase credentials. Please check your .env file and app.json configuration."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export { SUPABASE_URL };
