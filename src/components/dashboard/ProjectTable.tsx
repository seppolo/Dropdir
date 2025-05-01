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
} from "lucide-react";
import SupabaseStatus from "./SupabaseStatus";
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [showMakeAllPublicModal, setShowMakeAllPublicModal] = useState(false);
  const [isPublicMode, setIsPublicMode] = useState(false);
  const [isNestedByEcosystem, setIsNestedByEcosystem] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [autoStatusTime, setAutoStatusTime] = useState("09:00 AM");
  const [visibleColumns, setVisibleColumns] = useState({
    Project: true,
    Status: true,
    Link: true,
    Twitter: true,
    Notes: true,
    "Join Date": true,
    Chain: true,
    Stage: true,
    Tags: true,
    Type: true,
    Cost: true,
    "Last Activity": true,
  });

  React.useEffect(() => {
    const handleResize = () => {
      setIsFullMode(window.innerWidth >= 768);
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
    <div className="w-full h-full rounded-xl overflow-hidden flex flex-col bg-[#1A1A1A] backdrop-blur-sm border border-gray-700 mb-6 relative">
      <div className="p-4 flex items-center justify-between border-b border-gray-600 bg-[#1A1A1A]">
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
                onClick={() => setIsSearchVisible(!isSearchVisible)}
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
                  onBlur={() => setIsSearchVisible(false)}
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AuthController />
        </div>
      </div>
      <div className="flex-1 overflow-auto max-h-[calc(100vh-150px)] scrollbar-thin bg-[#1A1A1A]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-gray-600 bg-[#1A1A1A]">
              <TableHead className="w-[300px] text-white text-left pl-4 sticky top-0 bg-[#1A1A1A] z-10">
                Project
              </TableHead>
              {visibleColumns.Status && (
                <TableHead className="w-[80px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                  Check-in
                </TableHead>
              )}
              {visibleColumns.Link && (
                <TableHead className="w-[80px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                  Link
                </TableHead>
              )}
              {visibleColumns.Twitter && (
                <TableHead className="w-[80px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                  Twitter
                </TableHead>
              )}
              {visibleColumns.Notes && (
                <TableHead className="w-[80px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                  Notes
                </TableHead>
              )}
              {isFullMode && (
                <>
                  {visibleColumns["Join Date"] && (
                    <TableHead className="w-[100px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                      Join Date
                    </TableHead>
                  )}

                  {visibleColumns.Chain && (
                    <TableHead className="w-[100px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                      Chain
                    </TableHead>
                  )}
                  {visibleColumns.Stage && (
                    <TableHead className="w-[100px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                      Stage
                    </TableHead>
                  )}
                  {visibleColumns.Tags && (
                    <TableHead className="w-[200px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                      Tags
                    </TableHead>
                  )}
                  {visibleColumns.Type && (
                    <TableHead className="w-[100px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                      Type
                    </TableHead>
                  )}
                  {visibleColumns.Cost && (
                    <TableHead className="w-[100px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                      Cost
                    </TableHead>
                  )}
                </>
              )}
              {visibleColumns["Last Activity"] && (
                <TableHead className="w-[120px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                  Last Activity
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isNestedByEcosystem
              ? // Nested by ecosystem view
                uniqueChains.sort().map((chain) => (
                  <React.Fragment key={chain}>
                    {/* Chain header row */}
                    <TableRow
                      className="hover:bg-gray-800 cursor-pointer border-b border-gray-700"
                      onClick={() => toggleChainExpansion(chain)}
                    >
                      <TableHead colSpan={12} className="py-2 pl-4">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400 font-medium">
                            {expandedChains.includes(chain) ? "▼" : "►"}
                          </span>
                          <span className="font-bold text-blue-400">
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
                      filteredProjects
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
                            new Date(
                              a.last_activity || a.lastActivity,
                            ).getTime()
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
                                ? project.tags
                                    .split(",")
                                    .map((tag) => tag.trim())
                                : project.tags
                            }
                            isPublicMode={false}
                            visibleColumns={visibleColumns}
                            wallet={project.wallet}
                          />
                        ))}
                  </React.Fragment>
                ))
              : // Regular flat view
                filteredProjects
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
                      visibleColumns={visibleColumns}
                      wallet={project.wallet}
                    />
                  ))}
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
