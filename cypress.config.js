const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: 'eqfhu7',
  allowCypressEnv: false,

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      return config;
    },
  },
});
