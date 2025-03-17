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

// Get all projects for the current user
export const getUserProjects = async () => {
  try {
    const user = getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("user_airdrops")
      .select("*")
      .eq("username", user.username)
      .order("last_activity", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching projects:", error);
    return [];
  }
};

// Add a new project
export const addProject = async (projectData) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error("You must be logged in to add a project");

    const { data, error } = await supabase
      .from("user_airdrops")
      .insert([
        {
          ...projectData,
          username: user.username,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding project:", error);
    throw error;
  }
};

// Update a project
export const updateProject = async (id, updates) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error("You must be logged in to update a project");

    // Format the updates object to match the database schema
    const formattedUpdates = {
      ...updates,
      // Ensure these fields use the database column names
      project: updates.name || updates.project,
      image: updates.logo || updates.image,
      twitter: updates.twitterLink || updates.twitter,
      status: updates.isActive ? "active" : "pending",
      last_activity: new Date().toISOString(),
      // Format tags as a string if it's an array
      tags: Array.isArray(updates.tags)
        ? updates.tags.join(", ")
        : updates.tags,
    };

    const { data, error } = await supabase
      .from("user_airdrops")
      .update(formattedUpdates)
      .eq("id", id)
      .eq("username", user.username)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

// Delete a project
export const deleteProject = async (id) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error("You must be logged in to delete a project");

    const { error } = await supabase
      .from("user_airdrops")
      .delete()
      .eq("id", id)
      .eq("username", user.username);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

// Update project status
export const updateProjectStatus = async (id, status) => {
  return updateProject(id, { status });
};

// Update project notes
export const updateProjectNotes = async (id, notes) => {
  return updateProject(id, { notes });
};
