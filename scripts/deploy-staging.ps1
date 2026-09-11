# Staging deployment script for IRIB DWP (Windows version)
# Uses GHCR images and Kubernetes with Helm

Write-Host "🚀 Starting staging deployment..." -ForegroundColor Cyan

# Configuration
$FrontendImage = "ghcr.io/irib-digital-workplace/irib-digital-workplace-frontend"
$BackendImage = "ghcr.io/irib-digital-workplace/irib-digital-workplace-backend"
$CommitSha = git rev-parse --short HEAD
$Namespace = "dwp-staging"

Write-Host "📦 Commit SHA: $CommitSha" -ForegroundColor Yellow

# 1. Log in to GHCR
Write-Host "🔐 Logging in to GitHub Container Registry..." -ForegroundColor Yellow
$env:GITHUB_TOKEN | docker login ghcr.io -u $env:GITHUB_USERNAME --password-stdin

# 2. Pull latest images
Write-Host "📥 Pulling latest images..." -ForegroundColor Yellow
docker pull "$FrontendImage:$CommitSha"
docker pull "$BackendImage:$CommitSha"

# 3. Tag images for staging
Write-Host "🏷️  Tagging images for staging..." -ForegroundColor Yellow
docker tag "$FrontendImage:$CommitSha" "$FrontendImage:staging"
docker tag "$BackendImage:$CommitSha" "$BackendImage:staging"

# 4. Deploy with Helm
Write-Host "🚀 Deploying with Helm..." -ForegroundColor Yellow

# Deploy Frontend
helm upgrade dwp-frontend infra/helm/dwp-frontend `
  --namespace $Namespace `
  --install `
  --values infra/helm/dwp-frontend/values-staging.yaml `
  --set image.tag="$CommitSha" `
  --set image.repository="$FrontendImage" `
  --wait `
  --timeout 10m

# Deploy Backend
helm upgrade dwp-backend backend/infra/helm/dwp-backend `
  --namespace $Namespace `
  --install `
  --values backend/infra/helm/dwp-backend/values-staging.yaml `
  --set image.tag="$CommitSha" `
  --set image.repository="$BackendImage" `
  --wait `
  --timeout 10m

# 5. Run database migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
kubectl exec -n $Namespace deployment/dwp-backend -- bash -c "pnpm db:migrate"

# 6. Verify deployment
Write-Host "✅ Verifying deployment..." -ForegroundColor Yellow
kubectl rollout status deployment/dwp-frontend -n $Namespace
kubectl rollout status deployment/dwp-backend -n $Namespace

# 7. Run smoke tests
Write-Host "🧪 Running smoke tests..." -ForegroundColor Yellow
kubectl exec -n $Namespace deployment/dwp-backend -- curl -f http://localhost:3001/api/v1/health/live

Write-Host "✅ Staging deployment completed successfully!" -ForegroundColor Green