import React, { useEffect } from "react";
import AllPublicAirdrops from "./AllPublicAirdrops";

const PublicPage = () => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="h-screen bg-gray-900 relative overflow-hidden">
      <header className="w-full h-16 px-4 bg-gray-900 border-b border-gray-700 flex items-center justify-between fixed top-0 z-10">
        <div className="flex items-center gap-4">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=airdrop"
            alt="Logo"
            className="w-8 h-8"
          />
          <h1 className="text-xl font-bold text-gray-100">
            Airdrop Manager{" "}
            <span className="text-blue-400 text-sm">All Public Airdrops</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/Moffuadi"
            className="text-blue-400 hover:text-blue-500 transition-colors text-sm flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-list"
            >
              <line x1="8" x2="21" y1="6" y2="6" />
              <line x1="8" x2="21" y1="12" y2="12" />
              <line x1="8" x2="21" y1="18" y2="18" />
              <line x1="3" x2="3.01" y1="6" y2="6" />
              <line x1="3" x2="3.01" y1="12" y2="12" />
              <line x1="3" x2="3.01" y1="18" y2="18" />
            </svg>
            List
          </a>
          <a
            href="/"
            className="text-blue-400 hover:text-blue-500 transition-colors text-sm"
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
