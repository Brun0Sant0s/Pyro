export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        neon: {
          green: "#00ff9d",
          pink: "#ff00c8",
          yellow: "#fff200",
          blue: "#00d1ff"
        },
        glass: "rgba(255, 255, 255, 0.05)"
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"]
      }
    },
  },
  plugins: [],
}
