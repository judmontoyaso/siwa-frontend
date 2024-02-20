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
        }}
    },
  },
  plugins: [],
};
export default config;
