import React, { useState } from "react";
import {
  Plus as PlusIcon,
  Search,
  Pencil,
  Database,
  Moon,
  Sun,
  Globe,
  Settings,
  MessageCircle,
  Heart,
  AlertCircle,
} from "lucide-react";
import SupabaseStatus from "./SupabaseStatus";
import { isSupabaseConfigured } from "@/lib/supabase";
import SupabaseConfigWarning from "../SupabaseConfigWarning";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ProjectRow from "./ProjectRow";
import NotesModal from "./NotesModal";
import AddProjectModal from "./AddProjectModal";
import EditProjectModal from "./EditProjectModal";
import { Button } from "../ui/button";
import AuthController from "../auth/AuthController";
import { Input } from "../ui/input";
import MakeAllPublicModal from "./MakeAllPublicModal";
import ColumnSettingsModal from "./ColumnSettingsModal";

interface Project {
  id: string;
  name: string;
  logo: string;
  link: string;
  isActive: boolean;
  lastActivity: string;
  notes: string;
  joinDate: string;
  chain: string;
  stage: string;
  tags: string[];
  type: "Retroactive" | "Testnet" | "Mini App" | "Node";
  cost: number;
  wallet: string;
}

interface ProjectTableProps {
  projects?: Project[];
  onStatusChange?: (projectId: string, status: boolean) => void;
  onNotesChange?: (projectId: string, notes: string) => void;
  onAddProject?: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
  onUpdateProject?: (project: Project) => void;
  setProjects?: (projects: Project[]) => void;
  isLoggedIn?: boolean;
}

const ProjectTable: React.FC<ProjectTableProps> = ({
  projects = [],
  onStatusChange = () => {},
  onNotesChange = () => {},
  onAddProject = () => {},
  onDeleteProject = () => {},
  onUpdateProject = () => {},
  setProjects = () => {},
  isLoggedIn = false,
}) => {
  const [isFullMode, setIsFullMode] = useState(window.innerWidth >= 768);
  const [isMobileMode, setIsMobileMode] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [showMakeAllPublicModal, setShowMakeAllPublicModal] = useState(false);
  const [isPublicMode, setIsPublicMode] = useState(false);
  const [isNestedByEcosystem, setIsNestedByEcosystem] = useState(false);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [autoStatusTime, setAutoStatusTime] = useState("09:00 AM");
  const [supabaseConfigured, setSupabaseConfigured] = useState(
    isSupabaseConfigured(),
  );
  const [visibleColumns, setVisibleColumns] = useState({
    Project: true,
    Status: true,
    Link: true,
    Twitter: true,
    Notes: true,
    Wallet: true,
    "Join Date": true,
    Chain: true,
    Stage: true,
    Tags: true,
    Type: true,
    Cost: true,
    "Last Activity": true,
  });

  // Mobile mode always visible columns
  const mobileVisibleColumns = {
    Project: true,
    Status: true,
    Link: true,
    Twitter: true,
    Notes: false,
    Wallet: false,
    "Join Date": false,
    Chain: false,
    Stage: false,
    Tags: false,
    Type: false,
    Cost: false,
    "Last Activity": false,
  };

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsFullMode(width >= 768);
      setIsMobileMode(width < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Load auto status time from localStorage
    const savedAutoStatusTime = localStorage.getItem("autoStatusTime");
    if (savedAutoStatusTime) {
      setAutoStatusTime(savedAutoStatusTime);
    }

    // Load visible columns from localStorage
    const savedVisibleColumns = localStorage.getItem("visibleColumns");
    if (savedVisibleColumns) {
      try {
        setVisibleColumns(JSON.parse(savedVisibleColumns));
      } catch (error) {
        console.error("Error parsing visible columns from localStorage", error);
      }
    }

    // Load public mode setting from localStorage
    const savedPublicMode = localStorage.getItem("isPublicMode");
    if (savedPublicMode) {
      try {
        setIsPublicMode(JSON.parse(savedPublicMode));
      } catch (error) {
        console.error("Error parsing public mode from localStorage", error);
      }
    }

    // Load nested by ecosystem setting from localStorage
    const savedNestedByEcosystem = localStorage.getItem("isNestedByEcosystem");
    if (savedNestedByEcosystem) {
      try {
        setIsNestedByEcosystem(JSON.parse(savedNestedByEcosystem));
      } catch (error) {
        console.error(
          "Error parsing nested by ecosystem from localStorage",
          error,
        );
      }
    }

    // Set up daily auto status change
    const checkAndUpdateStatus = () => {
      const now = new Date();
      const currentTimeStr = now.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      if (currentTimeStr === autoStatusTime) {
        console.log("Auto activating all projects");
        // Activate all inactive projects
        projects.forEach((project) => {
          if (
            !project.isActive &&
            !project.is_active &&
            project.status !== "active"
          ) {
            onStatusChange(project.id, true);
          }
        });
      }
    };

    // Check every minute
    const intervalId = setInterval(checkAndUpdateStatus, 60000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(intervalId);
    };
  }, [projects, autoStatusTime, onStatusChange]);

  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();
    return (
      project.name?.toLowerCase().includes(query) ||
      project.chain?.toLowerCase().includes(query) ||
      project.type?.toLowerCase().includes(query) ||
      project.notes?.toLowerCase().includes(query) ||
      project.stage?.toLowerCase().includes(query) ||
      (project.tags &&
        (typeof project.tags === "string"
          ? project.tags.toLowerCase().includes(query)
          : project.tags.some((tag) => tag.toLowerCase().includes(query)))) ||
      (project.joinDate || project.join_date)?.toLowerCase().includes(query) ||
      (project.cost?.toString() || "").includes(query) ||
      project.link?.toLowerCase().includes(query)
    );
  });

  // Get unique chains from filtered projects
  const uniqueChains = [
    ...new Set(filteredProjects.map((project) => project.chain || "Unknown")),
  ];

  // Get unique stages from filtered projects
  const uniqueStages = [
    ...new Set(filteredProjects.map((project) => project.stage || "Unknown")),
  ];

  // Filter projects by active stage if one is selected
  const stageFilteredProjects = activeStage
    ? filteredProjects.filter(
        (project) =>
          (project.stage || "Unknown").toLowerCase() ===
          activeStage.toLowerCase(),
      )
    : filteredProjects;

  // State to track expanded chains
  const [expandedChains, setExpandedChains] = useState<string[]>(uniqueChains);

  // Toggle chain expansion
  const toggleChainExpansion = (chain: string) => {
    setExpandedChains((prev) =>
      prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain],
    );
  };

  const handleNotesClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleNotesClose = () => {
    setSelectedProject(null);
  };

  const handleNotesSave = (notes: string) => {
    if (selectedProject) {
      onNotesChange(selectedProject.id, notes);
    }
    handleNotesClose();
  };

  const handleEditClick = (project: Project) => {
    console.log("Edit project clicked:", project);
    setEditProject({
      ...project,
      name: project.project || project.name,
      logo: project.image || project.logo,
      twitterLink: project.twitter || project.twitterLink,
      isActive:
        project.status === "active" || project.is_active || project.isActive,
      lastActivity: project.last_activity || project.lastActivity,
      joinDate: project.join_date || project.joinDate,
    });
  };

  const handleEditClose = () => {
    setEditProject(null);
  };

  const handleEditSave = async (updatedProject: Project) => {
    // Format tags properly before saving
    const formattedProject = {
      ...updatedProject,
      // Convert tags array to comma-separated string if it's an array
      tags: Array.isArray(updatedProject.tags)
        ? updatedProject.tags.join(", ")
        : updatedProject.tags,
    };

    try {
      // Call the parent component's update function
      await onUpdateProject(formattedProject);

      // Force refresh projects from database
      window.dispatchEvent(new Event("forceDataReload"));

      // Also update the local state immediately for better UX
      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === updatedProject.id
            ? {
                ...project,
                ...updatedProject,
                // Handle field name variations
                project: updatedProject.name || updatedProject.project,
                name: updatedProject.name || updatedProject.project,
                twitter: updatedProject.twitterLink || updatedProject.twitter,
                twitterLink:
                  updatedProject.twitterLink || updatedProject.twitter,
                logo: updatedProject.logo || updatedProject.image,
                image: updatedProject.logo || updatedProject.image,
                joinDate: updatedProject.joinDate || updatedProject.join_date,
                join_date: updatedProject.joinDate || updatedProject.join_date,
                lastActivity: new Date().toISOString(),
                last_activity: new Date().toISOString(),
                isActive:
                  updatedProject.isActive || updatedProject.status === "active",
                status:
                  updatedProject.status ||
                  (updatedProject.isActive ? "active" : "pending"),
                is_active:
                  updatedProject.isActive || updatedProject.status === "active",
              }
            : project,
        ),
      );
    } catch (error) {
      console.error("Error updating project:", error);
    }

    handleEditClose();
  };

  const handleStatusChange = (projectId: string, status: boolean) => {
    // Update the last activity timestamp when status changes
    const updatedProjects = projects.map((project) => {
      if (project.id === projectId) {
        return {
          ...project,
          lastActivity: new Date().toISOString(),
          last_activity: new Date().toISOString(),
        };
      }
      return project;
    });

    // Update local state immediately for better UX
    setProjects(updatedProjects);

    // Call the parent handler to update the database
    onStatusChange(projectId, status);
  };

  const handleTogglePublicMode = () => {
    const newPublicMode = !isPublicMode;
    setIsPublicMode(newPublicMode);
    localStorage.setItem("isPublicMode", JSON.stringify(newPublicMode));

    // If turning on public mode, show the make all public modal
    if (newPublicMode) {
      setShowMakeAllPublicModal(true);
    }
  };

  const handleToggleNestedByEcosystem = () => {
    const newNestedByEcosystem = !isNestedByEcosystem;
    setIsNestedByEcosystem(newNestedByEcosystem);
    localStorage.setItem(
      "isNestedByEcosystem",
      JSON.stringify(newNestedByEcosystem),
    );
  };

  // Get username from localStorage
  const [username, setUsername] = React.useState("Moffuadi");
  React.useEffect(() => {
    try {
      const authState = localStorage.getItem("auth_state");
      if (authState) {
        const parsedState = JSON.parse(authState);
        if (parsedState.username) {
          setUsername(parsedState.username);
        }
      }
    } catch (error) {
      console.error("Error getting username from localStorage", error);
    }
  }, []);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden flex flex-col bg-[#1A1A2A] backdrop-blur-sm border border-gray-700 mb-6 relative">
      {!supabaseConfigured && (
        <div className="p-4">
          <SupabaseConfigWarning />
        </div>
      )}
      <div className="p-4 border-b border-gray-600 bg-[#1A1A2A] relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 relative w-full md:w-auto">
            {isLoggedIn && (
              <Button
                onClick={() => setShowAddModal(true)}
                className="rounded-full w-8 h-8 md:w-10 md:h-10 border border-gray-600 bg-gray-800 hover:bg-gray-700 flex items-center justify-center"
              >
                <div className="flex items-center justify-center">
                  <span className="text-white font-bold text-lg">+</span>
                </div>
              </Button>
            )}

            <div className="flex items-center gap-2 relative">
              {isLoggedIn && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDeleteMode(!isDeleteMode)}
                    className="rounded-full w-8 h-8 md:w-10 md:h-10 border border-gray-600 bg-gray-800 hover:bg-gray-700"
                  >
                    <Pencil className="h-4 w-4 text-white" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowColumnSettings(true)}
                className="rounded-full w-8 h-8 md:w-10 md:h-10 border border-gray-600 bg-gray-800 hover:bg-gray-700 ml-2"
              >
                <Settings className="h-4 w-4 text-white" />
              </Button>

              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsSearchVisible(!isSearchVisible);
                    if (!isSearchVisible) {
                      setSearchQuery("");
                    }
                  }}
                  className="rounded-full w-8 h-8 md:w-10 md:h-10 border border-gray-600 bg-gray-800 hover:bg-gray-700"
                >
                  <Search className="h-4 w-4 text-white" />
                </Button>
                {isSearchVisible && (
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-40 h-8 ml-2 text-sm bg-[#0A101F] border-gray-600 focus:border-gray-500 rounded-full"
                    autoFocus
                    onBlur={() => {
                      if (!searchQuery) {
                        setIsSearchVisible(false);
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex items-center justify-center p-2 hover:bg-gray-700"
              title="Donate to Dropdir"
              onClick={() =>
                window.open("https://saweria.co/dropdir", "_blank")
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 512 512"
                fill="currentColor"
                className="animate-[color-cycle_3s_ease-in-out_infinite] animate-float"
              >
                <path d="M306.34,343.86c0,19.95-13.05,33.74-36.17,38v8c0,5.22-1.68,6.9-6.9,6.9H249.11c-5,0-6.9-1.68-6.9-6.9v-7.64c-18.27-2.8-30.2-11.93-36-27.22q-2.52-7.27,5-10.06l12.68-4.48c5.41-2,8-.93,10.44,4.48,3,7.64,9.88,11.37,20.51,11.37,14.17,0,21.25-3.92,21.25-11.94,0-7.45-7.27-9.88-22-11.37-10.44-1.31-15.85-1.87-25.36-5.59a32.36,32.36,0,0,1-11.55-6.53c-5.78-5-10.63-14.54-10.63-26.65,0-19.58,12.49-33,35.61-36.72v-7.65c0-5,1.86-6.71,6.9-6.71h14.17c5.22,0,6.9,1.68,6.9,6.71v7.65c15.1,2.61,25.73,10.62,32.06,24.23,2.8,5.22,1.49,8-4.29,10.44L285.09,298c-5,2.24-7.46,1.49-10.26-3.73-3.73-7.27-8.57-10.81-18.82-10.81-13.23,0-18.83,2.8-18.83,10.81,0,6.9,7.83,9.51,22.18,11a130,130,0,0,1,21.25,3.54,36.42,36.42,0,0,1,10.07,4.29C299.07,318.14,307.09,327.83,306.34,343.86ZM256,512c-324.62,0-150.83-289-99.09-365.56a38.35,38.35,0,0,1,.39-62.75L145,58.64A40.77,40.77,0,0,1,147,19,39.72,39.72,0,0,1,180.64,0a50.09,50.09,0,0,1,37.72,17.09,50,50,0,0,1,75.28,0A50,50,0,0,1,331.28,0,39.75,39.75,0,0,1,365,19a40.77,40.77,0,0,1,2,39.64l-12.28,25a38.35,38.35,0,0,1,.39,62.75C406.83,223,580.62,512,256,512ZM166.4,115.2A12.81,12.81,0,0,0,179.2,128H332.8a12.8,12.8,0,0,0,0-25.6H179.2A12.81,12.81,0,0,0,166.4,115.2ZM168,47.38L182.42,76.8H329.58L344,47.38a15.32,15.32,0,0,0-.73-14.9,14.09,14.09,0,0,0-12.06-6.88,24.79,24.79,0,0,0-22.8,15.59,15.92,15.92,0,0,1-29.54,0,24.58,24.58,0,0,0-45.75,0,15.92,15.92,0,0,1-29.53,0A24.82,24.82,0,0,0,180.72,25.6a14.06,14.06,0,0,0-12,6.88A15.32,15.32,0,0,0,168,47.38ZM329.1,153.6H182.92C141.08,213,61.87,351.95,99.39,426.92,119.15,466.39,171.84,486.4,256,486.4s136.88-20,156.62-59.51C450.19,351.75,371,212.91,329.1,153.6Z" />
              </svg>
            </button>
            <AuthController />
          </div>
        </div>

        {/* Stage Tabs - Centered */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-1 overflow-x-auto max-w-md z-0 sticky top-0">
          {!isMobileMode && (
            <button
              onClick={() => setActiveStage(null)}
              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${!activeStage ? "bg-primary-600 text-white" : "bg-transparent text-gray-300 hover:bg-gray-700/30 border border-gray-700"}`}
            >
              All
              <span
                className={`inline-flex items-center justify-center rounded-full px-1.5 text-xs ${!activeStage ? "bg-primary-800 text-white" : "bg-gray-700 text-gray-300"}`}
              >
                {filteredProjects.length}
              </span>
            </button>
          )}
          {uniqueStages
            .filter((stage) => {
              // In mobile mode, only show testnet, waitlist, and early access tabs
              if (isMobileMode) {
                const lowerStage = stage.toLowerCase();
                return (
                  lowerStage === "testnet" ||
                  lowerStage === "waitlist" ||
                  lowerStage === "early access"
                );
              }
              return true;
            })
            .map((stage) => {
              const stageCount = filteredProjects.filter(
                (project) =>
                  (project.stage || "Unknown").toLowerCase() ===
                  stage.toLowerCase(),
              ).length;
              return (
                <button
                  key={stage}
                  onClick={() => setActiveStage(stage)}
                  className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${activeStage === stage ? "bg-primary-600 text-white" : "bg-transparent text-gray-300 hover:bg-gray-700/30 border border-gray-700"}`}
                >
                  {stage}
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-1.5 text-xs ${activeStage === stage ? "bg-primary-800 text-white" : "bg-gray-700 text-gray-300"}`}
                  >
                    {stageCount}
                  </span>
                </button>
              );
            })}
        </div>
      </div>
      <div className="flex-1 overflow-auto max-h-[calc(100vh-150px)] scrollbar-thin bg-[#1A1A2A] relative z-10">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-gray-600 bg-[#1A1A2A]">
              <TableHead className="w-[300px] text-white text-left pl-4 sticky top-0 bg-[#1A1A2A] z-10">
                Project
              </TableHead>
              {(isMobileMode
                ? mobileVisibleColumns.Status
                : visibleColumns.Status) && (
                <TableHead className="w-[30px] text-center text-white sticky top-0 bg-[#1A1A2A] z-10">
                  Check-in
                </TableHead>
              )}
              {(isMobileMode
                ? mobileVisibleColumns.Link
                : visibleColumns.Link) && (
                <TableHead className="w-[30px] text-center text-white sticky top-0 bg-[#1A1A2A] z-10">
                  Link
                </TableHead>
              )}
              {(isMobileMode
                ? mobileVisibleColumns.Twitter
                : visibleColumns.Twitter) && (
                <TableHead className="w-[30px] text-center text-white sticky top-0 bg-[#1A1A2A] z-10">
                  Twitter
                </TableHead>
              )}
              {!isMobileMode && visibleColumns.Notes && (
                <TableHead className="w-[30px] text-center text-white sticky top-0 bg-[#1A1A2A] z-10">
                  Notes
                </TableHead>
              )}
              {!isMobileMode && visibleColumns.Wallet && (
                <TableHead className="w-[35px] text-center text-white sticky top-0 bg-[#1A1A2A] z-10">
                  Wallet
                </TableHead>
              )}
              {isFullMode && !isMobileMode && (
                <>
                  {visibleColumns["Join Date"] && (
                    <TableHead className="w-[100px] text-center text-white sticky top-0 bg-[#1A1A2A] z-10">
                      Join Date
                    </TableHead>
                  )}
                </>
              )}
              {!isMobileMode && visibleColumns.Chain && (
                <TableHead className="w-[80px] text-center text-white sticky top-0 bg-[#1A1A2A] z-10">
                  Chain
                </TableHead>
              )}
              {!isMobileMode && visibleColumns.Stage && (
                <TableHead className="w-[80px] text-center text-white sticky top-0 bg-[#1A1A2A] z-10">
                  Stage
                </TableHead>
              )}
              {!isMobileMode && visibleColumns.Tags && (
                <TableHead className="w-[120px] text-center text-white sticky top-0 bg-[#1A1A2A] z-10">
                  Tags
                </TableHead>
              )}
              {!isMobileMode && visibleColumns.Type && (
                <TableHead className="w-[80px] text-center text-white sticky top-0 bg-[#1A1A2A] z-10">
                  Type
                </TableHead>
              )}
              {!isMobileMode && visibleColumns.Cost && (
                <TableHead className="w-[80px] text-center text-white sticky top-0 bg-[#1A1A2A] z-10">
                  Cost
                </TableHead>
              )}
              {!isMobileMode && visibleColumns["Last Activity"] && (
                <TableHead className="w-[100px] text-center text-white sticky top-0 bg-[#1A1A2A] z-10">
                  Last Activity
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {stageFilteredProjects.length === 0 ? (
              <TableRow>
                <TableHead
                  colSpan={12}
                  className="py-4 text-center text-gray-400"
                >
                  No projects found for{" "}
                  {activeStage
                    ? `stage "${activeStage}"`
                    : "the selected filters"}
                </TableHead>
              </TableRow>
            ) : isNestedByEcosystem ? (
              // Nested by ecosystem view
              uniqueChains.sort().map((chain) => (
                <React.Fragment key={chain}>
                  {/* Chain header row */}
                  <TableRow
                    className="hover:bg-gray-800 cursor-pointer border-b border-gray-700"
                    onClick={() => toggleChainExpansion(chain)}
                  >
                    <TableHead colSpan={12} className="py-2 pl-4">
                      <div className="flex items-center gap-2">
                        <span className="text-primary-400 font-medium">
                          {expandedChains.includes(chain) ? "▼" : "►"}
                        </span>
                        <span className="font-bold text-primary-400">
                          {chain} (
                          {
                            filteredProjects.filter(
                              (p) => (p.chain || "Unknown") === chain,
                            ).length
                          }
                          )
                        </span>
                      </div>
                    </TableHead>
                  </TableRow>

                  {/* Projects in this chain */}
                  {expandedChains.includes(chain) &&
                    stageFilteredProjects
                      .filter(
                        (project) => (project.chain || "Unknown") === chain,
                      )
                      .sort((a, b) => {
                        // Sort by active status first (active projects at the top)
                        const aActive =
                          a.status === "active" || a.is_active || a.isActive;
                        const bActive =
                          b.status === "active" || b.is_active || b.isActive;
                        if (aActive && !bActive) return -1;
                        if (!aActive && bActive) return 1;
                        // Then sort by last activity date
                        return (
                          new Date(
                            b.last_activity || b.lastActivity,
                          ).getTime() -
                          new Date(a.last_activity || a.lastActivity).getTime()
                        );
                      })
                      .map((project) => (
                        <ProjectRow
                          key={project.id}
                          projectName={project.project || project.name}
                          projectLogo={
                            project.image ||
                            project.logo ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.project || project.name}`
                          }
                          projectLink={project.link}
                          twitterLink={project.twitter || project.twitterLink}
                          isActive={
                            project.status === "active" ||
                            project.is_active ||
                            project.isActive
                          }
                          lastActivity={
                            project.last_activity || project.lastActivity
                          }
                          notes={project.notes}
                          onStatusChange={(status) =>
                            handleStatusChange(project.id, status)
                          }
                          onNotesClick={() =>
                            isDeleteMode
                              ? handleEditClick(project)
                              : handleNotesClick(project)
                          }
                          onDelete={() => onDeleteProject(project.id)}
                          showDeleteButton={isDeleteMode}
                          showEditButton={isDeleteMode}
                          isFullMode={isFullMode}
                          type={project.type}
                          cost={project.cost}
                          joinDate={project.join_date || project.joinDate}
                          chain={project.chain}
                          stage={project.stage}
                          tags={
                            typeof project.tags === "string"
                              ? project.tags.split(",").map((tag) => tag.trim())
                              : project.tags
                          }
                          isPublicMode={false}
                          visibleColumns={
                            isMobileMode ? mobileVisibleColumns : visibleColumns
                          }
                          wallet={project.wallet}
                        />
                      ))}
                </React.Fragment>
              ))
            ) : (
              // Regular flat view
              stageFilteredProjects
                .sort((a, b) => {
                  // Sort by active status first (active projects at the top)
                  const aActive =
                    a.status === "active" || a.is_active || a.isActive;
                  const bActive =
                    b.status === "active" || b.is_active || b.isActive;
                  if (aActive && !bActive) return -1;
                  if (!aActive && bActive) return 1;
                  // Then sort by last activity date
                  return (
                    new Date(b.last_activity || b.lastActivity).getTime() -
                    new Date(a.last_activity || a.lastActivity).getTime()
                  );
                })
                .map((project) => (
                  <ProjectRow
                    key={project.id}
                    projectName={project.project || project.name}
                    projectLogo={
                      project.image ||
                      project.logo ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.project || project.name}`
                    }
                    projectLink={project.link}
                    twitterLink={project.twitter || project.twitterLink}
                    isActive={
                      project.status === "active" ||
                      project.is_active ||
                      project.isActive
                    }
                    lastActivity={project.last_activity || project.lastActivity}
                    notes={project.notes}
                    onStatusChange={(status) =>
                      handleStatusChange(project.id, status)
                    }
                    onNotesClick={() =>
                      isDeleteMode
                        ? handleEditClick(project)
                        : handleNotesClick(project)
                    }
                    onDelete={() => onDeleteProject(project.id)}
                    showDeleteButton={isDeleteMode}
                    showEditButton={isDeleteMode}
                    isFullMode={isFullMode}
                    type={project.type}
                    cost={project.cost}
                    joinDate={project.join_date || project.joinDate}
                    chain={project.chain}
                    stage={project.stage}
                    tags={
                      typeof project.tags === "string"
                        ? project.tags.split(",").map((tag) => tag.trim())
                        : project.tags
                    }
                    isPublicMode={false}
                    visibleColumns={
                      isMobileMode ? mobileVisibleColumns : visibleColumns
                    }
                    wallet={project.wallet}
                  />
                ))
            )}
          </TableBody>
        </Table>
      </div>
      {selectedProject && (
        <NotesModal
          isOpen={true}
          onClose={handleNotesClose}
          projectName={selectedProject.name}
          notes={selectedProject.notes}
          onSave={handleNotesSave}
        />
      )}
      {editProject && (
        <EditProjectModal
          isOpen={true}
          onClose={handleEditClose}
          project={editProject}
          onSave={handleEditSave}
        />
      )}
      <AddProjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(project) => {
          onAddProject(project);
          setShowAddModal(false);
        }}
      />
      <MakeAllPublicModal
        isOpen={showMakeAllPublicModal}
        onClose={() => setShowMakeAllPublicModal(false)}
        onSuccess={() => {
          // Force refresh of projects
          window.dispatchEvent(new Event("forceDataReload"));
        }}
      />
      <ColumnSettingsModal
        isOpen={showColumnSettings}
        onClose={() => setShowColumnSettings(false)}
        columns={Object.keys(visibleColumns).map((name) => ({
          name,
          visible: visibleColumns[name],
        }))}
        onColumnToggle={(columnName) => {
          console.log(`Toggle column: ${columnName}`);
          const updatedColumns = {
            ...visibleColumns,
            [columnName]: !visibleColumns[columnName],
          };
          setVisibleColumns(updatedColumns);
          localStorage.setItem(
            "visibleColumns",
            JSON.stringify(updatedColumns),
          );
        }}
        onAutoStatusTimeChange={(time) => {
          setAutoStatusTime(time);
          console.log(`Auto status time set to: ${time}`);
          // Implement auto status time change functionality here
          localStorage.setItem("autoStatusTime", time);
        }}
        autoStatusTime={autoStatusTime}
        onTogglePublicMode={handleTogglePublicMode}
        isPublicMode={isPublicMode}
        username={username}
        isNestedByEcosystem={isNestedByEcosystem}
        onToggleNestedByEcosystem={handleToggleNestedByEcosystem}
        onResetInactiveProjects={() => {
          console.log("Activating all inactive projects");
          // Activate all inactive projects
          projects.forEach((project) => {
            if (
              !project.isActive &&
              !project.is_active &&
              project.status !== "active"
            ) {
              onStatusChange(project.id, true);
            }
          });
        }}
      />
    </div>
  );
};

export default ProjectTable;
