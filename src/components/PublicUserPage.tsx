import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import ProjectRow from "./dashboard/ProjectRow";
import { Search, LogIn, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import DoodlesBackground from "./DoodlesBackground";
import LoginModal from "./auth/LoginModal";
import { getCurrentUser } from "@/lib/projectService";
import { addProject } from "@/lib/projectService";
import { useToast } from "./ui/use-toast";

const PublicUserPage = () => {
  const { username } = useParams();
  const [isFullMode, setIsFullMode] = useState(window.innerWidth >= 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedProjects, setCopiedProjects] = useState({});
  const [visibleColumns, setVisibleColumns] = useState({
    Project: true,
    Link: true,
    Twitter: true,
    Notes: true,
    "Join Date": window.innerWidth >= 768,
    Chain: window.innerWidth >= 768,
    Stage: window.innerWidth >= 768,
    Tags: window.innerWidth >= 768,
    Type: window.innerWidth >= 768,
    Cost: window.innerWidth >= 768,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    document.documentElement.classList.add("dark");

    // Get current logged in user
    const user = getCurrentUser();
    setCurrentUser(user);

    // Initialize copied projects from localStorage if available
    const savedCopiedProjects = localStorage.getItem(
      `copiedProjects_${username}`,
    );
    if (savedCopiedProjects) {
      try {
        setCopiedProjects(JSON.parse(savedCopiedProjects));
      } catch (error) {
        console.error("Error parsing saved copied projects:", error);
      }
    }
  }, [username]);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setIsFullMode(!isMobile);

      // Update visible columns based on screen size
      setVisibleColumns((prev) => ({
        ...prev,
        "Join Date": !isMobile,
        Chain: !isMobile,
        Stage: !isMobile,
        Tags: !isMobile,
        Type: !isMobile,
        Cost: !isMobile,
      }));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchUserProjects = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching projects for username:", username);
        // Fetch all projects for this user (without checking is_public)
        const { data, error } = await supabase
          .from("user_airdrops")
          .select("*")
          .eq("username", username)
          .order("last_activity", { ascending: false });

        if (error) {
          console.error("Supabase error:", error);
          // Continue with empty data instead of throwing
        }
        console.log("Public projects for user:", data);
        setProjects(data || []);
      } catch (error) {
        console.error("Error fetching user projects:", error);
        // Don't let errors crash the component
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchUserProjects();
    } else {
      console.error("No username parameter found in URL");
      setIsLoading(false);
    }
  }, [username]);

  const filteredProjects = projects.filter(
    (project) =>
      project.project?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.chain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.tags &&
        typeof project.tags === "string" &&
        project.tags.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const toggleColumn = (columnName) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnName]: !prev[columnName],
    }));
  };

  const handleRegisterClick = () => {
    setLoginModalOpen(false);
    // Dispatch event to show register modal on main app
    window.dispatchEvent(new Event("showRegisterModal"));
    // Redirect to main app
    window.location.href = "/";
  };

  const handleCopyProject = async (project) => {
    if (!currentUser) {
      setLoginModalOpen(true);
      return;
    }

    try {
      // Format project data for adding to user's database
      const projectData = {
        project: project.project || project.name,
        image: project.image || project.logo,
        link: project.link,
        twitter: project.twitter || project.twitterLink,
        status: "active",
        chain: project.chain,
        stage: project.stage,
        type: project.type,
        cost: project.cost,
        join_date: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        tags:
          typeof project.tags === "string"
            ? project.tags
            : Array.isArray(project.tags)
              ? project.tags.join(", ")
              : "",
        notes: `Copied from ${username}'s public profile`,
      };

      await addProject(projectData);

      // Mark this project as copied
      const updatedCopiedProjects = {
        ...copiedProjects,
        [project.id]: true,
      };
      setCopiedProjects(updatedCopiedProjects);

      // Save to localStorage
      localStorage.setItem(
        `copiedProjects_${username}`,
        JSON.stringify(updatedCopiedProjects),
      );

      toast({
        title: "Project copied successfully",
        description: `${project.project || project.name} has been added to your projects`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error copying project:", error);
      toast({
        title: "Failed to copy project",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#050A14] relative overflow-hidden">
      {/* Add doodles background */}
      <DoodlesBackground />

      <style jsx>{`
        .telegram-icon-container {
          border-radius: 50%;
          padding: 4px;
          animation: blinkingBorder 4.5s infinite;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: black;
        }

        @keyframes blinkingBorder {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
            color: rgb(239, 68, 68);
          }
          16% {
            box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.7);
            color: rgb(239, 68, 68);
          }
          33% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
            color: rgb(34, 197, 94);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.7);
            color: rgb(34, 197, 94);
          }
          66% {
            box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7);
            color: rgb(234, 179, 8);
          }
          83% {
            box-shadow: 0 0 0 4px rgba(234, 179, 8, 0.7);
            color: rgb(234, 179, 8);
          }
        }
      `}</style>

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 relative z-10">
        <div className="w-full rounded-xl overflow-visible flex flex-col bg-[#1A1A1A] backdrop-blur-sm border border-gray-700">
          <div className="p-2 sm:p-4 flex items-center justify-between border-b border-gray-600 bg-[#1A1A1A] sticky top-0 z-20">
            <div className="flex items-center gap-2 relative w-full">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-full w-8 h-8 border border-gray-600 bg-transparent md:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4 text-[#3B82F6]" />
                ) : (
                  <Menu className="h-4 w-4 text-[#3B82F6]" />
                )}
              </Button>

              <div className="flex items-center gap-2 relative">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchVisible(!isSearchVisible)}
                    className="rounded-full w-8 h-8 md:w-10 md:h-10 border border-gray-600 bg-transparent"
                  >
                    <Search className="h-4 w-4 text-[#3B82F6]" />
                  </Button>
                  {isSearchVisible && (
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-32 sm:w-40 h-8 ml-2 text-sm bg-[#1A1A1A] border-gray-600 focus:border-[#3B82F6] focus:ring-[#3B82F6]/20 rounded-full"
                      autoFocus
                    />
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLoginModalOpen(true)}
              className="rounded-md border border-gray-600 bg-transparent text-[#3B82F6] text-xs sm:text-sm px-2 sm:px-4"
            >
              Login
            </Button>
          </div>

          {/* Mobile column selector menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-[#1A1A1A] border-b border-gray-600 p-3 animate-slide-down-fade">
              <div className="text-white text-sm mb-2 font-medium">
                Show/Hide Columns:
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(visibleColumns).map((columnName) => (
                  <Button
                    key={columnName}
                    variant={visibleColumns[columnName] ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleColumn(columnName)}
                    className={`text-xs rounded-full ${visibleColumns[columnName] ? "bg-blue-600 hover:bg-blue-700" : "text-gray-300"}`}
                  >
                    {columnName}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <div className="rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B82F6] animate-spin mb-4"></div>
              <div className="text-white/80 text-lg font-medium">
                Loading {username}'s projects...
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-visible">
              {filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20">
                  <div className="text-white/80 text-lg font-medium">
                    No public projects found for {username}
                  </div>
                  {searchQuery && (
                    <div className="text-white/60 text-sm mt-2">
                      Try a different search term
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[calc(100vh-150px)] scrollbar-thin">
                  <Table className="relative">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-gray-600 bg-[#1A1A1A]">
                        {visibleColumns.Project && (
                          <TableHead className="w-[200px] md:w-[300px] text-white text-left pl-4 sticky top-0 left-0 bg-[#1A1A1A] z-10">
                            Project
                          </TableHead>
                        )}
                        {visibleColumns.Link && (
                          <TableHead className="w-[60px] md:w-[80px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                            Link
                          </TableHead>
                        )}
                        {visibleColumns.Twitter && (
                          <TableHead className="w-[60px] md:w-[80px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                            Twitter
                          </TableHead>
                        )}
                        {visibleColumns.Notes && (
                          <TableHead className="w-[60px] md:w-[80px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                            Notes
                          </TableHead>
                        )}
                        {visibleColumns["Join Date"] && (
                          <TableHead className="w-[80px] md:w-[100px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                            Join Date
                          </TableHead>
                        )}
                        {visibleColumns.Chain && (
                          <TableHead className="w-[80px] md:w-[100px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                            Chain
                          </TableHead>
                        )}
                        {visibleColumns.Stage && (
                          <TableHead className="w-[80px] md:w-[100px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                            Stage
                          </TableHead>
                        )}
                        {visibleColumns.Tags && (
                          <TableHead className="w-[150px] md:w-[200px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                            Tags
                          </TableHead>
                        )}
                        {visibleColumns.Type && (
                          <TableHead className="w-[80px] md:w-[100px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                            Type
                          </TableHead>
                        )}
                        {visibleColumns.Cost && (
                          <TableHead className="w-[80px] md:w-[100px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                            Cost
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.map((project) => (
                        <ProjectRow
                          key={project.id}
                          visibleColumns={visibleColumns}
                          projectName={project.project || project.name}
                          projectLogo={
                            project.image ||
                            project.logo ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.project || project.name}`
                          }
                          projectLink={project.link}
                          twitterLink={project.twitter || project.twitterLink}
                          isActive={
                            project.status === "active" || project.isActive
                          }
                          lastActivity={
                            project.last_activity || project.lastActivity
                          }
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
                          isPublicMode={true}
                          isOwnProfile={currentUser?.username === username}
                          notes={project.notes}
                          onCopyProject={() => handleCopyProject(project)}
                          isCopied={copiedProjects[project.id]}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Telegram Icon with blinking animation */}
      <a
        href="https://t.me/dropdirs"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 left-4 text-blue-400 hover:text-blue-300 transition-colors"
      >
        <div className="telegram-icon-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-10 h-10"
          >
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        </div>
      </a>

      {/* Login Modal */}
      <LoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
        onLoginSuccess={() => (window.location.href = "/")}
        isPublicMode={true}
        onRegisterClick={handleRegisterClick}
      />
    </div>
  );
};

export default PublicUserPage;
