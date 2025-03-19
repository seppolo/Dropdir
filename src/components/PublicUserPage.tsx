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

const PublicUserPage = () => {
  const { username } = useParams();
  const [isFullMode, setIsFullMode] = useState(window.innerWidth >= 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

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

  return (
    <div className="min-h-screen bg-[#050A14] relative overflow-hidden">
      {/* Add doodles background */}
      <DoodlesBackground />

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
                          notes={project.notes}
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
