import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface MakeAllPublicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MakeAllPublicModal: React.FC<MakeAllPublicModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleMakeAllPublic = async () => {
    setIsLoading(true);
    try {
      // Get current user from localStorage
      const authState = localStorage.getItem("auth_state");
      if (!authState) {
        throw new Error("You must be logged in to perform this action");
      }

      const { username } = JSON.parse(authState);
      if (!username) {
        throw new Error("Username not found in auth state");
      }

      // Update all projects for this user to be public
      console.log("Making all projects public for user:", username);
      const { data, error } = await supabase
        .from("user_airdrops")
        .update({ is_public: true, last_activity: new Date().toISOString() })
        .eq("username", username)
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Successfully made projects public:", data);

      // Call the success callback
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error making all projects public:", error);
      alert(
        `Failed to make all projects public: ${error.message || "Unknown error"}. Please try again.`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-400" />
            Make All Projects Public
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            This will make all your projects visible to anyone who visits your
            public profile.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-white/80">
            Are you sure you want to make all your projects public? This action
            will:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-white/70">
            <li>Make all your projects visible on your public profile</li>
            <li>Include them in the "All Public Airdrops" page</li>
            <li>Allow anyone to see your project details</li>
          </ul>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMakeAllPublic}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Make All Public"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MakeAllPublicModal;
