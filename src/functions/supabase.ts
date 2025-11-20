import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rlsntcjovsetoejjcmzw.supabase.co";
// TODO: Replace this with your actual anon/public key from Supabase dashboard
// It should start with "eyJ..." and be very long
const SUPABASE_ANON_KEY = "sb_publishable_4rSd2pce5Lvbvi10qUMHtQ_gh7cXNHk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export { SUPABASE_URL };
