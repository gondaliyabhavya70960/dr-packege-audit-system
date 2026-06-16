/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  // The app is currently styled with inline styles + one global stylesheet.
  // Tailwind is added additively: preflight (the base reset) is OFF so existing
  // visuals are untouched. Turn it on once components are migrated to utilities.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        accent: { DEFAULT: '#8E0E22', soft: 'rgba(142,14,34,0.08)' },
        ink: '#0F1115',
        mute: '#6B7280',
        hairline: '#F0F1F3',
        ok: '#0E8A50',
        warn: '#9A6A00',
        danger: '#C62B22',
      },
      fontFamily: {
        sans: ['Figtree', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: { card: '18px' },
      boxShadow: { card: '0 1px 2px rgba(15,17,21,0.05), 0 14px 32px -22px rgba(15,17,21,0.28)' },
    },
  },
  plugins: [],
};
