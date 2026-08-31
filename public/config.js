// Exposes only the public, environment-specific API address before the application bundle runs.
window.__APP_CONFIG__ = {
  // Supplies a non-sensitive default that Helm can replace through its runtime ConfigMap.
  API_BASE_URL: ""
};
