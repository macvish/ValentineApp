/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        floatUp: {
          "0%": { transform: "translateY(0) scale(0.9)", opacity: "0" },
          "10%": { opacity: "0.45" },
          "100%": { transform: "translateY(-120vh) scale(1.25)", opacity: "0" },
        },
        heartPop: {
          "0%": { transform: "translate(-50%, -50%) scale(0.6)", opacity: "0" },
          "15%": { opacity: "0.85" },
          "100%": { transform: "translate(-50%, -85px) scale(1.3)", opacity: "0" },
        },
        letterIn: {
          "0%": { transform: "translateY(10px) scale(0.98)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        floatUp: "floatUp 9s linear infinite",
        heartPop: "heartPop 650ms ease-out forwards",
        letterIn: "letterIn 380ms ease-out both",
        shimmer: "shimmer 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
