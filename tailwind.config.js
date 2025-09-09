/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4338ca", // Indigo 700
          light: "#6366f1", // Indigo 500
          dark: "#312e81", // Indigo 900
        },
        secondary: "#10b981", // Emerald 500
        background: "#f3f4f6", // Gray 100
        surface: "#ffffff",
        text: {
          primary: "#1f2937", // Gray 800
          secondary: "#6b7280", // Gray 500
        },
        danger: "#ef4444", // Red 500
        warning: "#f59e0b", // Amber 500
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};