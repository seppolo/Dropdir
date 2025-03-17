import { supabase } from "./supabase";
import { setupSupabaseTables } from "./setupSupabaseTables";
import { setupUserAirdropsTable } from "./setupUserAirdropsTable";

/**
 * Sets up the Supabase database with the required tables
 */
export async function setupSupabaseDatabase() {
  try {
    // First, try to set up all tables using the SQL file
    const tablesSetup = await setupSupabaseTables();

    // If that fails, try to set up the user_airdrops table separately
    if (!tablesSetup) {
      console.log("Trying to set up user_airdrops table separately...");
      await setupUserAirdropsTable();
    }

    // Check if the users table exists
    let usersTableExists = null;
    let usersCheckError = null;
    try {
      const result = await supabase.from("users").select("count").limit(1);
      usersTableExists = result.data;
      usersCheckError = result.error;
    } catch (e) {
      usersTableExists = null;
      usersCheckError = true;
    }

    // If users table doesn't exist, try to create it
    if (usersTableExists === null || usersCheckError) {
      console.log("Users table doesn't exist, creating it...");
      const { error: createUsersError } = await supabase.rpc(
        "create_users_table",
        {},
      );

      if (createUsersError) {
        console.error("Error creating users table:", createUsersError);
      }
    }

    // Check if the user_airdrops table exists
    let airdropsTableExists = null;
    let airdropsCheckError = null;
    try {
      const result = await supabase
        .from("user_airdrops")
        .select("count")
        .limit(1);
      airdropsTableExists = result.data;
      airdropsCheckError = result.error;
    } catch (e) {
      airdropsTableExists = null;
      airdropsCheckError = true;
    }

    // If user_airdrops table doesn't exist, try to create it
    if (airdropsTableExists === null || airdropsCheckError) {
      console.log("user_airdrops table doesn't exist, creating it...");
      await setupUserAirdropsTable();
    }

    // Create storage bucket for logos if it doesn't exist
    try {
      // Check if the bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const logosBucketExists = buckets?.some(
        (bucket) => bucket.name === "logos",
      );

      if (!logosBucketExists) {
        // Create the bucket
        const { data, error } = await supabase.storage.createBucket("logos", {
          public: true,
          fileSizeLimit: 1024 * 1024 * 2, // 2MB limit
          allowedMimeTypes: [
            "image/png",
            "image/jpeg",
            "image/gif",
            "image/svg+xml",
          ],
        });

        if (error) {
          console.error("Error creating logos bucket:", error);
        } else {
          console.log("Logos bucket created successfully");
        }
      } else {
        console.log("Logos bucket already exists");
      }
    } catch (storageError) {
      console.error("Error setting up storage:", storageError);
    }

    console.log("Supabase database setup complete");
    return true;
  } catch (error) {
    console.error("Error setting up Supabase database:", error);
    return false;
  }
}
