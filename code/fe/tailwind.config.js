/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#136ADA",
        secondary: "#D9D9D9",
        "bright-blue": "#136ADA",
        "light-grey": "#D9D9D9",
        black: "#000000",
        white: "#FFFFFF",
      },
      fontFamily: {
        poppins: ["Poppins-Regular"],
        "poppins-medium": ["Poppins-Medium"],
        "poppins-bold": ["Poppins-Bold"],
        "poppins-semibold": ["Poppins-SemiBold"],
      },
    },
  },
  plugins: [],
}

