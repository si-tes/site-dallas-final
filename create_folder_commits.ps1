$ErrorActionPreference = 'Stop'
$gitPath = (Get-ChildItem -Path "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe" | Select-Object -First 1).FullName

function Run-Git {
    param([string]$cmd)
    $maxRetries = 10
    for ($i = 0; $i -lt $maxRetries; $i++) {
        if (Test-Path ".git\index.lock") { Remove-Item ".git\index.lock" -Force -ErrorAction SilentlyContinue }
        try {
            Invoke-Expression "& '$gitPath' $cmd 2>&1"
            return
        } catch {
            Start-Sleep -Seconds 1
        }
    }
}

Write-Host "Resetting..."
Run-Git "reset --mixed HEAD"

$folders = Get-ChildItem -Path frontend -Directory

foreach ($folder in $folders) {
    Write-Host "Adding $($folder.Name)..."
    Run-Git "add `"frontend/$($folder.Name)/*`""
    Run-Git "commit -m `"Upload imagens: $($folder.Name)`""
}

Write-Host "Adding remaining files..."
Run-Git "add ."
Run-Git "commit -m `"Upload arquivos finais`""

Write-Host "PACOTES CRIADOS!"
