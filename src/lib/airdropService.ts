import { supabase } from "./supabase";

// Get current user from localStorage
export const getCurrentUser = () => {
  try {
    const authState = localStorage.getItem("auth_state");
    if (!authState) return null;

    const parsedState = JSON.parse(authState);
    return parsedState.username ? { username: parsedState.username } : null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Get all airdrops for the current user
export const getUserAirdrops = async () => {
  try {
    const user = getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("user_airdrops")
      .select("*")
      .eq("username", user.username)
      .order("last_activity", { ascending: false });

    if (error) {
      console.error("Error fetching airdrops:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching airdrops:", error);
    return [];
  }
};

// Add a new airdrop
export const addAirdrop = async (airdropData) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error("You must be logged in to add an airdrop");

    const { data, error } = await supabase
      .from("user_airdrops")
      .insert([
        {
          ...airdropData,
          username: user.username,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding airdrop:", error);
    throw error;
  }
};

// Update an airdrop
export const updateAirdrop = async (id, updates) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error("You must be logged in to update an airdrop");

    const { data, error } = await supabase
      .from("user_airdrops")
      .update(updates)
      .eq("id", id)
      .eq("username", user.username)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating airdrop:", error);
    throw error;
  }
};

// Delete an airdrop
export const deleteAirdrop = async (id) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error("You must be logged in to delete an airdrop");

    const { error } = await supabase
      .from("user_airdrops")
      .delete()
      .eq("id", id)
      .eq("username", user.username);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting airdrop:", error);
    throw error;
  }
};

// Update airdrop status
export const updateAirdropStatus = async (id, status) => {
  return updateAirdrop(id, { status });
};

// Update airdrop notes
export const updateAirdropNotes = async (id, notes) => {
  return updateAirdrop(id, { notes });
};
