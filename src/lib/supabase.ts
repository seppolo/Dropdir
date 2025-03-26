import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and Anon Key are required. Please check your .env file.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (...args) => {
      // Remove logging in production for better performance
      if (import.meta.env.DEV) {
        console.log("Supabase fetch request:", args[0]);
      }
      return fetch(...args);
    },
  },
  db: {
    schema: "public",
  },
  realtime: {
    timeout: 30000, // Increase timeout for better reliability
  },
});
