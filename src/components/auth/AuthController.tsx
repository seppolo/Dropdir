import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User, ChevronDown } from "lucide-react";
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
}

const AuthController: React.FC<AuthControllerProps> = ({
  onAuthStateChange = () => {},
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
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
    // Reload the page
    window.location.reload();
  };

  return (
    <>
      {isLoggedIn ? (
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
            <DropdownMenuItem
              className="text-red-400 hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
              onSelect={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onRegisterClick={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
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
