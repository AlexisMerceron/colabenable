import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Permet d'utiliser des fonctions globales comme `describe`, `test`, etc.
    environment: 'jsdom', // Simule un environnement navigateur.
    setupFiles: './vitest.setup.ts', // Fichier contenant les configurations globales pour les tests.
    coverage: {
      reporter: ['text', 'json', 'html'], // Génère des rapports de couverture.
      exclude: ['node_modules/', 'dist/', 'tests/', 'setupTests.ts'], // Exclut certains fichiers de la couverture.
    },
  },
  resolve: {
    alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/UI/Components'),
        '@pages': path.resolve(__dirname, 'src/UI/Pages'),
        '@utils': path.resolve(__dirname, 'src/Utils'),
        '@hooks': path.resolve(__dirname, 'src/Hooks'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        'echarts-for-react': path.resolve(__dirname, './__mocks__/echarts-for-react.ts'), // Mock pour `echarts-for-react`.
    },
  },
});