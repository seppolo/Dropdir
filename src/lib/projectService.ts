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

    // Check for cached data first
    const cachedProjects = localStorage.getItem("user_projects");
    const cachedTimestamp = localStorage.getItem("user_projects_timestamp");
    const now = new Date().getTime();

    // Use cache if it's less than 15 minutes old (increased from 5 minutes for better performance)
    if (
      cachedProjects &&
      cachedTimestamp &&
      now - parseInt(cachedTimestamp) < 15 * 60 * 1000
    ) {
      return JSON.parse(cachedProjects);
    }

    // Only select the fields we actually need instead of '*'
    const { data, error } = await supabase
      .from("user_airdrops")
      .select(
        "id, project, image, link, twitter, status, last_activity, notes, join_date, chain, stage, tags, type, cost, username, is_active",
      )
      .eq("username", user.username)
      .order("last_activity", { ascending: false });

    if (error) {
      // Try to use cached data even if it's older
      if (cachedProjects) {
        return JSON.parse(cachedProjects);
      }
      return [];
    }

    // Update cache with new data
    if (data) {
      localStorage.setItem("user_projects", JSON.stringify(data));
      localStorage.setItem("user_projects_timestamp", now.toString());
    }

    return data || [];
  } catch (error) {
    // Try to use cached data in case of error
    const cachedProjects = localStorage.getItem("user_projects");
    if (cachedProjects) {
      return JSON.parse(cachedProjects);
    }
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
