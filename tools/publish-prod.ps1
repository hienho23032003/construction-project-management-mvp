# ==============================================================================
# Script Build & Publish Cho Production (Nhan Hoa Hosting / IIS)
# Du An: FCBVN - He Thong Quan Ly Tien Do Thi Cong & Log Timesheet
# Tac dung: Build Frontend (Vite) + Backend (ASP.NET Core .NET 8)
#           Dong goi toan bo thanh file publish.zip san sang upload len Hosting.
# ==============================================================================

$ErrorActionPreference = "Stop"

$RootDir = Resolve-Path "$PSScriptRoot\.."
$FrontendDir = Join-Path $RootDir "frontend"
$BackendApiDir = Join-Path $RootDir "backend\ConstructionManagement.API"
$StagingDir = Join-Path $RootDir ".publish_release"
$ZipFile = Join-Path $RootDir "publish.zip"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " [1/4] Bat dau build Frontend (React + TypeScript + Vite)..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Set-Location $FrontendDir
npm run build

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " [2/4] Copy file tinh Frontend vao wwwroot backend..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
$DistDir = Join-Path $FrontendDir "dist"
$WwwrootDir = Join-Path $BackendApiDir "wwwroot"

if (-not (Test-Path $WwwrootDir)) {
    New-Item -ItemType Directory -Path $WwwrootDir -Force | Out-Null
}

# Clear old static files except user uploaded files
Get-ChildItem -Path $WwwrootDir -Exclude "uploads" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

Copy-Item -Path "$DistDir\*" -Destination $WwwrootDir -Recurse -Force

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " [3/4] Chay dotnet publish cho Backend (.NET 8 Release)..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Set-Location $BackendApiDir

if (Test-Path $StagingDir) {
    Remove-Item -Path $StagingDir -Recurse -Force -ErrorAction SilentlyContinue
}

dotnet publish -c Release -o $StagingDir

# Copy web.config to staging directory if not present
$WebConfigSrc = Join-Path $BackendApiDir "web.config"
$WebConfigDest = Join-Path $StagingDir "web.config"
if ((Test-Path $WebConfigSrc) -and (-not (Test-Path $WebConfigDest))) {
    Copy-Item -Path $WebConfigSrc -Destination $WebConfigDest -Force
}

# Copy appsettings.Production.json to staging directory
$ProdConfigSrc = Join-Path $BackendApiDir "appsettings.Production.json"
$ProdConfigDest = Join-Path $StagingDir "appsettings.Production.json"
if (Test-Path $ProdConfigSrc) {
    Copy-Item -Path $ProdConfigSrc -Destination $ProdConfigDest -Force
}

# Ensure uploads folder is never packaged in publish.zip (preserving production uploaded data)
$StagingUploads = Join-Path $StagingDir "uploads"
if (Test-Path $StagingUploads) {
    Remove-Item -Path $StagingUploads -Recurse -Force -ErrorAction SilentlyContinue
}
$StagingWwwrootUploads = Join-Path $StagingDir "wwwroot\uploads"
if (Test-Path $StagingWwwrootUploads) {
    Remove-Item -Path $StagingWwwrootUploads -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " [4/4] Dong goi toan bo ung dung thanh publish.zip..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
if (Test-Path $ZipFile) {
    Remove-Item -Path $ZipFile -Force -ErrorAction SilentlyContinue
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($StagingDir, $ZipFile)

Set-Location $RootDir

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " [HOAN TAT] BUILD VA DONG GOI PUBLISH PRODUCTION THANH CONG!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host " 1. Thu muc publish : $StagingDir" -ForegroundColor Yellow
Write-Host " 2. File nen san sang: $ZipFile" -ForegroundColor Yellow
Write-Host " 3. Huong dan upload : Xem file DEPLOY_NHANHOA.md" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Green
