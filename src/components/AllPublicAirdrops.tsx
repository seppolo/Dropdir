import React, { useState, useEffect } from "react";
import { Search, List } from "lucide-react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import ProjectRow from "./dashboard/ProjectRow";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { supabase } from "@/lib/supabase";

const AllPublicAirdrops = () => {
  // Check if user is logged in when component mounts
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("supabase.auth.token");
      const session = localStorage.getItem("supabase.auth.session");

      // If no token or session, redirect to login page
      if (!token && !session) {
        window.location.href = "/";
        localStorage.setItem("showLoginModal", "true");
      }
    };

    checkAuth();
  }, []);
  const [isFullMode, setIsFullMode] = useState(window.innerWidth >= 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsFullMode(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchAllPublicProjects = async () => {
      setIsLoading(true);
      try {
        // Fetch all public projects from all users
        const { data, error } = await supabase
          .from("user_airdrops")
          .select("*")
          .eq("is_public", true)
          .order("last_activity", { ascending: false });

        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error("Error fetching public projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllPublicProjects();
  }, []);

  const filteredProjects = projects.filter(
    (project) =>
      project.project?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.chain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.tags &&
        typeof project.tags === "string" &&
        project.tags.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="w-full h-full rounded-lg overflow-hidden flex flex-col bg-[#1A1A1A] backdrop-blur-sm border border-gray-700">
      <div className="p-4 flex items-center justify-between border-b border-gray-600 bg-[#1A1A1A]">
        <div className="flex items-center gap-3 relative w-full md:w-auto">
          <div className="flex items-center gap-2 relative">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                className="rounded-full w-8 h-8 md:w-10 md:h-10 border border-gray-600 bg-transparent hover:bg-gray-800"
              >
                <Search className="h-4 w-4 text-[#3B82F6]" />
              </Button>
              {isSearchVisible && (
                <Input
                  placeholder="Search projects or users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-40 h-8 ml-2 text-sm bg-[#1A1A1A] border-gray-600 focus:border-[#3B82F6] focus:ring-[#3B82F6]/20 rounded-full"
                  autoFocus
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-white text-sm">
            <a href="/" className="text-[#3B82F6] hover:underline">
              Go to Dashboard
            </a>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = "/Moffuadi")}
            className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-purple-500/50"
          >
            <List className="h-4 w-4 mr-1" />
            List
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.href = "/";
              // Set a flag in localStorage to show login modal on dashboard
              localStorage.setItem("showLoginModal", "true");
            }}
            className="bg-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6]/30 border-[#3B82F6]/50"
          >
            Login
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full py-20">
          <div className="rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B82F6] mb-4"></div>
          <div className="text-white/80 text-lg font-medium">
            Loading public airdrops...
          </div>
        </div>
      ) : (
        <div className="flex-1">
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <div className="text-white/80 text-lg font-medium">
                No public airdrops found
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
                    <TableHead className="w-[120px] text-center text-white sticky top-0 bg-[#1A1A1A] z-10">
                      User
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
                      <TableRow
                        key={project.id}
                        className="hover:bg-gray-800/50 transition-colors border-b border-gray-800"
                      >
                        <td className="font-medium p-2 text-left">
                          <div className="flex items-center gap-3 pl-2">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 border-2 border-gray-600 hover:border-[#3B82F6] transition-colors cursor-pointer shadow-md">
                              <img
                                src={
                                  project.image ||
                                  project.logo ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${project.project || project.name}`
                                }
                                alt={project.project || project.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${project.project || project.name}`;
                                }}
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-white truncate max-w-[200px] font-medium">
                                {project.project || project.name}
                              </span>
                              {project.chain && (
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-xs text-[#3B82F6]">
                                    {project.chain}
                                  </span>
                                  {project.stage && (
                                    <span className="text-xs text-[#3B82F6]/80 ml-2">
                                      {project.stage}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(project.link, "_blank")}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-600 bg-transparent hover:bg-gray-800 text-[#3B82F6]"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 md:h-5 md:w-5"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                          </Button>
                        </td>
                        <td className="p-4 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              window.open(
                                project.twitter || project.twitterLink,
                                "_blank",
                              )
                            }
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-600 bg-transparent hover:bg-gray-800 text-[#3B82F6]"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 md:h-5 md:w-5"
                            >
                              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                            </svg>
                          </Button>
                        </td>
                        <td className="p-4 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {}}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-600 bg-transparent hover:bg-gray-800 text-[#3B82F6]"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 md:h-5 md:w-5"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                          </Button>
                        </td>
                        <td className="p-4 text-center">
                          <a
                            href={`/${project.username}`}
                            className="text-[#3B82F6] hover:underline text-sm"
                          >
                            {project.username}
                          </a>
                        </td>
                        {isFullMode && (
                          <>
                            <td className="p-2 text-center">
                              <span className="text-[0.8rem] text-white/80 whitespace-nowrap">
                                {(() => {
                                  try {
                                    const date = new Date(
                                      project.join_date || project.joinDate,
                                    );
                                    if (isNaN(date.getTime())) {
                                      return <div>Invalid date</div>;
                                    }
                                    return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${String(date.getFullYear()).slice(2)}`;
                                  } catch (error) {
                                    return <div>Invalid date</div>;
                                  }
                                })()}
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="text-[0.8rem] text-white/80">
                                {project.chain || "-"}
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="text-[0.8rem] text-white/80">
                                {project.stage || "-"}
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              <div className="flex gap-1 justify-center flex-wrap">
                                {typeof project.tags === "string" &&
                                project.tags ? (
                                  <div className="flex flex-wrap gap-1 justify-center">
                                    {project.tags
                                      .split(",")
                                      .map((tag, index) => (
                                        <span
                                          key={index}
                                          className="px-2 py-1 text-xs rounded-full text-white border border-transparent bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] shadow-lg"
                                        >
                                          {tag
                                            .trim()
                                            .replace(/[\[\]"]/g, "")
                                            .replace(/[^a-zA-Z]/g, "")}
                                        </span>
                                      ))}
                                  </div>
                                ) : Array.isArray(project.tags) &&
                                  project.tags.length > 0 ? (
                                  <div className="flex flex-wrap gap-1 justify-center">
                                    {project.tags.map((tag, index) => (
                                      <span
                                        key={index}
                                        className="px-2 py-1 text-xs rounded-full text-white border border-transparent bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] shadow-lg"
                                      >
                                        {typeof tag === "string"
                                          ? tag
                                              .replace(/[\[\]"]/g, "")
                                              .replace(/[^a-zA-Z]/g, "")
                                          : tag}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[0.8rem] text-white/50">
                                    -
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-2 text-center">
                              <span className="text-[0.8rem] text-white/80">
                                {project.type || "-"}
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="text-[0.8rem] text-white/80">
                                ${project.cost || 0}
                              </span>
                            </td>
                          </>
                        )}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AllPublicAirdrops;
