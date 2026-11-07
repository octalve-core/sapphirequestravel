# Runs the production first-owner bootstrap without echoing secrets to the console.
# Invoke from the project root: powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\bootstrap-admin.ps1
$ErrorActionPreference = "Stop"
$dbPtr = [IntPtr]::Zero
$passwordPtr = [IntPtr]::Zero

try {
    $adminName = (Read-Host "Administrator full name").Trim()
    $adminEmail = (Read-Host "Administrator email (confirm the exact address)").Trim()
    $dbSecret = Read-Host "Neon pooled connection string" -AsSecureString
    $passwordSecret = Read-Host "New admin password (16+ characters)" -AsSecureString

    $dbPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbSecret)
    $passwordPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($passwordSecret)

    $env:ADMIN_NAME = $adminName
    $env:ADMIN_EMAIL = $adminEmail
    $env:DATABASE_URL = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($dbPtr)
    $env:ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPtr)

    & pnpm run bootstrap:admin
    if ($LASTEXITCODE -ne 0) {
        throw "Administrator bootstrap did not complete. Check the message above before retrying."
    }
}
finally {
    if ($dbPtr -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($dbPtr)
    }
    if ($passwordPtr -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPtr)
    }
    foreach ($key in @("DATABASE_URL", "ADMIN_NAME", "ADMIN_EMAIL", "ADMIN_PASSWORD")) {
        [Environment]::SetEnvironmentVariable($key, $null, "Process")
    }
}
