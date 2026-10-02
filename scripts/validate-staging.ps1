$ErrorActionPreference = 'Stop'

$namespace = 'dwp-staging'
$requiredCommands = @('git', 'helm', 'kubectl')

foreach ($command in $requiredCommands) {
  if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
    throw "Missing required command: $command"
  }
}

$commitSha = (git rev-parse --short HEAD).Trim()
if (-not $commitSha) {
  throw 'Unable to resolve the current commit SHA'
}

kubectl get namespace $namespace | Out-Null
helm lint infra/helm/dwp-frontend --values infra/helm/dwp-frontend/values-staging.yaml
if ($LASTEXITCODE -ne 0) { throw 'Frontend Helm lint failed' }
helm lint backend/infra/helm/dwp-backend --values backend/infra/helm/dwp-backend/values-staging.yaml
if ($LASTEXITCODE -ne 0) { throw 'Backend Helm lint failed' }
kubectl rollout status deployment/dwp-frontend -n $namespace --timeout=120s
kubectl rollout status deployment/dwp-backend -n $namespace --timeout=120s

$backendLiveCheck = "const http=require('http');const r=http.get('http://127.0.0.1:3001/api/v1/health/live',res=>{console.log(res.statusCode);process.exit(res.statusCode===200?0:1)});r.on('error',()=>process.exit(1))"
$backendReadyCheck = "const http=require('http');const r=http.get('http://127.0.0.1:3001/api/v1/health/ready',res=>{console.log(res.statusCode);process.exit(res.statusCode===200?0:1)});r.on('error',()=>process.exit(1))"
$frontendCheck = "const http=require('http');const r=http.get('http://127.0.0.1:3000/fa',res=>{console.log(res.statusCode);process.exit(res.statusCode>=200 && res.statusCode<400?0:1)});r.on('error',()=>process.exit(1))"

kubectl exec -n $namespace deployment/dwp-backend -- node -e $backendLiveCheck
if ($LASTEXITCODE -ne 0) { throw 'Backend liveness smoke test failed' }
kubectl exec -n $namespace deployment/dwp-backend -- node -e $backendReadyCheck
if ($LASTEXITCODE -ne 0) { throw 'Backend readiness smoke test failed' }
kubectl exec -n $namespace deployment/dwp-frontend -- node -e $frontendCheck
if ($LASTEXITCODE -ne 0) { throw 'Frontend smoke test failed' }

Write-Host "Staging validation passed for commit $commitSha"