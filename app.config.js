// Extends app.json. WEB_BASE_URL is set by the GitHub Pages build so the site works
// under https://<user>.github.io/<repo>/; it stays unset for local dev and Expo Go.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.WEB_BASE_URL ? { baseUrl: process.env.WEB_BASE_URL } : {}),
  },
});
