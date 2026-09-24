/** @type {import('tailwindcss').Config} */

// Every colour is a CSS variable holding "R G B" channels, defined in
// src/index.css for light and dark. That keeps Tailwind's opacity modifiers
// (text-ink/90, bg-black/60) working while one data-theme attribute on <html>
// switches the whole palette.
const v = (name) => `rgb(var(--c-${name}) / <alpha-value>)`
const scale = (family, steps) => Object.fromEntries(steps.map((step) => [step, v(`${family}-${step}`)]))

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep field green: actions, links, confirmation.
        brand: { ...scale('brand', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]), hover: v('brand-hover') },
        // Chrome green: masthead and token plate. Stays dark in both themes.
        forest: scale('forest', [800, 900]),
        // Grain amber: attention, in-progress, focus ring, priority.
        grain: scale('grain', [50, 100, 200, 500, 600, 700]),
        // Steel blue: "now serving", informational notices.
        steel: scale('steel', [50, 100, 500, 600]),
        danger: { ...scale('danger', [50, 100, 500, 600]), hover: v('danger-hover') },
        surface: v('surface'),
        paper: v('paper'),
        line: v('line'),
        ink: v('ink'),
        muted: v('muted'),
      },
      fontFamily: {
        sans: [
          '"Noto Sans"',
          '"Noto Sans Devanagari"',
          '"Noto Sans Kannada"',
          '"Noto Sans Tamil"',
          '"Noto Sans Telugu"',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        token: ['3.25rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      borderRadius: {
        DEFAULT: '4px',
        md: '4px',
        lg: '6px',
      },
      maxWidth: {
        content: '1100px',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.35', transform: 'scale(0.82)' },
        },
      },
      animation: {
        // The only ambient motion in the app: the "now serving" indicator.
        pulseDot: 'pulseDot 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
