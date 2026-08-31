// Names the browser global that carries ConfigMap-provided runtime configuration.
export const APP_CONFIG_KEY = "__APP_CONFIG__";

// Names the only public configuration field consumed by this baseline application.
export const API_BASE_URL_KEY = "API_BASE_URL";

// Reads and normalizes the optional public API base URL without accepting credentials or build-time values.
export function readApiBaseUrl(globalObject = globalThis) {
  // Stores the runtime configuration object supplied by public/config.js or the mounted ConfigMap file.
  const runtimeConfig = globalObject?.[APP_CONFIG_KEY];
  // Stores the candidate API address only when the expected field is a string.
  const candidateUrl = runtimeConfig?.[API_BASE_URL_KEY];

  if (typeof candidateUrl !== "string") {
    return "";
  }

  // Removes trailing slashes so later route joins remain deterministic.
  return candidateUrl.trim().replace(/\/+$/, "");
}
