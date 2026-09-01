import "./styles.css";
import { createApiHealthUrl, readApiBaseUrl } from "./app-config.js";

// Stores the application root that receives the minimal deployability status view.
const applicationRoot = document.querySelector("#app");

// Defines the maximum browser wait for the non-mutating API health request.
const API_REQUEST_TIMEOUT_MS = 5000;

// Updates the page with the current non-sensitive API health-check outcome.
function setApiHealthStatus(statusText, isHealthy) {
  // Stores the status element rendered with the application status view.
  const apiHealthStatusElement = document.querySelector("#api-health-status");

  apiHealthStatusElement.textContent = statusText;
  apiHealthStatusElement.dataset.state = isHealthy ? "healthy" : "unhealthy";
}

// Requests the configured Spring Boot health endpoint without forwarding credentials or browser cookies.
async function checkApiHealth(apiHealthUrl) {
  if (!apiHealthUrl) {
    setApiHealthStatus("Runtime API is not configured safely.", false);
    return;
  }

  // Stores the controller used to end an unavailable API request after the fixed training timeout.
  const requestController = new AbortController();
  // Stores the timeout handle so it can be released immediately after the request settles.
  const requestTimeout = window.setTimeout(
    () => requestController.abort(),
    API_REQUEST_TIMEOUT_MS
  );

  try {
    // Stores the HTTP response from the public health endpoint; no Authorization header or credential mode is used.
    const healthResponse = await fetch(apiHealthUrl, {
      credentials: "omit",
      headers: { Accept: "application/json" },
      signal: requestController.signal
    });

    if (!healthResponse.ok) {
      setApiHealthStatus(`API returned HTTP ${healthResponse.status}.`, false);
      return;
    }

    // Stores the optional Spring Boot health payload for the user-visible success state.
    const healthPayload = await healthResponse.json().catch(() => ({}));
    // Stores the health state returned by the API without assuming a response schema outside the standard status field.
    const healthStatus = typeof healthPayload.status === "string" ? healthPayload.status : "available";

    setApiHealthStatus(`API health: ${healthStatus}.`, healthStatus === "UP");
  } catch (error) {
    // Stores an intentional timeout description or a non-sensitive browser/network failure message.
    const failureReason = error.name === "AbortError" ? "request timed out" : "network or CORS request failed";

    setApiHealthStatus(`API health check failed: ${failureReason}.`, false);
  } finally {
    window.clearTimeout(requestTimeout);
  }
}

// Renders a compact status view proving that config.js was loaded before the application bundle.
function renderApplication() {
  // Stores the public runtime API address, or a clear fallback when no environment override is mounted.
  const apiBaseUrl = readApiBaseUrl(window) || "Not configured";
  // Stores the validated health URL derived from the API base URL before it is requested.
  const apiHealthUrl = createApiHealthUrl(apiBaseUrl);

  applicationRoot.innerHTML = `
    <section class="application-status" aria-labelledby="application-title">
      <p class="eyebrow">Kubernetes delivery baseline</p>
      <h1 id="application-title">Web Frontend</h1>
      <dl>
        <div>
          <dt>Runtime API</dt>
          <dd data-testid="api-base-url" id="api-base-url"></dd>
        </div>
        <div>
          <dt>API health</dt>
          <dd data-testid="api-health-status" id="api-health-status" data-state="pending">Checking API health.</dd>
        </div>
      </dl>
    </section>
  `;

  // Stores the runtime API element so untrusted ConfigMap text is assigned as text rather than interpolated HTML.
  const apiBaseUrlElement = document.querySelector("#api-base-url");

  apiBaseUrlElement.textContent = apiBaseUrl;
  void checkApiHealth(apiHealthUrl);
}

// Starts rendering only after module dependencies and runtime configuration are available.
renderApplication();
