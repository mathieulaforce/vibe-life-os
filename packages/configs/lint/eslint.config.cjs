const path = require('node:path');

const tsConfigPath = path.join(__dirname, '../../../apps/web/tsconfig.app.json');

module.exports = [
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
    ],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: [tsConfigPath],
        tsconfigRootDir: path.join(__dirname, '../../..'),
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      '@angular-eslint': require('@angular-eslint/eslint-plugin'),
      '@angular-eslint/template': require('@angular-eslint/eslint-plugin-template'),
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.html'],
    plugins: {
      '@angular-eslint/template': require('@angular-eslint/eslint-plugin-template'),
    },
    rules: {},
  },
];
