import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and Anon Key are required. Please check your .env file.",
  );
}

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
