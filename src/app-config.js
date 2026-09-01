// Names the browser global that carries ConfigMap-provided runtime configuration.
export const APP_CONFIG_KEY = "__APP_CONFIG__";

// Names the only public configuration field consumed by this baseline application.
export const API_BASE_URL_KEY = "API_BASE_URL";

// Defines the non-sensitive Spring Boot health route used to prove browser-to-API connectivity.
export const API_HEALTH_PATH = "/actuator/health";

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

// Builds a credential-free health-check URL from the public runtime API base URL.
export function createApiHealthUrl(apiBaseUrl) {
  // Stores the parsed API address so its scheme and embedded credentials can be checked before a browser request.
  let parsedApiUrl;

  try {
    parsedApiUrl = new URL(apiBaseUrl);
  } catch {
    return "";
  }

  if (
    !["http:", "https:"].includes(parsedApiUrl.protocol) ||
    parsedApiUrl.username ||
    parsedApiUrl.password
  ) {
    return "";
  }

  // Stores the configured API path without its trailing slash before appending the fixed health route.
  const normalizedPath = parsedApiUrl.pathname.replace(/\/+$/, "");

  parsedApiUrl.pathname = `${normalizedPath}${API_HEALTH_PATH}`;
  parsedApiUrl.search = "";
  parsedApiUrl.hash = "";

  return parsedApiUrl.toString();
}
