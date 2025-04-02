import React, { useState, useEffect } from "react";
import ProjectTable from "./dashboard/ProjectTable";
import { supabase } from "@/lib/supabase";
import { checkSupabaseConnection } from "@/lib/checkSupabase";
import AuthController from "./auth/AuthController";
import AuthModal from "./auth/AuthModal";
import { getUserProjects } from "@/lib/projectService";
import { Project } from "@/types/schema";
import SupabaseStatus from "./dashboard/SupabaseStatus";
import { Button } from "@/components/ui/button";
import DoodlesBackground from "./DoodlesBackground";

import { setupDailyReset } from "@/lib/dailyReset";

const Home = () => {
  React.useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  // Public mode removed

  // Initialize daily reset scheduler and listen for logout/login events
  useEffect(() => {
    setupDailyReset();

    // Add event listener for user logout
    const handleLogout = () => {
      setProjects([]);
      setIsLoggedIn(false);
      setShowAuthModal(true);
    };

    // Add event listener for projects loaded
    const handleProjectsLoaded = (event: CustomEvent) => {
      setProjects(event.detail || []);
      setIsLoading(false);
    };

    // Add event listeners for loading state
    const handleLoadingStarted = () => {
      setIsLoading(true);
    };

    const handleLoadingFinished = () => {
      setIsLoading(false);
    };

    window.addEventListener("userLoggedOut", handleLogout);
    window.addEventListener(
      "projectsLoaded",
      handleProjectsLoaded as EventListener,
    );
    window.addEventListener("projectsLoadingStarted", handleLoadingStarted);
    window.addEventListener("projectsLoadingFinished", handleLoadingFinished);

    return () => {
      window.removeEventListener("userLoggedOut", handleLogout);
      window.removeEventListener(
        "projectsLoaded",
        handleProjectsLoaded as EventListener,
      );
      window.removeEventListener(
        "projectsLoadingStarted",
        handleLoadingStarted,
      );
      window.removeEventListener(
        "projectsLoadingFinished",
        handleLoadingFinished,
      );
    };
  }, []);

  // Listen for auth modal events and force data reload
  useEffect(() => {
    // Log when component mounts
    console.log("Home component mounted");
    const handleAuthModalOpen = () => {
      // This will be triggered when the auth modal is opened
      console.log("Auth modal opened");
    };

    const handleForceDataReload = () => {
      console.log("Force data reload triggered");
      // Get current user from localStorage
      const authState = localStorage.getItem("auth_state");
      if (authState) {
        try {
          const parsedState = JSON.parse(authState);
          if (parsedState.username) {
            console.log("Reloading projects for user:", parsedState.username);
            loadProjectsFromDatabase(parsedState.username);
            setIsLoggedIn(true);
            setShowAuthModal(false);
          }
        } catch (error) {
          console.error("Error parsing auth state during force reload:", error);
        }
      }
    };

    window.addEventListener("authModalOpened", handleAuthModalOpen);
    window.addEventListener("forceDataReload", handleForceDataReload);

    return () => {
      window.removeEventListener("authModalOpened", handleAuthModalOpen);
      window.removeEventListener("forceDataReload", handleForceDataReload);
    };
  }, []);

  // Check Supabase connection and load projects
  useEffect(() => {
    // Check if user is logged in
    const authState = localStorage.getItem("auth_state");
    if (authState) {
      try {
        const parsedState = JSON.parse(authState);
        const userLoggedIn = !!parsedState.username;
        setIsLoggedIn(userLoggedIn);

        if (userLoggedIn) {
          // Always load fresh data from database
          loadProjectsFromDatabase(parsedState.username);
          setShowAuthModal(false);
        } else {
          // If not logged in, show auth modal
          setShowAuthModal(true);
          setProjects([]);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error parsing auth state:", error);
        setShowAuthModal(true);
      }
    } else {
      // If not logged in, show auth modal
      setIsLoggedIn(false);
      setShowAuthModal(true);
      setProjects([]);
      setIsLoading(false);
    }

    // Public mode check removed
  }, [isLoggedIn]);

  // Function to load projects directly from database
  const loadProjectsFromDatabase = async (username) => {
    if (!username) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Check if we have recent cached data (less than 5 minutes old - increased from 2 minutes for better performance)
      const cachedProjects = localStorage.getItem("user_projects");
      const cachedTimestamp = localStorage.getItem("user_projects_timestamp");
      const now = new Date().getTime();

      if (
        cachedProjects &&
        cachedTimestamp &&
        now - parseInt(cachedTimestamp) < 5 * 60 * 1000
      ) {
        console.log("Using cached projects data");
        setProjects(JSON.parse(cachedProjects));
        setIsLoading(false);
        setConnectionError(false);
        return;
      }

      // Check if Supabase is connected
      const isConnected = await checkSupabaseConnection();

      if (isConnected) {
        // Fetch directly from Supabase
        const { data: projectsData, error } = await supabase
          .from("user_airdrops")
          .select("*")
          .eq("username", username)
          .order("last_activity", { ascending: false });

        if (error) throw error;

        setProjects(projectsData || []);

        // Cache the projects with timestamp
        localStorage.setItem(
          "user_projects",
          JSON.stringify(projectsData || []),
        );
        localStorage.setItem("user_projects_timestamp", now.toString());

        setConnectionError(false);
      } else {
        console.error("Failed to connect to Supabase");
        setConnectionError(true);

        // Try to use cached data even if it's older than 2 minutes
        if (cachedProjects) {
          console.log("Using older cached data due to connection error");
          setProjects(JSON.parse(cachedProjects));
        } else {
          setProjects([]);
        }
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      setConnectionError(true);

      // Try to use cached data in case of error
      const cachedProjects = localStorage.getItem("user_projects");
      if (cachedProjects) {
        console.log("Using cached data due to error");
        setProjects(JSON.parse(cachedProjects));
      } else {
        setProjects([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProject = async (newProject) => {
    try {
      if (!connectionError) {
        // Project already has been added to Supabase in the AddProjectModal component
        // Just update the UI with the returned project data immediately
        setProjects((currentProjects) => [newProject, ...currentProjects]);
      } else {
        // If not connected to Supabase, show error
        console.error("Cannot add project: No connection to database");
        alert("Cannot add project: No connection to database");
      }
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const handleUpdateProject = async (updatedProject) => {
    try {
      console.log("Updating project:", updatedProject);
      // Show loading animation
      window.dispatchEvent(new Event("projectsLoadingStarted"));

      // Update in Supabase if connected
      if (!connectionError) {
        console.log("Sending update to database:", updatedProject);
        const { error } = await supabase
          .from("user_airdrops")
          .update({
            project: updatedProject.name || updatedProject.project,
            link: updatedProject.link,
            twitter: updatedProject.twitterLink || updatedProject.twitter,
            chain: updatedProject.chain,
            stage: updatedProject.stage,
            type: updatedProject.type,
            cost: updatedProject.cost,
            image: updatedProject.logo || updatedProject.image,
            tags: Array.isArray(updatedProject.tags)
              ? updatedProject.tags.join(", ")
              : updatedProject.tags,
            notes: updatedProject.notes,
            join_date: updatedProject.joinDate || updatedProject.join_date,
            last_activity: new Date().toISOString(),
            is_active:
              updatedProject.isActive || updatedProject.status === "active",
            status:
              updatedProject.status ||
              (updatedProject.isActive ? "active" : "pending"),
            is_public: updatedProject.is_public,
          })
          .eq("id", updatedProject.id);

        if (error) throw error;

        // Get the current user
        const authState = localStorage.getItem("auth_state");
        if (authState) {
          const { username } = JSON.parse(authState);

          // Refresh all projects to ensure we have the latest data
          const { data: refreshedProjects } = await supabase
            .from("user_airdrops")
            .select("*")
            .eq("username", username)
            .order("last_activity", { ascending: false });

          if (refreshedProjects) {
            localStorage.setItem(
              "user_projects",
              JSON.stringify(refreshedProjects),
            );
            setProjects(refreshedProjects);
          } else {
            // Fallback to local update if refresh fails
            setProjects((currentProjects) =>
              currentProjects.map((project) =>
                project.id === updatedProject.id
                  ? {
                      ...project,
                      ...updatedProject,
                      project: updatedProject.name || updatedProject.project,
                      name: updatedProject.name || updatedProject.project,
                      twitter:
                        updatedProject.twitterLink || updatedProject.twitter,
                      twitterLink:
                        updatedProject.twitterLink || updatedProject.twitter,
                      logo: updatedProject.logo || updatedProject.image,
                      image: updatedProject.logo || updatedProject.image,
                      joinDate:
                        updatedProject.joinDate || updatedProject.join_date,
                      join_date:
                        updatedProject.joinDate || updatedProject.join_date,
                      lastActivity: new Date().toISOString(),
                      last_activity: new Date().toISOString(),
                      isActive:
                        updatedProject.isActive ||
                        updatedProject.status === "active",
                      status:
                        updatedProject.status ||
                        (updatedProject.isActive ? "active" : "pending"),
                      is_active:
                        updatedProject.isActive ||
                        updatedProject.status === "active",
                    }
                  : project,
              ),
            );
          }
        } else {
          // Fallback to local update if no auth state
          setProjects((currentProjects) =>
            currentProjects.map((project) =>
              project.id === updatedProject.id
                ? {
                    ...project,
                    ...updatedProject,
                    project: updatedProject.name || updatedProject.project,
                    name: updatedProject.name || updatedProject.project,
                    twitter:
                      updatedProject.twitterLink || updatedProject.twitter,
                    twitterLink:
                      updatedProject.twitterLink || updatedProject.twitter,
                    logo: updatedProject.logo || updatedProject.image,
                    image: updatedProject.logo || updatedProject.image,
                    joinDate:
                      updatedProject.joinDate || updatedProject.join_date,
                    join_date:
                      updatedProject.joinDate || updatedProject.join_date,
                    lastActivity: new Date().toISOString(),
                    last_activity: new Date().toISOString(),
                    isActive:
                      updatedProject.isActive ||
                      updatedProject.status === "active",
                    status:
                      updatedProject.status ||
                      (updatedProject.isActive ? "active" : "pending"),
                    is_active:
                      updatedProject.isActive ||
                      updatedProject.status === "active",
                  }
                : project,
            ),
          );
        }
      } else {
        // If not connected to Supabase, show error
        console.error("Cannot update project: No connection to database");
        alert("Cannot update project: No connection to database");
      }
    } catch (error) {
      console.error("Error updating project:", error);
    } finally {
      // Hide loading animation
      window.dispatchEvent(new Event("projectsLoadingFinished"));
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      // Show loading animation
      window.dispatchEvent(new Event("projectsLoadingStarted"));

      // Delete from Supabase if connected
      if (!connectionError) {
        const { error } = await supabase
          .from("user_airdrops")
          .delete()
          .eq("id", projectId);

        if (error) throw error;

        // Get the current user
        const authState = localStorage.getItem("auth_state");
        if (authState) {
          const { username } = JSON.parse(authState);

          // Refresh all projects to ensure we have the latest data
          const { data: refreshedProjects } = await supabase
            .from("user_airdrops")
            .select("*")
            .eq("username", username)
            .order("last_activity", { ascending: false });

          if (refreshedProjects) {
            localStorage.setItem(
              "user_projects",
              JSON.stringify(refreshedProjects),
            );
            setProjects(refreshedProjects);
          } else {
            // Fallback to local update if refresh fails
            setProjects(projects.filter((project) => project.id !== projectId));
          }
        } else {
          // Fallback to local update if no auth state
          setProjects(projects.filter((project) => project.id !== projectId));
        }
      } else {
        // If not connected to Supabase, show error
        console.error("Cannot delete project: No connection to database");
        alert("Cannot delete project: No connection to database");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      // Hide loading animation
      window.dispatchEvent(new Event("projectsLoadingFinished"));
    }
  };

  const handleStatusChange = async (projectId, status) => {
    try {
      // Show loading animation
      window.dispatchEvent(new Event("projectsLoadingStarted"));

      // Update in Supabase if connected
      if (!connectionError) {
        const { error } = await supabase
          .from("user_airdrops")
          .update({
            status: status ? "active" : "pending",
            last_activity: new Date().toISOString(),
          })
          .eq("id", projectId);

        if (error) throw error;

        // Get the current user
        const authState = localStorage.getItem("auth_state");
        if (authState) {
          const { username } = JSON.parse(authState);

          // Refresh all projects to ensure we have the latest data
          const { data: refreshedProjects } = await supabase
            .from("user_airdrops")
            .select("*")
            .eq("username", username)
            .order("last_activity", { ascending: false });

          if (refreshedProjects) {
            localStorage.setItem(
              "user_projects",
              JSON.stringify(refreshedProjects),
            );
            setProjects(refreshedProjects);
          } else {
            // Fallback to local update if refresh fails
            setProjects(
              projects.map((project) =>
                project.id === projectId
                  ? {
                      ...project,
                      status: status ? "active" : "pending",
                      last_activity: new Date().toISOString(),
                    }
                  : project,
              ),
            );
          }
        } else {
          // Fallback to local update if no auth state
          setProjects(
            projects.map((project) =>
              project.id === projectId
                ? {
                    ...project,
                    status: status ? "active" : "pending",
                    last_activity: new Date().toISOString(),
                  }
                : project,
            ),
          );
        }
      } else {
        // If not connected to Supabase, show error
        console.error(
          "Cannot update project status: No connection to database",
        );
        alert("Cannot update project status: No connection to database");
      }
    } catch (error) {
      console.error("Error updating project status:", error);
    } finally {
      // Hide loading animation
      window.dispatchEvent(new Event("projectsLoadingFinished"));
    }
  };

  const handleNotesChange = async (projectId, notes) => {
    try {
      // Show loading animation
      window.dispatchEvent(new Event("projectsLoadingStarted"));

      // Update in Supabase if connected
      if (!connectionError) {
        const { error } = await supabase
          .from("user_airdrops")
          .update({
            notes,
            last_activity: new Date().toISOString(),
          })
          .eq("id", projectId);

        if (error) throw error;

        // Get the current user
        const authState = localStorage.getItem("auth_state");
        if (authState) {
          const { username } = JSON.parse(authState);

          // Refresh all projects to ensure we have the latest data
          const { data: refreshedProjects } = await supabase
            .from("user_airdrops")
            .select("*")
            .eq("username", username)
            .order("last_activity", { ascending: false });

          if (refreshedProjects) {
            localStorage.setItem(
              "user_projects",
              JSON.stringify(refreshedProjects),
            );
            setProjects(refreshedProjects);
          } else {
            // Fallback to local update if refresh fails
            setProjects(
              projects.map((project) =>
                project.id === projectId
                  ? {
                      ...project,
                      notes,
                      last_activity: new Date().toISOString(),
                    }
                  : project,
              ),
            );
          }
        } else {
          // Fallback to local update if no auth state
          setProjects(
            projects.map((project) =>
              project.id === projectId
                ? {
                    ...project,
                    notes,
                    last_activity: new Date().toISOString(),
                  }
                : project,
            ),
          );
        }
      } else {
        // If not connected to Supabase, show error
        console.error("Cannot update project notes: No connection to database");
        alert("Cannot update project notes: No connection to database");
      }
    } catch (error) {
      console.error("Error updating project notes:", error);
    } finally {
      // Hide loading animation
      window.dispatchEvent(new Event("projectsLoadingFinished"));
    }
  };

  const handleAuthSuccess = () => {
    // Check if user is logged in after successful auth
    const authState = localStorage.getItem("auth_state");
    if (authState) {
      try {
        const parsedState = JSON.parse(authState);
        if (parsedState.username) {
          setIsLoggedIn(true);
          loadProjectsFromDatabase(parsedState.username);
        }
      } catch (error) {
        console.error("Error parsing auth state after auth success:", error);
      }
    }
  };

  // Public mode handler removed

  return (
    <div className="h-screen bg-[#050A14] relative overflow-hidden">
      {/* Add doodles background */}
      <DoodlesBackground />

      {/* Add header for mobile view, matching PublicPage */}
      <header className="w-full h-16 px-4 bg-[#1A1A1A] backdrop-blur-sm border-b border-gray-700 flex items-center justify-between fixed top-0 z-10 md:hidden">
        <div className="flex items-center gap-4">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=airdrop"
            alt="Logo"
            className="w-8 h-8"
          />
          <h1 className="text-xl font-bold text-gray-100">
            Airdrop Manager{" "}
            <span className="text-[#3B82F6] text-sm">Dashboard</span>
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 relative z-10 max-w-[1400px] md:py-8 md:h-full pt-20 md:pt-8">
        {connectionError && isLoggedIn && (
          <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-2 rounded-md mb-4">
            <p className="text-sm">
              ⚠️ Could not connect to Supabase database. Please check your
              connection and try again.
            </p>
          </div>
        )}

        {/* Show auth modal if not logged in */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
          defaultView="login"
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
            <div className="text-white/80 text-lg font-medium">
              Loading projects...
            </div>
          </div>
        ) : (
          <div className="relative">
            {isLoggedIn ? (
              <ProjectTable
                projects={projects}
                onStatusChange={handleStatusChange}
                onNotesChange={handleNotesChange}
                onAddProject={handleAddProject}
                onDeleteProject={handleDeleteProject}
                onUpdateProject={handleUpdateProject}
                setProjects={setProjects}
                isLoggedIn={isLoggedIn}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-[80vh]">
                <div className="text-white/80 text-xl font-medium mb-4">
                  Please log in to access your airdrop projects
                </div>
              </div>
            )}
            <div className="fixed bottom-4 right-4">
              <SupabaseStatus />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
