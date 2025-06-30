export default {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'mantine-breakpoint-xs': '40rem', // Tailwind's `sm` breakpoint (640px)
        'mantine-breakpoint-sm': '48rem', // Tailwind's `md` breakpoint (768px)
        'mantine-breakpoint-md': '64rem', // Tailwind's `lg` breakpoint (1024px)
        'mantine-breakpoint-lg': '80rem', // Tailwind's `xl` breakpoint (1280px)
        'mantine-breakpoint-xl': '96rem', // Tailwind's `2xl` breakpoint (1536px)
      },
    },
  },
};
