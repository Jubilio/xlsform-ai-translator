[CmdletBinding()]
param(
    [string]$ManifestPath,
    [string]$CatalogFolder = "C:\OfficeAddins",
    [string]$ShareName = "OfficeAddins"
)

$ErrorActionPreference = "Stop"
$CatalogId = "{B47E42F1-74A8-4E85-9A76-7B1885E2A169}"
$scriptPath = $MyInvocation.MyCommand.Path

if ([string]::IsNullOrWhiteSpace($scriptPath)) {
    throw "Nao foi possivel determinar o caminho do instalador. Execute o ficheiro INSTALL_TRUSTED_CATALOG_WINDOWS.bat."
}

if ([string]::IsNullOrWhiteSpace($ManifestPath)) {
    $scriptDirectory = Split-Path -Parent $scriptPath
    $projectDirectory = Split-Path -Parent $scriptDirectory
    $ManifestPath = Join-Path $projectDirectory "manifest.production.xml"
}

function Test-IsAdministrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if ($env:OS -ne "Windows_NT") {
    throw "Este instalador funciona apenas no Windows."
}

$ManifestPath = [IO.Path]::GetFullPath($ManifestPath)
if (-not (Test-Path -LiteralPath $ManifestPath -PathType Leaf)) {
    throw "Manifesto nao encontrado: $ManifestPath"
}

if (Get-Process -Name "EXCEL" -ErrorAction SilentlyContinue) {
    throw "Feche completamente o Microsoft Excel e execute novamente o instalador."
}

if (-not (Test-IsAdministrator)) {
    Write-Host "A solicitar permissao de Administrador..." -ForegroundColor Yellow
    $arguments = "-NoProfile -ExecutionPolicy Bypass " +
        "-File `"$scriptPath`" " +
        "-ManifestPath `"$ManifestPath`" " +
        "-CatalogFolder `"$CatalogFolder`" " +
        "-ShareName `"$ShareName`""
    $process = Start-Process powershell.exe -Verb RunAs -ArgumentList $arguments -Wait -PassThru
    exit $process.ExitCode
}

Write-Host "[1/4] A preparar a pasta do catalogo..."
New-Item -ItemType Directory -Path $CatalogFolder -Force | Out-Null
$destinationManifest = Join-Path $CatalogFolder "manifest.production.xml"
Copy-Item -LiteralPath $ManifestPath -Destination $destinationManifest -Force

Write-Host "[2/4] A configurar a partilha de rede..."
$existingShare = Get-SmbShare -Name $ShareName -ErrorAction SilentlyContinue
if ($existingShare) {
    $existingPath = [IO.Path]::GetFullPath($existingShare.Path).TrimEnd('\')
    $expectedPath = [IO.Path]::GetFullPath($CatalogFolder).TrimEnd('\')
    if (-not $existingPath.Equals($expectedPath, [StringComparison]::OrdinalIgnoreCase)) {
        throw "A partilha '$ShareName' ja existe e aponta para '$($existingShare.Path)'. Nenhuma alteracao foi feita nela."
    }
} else {
    $currentUser = "$env:USERDOMAIN\$env:USERNAME"
    New-SmbShare -Name $ShareName -Path $CatalogFolder -ReadAccess $currentUser | Out-Null
}

$catalogUrl = "\\$env:COMPUTERNAME\$ShareName"
if (-not (Test-Path -LiteralPath $catalogUrl)) {
    throw "Nao foi possivel abrir a partilha criada: $catalogUrl"
}

Write-Host "[3/4] A registar o catalogo confiavel no Microsoft Office..."
$trustedCatalogsPath = "HKCU:\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs"
$catalogRegistryPath = Join-Path $trustedCatalogsPath $CatalogId
New-Item -Path $catalogRegistryPath -Force | Out-Null
New-ItemProperty -Path $catalogRegistryPath -Name "Id" -Value $CatalogId -PropertyType String -Force | Out-Null
New-ItemProperty -Path $catalogRegistryPath -Name "Url" -Value $catalogUrl -PropertyType String -Force | Out-Null
New-ItemProperty -Path $catalogRegistryPath -Name "Flags" -Value 1 -PropertyType DWord -Force | Out-Null

Write-Host "[4/4] A verificar a instalacao..."
$registeredUrl = Get-ItemPropertyValue -Path $catalogRegistryPath -Name "Url"
$registeredFlags = Get-ItemPropertyValue -Path $catalogRegistryPath -Name "Flags"
if ($registeredUrl -ne $catalogUrl -or $registeredFlags -ne 1) {
    throw "O catalogo nao foi registado correctamente no Office."
}

Write-Host ""
Write-Host "Catalogo configurado com sucesso." -ForegroundColor Green
Write-Host "Manifesto: $destinationManifest"
Write-Host "Catalogo:  $catalogUrl"
Write-Host ""
Write-Host "Agora abra o Excel e seleccione:"
Write-Host "Home > Add-ins > More Add-ins > Shared Folder"
Write-Host "Depois escolha 'XLSForm AI Translator' e clique em Add."
