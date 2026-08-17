/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.jsx",
    "./resources/**/*.ts",
    "./resources/**/*.tsx",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0B2A4A',
        secondary: '#B08D57',
        surface: '#F8FAFC',
        muted: '#F1F5F9',
        border: '#E2E8F0',
        text: '#0F172A',
        link: '#1D4ED8',
        danger: '#DC2626',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(15, 23, 42, 0.08)',
        card: '0 16px 36px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        xl: '1rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}