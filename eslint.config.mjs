import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['test/**/*', 'server.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
