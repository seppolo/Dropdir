import { createClient } from "@supabase/supabase-js";

// Get environment variables with fallbacks for development
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://example.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

// Create a lightweight Supabase client with optimized settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      "Cache-Control": "max-age=1800", // 30 minutes cache
    },
  },
  db: {
    schema: "public",
  },
  realtime: {
    // Disable realtime subscriptions to reduce overhead
    params: {
      eventsPerSecond: 1,
    },
  },
});

// Function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl !== "https://example.supabase.co" &&
    supabaseAnonKey !== "your-anon-key" &&
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey)
  );
};

// Cache control helper functions
export const clearSupabaseCache = () => {
  // Clear all cached data related to Supabase
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes("user_projects") || key.includes("cached_"))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
};

export const getSupabaseCacheSize = () => {
  let totalSize = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes("user_projects") || key.includes("cached_"))) {
      totalSize += localStorage.getItem(key)?.length || 0;
    }
  }
  return (totalSize / 1024).toFixed(2) + " KB";
};
