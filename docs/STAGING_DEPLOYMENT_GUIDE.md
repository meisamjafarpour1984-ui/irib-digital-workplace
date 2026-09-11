# راهنمای Deployment در Staging با GHCR

## پیش‌نیازها

### Environment Variables

```bash
export GITHUB_USERNAME="your-github-username"
export GITHUB_TOKEN="your-github-token"
export KUBECONFIG="path-to-kubeconfig"
```

### Kubernetes Context

```bash
kubectl config use-context staging-cluster
kubectl config set-context --current --namespace=dwp-staging
```

## Scripts Deployment

### Linux/Mac

```bash
pnpm deploy-staging
```

### Windows

```powershell
pnpm deploy-staging
```

## مراحل Deployment

### 1. Build و Push Images

این کار توسط CI/CD انجام می‌شود، اما می‌توانید به صورت دستی هم انجام دهید:

```bash
# Frontend
docker build -t ghcr.io/irib-digital-workplace/irib-digital-workplace-frontend:$(git rev-parse --short HEAD) .
docker push ghcr.io/irib-digital-workplace/irib-digital-workplace-frontend:$(git rev-parse --short HEAD)

# Backend
docker build -t ghcr.io/irib-digital-workplace/irib-digital-workplace-backend:$(git rev-parse --short HEAD) -f backend/Dockerfile .
docker push ghcr.io/irib-digital-workplace/irib-digital-workplace-backend:$(git rev-parse --short HEAD)
```

### 2. Helm Deployment

```bash
# Frontend
helm upgrade dwp-frontend infra/helm/dwp-frontend \
  --namespace dwp-staging \
  --install \
  --values infra/helm/dwp-frontend/values-staging.yaml \
  --set image.tag=$(git rev-parse --short HEAD) \
  --set image.repository=ghcr.io/irib-digital-workplace/irib-digital-workplace-frontend \
  --wait

# Backend
helm upgrade dwp-backend backend/infra/helm/dwp-backend \
  --namespace dwp-staging \
  --install \
  --values backend/infra/helm/dwp-backend/values-staging.yaml \
  --set image.tag=$(git rev-parse --short HEAD) \
  --set image.repository=ghcr.io/irib-digital-workplace/irib-digital-workplace-backend \
  --wait
```

### 3. Database Migrations

```bash
kubectl exec -n dwp-staging deployment/dwp-backend -- bash -c "pnpm db:migrate"
```

### 4. Health Checks

```bash
# Frontend
kubectl exec -n dwp-staging deployment/dwp-frontend -- curl -f http://localhost:3000

# Backend
kubectl exec -n dwp-staging deployment/dwp-backend -- curl -f http://localhost:3001/api/v1/health/live
```

## Troubleshooting

### Helm Deploy Fails

```bash
# Check Helm release status
helm status dwp-frontend -n dwp-staging
helm status dwp-backend -n dwp-staging

# View Helm logs
helm history dwp-frontend -n dwp-staging
helm history dwp-backend -n dwp-staging

# Rollback
helm rollback dwp-frontend -n dwp-staging
helm rollback dwp-backend -n dwp-staging
```

### Pod Issues

```bash
# Check pod status
kubectl get pods -n dwp-staging

# View pod logs
kubectl logs -n dwp-staging deployment/dwp-frontend
kubectl logs -n dwp-staging deployment/dwp-backend

# Describe pod
kubectl describe pod -n dwp-staging <pod-name>
```

### Image Pull Issues

```bash
# Check image pull secrets
kubectl get secrets -n dwp-staging

# Create secret if needed
kubectl create secret docker-registry ghcr-registry-secret \
  --docker-server=ghcr.io \
  --docker-username=<github-username> \
  --docker-password=<github-token> \
  --namespace=dwp-staging
```

## CI/CD Integration

Deployment به staging می‌تواند به CI/CD اضافه شود:

```yaml
deploy-staging:
  name: Deploy to Staging
  runs-on: ubuntu-latest
  needs: [e2e-tests, lint-helm]
  if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
  permissions:
    contents: read
    packages: write

  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Log in to GitHub Container Registry
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push images
      run: |
        docker build -t ghcr.io/irib-digital-workplace/irib-digital-workplace-frontend:${{ github.sha }} .
        docker build -t ghcr.io/irib-digital-workplace/irib-digital-workplace-backend:${{ github.sha }} -f backend/Dockerfile .
        docker push ghcr.io/irib-digital-workplace/irib-digital-workplace-frontend:${{ github.sha }}
        docker push ghcr.io/irib-digital-workplace/irib-digital-workplace-backend:${{ github.sha }}

    - name: Deploy to Staging
      uses: azure/setup-helm@v4

    - name: Deploy Frontend
      run: |
        helm upgrade dwp-frontend infra/helm/dwp-frontend \
          --namespace dwp-staging \
          --install \
          --values infra/helm/dwp-frontend/values-staging.yaml \
          --set image.tag=${{ github.sha }} \
          --set image.repository=ghcr.io/irib-digital-workplace/irib-digital-workplace-frontend \
          --wait

    - name: Deploy Backend
      run: |
        helm upgrade dwp-backend backend/infra/helm/dwp-backend \
          --namespace dwp-staging \
          --install \
          --values backend/infra/helm/dwp-backend/values-staging.yaml \
          --set image.tag=${{ github.sha }} \
          --set image.repository=ghcr.io/irib-digital-workplace/irib-digital-workplace-backend \
          --wait
```

## تأیید

- ✅ GHCR registry هماهنگ شده است
- ✅ Helm values با GHCR به‌روزرسانی شده‌اند
- ✅ Deployment scripts ایجاد شده‌اند
- ✅ Database migration integration آماده است
- ✅ Health checks تعریف شده‌اند

## تاریخچه

- 2026-09-11: ایجاد راهنمای deployment در staging با GHCR
