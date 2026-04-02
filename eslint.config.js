import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],

      // Item 1: Prevent calling store getter functions inside Zustand selectors
      // Pattern: useWorkoutStore((s) => s.someGetter())  ← BAD, causes infinite re-renders
      // Correct: useWorkoutStore((s) => s.someGetter)    ← get the fn reference, call in useMemo
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'CallExpression[callee.name="useWorkoutStore"] > ArrowFunctionExpression > CallExpression > MemberExpression[object.name="s"]',
          message:
            'Do NOT call store getters inside selectors (e.g. s.getFoo()). ' +
            'This creates new values on every render → infinite loop. ' +
            'Instead, select the function reference and call it in useMemo.',
        },
      ],
    },
  },
])
