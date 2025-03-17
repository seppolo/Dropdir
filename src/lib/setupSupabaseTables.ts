import { supabase } from "./supabase";

/**
 * Sets up the required tables in Supabase
 */
export async function setupSupabaseTables() {
  try {
    console.log("Setting up Supabase tables...");

    // Read the SQL file content
    const response = await fetch("/src/sql/setup_supabase_tables.sql");
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

    console.log("Supabase tables setup complete");
    return true;
  } catch (error) {
    console.error("Error setting up Supabase tables:", error);
    return false;
  }
}

/**
 * Alternative method to set up tables using individual RPC calls
 */
export async function setupTablesManually() {
  try {
    // Create users table
    const { error: usersError } = await supabase.rpc("create_users_table");
    if (usersError) {
      console.error("Error creating users table:", usersError);
    }

    // Create user_projects table
    const { error: projectsError } = await supabase.rpc(
      "create_projects_table",
    );
    if (projectsError) {
      console.error("Error creating projects table:", projectsError);
    }

    // Set up RLS policies
    const { error: rlsError } = await supabase.rpc("setup_rls_policies");
    if (rlsError) {
      console.error("Error setting up RLS policies:", rlsError);
    }

    return !usersError && !projectsError && !rlsError;
  } catch (error) {
    console.error("Error in manual table setup:", error);
    return false;
  }
}
