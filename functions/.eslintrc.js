/* eslint-disable no-undef */
module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json'],
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  plugins: [
    '@typescript-eslint'
  ],
  ignorePatterns: [
    '/lib/**/*',
    '/dist/**/*',
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      rules: {
        'no-restricted-globals': ['off'],
        'no-unused-vars': ['off'],
        '@typescript-eslint/no-unused-vars': ['off'],
        'no-undef': ['off'],
      },
    },
  ],
};
