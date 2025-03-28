import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Sun,
  Download,
  Archive,
  Share2,
  List,
  User,
  Globe,
  Layers,
} from "lucide-react";
import DownloadInstructions from "./DownloadInstructions";
import AuthController from "../auth/AuthController";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface HeaderProps {
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

const Header = ({
  isDarkMode = false,
  onThemeToggle = () => {},
}: HeaderProps) => {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  const handleExportProject = () => {
    // This is a placeholder function that would trigger a project export
    alert(
      "To export your project, go to the Git tab in the left panel and use the download or export option.",
    );
    setShowBackupModal(false);
  };

  return (
    <header className="w-full h-16 px-4 bg-background border-b border-gray-700 flex items-center justify-between fixed top-0 z-10">
      <div className="flex items-center gap-4">
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=airdrop"
          alt="Logo"
          className="w-8 h-8"
        />
        <h1 className="text-xl font-bold dark:text-gray-100">
          Airdrop Manager
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="rounded-none dark:text-gray-400 h-9 w-9"
          title="Profile"
        >
          <User className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onThemeToggle}
          className="rounded-none dark:text-gray-400 h-9 w-9"
          title="Toggle Theme"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowBackupModal(true)}
          className="rounded-none dark:text-gray-400 h-9 w-9"
          title="Backup Project"
        >
          <Archive className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowDownloadModal(true)}
          className="rounded-none dark:text-gray-400 h-9 w-9"
          title="Download Instructions"
        >
          <Download className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-none dark:text-gray-400 h-9 w-9"
          title="Share Profile"
          asChild
        >
          <Link to="/public" target="_blank" rel="noopener noreferrer">
            <Globe className="h-5 w-5" />
          </Link>
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-none dark:text-gray-400 h-9 w-9"
          title="Project Pool"
          asChild
        >
          <Link to="/pool">
            <Layers className="h-5 w-5" />
          </Link>
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-none dark:text-gray-400 h-9 w-9"
          title="My Projects"
          asChild
        >
          <Link to="/Moffuadi" target="_blank" rel="noopener noreferrer">
            <List className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      <DownloadInstructions
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />

      <Dialog open={showBackupModal} onOpenChange={setShowBackupModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Backup Project</DialogTitle>
            <DialogDescription>
              Choose how you want to back up your project files.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-medium">Git Repository</h3>
              <p className="text-sm text-muted-foreground">
                Push your changes to a connected Git repository for version
                control.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  alert(
                    "Go to the Git tab in the left panel to commit and push your changes.",
                  );
                  setShowBackupModal(false);
                }}
                className="mt-2"
              >
                Open Git Tab
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Download Project</h3>
              <p className="text-sm text-muted-foreground">
                Download all project files as a ZIP archive.
              </p>
              <Button
                variant="outline"
                onClick={handleExportProject}
                className="mt-2"
              >
                Export Project
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Deployed URL</h3>
              <p className="text-sm text-muted-foreground">
                Your project is deployed at:
              </p>
              <code className="block p-2 bg-muted rounded text-xs overflow-x-auto">
                https://view.tempolabs.ai/72f5fb6c-6670-4e72-b4b3-7cfb4a5185e3
              </code>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
