# Jenkins Project Variable Notes

`jenkins-project.json` remains strict JSON because `jenkins-json-build` reads it directly. JSON has no comment syntax, so this file documents each variable group without making the pipeline configuration invalid.

| Variable group | Purpose | Review rule |
| --- | --- | --- |
| `NPM_*`, `BUILD_ARTIFACTS`, `ENABLE_*` | Configures the inherited `node-npm-kubernetes` stages to run `npm ci`, `npm test`, and `npm run build`, producing `dist/**`. | Do not replace `ci` with `install`, and do not move image build ahead of these inherited stages. |
| `NODE_*` | Pins the non-root Node image, writable temporary home, and bounded resources. | `NODE_IMAGE` must be a manifest digest and `NODE_USER_HOME` must match the Node volume mount. |
| `JNLP_*` | Pins the Jenkins inbound Agent image and working directory. | It shares the Jenkins workspace but has no Kubernetes API token. |
| `IMAGE_REPOSITORY`, `BUILDKIT_CACHE_REF` | Sets the GHCR image destination and adjacent remote cache. | Repository is `ghcr.io/hurugen/web-frontend`; cache must be the same repository's `:buildcache` tag. |
| `BUILDKIT_*`, `IMAGE_BUILDER_*` | Pins Rootless BuildKit, registry config mount, state path, and resource limits. | Keep the digest, UID/GID, `--oci-worker-no-process-sandbox` exception, and narrow `SETUID`/`SETGID` capabilities. |
| `HELM_*`, `CI_NAMESPACE`, `KUBE_NAMESPACE`, `DEPLOY_SERVICE_ACCOUNT` | Pins Helm, the Jenkins Agent namespace, release history, Chart, target namespace, and the pre-created deploy identity. | Namespaces must exist already; `createNamespace` is deliberately false. |
| `POD_*`, `HELM_OVERRIDE_*`, `BUILD_PROXY_CONFIG_MAP` | Keeps Pod identity, optional deployment overrides, and proxy configuration consistent across JSON and Agent YAML. | ConfigMaps contain no credentials; only Helm receives `deploy-api`. |

The `image` stage is declared after the inherited Node stages. It produces `IMAGE_DIGEST`; every `lint`, `template`, and `upgrade` call in the following `deploy` stage sets `image.repository` and `image.digest` from that output. `status` is last, so a release cannot be treated as complete before Helm confirms it.
