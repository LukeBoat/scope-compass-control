module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  ignorePatterns: [
    'lib/**/*',
    'dist/**/*',
    'node_modules/**/*'
  ],
  rules: {
    'no-restricted-globals': ['off'],
    'no-unused-vars': ['off'],
    'no-undef': ['off'],
  },
}; 