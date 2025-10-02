import globals from 'globals'
import js from '@eslint/js'
import stylisticJs from '@stylistic/eslint-plugin-js'
import pluginReact from 'eslint-plugin-react'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: { globals: globals.browser }
  },
  pluginReact.configs.flat.recommended,
  {
    plugins: {
      '@stylistic/js': stylisticJs,
    },
    rules: {
      '@stylistic/js/indent': ['error', 2],
      '@stylistic/js/linebreak-style': ['error', 'unix'],
      '@stylistic/js/quotes': ['error', 'single'],
      '@stylistic/js/semi': ['error', 'never'],
      eqeqeq: 'error',
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      'arrow-spacing': ['error', { before: true, after: true }],
      'no-console': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
    },
  }
]