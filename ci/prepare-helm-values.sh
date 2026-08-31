#!/usr/bin/env sh

# Stops on an unset argument or failed copy so Helm never receives a partial values file.
set -eu

# Stores the optional ConfigMap-mounted, non-sensitive environment override source path.
source_file="${1:?source values file is required}"

# Stores the Agent-workspace destination consumed by every Helm command in the deploy stage.
output_file="${2:?output values file is required}"

# Creates the workspace directory without modifying the repository's reviewed default values file.
mkdir -p "$(dirname "$output_file")"

# Copies an available override or writes an empty mapping to preserve the Chart's default values.
if [ -f "$source_file" ]; then
  cp "$source_file" "$output_file"
else
  printf '{}\n' > "$output_file"
fi
