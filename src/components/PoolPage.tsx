import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Project } from "@/types/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PoolPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        // Fetch all projects from user_airdrops table
        const { data, error } = await supabase
          .from("user_airdrops")
          .select("*");

        if (error) throw error;

        if (data) {
          // Process data to ensure uniqueness based on regex transformation of link
          const uniqueProjects = processUniqueProjects(data);
          setProjects(uniqueProjects);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Function to process projects and ensure uniqueness based on regex pattern
  const processUniqueProjects = (data: any[]): Project[] => {
    const uniqueMap = new Map();

    data.forEach((project) => {
      if (project.link) {
        // Apply regex to extract base domain or subdomain
        const match = project.link.match(/(.*?)(\/.*)?/);
        const baseUrl = match ? match[1] : project.link;

        // Only add if this base URL hasn't been seen before
        if (!uniqueMap.has(baseUrl)) {
          uniqueMap.set(baseUrl, project);
        }
      }
    });

    // Convert map values back to array
    return Array.from(uniqueMap.values());
  };

  return (
    <div className="container mx-auto py-8 px-4 bg-background min-h-screen pt-24">
      <h1 className="text-3xl font-bold mb-6 dark:text-gray-100">
        Project Pool
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Showing unique projects from all user airdrops. Each project appears
        only once, even if it exists multiple times in the database.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="border border-gray-700">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length > 0 ? (
            projects.map((project) => (
              <Card
                key={project.id}
                className="border border-gray-700 hover:border-gray-500 transition-all"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    {project.logo ? (
                      <img
                        src={project.logo}
                        alt={`${project.name} logo`}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://api.dicebear.com/7.x/shapes/svg?seed=" +
                            project.name;
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        {project.name?.charAt(0) || "?"}
                      </div>
                    )}
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Chain:
                      </span>
                      <span className="text-sm font-medium">
                        {Array.isArray(project.chain)
                          ? project.chain.join(", ")
                          : project.chain}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Type:
                      </span>
                      <span className="text-sm font-medium">
                        {project.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Stage:
                      </span>
                      <span className="text-sm font-medium">
                        {project.stage}
                      </span>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(project.link, "_blank")}
                      >
                        Visit Project
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No projects found.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PoolPage;
