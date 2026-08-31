{{/* Returns the stable chart name used in generated resource names and labels. */}}
{{- define "web-frontend.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/* Returns the release-qualified base name so independent releases do not collide. */}}
{{- define "web-frontend.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else if contains (include "web-frontend.name" .) .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name (include "web-frontend.name" .) | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/* Returns selector labels that must remain immutable across Deployment, Service, and Pods. */}}
{{- define "web-frontend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "web-frontend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/* Returns standard resource labels while preserving the immutable selector labels. */}}
{{- define "web-frontend.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{ include "web-frontend.selectorLabels" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/* Returns the repository-at-digest reference required for every deployed container. */}}
{{- define "web-frontend.image" -}}
{{- /* Stores the immutable repository input supplied by reviewed values or CI. */ -}}
{{- $repository := required "image.repository is required" .Values.image.repository -}}
{{- /* Stores the BuildKit digest input so a mutable tag cannot reach the Deployment. */ -}}
{{- $digest := required "image.digest is required" .Values.image.digest -}}
{{- printf "%s@%s" $repository $digest -}}
{{- end }}
