import React from "react";

interface DoodlesBackgroundProps {
  className?: string;
}

const DoodlesBackground: React.FC<DoodlesBackgroundProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 opacity-10 ${className}`}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="doodle-pattern"
            patternUnits="userSpaceOnUse"
            width="100"
            height="100"
          >
            <path
              d="M30,10 Q40,5 50,10 T70,10"
              stroke="currentColor"
              fill="none"
              strokeWidth="1"
            />
            <circle
              cx="80"
              cy="20"
              r="5"
              stroke="currentColor"
              fill="none"
              strokeWidth="1"
            />
            <path
              d="M10,30 L20,40 L10,50 L20,60"
              stroke="currentColor"
              fill="none"
              strokeWidth="1"
            />
            <rect
              x="60"
              y="30"
              width="10"
              height="10"
              stroke="currentColor"
              fill="none"
              strokeWidth="1"
            />
            <path
              d="M80,70 C85,60 95,60 90,70"
              stroke="currentColor"
              fill="none"
              strokeWidth="1"
            />
            <path
              d="M10,80 Q20,70 30,80 T50,80"
              stroke="currentColor"
              fill="none"
              strokeWidth="1"
            />
            <circle
              cx="70"
              cy="80"
              r="3"
              stroke="currentColor"
              fill="none"
              strokeWidth="1"
            />
            <path
              d="M30,30 Q40,20 50,30 Q60,40 70,30"
              stroke="currentColor"
              fill="none"
              strokeWidth="1"
            />
            <path
              d="M50,50 L55,55 L50,60 L45,55 Z"
              stroke="currentColor"
              fill="none"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#doodle-pattern)" />
      </svg>
    </div>
  );
};

export default DoodlesBackground;
