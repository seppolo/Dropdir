import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { addProject } from "@/lib/projectService";
import { getCurrentUser } from "@/lib/projectService";
import { useToast } from "./ui/use-toast";

const ProjectCopyRedirect = () => {
  const { username, projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const copyProject = async () => {
      try {
        // Check if user is logged in
        const currentUser = getCurrentUser();
        if (!currentUser) {
          // Store the redirect URL in localStorage to return after login
          localStorage.setItem("redirectAfterLogin", window.location.pathname);
          toast({
            title: "Login Required",
            description: "Please log in to copy this project",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        // Fetch the project from Supabase
        const { data, error } = await supabase
          .from("user_airdrops")
          .select("*")
          .eq("id", projectId)
          .eq("username", username)
          .single();

        if (error || !data) {
          console.error("Error fetching project:", error);
          toast({
            title: "Project Not Found",
            description: `Could not find project with ID ${projectId} for user ${username}`,
            variant: "destructive",
          });
          navigate(`/${username}`);
          return;
        }

        // Format project data for adding to user's database
        const projectData = {
          project: data.project || data.name,
          image: data.image || data.logo,
          link: data.link,
          twitter: data.twitter || data.twitterLink,
          status: "active",
          chain: data.chain,
          stage: data.stage,
          type: data.type,
          cost: data.cost,
          join_date: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          tags:
            typeof data.tags === "string"
              ? data.tags
              : Array.isArray(data.tags)
                ? data.tags.join(", ")
                : "",
          notes: `Copied from ${username}'s project (ID: ${projectId})`,
        };

        // Add the project to the user's database
        await addProject(projectData);

        // Mark this project as copied in localStorage
        const copiedProjectsKey = `copiedProjects_${username}`;
        const savedCopiedProjects = localStorage.getItem(copiedProjectsKey);
        const copiedProjects = savedCopiedProjects
          ? JSON.parse(savedCopiedProjects)
          : {};

        copiedProjects[projectId] = true;
        localStorage.setItem(copiedProjectsKey, JSON.stringify(copiedProjects));

        // Show success message
        toast({
          title: "Project Copied Successfully",
          description: `${projectData.project} has been added to your projects`,
          variant: "default",
        });

        // Redirect to the project's link if available, otherwise redirect to dashboard
        if (projectData.link && projectData.link.trim() !== "") {
          window.location.href = projectData.link.startsWith("http")
            ? projectData.link
            : `https://${projectData.link}`;
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error copying project:", error);
        toast({
          title: "Failed to Copy Project",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
        navigate(`/${username}`);
      } finally {
        setIsLoading(false);
      }
    };

    copyProject();
  }, [username, projectId, navigate, toast]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#050A14]">
      {isLoading && (
        <>
          <div className="rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B82F6] animate-spin mb-4"></div>
          <div className="text-white/80 text-lg font-medium">
            Copying project {projectId} from {username}...
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectCopyRedirect;
