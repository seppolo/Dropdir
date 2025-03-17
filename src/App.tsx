import { Suspense, lazy } from "react";
import { Routes, Route, useRoutes } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import AuthGuard from "./components/auth/AuthGuard";

// Lazy load components for better performance
const PublicUserPage = lazy(() => import("./components/PublicUserPage"));
const PublicPage = lazy(() => import("./components/PublicPage"));

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
        <Route path="/" element={<Home />} />
        <Route path="/public" element={<PublicPage />} />
        <Route path="/:username" element={<PublicUserPage />} />
        {/* Add explicit Tempo route to prevent catch-all conflicts */}
        {import.meta.env.VITE_TEMPO === "true" && <Route path="/tempobook/*" />}
      </Routes>
    </Suspense>
  );
}

export default App;
