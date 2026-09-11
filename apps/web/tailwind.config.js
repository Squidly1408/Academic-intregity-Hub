/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        serif: ["\"Source Serif 4\"", "ui-serif", "Georgia", "serif"]
      },
      boxShadow: {
        soft: "0 1px 2px rgba(28, 25, 20, 0.04), 0 10px 28px rgba(28, 25, 20, 0.06)"
      }
    }
  },
  plugins: []
};
