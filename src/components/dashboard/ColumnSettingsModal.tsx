import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Clock, Globe, Save, Share2 } from "lucide-react";
import AutoStatusSettings from "./AutoStatusSettings";
import { Link } from "react-router-dom";
import { saveUserSettings, getUserSettings } from "@/lib/userSettingsService";
import { useToast } from "@/components/ui/use-toast";

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
  columns: initialColumns = [
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
  autoStatusTime: initialAutoStatusTime = "09:00 AM",
  onTogglePublicMode = () => {},
  isPublicMode = false,
  username = "Moffuadi",
}: ColumnSettingsModalProps) => {
  const { toast } = useToast();
  const [showAutoStatusSettings, setShowAutoStatusSettings] = useState(false);
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [autoStatusTime, setAutoStatusTime] = useState(initialAutoStatusTime);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user settings from database when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUserSettings();
    }
  }, [isOpen]);

  // Load user settings from database
  const loadUserSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await getUserSettings();

      if (settings) {
        // Convert columnVisibility object to columns array
        if (settings.columnVisibility) {
          const updatedColumns = initialColumns.map((col) => ({
            name: col.name,
            visible:
              settings.columnVisibility[col.name] !== undefined
                ? settings.columnVisibility[col.name]
                : col.visible,
          }));

          setColumns(updatedColumns);
          // Also update parent component
          updatedColumns.forEach((col) => {
            if (
              col.visible !==
              initialColumns.find((c) => c.name === col.name)?.visible
            ) {
              onColumnToggle(col.name);
            }
          });
        }

        // Set auto status time
        if (settings.autoStatusTime) {
          setAutoStatusTime(settings.autoStatusTime);
          onAutoStatusTimeChange(settings.autoStatusTime);
        }
      }
    } catch (error) {
      console.error("Error loading user settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save user settings to database
  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Convert columns array to columnVisibility object
      const columnVisibility: Record<string, boolean> = {};
      columns.forEach((col) => {
        columnVisibility[col.name] = col.visible;
      });

      const result = await saveUserSettings(columnVisibility, autoStatusTime);

      if (result) {
        toast({
          title: "Settings saved",
          description:
            "Your column visibility and auto-activation settings have been saved.",
          variant: "default",
        });
      } else {
        toast({
          title: "Error saving settings",
          description:
            "There was an error saving your settings. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving user settings:", error);
      toast({
        title: "Error saving settings",
        description:
          "There was an error saving your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle column toggle
  const handleColumnToggle = (columnName: string) => {
    // Update local state
    setColumns((prev) =>
      prev.map((col) =>
        col.name === columnName ? { ...col, visible: !col.visible } : col,
      ),
    );

    // Call parent handler
    onColumnToggle(columnName);
  };

  // Handle auto status time change
  const handleAutoStatusTimeChange = (time: string) => {
    setAutoStatusTime(time);
    onAutoStatusTimeChange(time);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sketch-card fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[600px] max-w-3xl h-fit rounded-lg transform transition-all duration-300 ease-in-out bg-background border-2 border-white/10 shadow-2xl overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 mb-4">
          <DialogTitle className="text-2xl font-bold sketch-font text-white">
            Settings
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
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
                  Share your airdrop list with others through a public profile
                  link
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
                      onCheckedChange={() => handleColumnToggle(column.name)}
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
                All inactive projects will automatically be set to active at
                this time daily.
              </p>
            </div>

            <DialogFooter className="mt-6 pt-4 border-t border-gray-700 px-6 pb-6">
              <Button
                onClick={saveSettings}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <span>Save Settings</span>
                  </div>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>

      <AutoStatusSettings
        isOpen={showAutoStatusSettings}
        onClose={() => setShowAutoStatusSettings(false)}
        onSave={handleAutoStatusTimeChange}
        currentTime={autoStatusTime.split(" ")[0]}
      />
    </Dialog>
  );
};

export default ColumnSettingsModal;
