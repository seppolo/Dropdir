import { supabase } from "./supabase";

/**
 * Sets up the user_airdrops table in Supabase
 */
export async function setupUserAirdropsTable() {
  try {
    console.log("Setting up user_airdrops table...");

    // Read the SQL file content
    const response = await fetch("/src/sql/create_user_airdrops_table.sql");
    const sqlContent = await response.text();

    // Split the SQL into individual statements
    const statements = sqlContent
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0);

    // Execute each statement
    for (const statement of statements) {
      const { error } = await supabase.rpc("exec_sql", { sql: statement });
      if (error) {
        console.error(`Error executing SQL: ${statement}`, error);
      }
    }

    console.log("user_airdrops table setup complete");
    return true;
  } catch (error) {
    console.error("Error setting up user_airdrops table:", error);
    return false;
  }
}
