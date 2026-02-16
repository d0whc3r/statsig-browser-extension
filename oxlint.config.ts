import { defineConfig } from 'oxlint'

const JSX_MAX_DEPTH = 10
const ID_LENGTH_MAX = 40
const ID_LENGTH_MIN = 2
const MAX_LINES = 350
const MAX_LINES_PER_FUNCTION = 150

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
      rules: {
        'max-lines': 'off',
        'max-lines-per-function': 'off',
        'max-statements': 'off',
        'no-explicit-any': 'off',
        'no-magic-numbers': 'off',
        'typescript/consistent-type-imports': 'off',
        'typescript/no-explicit-any': 'off',
        'vitest/prefer-called-once': 'off',
      },
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
        'jsx-max-depth': ['warn', { max: JSX_MAX_DEPTH }],
        'jsx-no-new-object-as-prop': 'off',
        'jsx-props-no-spreading': 'off',
        'react-in-jsx-scope': 'off',
        'unicorn/filename-case': ['warn', { case: 'pascalCase' }],
      },
    },
    {
      files: ['**/*.config.{js,ts,mjs,cjs}', 'entrypoints/background.ts', 'entrypoints/content.ts'],
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
    {
      files: ['entrypoints/*/main.tsx'],
      rules: {
        'no-unassigned-import': 'off',
        'unicorn/filename-case': ['warn', { case: 'kebabCase' }],
      },
    },
  ],
  plugins: ['typescript', 'unicorn', 'oxc', 'import'],
  rules: {
    'eslint/no-unused-vars': 'error',
    'func-style': [
      'warn',
      'declaration',
      { allowArrowFunctions: true, overrides: { namedExports: 'ignore' } },
    ],
    'group-exports': 'off',
    'id-length': [
      'warn',
      {
        exceptions: ['i', 'j', 'k', 'x', 'y', 'z', 'T', 'K', 'Q', 'V'],
        max: ID_LENGTH_MAX,
        min: ID_LENGTH_MIN,
        properties: 'never',
      },
    ],
    'import/exports-last': 'off',
    'import/first': 'error',
    'import/no-amd': 'error',
    'import/no-commonjs': 'warn',
    'import/no-cycle': 'error',
    'import/no-default-export': 'error',
    'import/no-duplicates': 'error',
    'import/no-named-default': 'warn',
    'import/no-unresolved': 'error',
    'import/no-unused-modules': 'warn',
    'max-dependencies': 'off',
    'max-lines': ['warn', MAX_LINES],
    'max-lines-per-function': ['warn', MAX_LINES_PER_FUNCTION],
    'max-params': ['warn', 3],
    'no-array-for-each': 'off',
    'no-duplicate-imports': [
      'error',
      {
        allowSeparateTypeImports: true,
      },
    ],
    'no-inline-comments': 'off',
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
    'no-nested-ternary': 'off',
    'no-restricted-syntax': [
      'error',
      {
        message: 'Export objects are not allowed. Use inline exports instead.',
        selector: 'ExportNamedDeclaration[declaration=null][source=null]',
      },
    ],
    'no-ternary': 'allow',
    'prefer-default-export': 'off',
    'sort-imports': 'off',
    'typescript/no-explicit-any': 'warn',
    'typescript/no-unused-vars': 'warn',
    'unicorn/filename-case': ['warn', { case: 'kebabCase' }],
    'unicorn/no-nested-ternary': 'error',
    'unicorn/no-null': 'off',
    'unicorn/prevent-abbreviations': [
      'warn',
      { allowList: { Params: true, Props: true, Ref: true, params: true, props: true, ref: true } },
    ],
  },
})
