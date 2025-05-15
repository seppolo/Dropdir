import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  LogIn,
  LogOut,
  User,
  ChevronDown,
  Sun,
  Moon,
  Palette,
} from "lucide-react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AuthControllerProps {
  onAuthStateChange?: (isLoggedIn: boolean) => void;
  compact?: boolean;
}

const AuthController: React.FC<AuthControllerProps> = ({
  onAuthStateChange = () => {},
  compact = false,
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [theme, setTheme] = useState<
    "dark" | "light" | "light-gradient" | "system"
  >("dark");

  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem("theme") as
      | "dark"
      | "light"
      | "light-gradient"
      | "system"
      | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setTheme(systemTheme);
    }
    // Check if user is logged in
    const authState = localStorage.getItem("auth_state");
    if (authState) {
      try {
        const parsedState = JSON.parse(authState);
        setIsLoggedIn(parsedState.isLoggedIn);
        setUsername(parsedState.username || "");
        onAuthStateChange(parsedState.isLoggedIn);
      } catch (error) {
        console.error("Error parsing auth state:", error);
      }
    }

    // Listen for showRegisterModal event
    const handleShowRegisterModal = () => {
      setShowRegisterModal(true);
    };

    window.addEventListener("showRegisterModal", handleShowRegisterModal);

    return () => {
      window.removeEventListener("showRegisterModal", handleShowRegisterModal);
    };
  }, [onAuthStateChange]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);

    // Get username from localStorage
    const authState = localStorage.getItem("auth_state");
    if (authState) {
      try {
        const parsedState = JSON.parse(authState);
        setUsername(parsedState.username || "");
      } catch (error) {
        console.error("Error parsing auth state:", error);
      }
    }

    onAuthStateChange(true);

    // Dispatch event that auth state changed
    window.dispatchEvent(new Event("authStateChanged"));

    // Force immediate reload
    window.location.reload();
  };

  const handleRegisterSuccess = () => {
    setIsLoggedIn(true);
    setShowRegisterModal(false);

    // Get username from localStorage
    const authState = localStorage.getItem("auth_state");
    if (authState) {
      try {
        const parsedState = JSON.parse(authState);
        setUsername(parsedState.username || "");
      } catch (error) {
        console.error("Error parsing auth state:", error);
      }
    }

    onAuthStateChange(true);
    // Force immediate reload
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_state");
    localStorage.removeItem("user_projects");
    setIsLoggedIn(false);
    setUsername("");
    onAuthStateChange(false);
    // Clear projects immediately
    window.dispatchEvent(new Event("userLoggedOut"));
    // Redirect to Moffuadi's public page
    window.location.href = "/Moffuadi";
  };

  const handleThemeChange = (
    newTheme: "dark" | "light" | "light-gradient" | "system",
  ) => {
    setTheme(newTheme);
    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      document.documentElement.className = systemTheme;
    } else {
      document.documentElement.className = newTheme;
    }
    localStorage.setItem("theme", newTheme);
  };

  return (
    <>
      {isLoggedIn ? (
        compact ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-md text-gray-300 hover:bg-gray-700/50"
            >
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{username}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 hover:bg-transparent"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-md text-gray-300 hover:bg-gray-700/50"
              >
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{username}</span>
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-gray-800 border-gray-700"
            >
              <DropdownMenuLabel className="text-gray-300">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuLabel className="text-gray-300">
                Theme
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
                onSelect={() => handleThemeChange("light")}
              >
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
                onSelect={() => handleThemeChange("light-gradient")}
              >
                <Palette className="mr-2 h-4 w-4" />
                <span>Light Gradient</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
                onSelect={() => handleThemeChange("dark")}
              >
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
                onSelect={() => handleThemeChange("system")}
              >
                <span>System</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                className="text-red-400 hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
                onSelect={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      ) : compact ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLoginModal(true)}
          className="text-gray-300 border-gray-700 hover:bg-gray-800 w-full"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLoginModal(true)}
          className="text-gray-300 border-gray-700 hover:bg-gray-800"
        >
          Login
        </Button>
      )}

      <LoginModal
        open={showLoginModal}
        onOpenChange={(open) => setShowLoginModal(open)}
        onLoginSuccess={handleLoginSuccess}
        onRegisterClick={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      <RegisterModal
        open={showRegisterModal}
        onOpenChange={(open) => setShowRegisterModal(open)}
        onRegisterSuccess={handleRegisterSuccess}
        onLoginClick={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </>
  );
};

export default AuthController;
