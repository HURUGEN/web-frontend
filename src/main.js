import "./styles.css";
import { readApiBaseUrl } from "./app-config.js";

// Stores the application root that receives the minimal deployability status view.
const applicationRoot = document.querySelector("#app");

// Renders a compact status view proving that config.js was loaded before the application bundle.
function renderApplication() {
  // Stores the public runtime API address, or a clear fallback when no environment override is mounted.
  const apiBaseUrl = readApiBaseUrl(window) || "Not configured";

  applicationRoot.innerHTML = `
    <section class="application-status" aria-labelledby="application-title">
      <p class="eyebrow">Kubernetes delivery baseline</p>
      <h1 id="application-title">Web Frontend</h1>
      <dl>
        <div>
          <dt>Runtime API</dt>
          <dd data-testid="api-base-url">${apiBaseUrl}</dd>
        </div>
      </dl>
    </section>
  `;
}

// Starts rendering only after module dependencies and runtime configuration are available.
renderApplication();
