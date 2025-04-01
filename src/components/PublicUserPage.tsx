import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import ProjectRow from "./dashboard/ProjectRow";
import { Search, LogIn, Menu, X, Send } from "lucide-react";
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
        // Check if we have cached data for this user
        const cachedData = localStorage.getItem(`cached_projects_${username}`);
        const cachedTimestamp = localStorage.getItem(
          `cached_projects_timestamp_${username}`,
        );
        const now = new Date().getTime();

        // Use cache if it exists and is less than 10 minutes old (increased from 5 minutes for better performance)
        if (
          cachedData &&
          cachedTimestamp &&
          now - parseInt(cachedTimestamp) < 10 * 60 * 1000
        ) {
          console.log("Using cached projects data for:", username);
          setProjects(JSON.parse(cachedData));
          setIsLoading(false);
          return;
        }

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

        // Cache the results
        if (data) {
          localStorage.setItem(
            `cached_projects_${username}`,
            JSON.stringify(data),
          );
          localStorage.setItem(
            `cached_projects_timestamp_${username}`,
            now.toString(),
          );
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
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
            filter: drop-shadow(0 0 5px rgba(34, 211, 238, 0.7));
          }
          50% {
            transform: translateY(-5px);
            filter: drop-shadow(0 0 10px rgba(34, 211, 238, 0.9));
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      <main className="container mx-auto w-[78%] px-2 sm:px-4 py-2 sm:py-4 relative z-10">
        <div className="w-full rounded-xl overflow-visible flex flex-col bg-[#1A1A1A] backdrop-blur-sm border border-gray-700">
          <div className="p-2 sm:p-4 flex items-center justify-between border-b border-gray-600 bg-[#1A1A1A] sticky top-0 z-20">
            <div className="flex items-center gap-2 relative w-full">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-full w-10 h-10 border border-gray-600 bg-transparent md:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-[#3B82F6]" />
                ) : (
                  <Menu className="h-5 w-5 text-[#3B82F6]" />
                )}
              </Button>

              <div className="flex items-center gap-2 relative">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchVisible(!isSearchVisible)}
                    className="rounded-full w-10 h-10 border border-gray-600 bg-transparent"
                  >
                    <Search className="h-5 w-5 text-[#3B82F6]" />
                  </Button>
                  {isSearchVisible && (
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-40 sm:w-48 h-10 ml-2 text-sm bg-[#1A1A1A] border-gray-600 focus:border-[#3B82F6] focus:ring-[#3B82F6]/20 rounded-full"
                      autoFocus
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://t.me/dropdirs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center text-cyan-400 hover:bg-cyan-900/30 transition-all duration-200 shadow-md hover:shadow-cyan-500/30 w-10 h-10 animate-float"
              >
                <Send className="h-5 w-5" />
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  currentUser
                    ? (window.location.href = "/dashboard")
                    : setLoginModalOpen(true)
                }
                className="rounded-md border border-gray-600 bg-transparent text-[#3B82F6] text-sm sm:text-base px-4 sm:px-6 h-10"
              >
                {currentUser ? "Dashboard" : "Login"}
              </Button>
            </div>
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
                <div className="overflow-x-auto max-h-[calc(100vh-100px)] scrollbar-thin">
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
