import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import ProjectRow from "./dashboard/ProjectRow";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DoodlesBackground from "./DoodlesBackground";

const PoolPage = () => {
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

  // Preload data from localStorage immediately
  useEffect(() => {
    // Try to load from cache immediately to show something fast
    const cachedData = localStorage.getItem(`cached_pool_projects`);
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        const uniqueProjects = getUniqueProjects(parsedData);
        setProjects(uniqueProjects);
        setIsLoading(false);
      } catch (e) {
        console.error("Error parsing cached data:", e);
      }
    }

    // Then fetch fresh data
    fetchProjects();
  }, []);

  // Function to filter unique projects based on link
  const getUniqueProjects = (data) => {
    if (!data || !Array.isArray(data)) return [];

    const uniqueMap = new Map();

    data.forEach((project) => {
      if (project.link) {
        // Extract domain using regex - simplified for performance
        try {
          // Simpler regex for better performance
          const domainMatch = project.link.match(/[^/]+\.[^/]+/);
          const domain = domainMatch ? domainMatch[0] : project.link;

          // Only add if this domain hasn't been seen before
          if (!uniqueMap.has(domain)) {
            uniqueMap.set(domain, project);
          }
        } catch (e) {
          // If regex fails, use the full link as key
          if (!uniqueMap.has(project.link)) {
            uniqueMap.set(project.link, project);
          }
        }
      } else {
        // For projects without links, use project name as key
        const key = project.project || project.name || Math.random().toString();
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, project);
        }
      }
    });

    return Array.from(uniqueMap.values());
  };

  // Separate fetch function for cleaner code
  const fetchProjects = async () => {
    try {
      // Check if we have cached data
      const cachedTimestamp = localStorage.getItem(
        `cached_pool_projects_timestamp`,
      );
      const now = new Date().getTime();

      // Use cache if it exists and is less than 100 minutes old (increased from 10 minutes)
      if (
        cachedTimestamp &&
        now - parseInt(cachedTimestamp) < 100 * 60 * 1000
      ) {
        // We already loaded the cached data in the first useEffect
        return;
      }

      // Fetch all projects from user_airdrops table with limit to improve performance
      const { data, error } = await supabase
        .from("user_airdrops")
        .select(
          "id, project, name, image, logo, link, twitter, twitterLink, status, is_active, isActive, last_activity, lastActivity, notes, join_date, joinDate, chain, stage, tags, type, cost",
        )
        .order("last_activity", { ascending: false })
        .limit(1000); // Limit to 1000 most recent projects for better performance

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      // Cache the results
      if (data) {
        localStorage.setItem(`cached_pool_projects`, JSON.stringify(data));
        localStorage.setItem(`cached_pool_projects_timestamp`, now.toString());

        // Filter unique projects
        const uniqueProjects = getUniqueProjects(data);
        setProjects(uniqueProjects);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      (project.project || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (project.chain || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.type || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            <h1 className="text-lg font-bold text-white">Project Pool</h1>
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

          {isLoading && projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <div className="rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B82F6] animate-spin mb-4"></div>
              <div className="text-white/80 text-lg font-medium">
                Loading projects...
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-visible">
              {filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20">
                  <div className="text-white/80 text-lg font-medium">
                    No projects found
                  </div>
                  {searchQuery && (
                    <div className="text-white/60 text-sm mt-2">
                      Try a different search term
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="p-4 text-center text-white/70">
                    Showing {filteredProjects.length} unique projects (filtered
                    by domain)
                  </div>
                  <div className="overflow-x-auto max-h-[calc(100vh-200px)] scrollbar-thin">
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
                                ? project.tags
                                    .split(",")
                                    .map((tag) => tag.trim())
                                : project.tags
                            }
                            isPublicMode={true}
                            notes={project.notes}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PoolPage;
