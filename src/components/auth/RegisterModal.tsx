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
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: () => void;
  onLoginClick: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
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
      // Check if username already exists
      const { data: existingUsers } = await supabase
        .from("users")
        .select("username")
        .eq("username", username);

      if (existingUsers && existingUsers.length > 0) {
        setError("Username already exists");
        setIsLoading(false);
        return;
      }

      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([{ username, password_hash: password }])
        .select()
        .single();

      if (createError) {
        console.error("Registration error:", createError);
        setError(createError.message);
        setIsLoading(false);
        return;
      }

      // Store user session
      localStorage.setItem(
        "auth_state",
        JSON.stringify({
          isLoggedIn: true,
          username: newUser.username,
        }),
      );

      // Set RLS policy parameter
      await supabase.rpc("set_claim", {
        claim: "username",
        value: username,
      });

      // Fetch projects immediately after registration
      try {
        const { data: projectsData } = await supabase
          .from("user_airdrops")
          .select("*")
          .eq("username", username)
          .order("last_activity", { ascending: false });

        // Store projects in localStorage for immediate access
        if (projectsData) {
          localStorage.setItem("user_projects", JSON.stringify(projectsData));
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
      }

      onRegisterSuccess();
      onClose();
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sketch-card w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl sketch-font">
            Create New Account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="sketch-input"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create password"
              className="sketch-input"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="sketch-input"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <Button
            onClick={handleRegister}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Register"}
          </Button>

          <div className="text-center mt-4">
            <span className="text-sm text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Button variant="link" className="p-0" onClick={onLoginClick}>
              Login instead
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;
