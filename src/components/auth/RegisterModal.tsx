import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegisterSuccess: () => void;
  onLoginClick: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({
  open,
  onOpenChange,
  onRegisterSuccess = () => {},
  onLoginClick,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Starting registration process for username:", username);

      // Check if username already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from("users")
        .select("username")
        .eq("username", username);

      if (checkError) {
        console.error("Error checking username:", checkError);
        setError("Error checking username availability");
        setIsLoading(false);
        return;
      }

      if (existingUsers && existingUsers.length > 0) {
        console.log("Username already exists:", username);
        setError("Username already exists");
        setIsLoading(false);
        return;
      }

      console.log("Username is available, creating new user");

      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([{ username, password_hash: password }])
        .select()
        .single();

      if (createError) {
        console.error("Registration error:", createError);
        setError(createError.message || "Error creating user account");
        setIsLoading(false);
        return;
      }

      if (!newUser) {
        console.error("No user data returned after registration");
        setError("Failed to create user account");
        setIsLoading(false);
        return;
      }

      console.log("User created successfully:", newUser.username);

      // Store user session
      localStorage.setItem(
        "auth_state",
        JSON.stringify({
          isLoggedIn: true,
          username: newUser.username,
        }),
      );

      console.log("Auth state saved to localStorage");

      // Set RLS policy parameter
      try {
        console.log("Setting RLS claim for username:", username);
        const { error: rpcError } = await supabase.rpc("set_claim", {
          claim: "username",
          value: username,
        });

        if (rpcError) {
          console.error("Error setting RLS claim:", rpcError);
          // Continue with login even if this fails
        } else {
          console.log("RLS claim set successfully");
        }
      } catch (rpcErr) {
        console.error("Exception setting RLS claim:", rpcErr);
        // Continue with login even if this fails
      }

      // Set loading state in localStorage
      localStorage.setItem("projects_loading", "true");
      window.dispatchEvent(new Event("projectsLoadingStarted"));
      console.log("Projects loading state set");

      // Fetch projects immediately after registration
      try {
        console.log("Fetching initial projects for user:", username);
        const { data: projectsData, error: projectsError } = await supabase
          .from("user_airdrops")
          .select("*")
          .eq("username", username)
          .order("last_activity", { ascending: false });

        if (projectsError) {
          console.error("Error fetching projects:", projectsError);
        }

        // Store projects in localStorage for immediate access
        if (projectsData) {
          localStorage.setItem("user_projects", JSON.stringify(projectsData));
          console.log("Projects saved to localStorage:", projectsData.length);
          // Dispatch event to update UI immediately
          window.dispatchEvent(
            new CustomEvent("projectsLoaded", { detail: projectsData }),
          );
        }
      } catch (fetchError) {
        console.error(
          "Error fetching projects after registration:",
          fetchError,
        );
        // Continue with login even if this fails
      } finally {
        // Clear loading state
        localStorage.removeItem("projects_loading");
        window.dispatchEvent(new Event("projectsLoadingFinished"));
      }

      console.log("Registration successful, calling success callback");
      // Call success callback and close modal
      onRegisterSuccess();
      onOpenChange(false);

      console.log("Redirecting to dashboard");
      // Force page reload to ensure proper state update
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        "An unexpected error occurred: " +
          (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sketch-card w-[400px] bg-[#0A0A0A] border-2 border-gray-700 shadow-xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl sketch-font text-blue-400 font-bold text-center">
            Create New Account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="sketch-input h-12 bg-[#1A1A1A] text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 rounded-lg px-4 py-3 text-base"
            />
          </div>

          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="sketch-input h-12 bg-[#1A1A1A] text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 rounded-lg px-4 py-3 text-base"
            />
          </div>

          <div>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="sketch-input h-12 bg-[#1A1A1A] text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 rounded-lg px-4 py-3 text-base"
            />
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>

          <Button
            onClick={handleRegister}
            className="w-full h-12 bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors rounded-lg py-2 mt-4 text-base"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Register"}
          </Button>

          <div className="text-center mt-6">
            <span className="text-sm text-gray-400">
              Already have an account?{" "}
            </span>
            <Button
              variant="link"
              className="p-0 text-blue-400 hover:text-blue-300"
              onClick={onLoginClick}
            >
              Login instead
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;
