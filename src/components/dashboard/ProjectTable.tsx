import React, { useState } from "react";
import {
  Plus as PlusIcon,
  Search,
  Pencil,
  Database,
  Moon,
  Sun,
  Globe,
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

  React.useEffect(() => {
    const handleResize = () => {
      setIsFullMode(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredProjects = projects.filter(
    (project) =>
      project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.chain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.type?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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

  const handleEditSave = (updatedProject: Project) => {
    // Format tags properly before saving
    const formattedProject = {
      ...updatedProject,
      // Convert tags array to comma-separated string if it's an array
      tags: Array.isArray(updatedProject.tags)
        ? updatedProject.tags.join(", ")
        : updatedProject.tags,
    };

    // Call the parent component's update function
    onUpdateProject(formattedProject);

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
              twitterLink: updatedProject.twitterLink || updatedProject.twitter,
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

  return (
    <div className="w-full h-full rounded-xl overflow-hidden flex flex-col bg-[#0A101F]/80 backdrop-blur-sm border border-[#1D4ED8]/20 mb-6">
      <div className="p-4 flex items-center justify-between border-b border-[#1D4ED8]/20">
        <div className="flex items-center gap-3 relative w-full md:w-auto">
          {isLoggedIn && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="rounded-full w-8 h-8 md:w-10 md:h-10 border border-[#1D4ED8]/50 bg-transparent hover:bg-[#1D4ED8]/20 flex items-center justify-center"
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
                  className="rounded-full w-8 h-8 md:w-10 md:h-10 border border-[#1D4ED8]/50 bg-transparent hover:bg-[#1D4ED8]/20"
                >
                  <Pencil className="h-4 w-4 text-white" />
                </Button>
              </>
            )}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                className="rounded-full w-8 h-8 md:w-10 md:h-10 border border-[#1D4ED8]/50 bg-transparent hover:bg-[#1D4ED8]/20"
              >
                <Search className="h-4 w-4 text-white" />
              </Button>
              {isSearchVisible && (
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-40 h-8 ml-2 text-sm bg-[#0A101F] border-[#1D4ED8]/30 focus:border-[#3B82F6] focus:ring-[#3B82F6]/20 rounded-full"
                  autoFocus
                  onBlur={() => setIsSearchVisible(false)}
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <AuthController />
        </div>
      </div>

      <div className="flex-1 overflow-auto max-h-[calc(100vh-150px)] scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-[#1D4ED8]/20">
              <TableHead className="w-[300px] text-white text-left pl-4 sticky top-0 bg-[#0A101F] z-10">
                Project
              </TableHead>
              <TableHead className="w-[80px] text-center text-white sticky top-0 bg-[#0A101F] z-10">
                Status
              </TableHead>
              <TableHead className="w-[80px] text-center text-white sticky top-0 bg-[#0A101F] z-10">
                Link
              </TableHead>
              <TableHead className="w-[80px] text-center text-white sticky top-0 bg-[#0A101F] z-10">
                Twitter
              </TableHead>
              <TableHead className="w-[80px] text-center text-white sticky top-0 bg-[#0A101F] z-10">
                Notes
              </TableHead>
              {isFullMode && (
                <>
                  <TableHead className="w-[100px] text-center text-white sticky top-0 bg-[#0A101F] z-10">
                    Join Date
                  </TableHead>
                  <TableHead className="w-[100px] text-center text-white sticky top-0 bg-[#0A101F] z-10">
                    Chain
                  </TableHead>
                  <TableHead className="w-[100px] text-center text-white sticky top-0 bg-[#0A101F] z-10">
                    Stage
                  </TableHead>
                  <TableHead className="w-[200px] text-center text-white sticky top-0 bg-[#0A101F] z-10">
                    Tags
                  </TableHead>
                  <TableHead className="w-[100px] text-center text-white sticky top-0 bg-[#0A101F] z-10">
                    Type
                  </TableHead>
                  <TableHead className="w-[100px] text-center text-white sticky top-0 bg-[#0A101F] z-10">
                    Cost
                  </TableHead>
                </>
              )}
              <TableHead className="w-[120px] text-center text-white sticky top-0 bg-[#0A101F] z-10">
                Last Activity
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects
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
    </div>
  );
};

export default ProjectTable;
