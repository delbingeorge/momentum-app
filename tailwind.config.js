/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
    "./shared/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0B",
        sheet: "#141416",
        card: "#1A1A1D",
        card2: "#202024",
        line: "rgba(255,255,255,0.07)",
        line2: "rgba(255,255,255,0.12)",
        text: "#F6F6F4",
        mut: "rgba(246,246,244,0.50)",
        faint: "rgba(246,246,244,0.28)",
        lime: "#CBFB45",
        "lime-dim": "rgba(203,251,69,0.16)",
        "lime-text": "#0A0A0B",
        green: "#7CE38B",
        warmup: "#6FB6FF",
        "warmup-dim": "rgba(111,182,255,0.18)",
        drop: "#FF8A5B",
        "drop-dim": "rgba(255,138,91,0.18)",
        danger: "#FF6B6B",
      },
      fontFamily: {
        sans: ["HankenGrotesk_400Regular"],
        "sans-medium": ["HankenGrotesk_500Medium"],
        "sans-semibold": ["HankenGrotesk_600SemiBold"],
        "sans-bold": ["HankenGrotesk_700Bold"],
        "sans-extrabold": ["HankenGrotesk_800ExtraBold"],
        mono: ["JetBrainsMono_400Regular"],
        "mono-medium": ["JetBrainsMono_500Medium"],
        "mono-bold": ["JetBrainsMono_700Bold"],
      },
    },
  },
  plugins: [],
};
