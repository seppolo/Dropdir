import { createClient } from "@supabase/supabase-js";

// Get environment variables with fallback to .env file values
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://cgsnxaqnbgvfcclimcfo.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnc254YXFuYmd2ZmNjbGltY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NjgyNzIsImV4cCI6MjA1NzM0NDI3Mn0.MGmHpPAuVGGBjB_BSEmHhI3QZ8ICwbXQxd9Zh8te1Wg";

// Validate that we have the required values
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL and Anon Key are required. Using fallback values.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (...args) => {
      // Log fetch requests for debugging
      console.log("Supabase fetch request:", args[0]);
      return fetch(...args);
    },
  },
});
