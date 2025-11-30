import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'light-bg': '#F9FAFA',
        'dark-bg': '#1F2937',
        'accent-blue': '#60A5FA',
      },
      fontFamily: {
        // Use a system font stack for maximum performance and compatibility.
        // This avoids external network requests and ensures the app is fast and works offline.
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      // A subtle glassmorphism effect via backdrop-blur.
      backdropBlur: {
        'xl': '24px',
      },
      boxShadow: {
        'soft': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'soft-dark': '0 4px 14px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
};
export default config;
