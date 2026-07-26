module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
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
    'src/modules/communication/',
    'src/modules/iam/user-management.*',
    'src/modules/integration/',
    'src/modules/knowledge/',
    'src/modules/media/',
    'src/modules/mobile-identity/',
    'src/modules/organization/',
    'src/modules/software/',
    'src/modules/widget-engine/',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
}
