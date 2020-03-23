module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'google',
    'prettier',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  env: {
    browser: true,
  },
  plugins: ['html', 'lit', '@typescript-eslint'],
  rules: {
    'max-len': [
      'error',
      {
        ignoreTemplateLiterals: true,
        ignoreStrings: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'no-var': 'error',
    'require-jsdoc': 'off',
    'arrow-parens': 'off',
    'no-console': 'off',
    'new-cap': 'off',
    'brace-style': [2, '1tbs'],
    'no-loop-func': 'error',
    'no-await-in-loop': 'error',
    'no-useless-call': 'error',
    'padded-blocks': [
      'error',
      {
        blocks: 'never',
        classes: 'never',
        switches: 'never',
      },
    ],
    'space-in-parens': 'error',
  },
  globals: {
    customElements: false,
  },
};
