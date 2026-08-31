import test from "node:test";
import assert from "node:assert/strict";
import { readApiBaseUrl } from "./app-config.js";

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
