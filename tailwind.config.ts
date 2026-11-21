import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        darkorange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c', // Dark orange utama
          800: '#9a3412', // Dark orange pekat
          900: '#7c2d12', // Darkest rust orange
          950: '#431407',
        },
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'soft-md': '0 4px 12px -2px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 10px 25px -4px rgba(0, 0, 0, 0.1)',
        'glow-orange': '0 0 20px -3px rgba(194, 65, 12, 0.45)',
        'glow-dark': '0 0 20px -3px rgba(24, 24, 27, 0.35)',
      },
      keyframes: {
        pulseOrange: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(194, 65, 12, 0.5)' },
          '50%': { transform: 'scale(1.03)', boxShadow: '0 0 0 10px rgba(194, 65, 12, 0)' },
        },
      },
      animation: {
        'pulse-orange': 'pulseOrange 2s infinite',
      },
    },
  },
  plugins: [],
};
export default config;
