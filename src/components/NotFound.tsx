import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md w-full sketch-card p-8 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-red-500 mb-2">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            onClick={() => navigate("/")}
            className="sketch-button w-full"
          >
            Go to Dashboard
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="sketch-button w-full"
          >
            Go Back
          </Button>
        </div>

        <div className="mt-8">
          <img
            src="https://api.dicebear.com/7.x/bottts/svg?seed=404&backgroundColor=b6e3f4"
            alt="404 Robot"
            className="w-32 h-32 mx-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
