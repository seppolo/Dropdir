import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadInstructionsProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const DownloadInstructions = ({
  isOpen = false,
  onClose = () => {},
}: DownloadInstructionsProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sketch-card w-[95%] sm:w-[600px]">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 mb-2">
          <DialogTitle className="text-xl font-bold sketch-font text-white">
            Download Code
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-md font-semibold mb-2">
              Option 1: Using Share Button
            </h3>
            <p className="text-sm mb-2">
              Look for the Share button (↗️) in the top-right corner of Tempo
              and select "Download as ZIP".
            </p>
          </div>

          <div>
            <h3 className="text-md font-semibold mb-2">
              Option 2: Using Terminal
            </h3>
            <p className="text-sm mb-2">
              Open the terminal in Tempo and run this command:
            </p>
            <div className="bg-gray-900 p-2 rounded-md text-xs font-mono mb-2 overflow-x-auto">
              <code>
                npm install -g jszip-cli jszip -o project.zip -i "**/*" -x
                "**/node_modules/**" -x "**/.git/**" -x "**/dist/**"
              </code>
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold mb-2">Option 3: Using Git</h3>
            <p className="text-sm mb-2">
              Use the Git tab to push to a repository, then clone it locally.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadInstructions;
