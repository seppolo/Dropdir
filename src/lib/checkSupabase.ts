import { supabase } from "./supabase";

export async function checkSupabaseConnection() {
  try {
    // First check if users table exists
    const usersResult = await supabase.from("users").select("count").limit(1);

    if (!usersResult.error) {
      return true;
    }

    // Fallback to checking user_projects table
    const projectsResult = await supabase
      .from("user_projects")
      .select("count")
      .limit(1);

    console.log("Supabase connection test:", {
      data: projectsResult.data,
      error: projectsResult.error,
    });
    return !projectsResult.error;
  } catch (e) {
    console.error("Supabase connection error:", e);
    return false;
  }
}
