import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import ProjectRow from "./dashboard/ProjectRow";
import { Search, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import DoodlesBackground from "./DoodlesBackground";

const PublicUserPage = () => {
  const { username } = useParams();
  const [isFullMode, setIsFullMode] = useState(window.innerWidth >= 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsFullMode(window.innerWidth >= 768);
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

  return (
    <div className="h-screen bg-[#050A14] relative overflow-hidden">
      {/* Add doodles background */}
      <DoodlesBackground />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="w-full rounded-xl overflow-visible flex flex-col bg-[#1A1A1A] backdrop-blur-sm border border-gray-700">
          <div className="p-4 flex items-center justify-between border-b border-gray-600 bg-[#1A1A1A]">
            <div className="flex items-center gap-3 relative w-full md:w-auto">
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
                      className="w-40 h-8 ml-2 text-sm bg-[#1A1A1A] border-gray-600 focus:border-[#3B82F6] focus:ring-[#3B82F6]/20 rounded-full"
                      autoFocus
                    />
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.href = "/")}
              className="rounded-md border border-gray-600 bg-transparent text-[#3B82F6]"
            >
              Login
            </Button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <div className="rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B82F6] mb-4"></div>
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
                <div className="overflow-x-auto max-h-[calc(100vh-150px)] scrollbar-thin scrollbar-thin">
                  <Table className="relative">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-gray-600 bg-[#1A1A1A]">
                        <TableHead className="w-[300px] text-white text-left pl-4 sticky top-0 bg-[#1A1A1A] z-10">
                          Project
                        </TableHead>

                        <TableHead className="w-[80px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                          Link
                        </TableHead>
                        <TableHead className="w-[80px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                          Twitter
                        </TableHead>
                        <TableHead className="w-[80px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                          Notes
                        </TableHead>
                        {isFullMode && (
                          <>
                            <TableHead className="w-[100px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                              Join Date
                            </TableHead>
                            <TableHead className="w-[100px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                              Chain
                            </TableHead>
                            <TableHead className="w-[100px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                              Stage
                            </TableHead>
                            <TableHead className="w-[200px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                              Tags
                            </TableHead>
                            <TableHead className="w-[100px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                              Type
                            </TableHead>
                            <TableHead className="w-[100px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                              Cost
                            </TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.map((project) => (
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
    </div>
  );
};

export default PublicUserPage;
