/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Senzio brand tokens
        senzio: {
          purple: "#8B5CF6",
          cyan: "#06B6D4",
          dark: "#05050A",
          surface: "#0F0F1A",
          "surface-hover": "#181829",
          blue: {
            DEFAULT: "#006FFF",
            50:  "#E5F0FF",
            100: "#CCE1FF",
            200: "#99C3FF",
            300: "#66A5FF",
            400: "#3387FF",
            500: "#006FFF",
            600: "#0059CC",
            700: "#004399",
            800: "#002D66",
            900: "#001633",
          },
          teal: {
            DEFAULT: "#0D9488",
            50:  "#F0FDFA",
            100: "#CCFBF1",
            500: "#14B8A6",
            600: "#0D9488",
            700: "#0F766E",
          },
          amber: {
            DEFAULT: "#D97706",
            50:  "#FFFBEB",
            100: "#FEF3C7",
            500: "#F59E0B",
            600: "#D97706",
            700: "#B45309",
          },
        },
        // Sidebar tokens
        sidebar: {
          bg: "hsl(var(--sidebar-bg))",
          border: "hsl(var(--sidebar-border))",
          text: "hsl(var(--sidebar-text))",
          hover: "hsl(var(--sidebar-hover))",
          active: "hsl(var(--sidebar-active))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'blue-glow': '0 0 0 3px rgb(59 130 246 / 0.15)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          from: { opacity: 0, transform: "translateY(4px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: 0, transform: "translateX(8px)" },
          to:   { opacity: 1, transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.25s ease-out",
        "slide-in-right": "slide-in-right 0.2s ease-out",
        "pulse-soft": "pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 1.5s infinite linear",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
