Write-Host "Starting push retry script..."

while ($true) {
    Write-Host "Trying to push code..."
    git push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Push successful! Task completed."
        break
    } else {
        Write-Host "Push failed, retrying in 2 minutes..."
        Start-Sleep -Seconds 120
    }
}
