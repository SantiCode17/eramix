/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        eu: {
          deep: "#003399",
          mid: "#1A4DB3",
          light: "#3366CC",
          star: "#FFCC00",
          orange: "#FF6B2B",
        },
        glass: {
          white: "rgba(255, 255, 255, 0.12)",
          border: "rgba(255, 255, 255, 0.15)",
        },
      },
      fontFamily: {
        heading: ["SpaceGrotesk-Bold"],
        subheading: ["SpaceGrotesk-SemiBold"],
        body: ["Inter-Regular"],
        "body-medium": ["Inter-Medium"],
        "body-bold": ["Inter-Bold"],
      },
    },
  },
  plugins: [],
};
