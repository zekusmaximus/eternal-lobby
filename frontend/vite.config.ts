
// frontend/vite.config.js
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite'; // Make sure sveltekit plugin is included

export default defineConfig({
  plugins: [sveltekit()], // Keep other plugins like sveltekit()

  // Add other existing config options if you have them
});