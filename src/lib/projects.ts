import { supabase } from "./supabase";
import { Project, ProjectInsert } from "@/types/schema";
import {
  createUserProject,
  getUserProjects,
  updateUserProject,
  deleteUserProject,
} from "./userProjectService";

export async function createProject(project: ProjectInsert) {
  try {
    console.log("Creating project with data:", project);

    // First test the connection
    let testResponse;
    try {
      testResponse = await supabase
        .from("user_projects")
        .select("count")
        .single();
      console.log("Connection test response:", testResponse);
    } catch (error) {
      console.error("Connection test error:", error);
      testResponse = { error: true };
    }

    if (testResponse.error) {
      console.error("Supabase connection test failed:", testResponse.error);
      throw new Error("Database connection failed");
    }

    // Create project using the user project service
    const data = await createUserProject(project);

    if (!data) {
      throw new Error("Failed to create project");
    }

    console.log("Project created successfully:", data);
    return data;
  } catch (error) {
    console.error("Unexpected error in createProject:", error);
    throw error;
  }
}

export async function updateProject(id: string, updates: Partial<Project>) {
  const data = await updateUserProject(id, updates);
  if (!data) throw new Error("Failed to update project");
  return data;
}

export async function deleteProject(id: string) {
  const success = await deleteUserProject(id);
  if (!success) throw new Error("Failed to delete project");
}

export async function getProjects() {
  try {
    // Get projects using the user project service
    const projects = await getUserProjects();

    // Ensure all projects have the required fields
    const processedData = projects?.map((project) => {
      // Handle tags specifically to ensure it's always an array
      let tags = [];
      if (project.tags) {
        if (Array.isArray(project.tags)) {
          tags = project.tags;
        } else if (typeof project.tags === "string") {
          // If tags is a string (like from PostgreSQL JSON), parse it
          try {
            const parsedTags = JSON.parse(project.tags);
            tags = Array.isArray(parsedTags) ? parsedTags : [];
          } catch (e) {
            // If parsing fails, split by comma if it's a comma-separated string
            tags = project.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0);
          }
        }
      }

      return {
        ...project,
        joinDate:
          project.joinDate || project.created_at || new Date().toISOString(),
        chain: project.chain || "Unknown",
        stage: project.stage || "Unknown",
        tags: tags,
        type: project.type || "Mini App",
        cost: typeof project.cost === "number" ? project.cost : 0,
      };
    });

    return processedData;
  } catch (error) {
    console.error("Unexpected error in getProjects:", error);
    throw error;
  }
}
