/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#165DFF", // Bright Blue
          hover: "#1247CC",   // Dark Blue
          navy: "#172033",    // Dark Navy
        },
        cyan: {
          DEFAULT: "#38BDF8", // Sky Blue
          light: "#7DD3FC",
          dark: "#0284C7",
          subtle: "#F0F9FF",
        },
        sidebar: "#FFFFFF",
        background: "#F5F6F8", // Soft crisp light grey
        surface: "#FFFFFF",    // Pure White
        canvas: "#EBF3FC",     // SignIn & SignUp Ambient Tint
        border: "#E5E7EB",     // Crisp Light Border
        text: {
          primary: "#172033",   // Dark Navy (Headings & Primary Text)
          secondary: "#64748B", // Slate Grey (Subtitles & Descriptions)
          muted: "#94A3B8",
        },
        whatsapp: {
          DEFAULT: "#25D366", // WhatsApp Green
          dark: "#128C7E",
          light: "#DCF8C6",
          badge: "#25D366",
        },
        danger: "#EF4444",
        warning: "#F59E0B",
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};