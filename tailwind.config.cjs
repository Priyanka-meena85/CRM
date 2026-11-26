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
        background: "#F7F6F2",
        primary: "#2F4838",
        primaryGradientStart: "#2F4838",
        primaryGradientEnd: "#3E5C48",
        accent: "#B08D57",
        accentShine: "#C7A773",
        text: "#1F2421",
        success: "#2E6F40",
        danger: "#B9382C",
        softPink: "#EFECE4",
        gold: "#B08D57",
        goldShine: "#C7A773",
        maroon: "#2F4838",
        maroonLight: "#3E5C48",
        surfaceBorder: "#E6E2D8",
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