import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        'slide-down': 'slideDown 1.5s ease-out forwards'
      },
      colors: {
        'custom-green': {
          DEFAULT: '#415a55',
          '50': '#e3e8e7', // Color más claro
          '100': '#c8d0cf',
          '200': '#a9b5b2',
          '300': '#8a9b96',
          '400': '#6b8079',
          '500': '#415a55', // Color base
          '600': '#334846',
          '700': '#253637',
          '800': '#172427',
          '900': '#091218', // Color más oscuro
        }, 'navy': {
          100: '#e2e6ea',
          200: '#b8c2cc',
          300: '#8e9aab',
          400: '#64778b',
          500: '#3b546a',
          600: '#0e253a',
          700: '#0c1f32',
          800: '#0a1929',
          900: '#081321',
        },
        'complementary': {
          100: '#fde8d7',
          200: '#facbaf',
          300: '#f7ae87',
          400: '#f4915f',
          500: '#f17437',
          600: '#a64b00',
          700: '#803a00',
          800: '#592900',
          900: '#331800',
        }}
    },
  },
  plugins: [],
};
export default config;
