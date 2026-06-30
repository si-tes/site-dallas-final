$ErrorActionPreference = 'Stop'
$gitPath = (Get-ChildItem -Path "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe" | Select-Object -First 1).FullName

function Run-Git {
    param([string]$cmd)
    for ($i = 0; $i -lt 10; $i++) {
        if (Test-Path ".git\index.lock") { Remove-Item ".git\index.lock" -Force -ErrorAction SilentlyContinue }
        try {
            Invoke-Expression "& '$gitPath' $cmd 2>&1"
            return
        } catch {
            Start-Sleep -Seconds 1
        }
    }
}

$folders = Get-ChildItem -Path frontend -Directory | Where-Object { $_.Name -in "seleções","serie A","src" }

foreach ($folder in $folders) {
    Write-Host "Adding $($folder.Name)..."
    Run-Git "add `"frontend/$($folder.Name)/*`""
    Run-Git "commit -m `"Upload imagens: $($folder.Name)`""
}

Write-Host "Adding remaining files..."
Run-Git "add ."
Run-Git "commit -m `"Upload arquivos finais`""

Write-Host "PACOTES CRIADOS COM SUCESSO!"
