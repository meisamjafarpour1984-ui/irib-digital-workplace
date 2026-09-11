#!/bin/bash
# Staging deployment script for IRIB DWP
# Uses GHCR images and Kubernetes with Helm

set -e

echo "🚀 Starting staging deployment..."

# Configuration
FRONTEND_IMAGE="ghcr.io/irib-digital-workplace/irib-digital-workplace-frontend"
BACKEND_IMAGE="ghcr.io/irib-digital-workplace/irib-digital-workplace-backend"
COMMIT_SHA=$(git rev-parse --short HEAD)
NAMESPACE="dwp-staging"

echo "📦 Commit SHA: $COMMIT_SHA"

# 1. Log in to GHCR
echo "🔐 Logging in to GitHub Container Registry..."
echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USERNAME" --password-stdin

# 2. Pull latest images
echo "📥 Pulling latest images..."
docker pull "$FRONTEND_IMAGE:$COMMIT_SHA"
docker pull "$BACKEND_IMAGE:$COMMIT_SHA"

# 3. Tag images for staging
echo "🏷️  Tagging images for staging..."
docker tag "$FRONTEND_IMAGE:$COMMIT_SHA" "$FRONTEND_IMAGE:staging"
docker tag "$BACKEND_IMAGE:$COMMIT_SHA" "$BACKEND_IMAGE:staging"

# 4. Deploy with Helm
echo "🚀 Deploying with Helm..."

# Deploy Frontend
helm upgrade dwp-frontend infra/helm/dwp-frontend \
  --namespace "$NAMESPACE" \
  --install \
  --values infra/helm/dwp-frontend/values-staging.yaml \
  --set image.tag="$COMMIT_SHA" \
  --set image.repository="$FRONTEND_IMAGE" \
  --wait \
  --timeout 10m

# Deploy Backend
helm upgrade dwp-backend backend/infra/helm/dwp-backend \
  --namespace "$NAMESPACE" \
  --install \
  --values backend/infra/helm/dwp-backend/values-staging.yaml \
  --set image.tag="$COMMIT_SHA" \
  --set image.repository="$BACKEND_IMAGE" \
  --wait \
  --timeout 10m

# 5. Run database migrations
echo "🗄️  Running database migrations..."
kubectl exec -n "$NAMESPACE" deployment/dwp-backend -- bash -c "pnpm db:migrate"

# 6. Verify deployment
echo "✅ Verifying deployment..."
kubectl rollout status deployment/dwp-frontend -n "$NAMESPACE"
kubectl rollout status deployment/dwp-backend -n "$NAMESPACE"

# 7. Run smoke tests
echo "🧪 Running smoke tests..."
kubectl exec -n "$NAMESPACE" deployment/dwp-backend -- curl -f http://localhost:3001/api/v1/health/live || exit 1

echo "✅ Staging deployment completed successfully!"