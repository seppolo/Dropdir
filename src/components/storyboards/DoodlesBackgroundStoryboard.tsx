import React from "react";
import DoodlesBackground from "../DoodlesBackground";

const DoodlesBackgroundStoryboard = () => {
  return (
    <div className="p-8 bg-background min-h-screen relative">
      <DoodlesBackground className="opacity-20" />

      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-6">Doodles Background Demo</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-card rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-3">About Doodles</h2>
            <p className="text-muted-foreground">
              This background adds a playful, hand-drawn feel to your
              application. The doodles are rendered as SVG patterns, making them
              lightweight and scalable.
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-3">Customization</h2>
            <p className="text-muted-foreground mb-4">
              You can customize the opacity, color, and pattern density by
              modifying the DoodlesBackground component.
            </p>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                1
              </div>
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                2
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
                3
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoodlesBackgroundStoryboard;
