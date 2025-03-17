import { pool } from "./postgres";
import { Project, ProjectInsert } from "@/types/schema";

export async function createProject(project: ProjectInsert): Promise<Project> {
  return {
    ...project,
    id: Math.random().toString(36).substring(2, 15),
  };
}

export async function updateProject(
  id: string,
  updates: Partial<Project>,
): Promise<Project> {
  return {
    id,
    name: updates.name || "",
    logo: updates.logo || "",
    link: updates.link || "",
    twitterLink: updates.twitterLink || "",
    isActive: updates.isActive || false,
    lastActivity: updates.lastActivity || new Date().toISOString(),
    notes: updates.notes || "",
    joinDate: updates.joinDate || new Date().toISOString(),
    chain: updates.chain || "",
    stage: (updates.stage as any) || "Testnet",
    tags: updates.tags || [],
    type: (updates.type as any) || "Mini App",
    cost: updates.cost || 0,
  };
}

export async function deleteProject(id: string): Promise<void> {
  // Simplified delete function
}

export async function getProjects(): Promise<Project[]> {
  return [];
}

export async function getProjectById(id: string): Promise<Project> {
  return {
    id,
    name: "Project",
    logo: "",
    link: "",
    twitterLink: "",
    isActive: true,
    lastActivity: new Date().toISOString(),
    notes: "",
    joinDate: new Date().toISOString(),
    chain: "Ethereum",
    stage: "Testnet",
    tags: [],
    type: "Mini App",
    cost: 0,
  };
}
