module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    ecmaVersion: 2021,
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [
    'dist/',
    'src/modules/access-control/',
    'src/modules/analytics/',
    'src/modules/integration/',
    'src/modules/knowledge/',
    'src/modules/media/',
    'src/modules/mobile-identity/',
    'src/modules/organization/',
    'src/modules/software/',
    'src/modules/widget-engine/',
    '**/*.spec.ts',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
}
