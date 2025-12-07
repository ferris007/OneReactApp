// eslint.config.js
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const react = require('eslint-plugin-react');

module.exports = [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Add globals for your environment
        browser: true,
        node: true,
        es2021: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': react,
    },
    rules: {
      ...tseslint.configs['recommended'].rules,
      ...react.configs['recommended'].rules,
      // You can add or override rules here
      'react/react-in-jsx-scope': 'off', // Not needed with modern React/Expo
    },
  },
];