#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/home/nkrumah/Documents/projects/AZUBI-CAPSTONE-PROJECT/multilangual-tts-app"
INFRA_DIR="$ROOT_DIR/infrastructure/outputs.tf"
APP_DIR="$ROOT_DIR/frontend/tts-frontend"

API_URL=$(terraform -chdir="$INFRA_DIR" output -raw tts_api_invoke_url)
FRONTEND_BUCKET=$(terraform -chdir="$INFRA_DIR" output -raw frontend_url | awk -F'.s3' '{print $1}')
# If CloudFront were enabled, we'd use frontend_url as domain. For S3, we also need bucket name.
# Our outputs give the S3 regional domain; derive bucket name as prefix before .s3

if [[ -z "$API_URL" ]]; then
  echo "Failed to resolve API URL from Terraform outputs" >&2
  exit 1
fi

if [[ -z "$FRONTEND_BUCKET" ]]; then
  echo "Failed to resolve frontend bucket name from outputs" >&2
  exit 1
fi

cd "$APP_DIR"

# Install deps if node_modules missing
if [[ ! -d node_modules ]]; then
  npm ci --no-audit --no-fund
fi

# Build with API URL injected
REACT_APP_TTS_API_URL="$API_URL" npm run build

# Sync to S3 bucket (public read is handled by Terraform when CloudFront disabled)
aws s3 sync build/ "s3://$FRONTEND_BUCKET" --delete --cache-control "public, max-age=300" --exclude "*.html"
# Ensure HTML files are not cached aggressively
aws s3 sync build/ "s3://$FRONTEND_BUCKET" --delete --cache-control "no-cache" --content-type "text/html" --exclude "*" --include "*.html"

# Print access URL
SITE_URL=$(terraform -chdir="$INFRA_DIR" output -raw frontend_url)
echo "Deployed. Access the app at: https://$SITE_URL"

