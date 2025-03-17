import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface NotesModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  projectName?: string;
  notes?: string;
  onSave?: (notes: string) => void;
}

const NotesModal = ({
  isOpen = true,
  onClose = () => {},
  projectName = "Sample Project",
  notes = "Add your project notes here...",
  onSave = () => {},
}: NotesModalProps) => {
  const [noteContent, setNoteContent] = React.useState(notes);

  const handleSave = () => {
    onSave(noteContent);
    onClose();
  };

  const [isEditing, setIsEditing] = React.useState(true);

  const handleTextClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (noteContent !== notes) {
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full md:max-w-[500px] sketch-card animate-slide-up-fade origin-bottom bg-gray-800 border-2 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl sketch-font">
            {projectName} Notes
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isEditing ? (
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              onBlur={handleBlur}
              placeholder="Enter your notes here..."
              className="min-h-[200px] resize-none sketch-font bg-gray-700 border-gray-600 text-white"
              autoFocus
            />
          ) : (
            <div
              onClick={handleTextClick}
              className="min-h-[200px] p-3 cursor-text sketch-font text-white hover:bg-gray-800/50 rounded-md transition-colors"
            >
              {noteContent || "Click to add notes..."}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotesModal;
