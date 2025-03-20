import { supabase } from "./supabase";

// Get the current user's username
const getUsername = () => {
  try {
    const authState = localStorage.getItem("auth_state");
    if (!authState) return null;

    const parsedState = JSON.parse(authState);
    return parsedState.username;
  } catch (error) {
    console.error("Error getting username:", error);
    return null;
  }
};

// Interface for user settings
export interface UserSettings {
  id?: string;
  username: string;
  columnVisibility: Record<string, boolean>;
  autoStatusTime: string;
  created_at?: string;
  updated_at?: string;
}

// Save user settings to the database
export const saveUserSettings = async (
  columnVisibility: Record<string, boolean>,
  autoStatusTime: string,
): Promise<UserSettings | null> => {
  try {
    const username = getUsername();

    if (!username) {
      throw new Error("User not logged in");
    }

    // Check if settings already exist for this user
    const { data: existingSettings } = await supabase
      .from("user_settings")
      .select("*")
      .eq("username", username)
      .single();

    const now = new Date().toISOString();

    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from("user_settings")
        .update({
          columnVisibility,
          autoStatusTime,
          updated_at: now,
        })
        .eq("id", existingSettings.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating user settings:", error);
        return null;
      }

      return data;
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from("user_settings")
        .insert([
          {
            username,
            columnVisibility,
            autoStatusTime,
            created_at: now,
            updated_at: now,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating user settings:", error);
        return null;
      }

      return data;
    }
  } catch (error) {
    console.error("Unexpected error saving user settings:", error);
    return null;
  }
};

// Get user settings from the database
export const getUserSettings = async (): Promise<UserSettings | null> => {
  try {
    const username = getUsername();

    if (!username) {
      return null;
    }

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("username", username)
      .single();

    if (error) {
      // If no settings found, this is not an error
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching user settings:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error fetching user settings:", error);
    return null;
  }
};
