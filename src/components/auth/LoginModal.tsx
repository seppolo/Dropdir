import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import RegisterModal from "./RegisterModal";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: () => void;
  onRegisterClick?: () => void;
  isPublicMode?: boolean;
}

const LoginModal: React.FC<LoginModalProps> = ({
  open,
  onOpenChange,
  onLoginSuccess = () => {},
  onRegisterClick = () => {},
  isPublicMode = false,
}) => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Check if user exists
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .eq("password_hash", password)
        .single();

      if (error || !data) {
        setError("Invalid username or password");
        setIsLoading(false);
        return;
      }

      // Store user session
      localStorage.setItem(
        "auth_state",
        JSON.stringify({
          isLoggedIn: true,
          username: data.username,
        }),
      );

      // Set RLS policy parameter
      await supabase.rpc("set_claim", {
        claim: "username",
        value: username,
      });

      // Set loading state in localStorage
      localStorage.setItem("projects_loading", "true");
      window.dispatchEvent(new Event("projectsLoadingStarted"));

      // Fetch user projects immediately after login
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
        console.error("Error fetching projects after login:", fetchError);
      } finally {
        // Clear loading state
        localStorage.removeItem("projects_loading");
        window.dispatchEvent(new Event("projectsLoadingFinished"));
      }

      onLoginSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sketch-card w-[350px] bg-[#1A1A1A] border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl sketch-font">
              Login Ke Dropdir
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="sketch-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="sketch-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <Button
              onClick={handleLogin}
              className="w-full bg-white text-black hover:bg-white"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
            <div className="text-sm text-muted-foreground">
              Don't have an account?
            </div>
            <Button
              variant="link"
              className="h-auto p-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenChange(false); // Close login modal first
                setTimeout(() => {
                  setShowRegisterModal(true); // Open register modal
                }, 100); // Small delay before opening register
              }}
              data-testid="register-button"
            >
              Register now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RegisterModal
        open={showRegisterModal}
        onOpenChange={setShowRegisterModal}
        onLoginClick={() => {
          setShowRegisterModal(false);
          setTimeout(() => onOpenChange(true), 100);
        }}
      />
    </>
  );
};

export default LoginModal;
