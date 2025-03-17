import { supabase } from "./supabase";
import { Project, ProjectInsert } from "@/types/schema";

// Get the current user's table name
const getUserTable = () => {
  try {
    const authState = localStorage.getItem("auth_state");
    if (!authState) return null;

    const parsedState = JSON.parse(authState);
    const username = parsedState.username;

    if (!username) return null;

    // Generate table name based on username
    return `user_projects_${username.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  } catch (error) {
    console.error("Error getting user table:", error);
    return null;
  }
};

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

// Create a new project in the user's table
export const createUserProject = async (
  project: ProjectInsert,
): Promise<Project | null> => {
  try {
    const tableName = getUserTable();
    const username = getUsername();

    if (!tableName || !username) {
      throw new Error("User not logged in");
    }

    // First try to insert into the user's specific table
    const { data: userData, error: userError } = await supabase
      .from(tableName)
      .insert([
        {
          ...project,
          username,
          tags: project.tags || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (userError) {
      console.error(`Error inserting into ${tableName}:`, userError);

      // Fallback to the shared user_projects table
      const { data: sharedData, error: sharedError } = await supabase
        .from("user_projects")
        .insert([
          {
            ...project,
            username,
            tags: project.tags || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (sharedError) {
        console.error("Error inserting into user_projects:", sharedError);
        return null;
      }

      return sharedData;
    }

    return userData;
  } catch (error) {
    console.error("Unexpected error creating user project:", error);
    return null;
  }
};

// Get all projects for the current user
export const getUserProjects = async (): Promise<Project[]> => {
  try {
    const tableName = getUserTable();
    const username = getUsername();

    if (!username) {
      return [];
    }

    let allProjects: Project[] = [];

    // Try to get projects from user's specific table if it exists
    if (tableName) {
      try {
        const { data: userData, error: userError } = await supabase
          .from(tableName)
          .select("*")
          .order("created_at", { ascending: false });

        if (!userError && userData) {
          allProjects = [...allProjects, ...userData];
        }
      } catch (tableError) {
        console.error(`Error fetching from ${tableName}:`, tableError);
      }
    }

    // Also get projects from the shared user_projects table
    const { data: sharedData, error: sharedError } = await supabase
      .from("user_projects")
      .select("*")
      .eq("username", username)
      .order("created_at", { ascending: false });

    if (!sharedError && sharedData) {
      allProjects = [...allProjects, ...sharedData];
    }

    return allProjects;
  } catch (error) {
    console.error("Unexpected error fetching user projects:", error);
    return [];
  }
};

// Update a project
export const updateUserProject = async (
  id: string,
  updates: Partial<Project>,
): Promise<Project | null> => {
  try {
    const tableName = getUserTable();
    const username = getUsername();

    if (!username) {
      throw new Error("User not logged in");
    }

    // Try to update in user's specific table first
    if (tableName) {
      try {
        const { data: userData, error: userError } = await supabase
          .from(tableName)
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (!userError && userData) {
          return userData;
        }
      } catch (tableError) {
        console.error(`Error updating in ${tableName}:`, tableError);
      }
    }

    // Fallback to the shared user_projects table
    const { data: sharedData, error: sharedError } = await supabase
      .from("user_projects")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("username", username)
      .select()
      .single();

    if (sharedError) {
      console.error("Error updating in user_projects:", sharedError);
      return null;
    }

    return sharedData;
  } catch (error) {
    console.error("Unexpected error updating user project:", error);
    return null;
  }
};

// Delete a project
export const deleteUserProject = async (id: string): Promise<boolean> => {
  try {
    const tableName = getUserTable();
    const username = getUsername();

    if (!username) {
      throw new Error("User not logged in");
    }

    let deleted = false;

    // Try to delete from user's specific table first
    if (tableName) {
      try {
        const { error: userError } = await supabase
          .from(tableName)
          .delete()
          .eq("id", id);

        if (!userError) {
          deleted = true;
        }
      } catch (tableError) {
        console.error(`Error deleting from ${tableName}:`, tableError);
      }
    }

    // Also try to delete from the shared user_projects table
    const { error: sharedError } = await supabase
      .from("user_projects")
      .delete()
      .eq("id", id)
      .eq("username", username);

    if (!sharedError) {
      deleted = true;
    }

    return deleted;
  } catch (error) {
    console.error("Unexpected error deleting user project:", error);
    return false;
  }
};
