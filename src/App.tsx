import { Suspense, lazy, useEffect, useState } from "react";
import { Routes, Route, useRoutes, Navigate } from "react-router-dom";
import routes from "tempo-routes";

// Lazy load all components for better performance
const AuthGuard = lazy(() => import("./components/auth/AuthGuard"));
const TelegramJoinModal = lazy(() => import("./components/TelegramJoinModal"));
const Home = lazy(() => import("./components/home"));
const PublicUserPage = lazy(() => import("./components/PublicUserPage"));
const PublicPage = lazy(() => import("./components/PublicPage"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const ProjectCopyRedirect = lazy(
  () => import("./components/ProjectCopyRedirect"),
);

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
  const [showTelegramModal, setShowTelegramModal] = useState(false);

  useEffect(() => {
    // Disable telegram modal to reduce app weight
    setShowTelegramModal(false);
  }, []);

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
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/:username/:projectId" element={<ProjectCopyRedirect />} />
        <Route path="/:username" element={<PublicUserPage />} />
        {/* Add explicit Tempo route to prevent catch-all conflicts */}
        {import.meta.env.VITE_TEMPO === "true" && <Route path="/tempobook/*" />}
      </Routes>

      {/* Telegram Join Modal - shows only once */}
      <TelegramJoinModal
        open={showTelegramModal}
        onOpenChange={setShowTelegramModal}
      />
    </Suspense>
  );
}

export default App;
