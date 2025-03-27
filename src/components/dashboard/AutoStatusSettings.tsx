import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AutoStatusSettingsProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (time: string) => void;
  currentTime?: string;
}

const AutoStatusSettings = ({
  isOpen = false,
  onClose = () => {},
  onSave = () => {},
  currentTime = "09:00",
}: AutoStatusSettingsProps) => {
  const [autoActivateTime, setAutoActivateTime] = useState(currentTime);
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  const handleSave = () => {
    // Format time with period
    const formattedTime = `${autoActivateTime} ${period}`;
    onSave(formattedTime);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sketch-card">
        <DialogHeader>
          <DialogTitle className="text-xl sketch-font">
            Auto Status Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="auto-activate-time" className="sketch-font">
              Automatically activate projects at:
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="auto-activate-time"
                type="time"
                value={autoActivateTime}
                onChange={(e) => setAutoActivateTime(e.target.value)}
                className="w-32 bg-gray-800 border-gray-600"
              />
              <Select
                value={period}
                onValueChange={(value) => setPeriod(value as "AM" | "PM")}
              >
                <SelectTrigger className="w-20 bg-gray-800 border-gray-600">
                  <SelectValue placeholder="AM/PM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              All inactive projects will automatically be set to active at this
              time every day.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AutoStatusSettings;
