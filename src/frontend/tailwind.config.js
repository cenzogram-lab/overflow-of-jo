/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Lato', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'oklch(var(--background) / <alpha-value>)',
        foreground: 'oklch(var(--foreground) / <alpha-value>)',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Brand palette
        'cream-light': 'oklch(97% 0.012 75)',
        'cream-dark': 'oklch(88% 0.025 75)',
        'brown-light': 'oklch(62% 0.07 60)',
        'brown-mid': 'oklch(48% 0.07 55)',
        'brown-dark': 'oklch(28% 0.05 50)',
        'accent-yellow': 'var(--accent-yellow)',
        // Admin palette
        'admin-bg': 'var(--admin-bg)',
        'admin-card': 'var(--admin-card)',
        'admin-input': 'var(--admin-input)',
        'admin-border': 'var(--admin-border)',
        'admin-text': 'var(--admin-text)',
        'admin-muted': 'var(--admin-muted)',
        'admin-accent': 'var(--admin-accent)',
        'admin-accent-hover': 'var(--admin-accent-hover)',
        'admin-accent-text': 'var(--admin-accent-text)',
      },
      boxShadow: {
        'warm': '0 2px 12px 0 oklch(28% 0.05 50 / 0.12)',
        'warm-sm': '0 1px 6px 0 oklch(28% 0.05 50 / 0.10)',
        'warm-lg': '0 6px 28px 0 oklch(28% 0.05 50 / 0.18)',
        'yellow-glow': '0 0 0 3px oklch(82% 0.16 85 / 0.35)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
};
