import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lab: {
          bg: "#08131A",
          dark: "#0B1A24",
          card: "#0E2433",
          cardHover: "#133145",
          border: "#1E3D52",
          cyan: "#00A3FF",
          cyanHover: "#008EE0",
          cyanLight: "#38BDF8",
          orange: "#FF6B35",
          orangeLight: "#FB923C",
          success: "#10B981",
          danger: "#EF4444",
          textMuted: "#8EADC1",
        }
      },
      backgroundImage: {
        'lab-gradient': 'linear-gradient(135deg, #071219 0%, #0B1D28 50%, #0E2838 100%)',
        'lab-card-gradient': 'linear-gradient(180deg, rgba(14, 36, 51, 0.85) 0%, rgba(9, 23, 33, 0.95) 100%)',
        'lab-cyan-gradient': 'linear-gradient(135deg, #00A3FF 0%, #0284C7 100%)',
        'lab-orange-gradient': 'linear-gradient(135deg, #FF6B35 0%, #EA580C 100%)',
      },
      boxShadow: {
        'glow-cyan': '0 0 25px rgba(0, 163, 255, 0.35)',
        'glow-orange': '0 0 25px rgba(255, 107, 53, 0.35)',
        'glow-card': '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(0, 163, 255, 0.15)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        }
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        pulseSlow: 'pulseSlow 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
export default config;
