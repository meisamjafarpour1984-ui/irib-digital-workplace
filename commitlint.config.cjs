/* eslint-disable no-undef */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting (no code change)
        'refactor', // Code refactoring
        'perf',     // Performance
        'test',     // Tests
        'build',    // Build system
        'ci',       // CI
        'chore',    // Other changes
        'revert',   // Revert
      ],
    ],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [1, 'always', 200],
  },
}
