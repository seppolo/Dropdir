import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Clock, Globe, ExternalLink, Share2 } from "lucide-react";
import AutoStatusSettings from "./AutoStatusSettings";
import { Link } from "react-router-dom";

interface Column {
  name: string;
  visible: boolean;
}

interface ColumnSettingsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  columns?: Column[];
  onColumnToggle?: (columnName: string) => void;
  onAutoStatusTimeChange?: (time: string) => void;
  autoStatusTime?: string;
  onTogglePublicMode?: () => void;
  isPublicMode?: boolean;
  username?: string;
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
  onAutoStatusTimeChange = () => {},
  autoStatusTime = "09:00 AM",
  onTogglePublicMode = () => {},
  isPublicMode = false,
  username = "Moffuadi",
}: ColumnSettingsModalProps) => {
  const [showAutoStatusSettings, setShowAutoStatusSettings] =
    React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sketch-card fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[600px] max-w-3xl h-fit rounded-lg transform transition-all duration-300 ease-in-out bg-background border-2 border-white/10 shadow-2xl overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 mb-4">
          <DialogTitle className="text-2xl font-bold sketch-font text-white">
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6">
          <div className="pt-2 pb-4 border-b border-gray-700">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium sketch-font">
                  Share Profile
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-gray-600"
                asChild
              >
                <Link
                  to={`/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Share2 className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Share your airdrop list with others through a public profile link
            </p>
          </div>

          <h3 className="text-sm font-medium sketch-font pt-2">
            Column Visibility
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
            {columns.map((column) => (
              <div
                key={column.name}
                className="flex items-center justify-between py-1"
              >
                <span className="text-sm font-medium sketch-font">
                  {column.name}
                </span>
                <Switch
                  checked={column.visible}
                  onCheckedChange={() => onColumnToggle(column.name)}
                  className="scale-90"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium sketch-font">
                Auto-activate projects at:
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAutoStatusSettings(true)}
              className="border-gray-600 text-sm"
            >
              {autoStatusTime}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            All inactive projects will automatically be set to active at this
            time daily.
          </p>
        </div>
      </DialogContent>

      <AutoStatusSettings
        isOpen={showAutoStatusSettings}
        onClose={() => setShowAutoStatusSettings(false)}
        onSave={onAutoStatusTimeChange}
        currentTime={autoStatusTime.split(" ")[0]}
      />
    </Dialog>
  );
};

export default ColumnSettingsModal;
