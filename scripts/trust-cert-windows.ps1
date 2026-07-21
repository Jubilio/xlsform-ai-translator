$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$CertPath = Join-Path $ProjectRoot "certs\localhost.crt"

if (-not (Test-Path $CertPath)) {
    throw "Certificado não encontrado. Execute primeiro: npm run certs"
}

Import-Certificate -FilePath $CertPath -CertStoreLocation "Cert:\CurrentUser\Root" | Out-Null
Write-Host "Certificado localhost instalado no repositório de confiança do utilizador." -ForegroundColor Green
