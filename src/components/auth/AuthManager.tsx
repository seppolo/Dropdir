import React, { useState, useEffect } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";

interface AuthManagerProps {
  onAuthStateChange?: (isLoggedIn: boolean) => void;
}

const AuthManager: React.FC<AuthManagerProps> = ({
  onAuthStateChange = () => {},
}) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
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
    setShowLogin(false);

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
    window.location.reload(); // Reload to fetch user's projects
  };

  const handleRegisterSuccess = () => {
    setIsLoggedIn(true);
    setShowRegister(false);

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
    window.location.reload(); // Reload to fetch user's projects
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_state");
    setIsLoggedIn(false);
    setUsername("");
    onAuthStateChange(false);
    window.location.reload(); // Reload to clear user's projects
  };

  return (
    <>
      {isLoggedIn ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-md">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300">{username}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-400 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLogin(true)}
          className="text-gray-300 border-gray-700 hover:bg-gray-800"
        >
          <LogIn className="h-4 w-4 mr-1" />
          Login
        </Button>
      )}

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={handleLoginSuccess}
        onRegisterClick={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />

      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </>
  );
};

export default AuthManager;
