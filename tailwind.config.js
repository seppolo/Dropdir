/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "hsl(160, 95%, 95%)",
          100: "hsl(160, 95%, 90%)",
          200: "hsl(160, 95%, 80%)",
          300: "hsl(160, 95%, 70%)",
          400: "hsl(160, 95%, 60%)",
          500: "hsl(160, 95%, 50%)",
          600: "hsl(160, 95%, 39%)" /* Primary color */,
          700: "hsl(160, 95%, 30%)",
          800: "hsl(160, 95%, 20%)",
          900: "hsl(160, 95%, 10%)",
          950: "hsl(160, 95%, 5%)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        mint: {
          50: "hsl(160, 95%, 95%)",
          100: "hsl(160, 95%, 90%)",
          200: "hsl(160, 95%, 80%)",
          300: "hsl(160, 95%, 70%)",
          400: "hsl(160, 95%, 60%)",
          500: "hsl(160, 95%, 50%)",
          600: "hsl(160, 95%, 39%)",
          700: "hsl(160, 95%, 30%)",
          800: "hsl(160, 95%, 20%)",
          900: "hsl(160, 95%, 10%)",
          950: "hsl(160, 95%, 5%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "color-cycle": {
          "0%": { color: "hsl(160, 95%, 39%)" },
          "25%": { color: "hsl(160, 95%, 50%)" },
          "50%": { color: "hsl(160, 95%, 60%)" },
          "75%": { color: "hsl(160, 95%, 70%)" },
          "100%": { color: "hsl(160, 95%, 39%)" },
        },
        float: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-5px)" },
          "100%": { transform: "translateY(0px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "color-cycle": "color-cycle 3s ease-in-out infinite",
        float: "float 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
