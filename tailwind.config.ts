import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "ui-sans-serif", "sans-serif"],
      },
      colors: {
        ink: { DEFAULT: "#09090b", 900: "#0c0c0f", 800: "#131318", 700: "#1c1c23", 600: "#2a2a33" },
        accent: { DEFAULT: "#c6f432", soft: "#d9ff6b" },
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        wave: { "0%,60%,100%": { transform: "rotate(0)" }, "10%,30%": { transform: "rotate(14deg)" }, "20%": { transform: "rotate(-8deg)" }, "40%": { transform: "rotate(-4deg)" }, "50%": { transform: "rotate(10deg)" } },
        shake: { "0%,100%": { translate: "0 0" }, "15%,55%": { translate: "-10px 0" }, "35%,75%": { translate: "10px 0" }, "90%": { translate: "-4px 0" } },
        "mole-up": { from: { transform: "translateY(70%) scale(.6)", opacity: "0" }, to: { transform: "none", opacity: "1" } },
        splat: { "0%": { transform: "scale(1)", opacity: "1" }, "40%": { transform: "scale(1.3) rotate(-10deg)" }, "100%": { transform: "scale(.2) rotate(20deg)", opacity: "0" } },
        "float-up": { from: { transform: "translateY(6px)", opacity: "1" }, to: { transform: "translateY(-22px)", opacity: "0" } },
        pop: { from: { transform: "scale(.6)", opacity: "0" }, to: { transform: "scale(1)", opacity: "1" } },
        blink: { "0%,49%": { opacity: "1" }, "50%,100%": { opacity: "0" } },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        float: "float 6s ease-in-out infinite",
        blink: "blink 1s step-end infinite",
        shake: "shake .5s cubic-bezier(.36,.07,.19,.97)",
        "mole-up": "mole-up .18s cubic-bezier(.2,.8,.2,1.3) both",
        splat: "splat .26s ease-out forwards",
        "float-up": "float-up .7s ease-out forwards",
        pop: "pop .3s cubic-bezier(.2,.8,.2,1.4) both",
      },
    },
  },
  plugins: [],
} satisfies Config;
