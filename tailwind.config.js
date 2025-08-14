/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in-left': {
          '0%': {
            opacity: 0,
            transform: 'translate3d(-100%, 0, 0)',
          },
          '100%': {
            opacity: 1,
            transform: 'translate3d(0, 0, 0)',
          },
        },
        marquee: {
          '0%': {
            transform: 'translateX(0%)',
          },
          '10%': {
            transform: 'translateX(0%)',
          },
          '30%': {
            transform: 'translateX(-100%)',
          },
          '40%': {
            transform: 'translateX(-100%)',
          },
          '60%': {
            transform: 'translateX(0%)',
          },
          '100%': {
            transform: 'translateX(0%)',
          },
        },
      },
      animation: {
        fadeinleft: 'fade-in-left 1s ease-in-out 0.25s 1',
        marquee: 'marquee 15s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
