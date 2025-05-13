import { Suspense, lazy, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
import { MessageCircle } from "lucide-react";
import {
  Routes,
  Route,
  useRoutes,
  Navigate,
  useNavigate,
} from "react-router-dom";
import routes from "tempo-routes";

// Lazy load all components for better performance
const AuthGuard = lazy(() => import("./components/auth/AuthGuard"));
// Inline TelegramJoinModal to avoid dynamic import issues
const TelegramJoinModal = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-2 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Bergabung ke Telegram
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4 p-4">
          <p className="text-center text-muted-foreground">
            Silahkan bergabung ke grup telegram Dropdir untuk mendapatkan
            informasi terbaru, tutorial dan diskusi terkait aplikasi
          </p>
          <a
            href="https://t.me/dropdirs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 w-full max-w-xs"
          >
            <MessageCircle className="h-5 w-5" />
            Bergabung ke Telegram
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Telegram redirect component
const TelegramRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.location.href = "https://t.me/dropdirs";
  }, []);

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      <p className="ml-3 text-white">Redirecting to Telegram...</p>
    </div>
  );
};
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
    // Check if user is logged in
    const authState = localStorage.getItem("auth_state");
    let username = "guest";

    if (authState) {
      try {
        const parsedState = JSON.parse(authState);
        if (parsedState.username && parsedState.isLoggedIn) {
          username = parsedState.username;
        }
      } catch (error) {
        console.error("Error parsing auth state:", error);
      }
    }

    // Check when the modal was last shown for this specific user
    const lastShownKey = `telegram_modal_last_shown_${username}`;
    const lastShown = localStorage.getItem(lastShownKey);
    const currentTime = new Date().getTime();

    // Show modal if it hasn't been shown before or if 24 hours have passed
    if (!lastShown || currentTime - parseInt(lastShown) > 24 * 60 * 60 * 1000) {
      setShowTelegramModal(true);
      localStorage.setItem(lastShownKey, currentTime.toString());
    }
  }, []);

  const handleTelegramModalClose = () => {
    setShowTelegramModal(false);
  };

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
        <Route path="/listener" element={<TelegramRedirect />} />
        <Route path="/:username/:projectId" element={<ProjectCopyRedirect />} />
        <Route path="/:username" element={<PublicUserPage />} />
        {/* Add explicit Tempo route to prevent catch-all conflicts */}
        {import.meta.env.VITE_TEMPO === "true" && <Route path="/tempobook/*" />}
      </Routes>

      {/* Telegram Join Modal */}
      <TelegramJoinModal
        open={showTelegramModal}
        onOpenChange={handleTelegramModalClose}
      />
    </Suspense>
  );
}

export default App;
