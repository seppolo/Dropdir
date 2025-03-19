import React, { useEffect } from "react";
import AllPublicAirdrops from "./AllPublicAirdrops";
import DoodlesBackground from "./DoodlesBackground";
import { List, LogIn } from "lucide-react";

const PublicPage = () => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="h-screen bg-[#050A14] relative overflow-hidden">
      {/* Add doodles background */}
      <DoodlesBackground />

      <header className="w-full h-16 px-4 bg-[#1A1A1A] backdrop-blur-sm border-b border-gray-700 flex items-center justify-between fixed top-0 z-10">
        <div className="flex items-center gap-4">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=airdrop"
            alt="Logo"
            className="w-8 h-8"
          />
          <h1 className="text-xl font-bold text-gray-100">
            Airdrop Manager{" "}
            <span className="text-[#3B82F6] text-sm">All Public Airdrops</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/Moffuadi"
            className="text-[#3B82F6] hover:text-[#60A5FA] transition-colors text-sm flex items-center gap-1"
          >
            <List className="h-4 w-4" />
            List
          </a>
          <a
            href="/"
            className="text-[#3B82F6] hover:text-[#60A5FA] transition-colors text-sm"
            onClick={(e) => {
              e.preventDefault();
              window.location.href =
                "https://musing-torvalds7-3sh6x.dev-2.tempolabs.ai";
              localStorage.setItem("showLoginModal", "true");
            }}
          >
            Login
          </a>
        </div>
      </header>

      <main className="h-full container mx-auto px-4 py-8 pt-20 relative z-10">
        <AllPublicAirdrops />
      </main>
    </div>
  );
};

export default PublicPage;
