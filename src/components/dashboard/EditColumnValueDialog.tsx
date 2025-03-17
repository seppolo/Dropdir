import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditColumnValueDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  columnName?: string;
  value?: string;
  onSave?: (value: string) => void;
}

const EditColumnValueDialog = ({
  isOpen = false,
  onClose = () => {},
  columnName = "",
  value = "",
  onSave = () => {},
}: EditColumnValueDialogProps) => {
  const [editValue, setEditValue] = React.useState(value);

  const handleSave = () => {
    onSave(editValue);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sketch-card">
        <DialogHeader>
          <DialogTitle className="text-xl sketch-font">
            Edit {columnName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="sketch-input"
            placeholder={`Enter ${columnName.toLowerCase()}`}
          />
          <Button onClick={handleSave} className="w-full">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditColumnValueDialog;
