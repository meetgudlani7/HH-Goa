import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';

export default [
  { ignores: ['dist/**', 'node_modules/**', 'test-screenshots/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // NOTE: this project has no vite.config.js right now, so Vite's default
      // esbuild JSX transform (classic, not automatic) is in effect — every
      // file using JSX needs `React` in scope. Do NOT apply the jsx-runtime
      // preset (which turns react-in-jsx-scope off) or ESLint will let
      // "React is not defined" runtime errors back in.
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/prop-types': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // This UI intentionally renders literal "// LIKE-A-CODE-COMMENT" strings
      // as visible decorative text (terminal/hacker aesthetic) throughout the
      // app — not accidental comments, so this rule is a false-positive here.
      'react/jsx-no-comment-textnodes': 'off',
    },
  },
  prettierConfig,
];
