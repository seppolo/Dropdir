import React from "react";

const Navbar = () => {
  return (
    <nav className="w-full h-16 bg-background border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=airdrop"
          alt="Logo"
          className="w-8 h-8"
        />
        <span className="text-lg font-semibold text-foreground sketch-font">
          Airdrop Manager
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
