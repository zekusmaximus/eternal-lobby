// Use this if your project uses ES Modules (most SvelteKit projects do)
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    tailwindcss, // Use the imported package
    autoprefixer,
  ],
};