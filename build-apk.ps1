# Saiyam Platform - Automated Android APK Builder
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Building Saiyam Platform Android APK   " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Build Web Assets
Write-Host "`n[1/4] Building web application (Vite production)..." -ForegroundColor Yellow
npm --prefix web run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Web build failed."
    exit 1
}

# 2. Sync to Capacitor Android
Write-Host "`n[2/4] Syncing web assets into Android project..." -ForegroundColor Yellow
Push-Location web
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Error "Capacitor sync failed."
    exit 1
}
Pop-Location

# 3. Configure Environment & Assemble APK
Write-Host "`n[3/4] Building APK with Gradle..." -ForegroundColor Yellow
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\Tukar\AppData\Local\Android\Sdk"

Push-Location web\android
.\gradlew.bat assembleDebug
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Error "Gradle APK build failed."
    exit 1
}
Pop-Location

# 4. Copy to Project Root
Write-Host "`n[4/4] Finalizing APK file..." -ForegroundColor Yellow
Copy-Item "web\android\app\build\outputs\apk\debug\app-debug.apk" "Saiyam-Platform-debug.apk" -Force

$apkItem = Get-Item "Saiyam-Platform-debug.apk"
$sizeMB = [math]::Round($apkItem.Length / 1MB, 2)

Write-Host "`n=======================================================" -ForegroundColor Green
Write-Host "  SUCCESS: APK is ready for installation!              " -ForegroundColor Green
Write-Host "  File: $($apkItem.FullName)                           " -ForegroundColor Green
Write-Host "  Size: $sizeMB MB                                     " -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
