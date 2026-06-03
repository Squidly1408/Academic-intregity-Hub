/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        soft: "0 20px 60px rgba(2, 8, 23, 0.35)"
      },
      colors: {
        ink: {
          950: "#04111f",
          900: "#081425",
          800: "#10213c"
        }
      }
    }
  },
  plugins: []
};
