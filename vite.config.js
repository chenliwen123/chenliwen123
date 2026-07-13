import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-three',
              test: /node_modules[\\/](@react-three|three)[\\/]/,
              priority: 2,
              maxSize: 450 * 1024,
            },
          ],
        },
      },
    },
  },
});
