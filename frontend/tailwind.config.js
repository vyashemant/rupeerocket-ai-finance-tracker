/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        surfaceAlt: 'var(--color-surface-alt)',
        text: 'var(--color-text)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
        accent: 'var(--color-accent)',
        accentSoft: 'var(--color-accent-soft)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
      },
      boxShadow: {
        soft: '0 20px 80px rgba(2, 6, 23, 0.12)',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at top left, rgba(59, 130, 246, 0.25), transparent 40%), radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.18), transparent 30%)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}