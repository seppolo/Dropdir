import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const SupabaseConfigWarning = () => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Supabase Configuration Missing</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          Supabase URL and Anon Key are required for this application to
          function properly. The app is currently running in demo mode with
          limited functionality.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            window.open("https://supabase.com/dashboard", "_blank")
          }
        >
          Set up Supabase
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default SupabaseConfigWarning;
