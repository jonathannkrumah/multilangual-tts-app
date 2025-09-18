#!/usr/bin/env bash
set -euo pipefail

# Use current directory as root if not already set
ROOT_DIR="${ROOT_DIR:-$(pwd)}"
INFRA_DIR="${INFRA_DIR:-$ROOT_DIR/infrastructure}"
APP_DIR="${APP_DIR:-$ROOT_DIR/frontend/tts-frontend}"

# Get Terraform outputs
API_URL=$(terraform -chdir="$INFRA_DIR" output -raw tts_api_invoke_url)
FRONTEND_BUCKET=$(terraform -chdir="$INFRA_DIR" output -raw frontend_url | awk -F'.s3' '{print $1}')

# Validate outputs
if [[ -z "$API_URL" ]]; then
  echo "Failed to resolve API URL from Terraform outputs" >&2
  exit 1
fi

if [[ -z "$FRONTEND_BUCKET" ]]; then
  echo "Failed to resolve frontend bucket name from outputs" >&2
  exit 1
fi

cd "$APP_DIR"

# Install dependencies if missing
if [[ ! -d node_modules ]]; then
  npm ci --no-audit --no-fund
fi

# Build frontend with API URL injected
REACT_APP_TTS_API_URL="$API_URL" npm run build

# Sync to S3 bucket
aws s3 sync build/ "s3://$FRONTEND_BUCKET" --delete --cache-control "public, max-age=300" --exclude "*.html"
aws s3 sync build/ "s3://$FRONTEND_BUCKET" --delete --cache-control "no-cache" --content-type "text/html" --exclude "*" --include "*.html"

# Print access URL
SITE_URL=$(terraform -chdir="$INFRA_DIR" output -raw frontend_url)
echo "Deployed. Access the app at: https://$SITE_URL"
