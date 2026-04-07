/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: "#ecf3fa",
          100: "#bfd4e8",
          200: "#bfd4e8",
          300: "#8da6bb",
          400: "#8da6bb",
          500: "#93a75c",
          600: "#697d49",
          700: "#697d49",
          800: "#24371e",
          900: "#24371e",
        },
        soil: {
          50: "#ecf3fa",
          100: "#bfd4e8",
          200: "#8da6bb",
          300: "#93a75c",
          400: "#697d49",
          500: "#24371e",
          600: "#24371e",
          700: "#24371e",
          800: "#24371e",
          900: "#24371e",
        },
        sun: {
          50: "#ecf3fa",
          100: "#bfd4e8",
          200: "#8da6bb",
          300: "#93a75c",
          400: "#697d49",
          500: "#24371e",
        },
      },
      fontFamily: {
        display: ["Sora", "Noto Sans", "sans-serif"],
        body: ["Noto Sans", "Manrope", "sans-serif"],
      },
      boxShadow: {
        soft: "0 12px 40px rgba(34, 64, 22, 0.10)",
        float: "0 24px 60px rgba(27, 51, 33, 0.16)",
        card: "0 18px 40px rgba(37, 49, 34, 0.09)",
      },
    },
  },
  plugins: [],
};
