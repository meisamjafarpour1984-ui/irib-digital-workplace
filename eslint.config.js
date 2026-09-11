import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Core `no-undef`/`no-require-imports` are redundant in TS/ESM projects (tsc + bundler handle them)
    rules: {
      'no-undef': 'off',
      'no-require-imports': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/no-autofocus': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    ignores: [
      'node_modules/',
      '.next/',
      'dist/',
      'backend/',
      'public/sw.js',
      'load-testing/',
      'load-tests/',
      'scripts/',
      'jest.setup.js',
      'next.config.mjs',
      'vitest.config.ts',
      'playwright.config.ts',
      'proxy.ts',
      '.storybook/',
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/*.spec.tsx',
      '**/*.test.tsx',
    ],
  },
]
