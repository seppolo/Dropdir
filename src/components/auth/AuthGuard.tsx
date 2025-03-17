import React, { useEffect, useState } from "react";
import AuthModal from "./AuthModal";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const authState = localStorage.getItem("auth_state");
    if (authState) {
      try {
        const parsedState = JSON.parse(authState);
        setIsLoggedIn(!!parsedState.username);
      } catch (error) {
        console.error("Error parsing auth state:", error);
        setIsLoggedIn(false);
        setShowAuthModal(true);
      }
    } else {
      setIsLoggedIn(false);
      setShowAuthModal(true);
    }

    // Listen for logout events to show login modal
    const handleLogout = () => {
      setIsLoggedIn(false);
      setShowAuthModal(true);
    };

    window.addEventListener("userLoggedOut", handleLogout);
    return () => window.removeEventListener("userLoggedOut", handleLogout);
  }, []);

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setShowAuthModal(false);

    // Force immediate reload data from database
    window.dispatchEvent(new Event("forceDataReload"));

    // Reload the page to ensure fresh data
    window.location.reload();
  };

  // Show loading state while checking auth
  if (isLoggedIn === null) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <>
      {isLoggedIn ? (
        children
      ) : (
        <div className="relative">
          {/* Blurred background with gradient */}
          <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-blue-900/90 backdrop-blur-sm z-10"></div>

          {/* Content (blurred) */}
          <div className="opacity-20 pointer-events-none">{children}</div>

          {/* Auth modal */}
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => {}}
            onAuthSuccess={handleAuthSuccess}
            defaultView="login"
          />
        </div>
      )}
    </>
  );
};

export default AuthGuard;
