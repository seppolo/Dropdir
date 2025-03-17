import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { checkSupabaseConnection } from "@/lib/checkSupabase";
import { setupSupabaseDatabase } from "@/lib/setupSupabase";
import { Database, RefreshCw } from "lucide-react";

interface SupabaseStatusProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

const SupabaseStatus: React.FC<SupabaseStatusProps> = ({
  onConnectionChange = () => {},
}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);
      onConnectionChange(connected);
    } catch (error) {
      console.error("Error checking Supabase connection:", error);
      setIsConnected(false);
      onConnectionChange(false);
    } finally {
      setIsChecking(false);
    }
  };

  const setupDatabase = async () => {
    setIsSettingUp(true);
    try {
      const success = await setupSupabaseDatabase();
      if (success) {
        await checkConnection();
      }
    } catch (error) {
      console.error("Error setting up database:", error);
    } finally {
      setIsSettingUp(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${isConnected === null ? "bg-gray-500" : isConnected ? "bg-green-500" : "bg-red-500"}`}
        />
        <span className="text-xs text-white/70">
          {isConnected === null
            ? "Checking..."
            : isConnected
              ? "Connected to Supabase"
              : "Not connected"}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={checkConnection}
        disabled={isChecking}
      >
        <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
      </Button>

      {!isConnected && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={setupDatabase}
          disabled={isSettingUp}
        >
          <Database className="h-3 w-3 mr-1" />
          {isSettingUp ? "Setting up..." : "Setup Database"}
        </Button>
      )}
    </div>
  );
};

export default SupabaseStatus;
