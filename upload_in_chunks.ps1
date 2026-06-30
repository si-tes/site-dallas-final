$ErrorActionPreference = 'Stop'
$gitPath = (Get-ChildItem -Path "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe" | Select-Object -First 1).FullName

Write-Host "Preparando arquivos..."
& $gitPath config core.quotepath false
& $gitPath rm -r --cached . 2>$null

$files = & $gitPath ls-files --others --modified --exclude-standard

if (-not $files) {
    Write-Host "Nenhum arquivo encontrado."
    exit
}

$batchSize = 500
$batchCount = 1
$totalBatches = [Math]::Ceiling($files.Count / $batchSize)

Write-Host "Encontrados $($files.Count) arquivos. Iniciando envio em $totalBatches lotes..."

for ($i = 0; $i -lt $files.Count; $i += $batchSize) {
    $batch = $files | Select-Object -Skip $i -First $batchSize
    
    for ($j = 0; $j -lt $batch.Count; $j += 50) {
        $subBatch = $batch | Select-Object -Skip $j -First 50
        & $gitPath add $subBatch
    }
    
    & $gitPath commit -m "Upload em lotes (parte $batchCount de $totalBatches)"
    & $gitPath push origin master
    
    $batchCount++
}
Write-Host "UPLOAD CONCLUIDO!"
