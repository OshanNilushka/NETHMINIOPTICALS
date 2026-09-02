// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  {
    ignores: ['eslint.config.mjs', 'generated/**/*'],
  },
  eslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: 'module',
      ecmaVersion: 'latest',
    },
  },
  {
    rules: {
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
];
