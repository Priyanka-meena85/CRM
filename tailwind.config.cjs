/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFBEB",
        primary: "#881337",
        primaryGradientStart: "#881337",
        primaryGradientEnd: "#9F1239",
        accent: "#CA8A04",
        accentShine: "#F59E0B",
        text: "#1C1917",
        success: "#16A34A",
        danger: "#DC2626",
        softPink: "#FFF1F2",
        gold: "#CA8A04",
        goldShine: "#F59E0B",
        maroon: "#881337",
        maroonLight: "#9F1239",
      },
      fontFamily: {
        heading: ["Fraunces", "serif"],
        body: ["Outfit", "sans-serif"],
      },
      borderRadius: {
        xl: "28px",
      },
    },
  },
  plugins: [],
};