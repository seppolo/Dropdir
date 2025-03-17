import { supabase } from "./supabase";

/**
 * Resets all project statuses to inactive at 7 AM WIB (UTC+7)
 */
export async function setupDailyReset() {
  // Calculate time until next 7 AM WIB
  const now = new Date();

  // Convert to WIB (UTC+7)
  const wibOffset = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
  const nowWIB = new Date(now.getTime() + wibOffset);

  // Set target time to 7 AM WIB today
  const targetTime = new Date(nowWIB);
  targetTime.setHours(7, 0, 0, 0);

  // If it's already past 7 AM WIB, set for tomorrow
  if (nowWIB > targetTime) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  // Calculate milliseconds until target time
  const timeUntilReset = targetTime.getTime() - nowWIB.getTime();

  console.log(
    `Daily reset scheduled for ${targetTime.toLocaleString()} (in ${Math.floor(timeUntilReset / 3600000)} hours)`,
  );

  // Schedule the reset
  setTimeout(() => {
    resetAllProjects();
    // After first execution, schedule it to run every 24 hours
    setInterval(resetAllProjects, 24 * 60 * 60 * 1000);
  }, timeUntilReset);
}

async function resetAllProjects() {
  try {
    console.log("Executing daily reset at", new Date().toLocaleString());

    // Update all projects to inactive in Supabase
    const { error } = await supabase
      .from("projects")
      .update({ isActive: false })
      .neq("id", ""); // Update all records

    if (error) {
      console.error("Error resetting projects:", error);
      return false;
    }

    console.log("All projects reset to inactive successfully");
    return true;
  } catch (error) {
    console.error("Unexpected error in resetAllProjects:", error);
    return false;
  }
}
