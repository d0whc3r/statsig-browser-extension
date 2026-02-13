import { defineConfig } from 'oxlint'

export default defineConfig({
  categories: {
    correctness: 'error',
    nursery: 'off',
    pedantic: 'warn',
    perf: 'warn',
    restriction: 'off',
    style: 'warn',
    suspicious: 'warn',
  },
  ignorePatterns: [
    '.git',
    'dist',
    'coverage',
    'node_modules',
    'pnpm-lock.yaml',
    'public/build',
    'build',
    '.agents',
    '.specify',
    'specs',
  ],
  overrides: [
    {
      env: {
        'vitest/globals': true,
      },
      files: ['**/*.{test,spec}.{ts,tsx,js,jsx}', '**/__tests__/**'],
      plugins: ['vitest'],
    },
    {
      files: ['*.d.ts'],
      rules: {
        'no-unassigned-import': 'off',
        'triple-slash-reference': 'off',
        unambiguous: 'off',
      },
    },
    {
      files: ['**/*.tsx'],
      plugins: ['jsx-a11y', 'react', 'react-perf'],
      rules: {
        'jsx-max-depth': ['warn', { max: 10 }],
        'jsx-props-no-spreading': 'off',
        'react-in-jsx-scope': 'off',
        'unicorn/filename-case': ['warn', { case: 'pascalCase' }],
      },
    },
    {
      files: ['vitest.config.ts'],
      rules: {
        'import/no-default-export': 'off',
        'no-nodejs-modules': 'off',
      },
    },
    {
      files: ['**/components/ui/*.tsx', '**/lib/utils.ts'],
      rules: {
        'func-style': 'off',
        'import/no-namespace': 'off',
        'unicorn/filename-case': ['warn', { case: 'kebabCase' }],
      },
    },
  ],
  plugins: ['typescript', 'unicorn', 'oxc', 'import'],
  rules: {
    'eslint/no-unused-vars': 'error',
    'group-exports': 'off',
    'id-length': [
      'warn',
      { exceptions: ['i', 'j', 'k', 'x', 'y', 'z'], max: 30, min: 2, properties: 'never' },
    ],
    'import/first': 'error',
    'import/no-amd': 'error',
    'import/no-commonjs': 'warn',
    'import/no-cycle': 'error',
    'import/no-duplicates': 'error',
    'import/no-named-default': 'warn',
    'import/no-unresolved': 'error',
    'import/no-unused-modules': 'warn',
    'max-dependencies': 'off',
    'no-array-for-each': 'off',
    'no-duplicate-imports': [
      'error',
      {
        allowSeparateTypeImports: true,
      },
    ],
    'no-magic-numbers': [
      'warn',
      {
        ignore: [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true,
        ignoreNumericLiteralTypes: true,
        ignoreReadonlyClassProperties: true,
        ignoreTypeIndexes: true,
      },
    ],
    'no-named-export': 'allow',
    'no-ternary': 'allow',
    'prefer-default-export': 'off',
    'sort-imports': 'off',
    'typescript/no-explicit-any': 'warn',
    'typescript/no-unused-vars': 'warn',
    'unicorn/filename-case': ['warn', { case: 'kebabCase' }],
    'unicorn/prevent-abbreviations': [
      'warn',
      { allowList: { Params: true, Props: true, Ref: true, params: true, props: true, ref: true } },
    ],
  },
})
