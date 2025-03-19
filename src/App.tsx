import { Suspense, lazy, useEffect, useState } from "react";
import { Routes, Route, useRoutes, Navigate } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import AuthGuard from "./components/auth/AuthGuard";

// Lazy load components for better performance
const PublicUserPage = lazy(() => import("./components/PublicUserPage"));
const PublicPage = lazy(() => import("./components/PublicPage"));

// Redirect component for the homepage that checks auth status
const HomeRedirect = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const authState = localStorage.getItem("auth_state");
    if (authState) {
      try {
        const parsedState = JSON.parse(authState);
        setIsLoggedIn(!!parsedState.username && parsedState.isLoggedIn);
      } catch (error) {
        console.error("Error parsing auth state:", error);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // If logged in, redirect to dashboard, otherwise to public profile
  return isLoggedIn ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/Moffuadi" replace />
  );
};

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen w-screen bg-background">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      }
    >
      {/* Initialize Tempo routes */}
      {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}

      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <Home />
            </AuthGuard>
          }
        />
        <Route path="/public" element={<PublicPage />} />
        <Route path="/:username" element={<PublicUserPage />} />
        {/* Add explicit Tempo route to prevent catch-all conflicts */}
        {import.meta.env.VITE_TEMPO === "true" && <Route path="/tempobook/*" />}
      </Routes>
    </Suspense>
  );
}

export default App;
