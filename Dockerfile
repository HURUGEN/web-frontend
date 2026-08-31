# Pins the Node builder version so npm ci and Vite run reproducibly in CI.
FROM node:24.15.0-bookworm-slim AS build

# Keeps all build-time source and npm state inside one container work directory.
WORKDIR /app

# Copies dependency manifests first so the npm ci layer can be reused when application source changes.
COPY package.json package-lock.json ./

# Installs only the exact dependency graph committed in package-lock.json.
RUN npm ci

# Copies the reviewed repository content after dependency installation has completed.
COPY . .

# Produces the Vite static artifact consumed by the Nginx runtime stage.
RUN npm run build

# Pins the minimal Nginx runtime version; this stage deliberately contains no Node dependencies.
FROM nginx:1.29.1-alpine

# Replaces the default virtual host with SPA routing and config.js cache rules.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copies only static build output from the Node builder into Nginx's web root.
COPY --from=build /app/dist /usr/share/nginx/html

# Documents the internal HTTP port that the ClusterIP Service forwards to.
EXPOSE 80

# Confirms that the Nginx process can serve the application's static entrypoint.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
