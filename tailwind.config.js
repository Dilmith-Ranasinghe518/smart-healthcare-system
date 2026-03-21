/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        "primary-hover": "#4338CA",
        secondary: "#10B981",
        accent: "#F43F5E",
        darkbg: "#0F172A",
        surface: "#1E293B",
        "surface-light": "#334155",
      }
    },
  },
  plugins: [],
}
