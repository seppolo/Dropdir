import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface Column {
  name: string;
  visible: boolean;
}

interface ColumnSettingsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  columns?: Column[];
  onColumnToggle?: (columnName: string) => void;
}

const ColumnSettingsModal = ({
  isOpen = false,
  onClose = () => {},
  columns = [
    { name: "Project", visible: true },
    { name: "Status", visible: true },
    { name: "Link", visible: true },
    { name: "Notes", visible: true },
    { name: "Join Date", visible: true },
    { name: "Chain", visible: true },
    { name: "Stage", visible: true },
    { name: "Tags", visible: true },
    { name: "Type", visible: true },
    { name: "Cost", visible: true },
    { name: "Last Activity", visible: true },
  ],
  onColumnToggle = () => {},
}: ColumnSettingsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sketch-card">
        <DialogHeader>
          <DialogTitle className="text-xl sketch-font">
            Column Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {columns.map((column) => (
            <div
              key={column.name}
              className="flex items-center justify-between py-2"
            >
              <span className="text-sm font-medium sketch-font">
                {column.name}
              </span>
              <Switch
                checked={column.visible}
                onCheckedChange={() => onColumnToggle(column.name)}
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnSettingsModal;
