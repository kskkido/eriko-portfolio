import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,svelte,ts,tsx,vue}'],
  theme: {
    fontSize: {
      xs: '0.7rem',
      sm: '0.825rem',
      base: '0.925rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.563rem',
      '3xl': '1.853rem',
      '4xl': '2.441rem',
      '5xl': '3rem',
    },
  },
} satisfies Config;
