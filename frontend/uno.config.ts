import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    colors: {
      brand: {
        DEFAULT: "rgb(var(--brand) / <alpha-value>)",
        dark: "#16a34a",
        light: "#86efac",
      },
      surface: {
        DEFAULT: "rgb(var(--surface-bg) / <alpha-value>)",
        card: "rgb(var(--surface-card) / <alpha-value>)",
        elevated: "rgb(var(--surface-elevated) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
      },
      text: {
        primary: "rgb(var(--text-primary) / <alpha-value>)",
        secondary: "rgb(var(--text-secondary) / <alpha-value>)",
      },
      good: {
        DEFAULT: "#22c55e",
        bg: "rgba(34, 197, 94, 0.1)",
        border: "rgba(34, 197, 94, 0.35)",
        glow: "rgba(34, 197, 94, 0.25)",
      },
      damaged: {
        DEFAULT: "#f59e0b",
        bg: "rgba(245, 158, 11, 0.1)",
        border: "rgba(245, 158, 11, 0.35)",
        glow: "rgba(245, 158, 11, 0.25)",
      },
      spoiled: {
        DEFAULT: "#ef4444",
        bg: "rgba(239, 68, 68, 0.1)",
        border: "rgba(239, 68, 68, 0.35)",
        glow: "rgba(239, 68, 68, 0.25)",
      },
    },
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "monospace"],
    },
    animation: {
      keyframes: {
        "fade-in": "{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}",
        "pulse-glow": "{0%,100%{box-shadow:0 0 12px var(--glow-color)}50%{box-shadow:0 0 28px var(--glow-color)}}",
        "spin-slow": "{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}",
        shimmer: "{0%{background-position:-200% 0}100%{background-position:200% 0}}",
      },
      durations: {
        "fade-in": "0.4s",
        "pulse-glow": "2s",
        "spin-slow": "3s",
        shimmer: "2s",
      },
      timingFns: {
        "fade-in": "ease-out",
        "pulse-glow": "ease-in-out",
        shimmer: "linear",
      },
      counts: {
        "pulse-glow": "infinite",
        "spin-slow": "infinite",
        shimmer: "infinite",
      },
    },
  },
  shortcuts: {
    "glass-card":
      "bg-surface-card border border-surface-border rounded-2xl backdrop-blur-sm",
    "glass-card-elevated":
      "bg-surface-elevated border border-surface-border rounded-2xl",
    "btn-primary":
      "bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer",
    "text-gradient":
      "bg-gradient-to-r from-brand to-emerald-400 bg-clip-text text-transparent",
  },
});
