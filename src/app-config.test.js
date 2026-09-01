import test from "node:test";
import assert from "node:assert/strict";
import { createApiHealthUrl, readApiBaseUrl } from "./app-config.js";

// Verifies that a public runtime address is normalized before the application renders it.
test("readApiBaseUrl removes surrounding whitespace and trailing slashes", () => {
  // Supplies a browser-like global object with a non-sensitive runtime API address.
  const testGlobalObject = {
    __APP_CONFIG__: {
      API_BASE_URL: " https://api.cloud.k8s.lab/ "
    }
  };

  assert.equal(readApiBaseUrl(testGlobalObject), "https://api.cloud.k8s.lab");
});

// Verifies that an absent runtime configuration resolves safely instead of reading build-time environment values.
test("readApiBaseUrl returns an empty string when runtime configuration is absent", () => {
  // Supplies an empty browser-like global object.
  const testGlobalObject = {};

  assert.equal(readApiBaseUrl(testGlobalObject), "");
});

// Verifies that the browser API check uses the expected health route and drops query-string configuration noise.
test("createApiHealthUrl appends the actuator health route to a public API base URL", () => {
  // Supplies a public API address with an optional path and query string from a browser-like runtime configuration.
  const apiBaseUrl = "https://api.cloud.k8s.lab/backend/?ignored=true";

  assert.equal(
    createApiHealthUrl(apiBaseUrl),
    "https://api.cloud.k8s.lab/backend/actuator/health"
  );
});

// Verifies that an address carrying embedded credentials cannot become a browser request target.
test("createApiHealthUrl rejects runtime API URLs with embedded credentials", () => {
  // Supplies an intentionally unsafe URL fixture that must not be requested by the browser.
  const unsafeApiBaseUrl = "https://operator:secret@api.cloud.k8s.lab";

  assert.equal(createApiHealthUrl(unsafeApiBaseUrl), "");
});
