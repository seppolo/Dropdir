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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

interface SetProjectPublicModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onSave: (updatedProject: any) => void;
}

const SetProjectPublicModal: React.FC<SetProjectPublicModalProps> = ({
  isOpen,
  onClose,
  project,
  onSave,
}) => {
  const [isPublic, setIsPublic] = useState(project?.is_public || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedProject = {
        ...project,
        is_public: isPublic,
        last_activity: new Date().toISOString(),
      };

      // Call the onSave callback with the updated project
      onSave(updatedProject);
    } catch (error) {
      console.error("Error updating project visibility:", error);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Set Project Visibility</DialogTitle>
          <DialogDescription className="text-gray-400">
            Make this project visible to the public?
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="is-public" className="text-white">
              Public visibility
            </Label>
            <Switch
              id="is-public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
          <p className="text-sm text-gray-400">
            {isPublic
              ? "This project will be visible to anyone who visits your public profile."
              : "This project will only be visible to you."}
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SetProjectPublicModal;
