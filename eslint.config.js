const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/*', '.expo/*', 'node_modules/*'] },
  {
    // Node scripts run outside the app (CI); web-push is installed only in the push workflow.
    files: ['scripts/**'],
    rules: {
      'expo/no-env-var-destructuring': 'off',
      'import/no-unresolved': ['error', { ignore: ['^web-push$'] }],
    },
  },
]);
